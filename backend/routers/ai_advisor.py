import os
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
You have deep knowledge of:
- Kenya's 47 counties, farming regions, rainfall patterns and soil types
- 60+ crops: maize, tea, coffee, avocado, beans, sorghum, potatoes, tomatoes, kale, bananas, passion fruit, oranges, mangoes, strawberries, roses and more
- 18 livestock: dairy cattle (Friesian, Ayrshire), beef cattle (Boran), goats, sheep (Dorper), broilers, layers, Kienyeji chickens, turkeys, rabbits, pigs, fish, bees, camels, donkeys, ducks, quail, ostriches
- All major Kenyan crop and livestock diseases with treatment using locally available products
- Planting calendars (long rains March-May, short rains October-December)
- Market prices and products available in Kenya: Dithane, Ridomil, Karate, Actara, DAP, CAN, Butalex

When analyzing photos or symptoms:
- Give clear diagnosis with confidence level
- Recommend specific products available in Kenya with doses
- Be concise and practical for smallholder farmers

Respond in the same language as the farmer (English or Swahili)."""


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
    if req.provider == "gemini" and GEMINI_API_KEY:
        try:
            return await _gemini_chat(req.message, req.history)
        except Exception:
            if GROQ_API_KEY:
                return await _groq_chat(req.message, req.history)
            raise
    elif GROQ_API_KEY:
        return await _groq_chat(req.message, req.history)
    elif GEMINI_API_KEY:
        return await _gemini_chat(req.message, req.history)
    raise HTTPException(400, "No AI API key configured.")


@router.post("/analyze-image")
async def analyze_image(req: ImageAnalysisReq, u: User = Depends(get_current_user)):
    if GEMINI_API_KEY:
        try:
            return await _gemini_vision(req.image, req.message)
        except Exception:
            pass
    if GROQ_API_KEY:
        prompt = (
            f"A farmer uploaded a photo and asked: '{req.message or 'What is wrong with this crop or animal?'}'\n\n"
            "Since you cannot view the image, help by:\n"
            "1. Asking them to describe what they see (colors, spots, wilting, lesions, swelling)\n"
            "2. Listing the 5 most common Kenya crop/livestock diseases with visible symptoms\n"
            "3. Giving immediate first-aid advice\n"
            "Be practical for a Kenyan smallholder farmer."
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

    for model in ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro-vision"]:
        try:
            url = get_gemini_url(model)
            payload = {
                "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
                "contents": [{"role": "user", "parts": [
                    {"inline_data": {"mime_type": mime_type, "data": b64_data}},
                    {"text": message or "Analyze this image. Identify disease, pest or health issue. Give: 1) Diagnosis, 2) Severity, 3) Treatment with Kenya product names, 4) Prevention."}
                ]}],
                "generationConfig": {"temperature": 0.4, "maxOutputTokens": 1500}
            }
            async with httpx.AsyncClient(timeout=30) as client:
                r = await client.post(url, json=payload)
                if r.status_code == 200:
                    return {"reply": r.json()["candidates"][0]["content"]["parts"][0]["text"], "provider": f"gemini-vision ({model})"}
                elif r.status_code in [400, 404]:
                    continue
                else:
                    raise Exception(f"Gemini {r.status_code}")
        except Exception as e:
            if "400" in str(e) or "404" in str(e):
                continue
            raise
    raise Exception("No compatible Gemini vision model")


async def _gemini_chat(message: str, history: list):
    for model in ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"]:
        try:
            contents = [{"role": "user" if h["role"]=="user" else "model", "parts": [{"text": h["content"]}]} for h in history[-10:]]
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
                    return {"reply": r.json()["candidates"][0]["content"]["parts"][0]["text"], "provider": f"gemini ({model})"}
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
    if GROQ_API_KEY:
        return await _groq_chat(message, history)
    raise HTTPException(500, "No working Gemini model found.")


async def _groq_chat(message: str, history: list):
    # Try models in order — use whichever works
    models = ["llama3-70b-8192", "llama3-8b-8192", "mixtral-8x7b-32768", "gemma2-9b-it"]
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for h in history[-10:]:
        messages.append({"role": h["role"], "content": h["content"]})
    messages.append({"role": "user", "content": message})

    last_error = ""
    for model in models:
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                r = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                    json={"model": model, "messages": messages, "max_tokens": 1000, "temperature": 0.7}
                )
                if r.status_code == 200:
                    return {"reply": r.json()["choices"][0]["message"]["content"], "provider": f"groq ({model})"}
                elif r.status_code == 404 or "model_not_found" in r.text:
                    last_error = r.text[:200]
                    continue
                else:
                    raise HTTPException(500, f"Groq error: {r.text[:200]}")
        except HTTPException:
            raise
        except Exception as e:
            last_error = str(e)
            continue

    raise HTTPException(500, f"No working Groq model found. Last error: {last_error}")
