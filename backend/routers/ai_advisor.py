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
Write in plain paragraphs only. No bullet points, dashes, asterisks or markdown.
Give confident direct answers about crops, livestock and diseases in Kenya.
Recommend Kenya products: Dithane, Ridomil, Karate, Actara, Mancozeb, CAN, DAP.
Respond in the farmer's language (English or Swahili)."""

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
        "groq_configured": bool(GROQ_API_KEY),
        "gemini_key_prefix": GEMINI_API_KEY[:8] if GEMINI_API_KEY else "none",
        "groq_key_prefix": GROQ_API_KEY[:8] if GROQ_API_KEY else "none",
    }


@router.post("/chat")
async def chat(req: ChatReq, u: User = Depends(get_current_user)):
    errors = []

    # Try Gemini first
    if GEMINI_API_KEY:
        try:
            return await _gemini_chat(req.message, req.history)
        except Exception as e:
            errors.append(f"Gemini: {str(e)[:100]}")

    # Try Groq
    if GROQ_API_KEY:
        try:
            return await _groq_chat(req.message, req.history)
        except Exception as e:
            errors.append(f"Groq: {str(e)[:100]}")

    raise HTTPException(500, f"All AI failed: {'; '.join(errors)}")


@router.post("/analyze-image")
async def analyze_image(req: ImageAnalysisReq, u: User = Depends(get_current_user)):
    question = req.message or "Diagnose this image. Identify the crop or animal and any disease or pest visible."
    errors = []

    # Try Gemini vision
    if GEMINI_API_KEY:
        try:
            return await _gemini_vision(req.image, question)
        except Exception as e:
            errors.append(f"Gemini vision: {str(e)[:100]}")

    # Groq fallback
    if GROQ_API_KEY:
        try:
            prompt = (
                f"A Kenyan farmer uploaded a crop/animal photo and asks: '{question}'\n\n"
                "Give the top 3 most likely diseases or pests in Kenya for any common crop. "
                "For each: name it, describe symptoms, give treatment with Kenya product names and doses, give prevention. "
                "Be confident and direct. Start with: Here are the most likely diagnoses:"
            )
            return await _groq_chat(prompt, [])
        except Exception as e:
            errors.append(f"Groq: {str(e)[:100]}")

    raise HTTPException(500, f"All AI failed: {'; '.join(errors)}")


async def _gemini_vision(image_data: str, message: str):
    if "," in image_data:
        header, b64_data = image_data.split(",", 1)
        mime_type = header.split(":")[1].split(";")[0] if ":" in header else "image/jpeg"
    else:
        b64_data = image_data
        mime_type = "image/jpeg"

    for model in ["gemini-1.5-flash", "gemini-1.5-pro"]:
        url = get_gemini_url(model)
        payload = {
            "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
            "contents": [{"role": "user", "parts": [
                {"inline_data": {"mime_type": mime_type, "data": b64_data}},
                {"text": message}
            ]}],
            "generationConfig": {"temperature": 0.3, "maxOutputTokens": 1200}
        }
        async with httpx.AsyncClient(timeout=40) as client:
            r = await client.post(url, json=payload)
            if r.status_code == 200:
                raw = r.json()["candidates"][0]["content"]["parts"][0]["text"]
                return {"reply": clean_text(raw), "provider": f"gemini-vision ({model})"}
            elif r.status_code in [400, 404]:
                continue
            else:
                raise Exception(f"Gemini {r.status_code}: {r.text[:200]}")
    raise Exception("No Gemini vision model worked")


async def _gemini_chat(message: str, history: list):
    for model in ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"]:
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
                raise Exception(f"Gemini {r.status_code}: {r.text[:200]}")
    raise Exception("No Gemini chat model worked")


async def _groq_chat(message: str, history: list):
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for h in history[-10:]:
        messages.append({"role": h["role"], "content": h["content"]})
    messages.append({"role": "user", "content": message})

    last_error = ""
    for model in GROQ_MODELS:
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
    raise Exception(f"All Groq models failed: {last_error[:100]}")
