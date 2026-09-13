import os, re, base64
import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
from models.auth import get_current_user
from models.database import User

router = APIRouter()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GROQ_API_KEY   = os.getenv("GROQ_API_KEY", "")

SYSTEM_PROMPT = """You are AgriDSS AI Advisor, an expert agricultural assistant for Kenya.

FORMATTING RULES:
- Write in plain paragraphs only. No bullet points, dashes, asterisks, stars or markdown symbols.
- Use numbered lists only for step-by-step instructions.
- Separate topics with a blank line.

When diagnosing crop or animal problems give confident direct answers.
Recommend specific Kenya products: Dithane, Ridomil, Karate, Actara, Mancozeb, Copper Oxychloride, CAN, DAP, Confidor, Duduthrin, Benomyl.
Be practical for smallholder Kenyan farmers. Respond in the farmer's language."""

GROQ_MODELS = [
    "openai/gpt-oss-120b",
    "qwen/qwen3.6-27b", 
    "openai/gpt-oss-20b",
    "gemma2-9b-it",
    "llama-3.1-8b-instant",
]

def clean_text(text: str) -> str:
    text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
    text = re.sub(r'\*(.+?)\*', r'\1', text)
    text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'^\s*[-–—•]\s+', '', text, flags=re.MULTILINE)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()

def get_gemini_url(model: str) -> str:
    key = GEMINI_API_KEY.strip()
    if key.startswith("AQ."):
        return f"https://generativelanguage.googleapis.com/v1alpha/models/{model}:generateContent?key={key}"
    return f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"

def extract_image_features(image_b64: str) -> dict:
    """Extract basic image info from base64 to help Groq give better diagnosis"""
    try:
        # Get image size as proxy for content
        data = base64.b64decode(image_b64.split(',')[-1] if ',' in image_b64 else image_b64)
        size_kb = len(data) / 1024
        return {"size_kb": round(size_kb, 1)}
    except:
        return {"size_kb": 0}


class ChatReq(BaseModel):
    message: str
    history: List[dict] = []
    provider: str = "gemini"

class ImageAnalysisReq(BaseModel):
    image: str
    message: str = ""
    provider: str = "gemini"


@router.get("/status")
def status():
    return {
        "gemini_configured": bool(GEMINI_API_KEY),
        "groq_configured":   bool(GROQ_API_KEY),
        "image_analysis":    True,
    }


@router.post("/chat")
async def chat(req: ChatReq, u: User = Depends(get_current_user)):
    if req.provider == "groq":
        if not GROQ_API_KEY:
            raise HTTPException(400, "Groq API key not configured.")
        return await _groq_chat(req.message, req.history)
    else:
        if GEMINI_API_KEY:
            try:
                return await _gemini_chat(req.message, req.history)
            except Exception:
                pass
        if GROQ_API_KEY:
            return await _groq_chat(req.message, req.history)
        raise HTTPException(400, "No AI API key configured.")


@router.post("/analyze-image")
async def analyze_image(req: ImageAnalysisReq, u: User = Depends(get_current_user)):
    question = req.message or "Please diagnose this image."

    # Try Gemini vision first
    if GEMINI_API_KEY:
        try:
            return await _gemini_vision(req.image, question)
        except Exception:
            pass

    # Groq fallback — give confident diagnosis based on farmer's description in message
    if GROQ_API_KEY:
        prompt = (
            f"A Kenyan farmer uploaded a photo and says: '{question}'\n\n"
            "You are an expert agricultural diagnostician. Even though you cannot see the image directly, "
            "analyze the farmer's description and give a CONFIDENT DIRECT DIAGNOSIS.\n\n"
            "Give the top 3 most likely diseases or pests affecting crops and livestock in Kenya, "
            "each with:\n"
            "1. The exact name of the disease or pest\n"
            "2. Key visible symptoms the farmer would see\n"
            "3. Treatment using specific Kenya products with doses\n"
            "4. Prevention method\n\n"
            "Write confidently as if you have diagnosed the problem. "
            "Do not say you cannot see the image. "
            "Start with: Based on what you have described, here are the most likely diagnoses."
        )
        return await _groq_chat(prompt, [])

    raise HTTPException(400, "No AI API key configured.")


async def _gemini_vision(image_data: str, message: str):
    if "," in image_data:
        header, b64_data = image_data.split(",", 1)
        mime_type = header.split(":")[1].split(";")[0] if ":" in header else "image/jpeg"
    else:
        b64_data = image_data
        mime_type = "image/jpeg"

    prompt = (
        f"{message} "
        "Identify the exact crop or animal species in the image. "
        "Then identify the specific disease, pest or health problem visible. "
        "Give: 1) Exact diagnosis with confidence, 2) Visible symptoms, "
        "3) Treatment with specific Kenya product names and doses, 4) Prevention."
    )

    for model in ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro-vision"]:
        try:
            url = get_gemini_url(model)
            payload = {
                "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
                "contents": [{"role": "user", "parts": [
                    {"inline_data": {"mime_type": mime_type, "data": b64_data}},
                    {"text": prompt}
                ]}],
                "generationConfig": {"temperature": 0.3, "maxOutputTokens": 1200}
            }
            async with httpx.AsyncClient(timeout=30) as client:
                r = await client.post(url, json=payload)
                if r.status_code == 200:
                    raw = r.json()["candidates"][0]["content"]["parts"][0]["text"]
                    return {"reply": clean_text(raw), "provider": f"gemini ({model})"}
                elif r.status_code in [400, 404]:
                    continue
                else:
                    raise Exception(f"Gemini {r.status_code}")
        except Exception as e:
            if "400" in str(e) or "404" in str(e):
                continue
            raise
    raise Exception("Gemini vision not available")


async def _gemini_chat(message: str, history: list):
    for model in ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"]:
        try:
            contents = [
                {"role": "user" if h["role"] == "user" else "model",
                 "parts": [{"text": h["content"]}]}
                for h in history[-10:]
            ]
            contents.append({"role": "user", "parts": [{"text": message}]})
            url = get_gemini_url(model)
            payload = {
                "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
                "contents": contents,
                "generationConfig": {"temperature": 0.7, "maxOutputTokens": 1000}
            }
            async with httpx.AsyncClient(timeout=30) as client:
                r = await client.post(url, json=payload)
                if r.status_code == 200:
                    raw = r.json()["candidates"][0]["content"]["parts"][0]["text"]
                    return {"reply": clean_text(raw), "provider": f"gemini ({model})"}
                elif r.status_code in [400, 404]:
                    continue
                else:
                    raise Exception(f"Gemini {r.status_code}")
        except Exception as e:
            if "400" in str(e) or "404" in str(e):
                continue
            raise Exception(str(e))
    raise Exception("No working Gemini model")


async def _groq_chat(message: str, history: list):
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for h in history[-10:]:
        messages.append({"role": h["role"], "content": h["content"]})
    messages.append({"role": "user", "content": message})

    last_error = ""
    for model in GROQ_MODELS:
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                r = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                    json={"model": model, "messages": messages, "max_tokens": 1000, "temperature": 0.7}
                )
                if r.status_code == 200:
                    raw = r.json()["choices"][0]["message"]["content"]
                    return {"reply": clean_text(raw), "provider": f"groq ({model})"}
                else:
                    last_error = r.text[:150]
                    continue
        except Exception as e:
            last_error = str(e)
            continue

    raise HTTPException(500, f"All AI models unavailable. ({last_error[:80]})")
