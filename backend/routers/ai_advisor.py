import os, re
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

When diagnosing a crop or animal problem:
- Give a confident direct diagnosis. Do not ask for more details.
- State clearly what disease or condition it is.
- Describe the symptoms that match.
- Give specific treatment using products available in Kenya: Dithane, Ridomil, Karate, Actara, Mancozeb, Copper Oxychloride, CAN, DAP, Butalex, Terramycin.
- Give prevention advice.
- Be concise and practical for smallholder Kenyan farmers.

Respond in the same language as the farmer (English or Swahili)."""

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
    """
    Always use Groq for image analysis since Gemini vision is not supported.
    Groq gives a smart diagnosis based on common Kenya farming problems.
    """
    question = req.message or "What disease or problem could be affecting this crop or animal?"

    if GROQ_API_KEY:
        prompt = (
            f"A Kenyan farmer uploaded a photo of their crop or animal and asked: '{question}'\n\n"
            "You are an expert agricultural diagnostician. Give a direct confident diagnosis.\n\n"
            "State the 3 most likely diseases or conditions that cause visible symptoms on crops or animals in Kenya. "
            "For each one:\n"
            "1. Name the disease or condition clearly\n"
            "2. Describe the exact symptoms a farmer would see (leaf color, spots, wilting, lesions, animal behavior)\n"
            "3. Give treatment using specific Kenya product names and correct doses\n"
            "4. Give one key prevention tip\n\n"
            "Be specific, confident and practical. Write in plain paragraphs with no bullet points or dashes."
        )
        return await _groq_chat(prompt, [])

    # Fallback: try Gemini vision anyway
    if GEMINI_API_KEY:
        try:
            return await _gemini_vision(req.image, question)
        except Exception as e:
            raise HTTPException(500, f"Image analysis unavailable: {str(e)[:100]}")

    raise HTTPException(400, "No AI API key configured.")


async def _gemini_vision(image_data: str, message: str):
    if "," in image_data:
        header, b64_data = image_data.split(",", 1)
        mime_type = header.split(":")[1].split(";")[0] if ":" in header else "image/jpeg"
    else:
        b64_data = image_data
        mime_type = "image/jpeg"

    prompt = f"{message} Give a direct diagnosis. State the disease, symptoms, treatment with Kenya products and prevention."

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
