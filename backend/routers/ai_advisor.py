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

You have deep knowledge of Kenya's 47 counties, crops, livestock, diseases and farming practices.

IMPORTANT FORMATTING RULES:
- Write in plain paragraphs only. No bullet points, no dashes, no asterisks, no stars, no markdown symbols.
- Do not use symbols like *, **, -, --, #, ##. Write everything as normal sentences and paragraphs.
- Separate topics with a blank line instead of bullet points or dashes.
- Use numbered lists only when giving step-by-step instructions (1. 2. 3.)

When analyzing a crop or animal photo:
- Give a confident direct diagnosis based on what you can see. Do not ask for more information.
- State clearly what disease, pest or condition you think it is.
- Explain the symptoms you can see.
- Give specific treatment using products available in Kenya such as Dithane, Ridomil, Karate, Actara, Mancozeb, Copper Oxychloride, CAN, DAP.
- Give prevention advice.

Respond in the same language as the farmer (English or Swahili)."""

GROQ_MODELS = [
    "openai/gpt-oss-120b",
    "qwen/qwen3.6-27b",
    "openai/gpt-oss-20b",
    "gemma2-9b-it",
]

def clean_text(text: str) -> str:
    """Remove markdown symbols from AI response"""
    # Remove bold/italic markers
    text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
    text = re.sub(r'\*(.+?)\*', r'\1', text)
    # Remove heading markers
    text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)
    # Remove bullet dashes at start of lines
    text = re.sub(r'^\s*[-–—•]\s+', '', text, flags=re.MULTILINE)
    # Remove excessive blank lines
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
    # Strictly use the requested provider — no automatic fallback
    if req.provider == "groq":
        if not GROQ_API_KEY:
            raise HTTPException(400, "Groq API key not configured.")
        return await _groq_chat(req.message, req.history)
    else:
        # Default to Gemini
        if not GEMINI_API_KEY:
            raise HTTPException(400, "Gemini API key not configured.")
        return await _gemini_chat(req.message, req.history)


@router.post("/analyze-image")
async def analyze_image(req: ImageAnalysisReq, u: User = Depends(get_current_user)):
    if req.provider == "groq":
        if not GROQ_API_KEY:
            raise HTTPException(400, "Groq API key not configured.")
        # Groq cannot see images — give direct diagnosis based on common diseases
        prompt = (
            f"A farmer sent a photo of their crop or animal and asked: '{req.message or 'What disease is this?'}'\n\n"
            "Give a direct confident diagnosis. State the 3 most likely diseases or conditions based on common Kenya farming problems. "
            "For each one give the symptoms that would match, the treatment using Kenya products, and prevention. "
            "Be specific and practical. Do not ask for more information."
        )
        return await _groq_chat(prompt, [])
    else:
        if not GEMINI_API_KEY:
            raise HTTPException(400, "Gemini API key not configured.")
        return await _gemini_vision(req.image, req.message)


async def _gemini_vision(image_data: str, message: str):
    if "," in image_data:
        header, b64_data = image_data.split(",", 1)
        mime_type = header.split(":")[1].split(";")[0] if ":" in header else "image/jpeg"
    else:
        b64_data = image_data
        mime_type = "image/jpeg"

    prompt = message or "Analyze this image carefully. Give a direct confident diagnosis of what disease, pest, deficiency or health condition you can see. Do not ask for more information. State what it is, what you can see, how to treat it with products available in Kenya, and how to prevent it."

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
            raise HTTPException(500, str(e))
    raise HTTPException(500, "Gemini vision not available for this API key. Try using the Groq engine.")


async def _gemini_chat(message: str, history: list):
    for model in ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"]:
        try:
            contents = [
                {"role": "user" if h["role"]=="user" else "model", "parts": [{"text": h["content"]}]}
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
                    raise HTTPException(500, f"Gemini error {r.status_code}")
        except HTTPException:
            raise
        except Exception as e:
            if "400" in str(e) or "404" in str(e):
                continue
            raise HTTPException(500, str(e))
    raise HTTPException(500, "No working Gemini model found.")


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

    raise HTTPException(500, f"Groq unavailable. Switch to Gemini engine. ({last_error[:80]})")
