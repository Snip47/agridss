import os
import httpx
import base64
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
from models.auth import get_current_user
from models.database import User

router = APIRouter()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

SYSTEM_PROMPT = """You are AgriDSS AI Advisor, an expert agricultural assistant for Kenya.

You have deep knowledge of:
- Kenya's 47 counties, farming regions, rainfall patterns and soil types
- 60+ Kenyan crops: maize, tea, coffee, avocado, beans, sorghum, potatoes, tomatoes, kale, bananas, passion fruit, oranges, mangoes, strawberries, roses and more
- 18 livestock types: dairy cattle (Friesian, Ayrshire), beef cattle (Boran), goats, sheep (Dorper), broilers, layers, Kienyeji chickens, turkeys, rabbits, pigs, fish, bees, camels, donkeys, ducks, quail, ostriches
- All major Kenyan crop and livestock diseases with treatment using locally available products
- Planting calendars (long rains March-May, short rains October-December)
- Market prices, inputs and products available in Kenya (Dithane, Ridomil, Karate, Actara, DAP, CAN)

When analyzing photos or described symptoms:
- Identify the problem clearly with confidence level
- Give practical diagnosis specific to Kenya
- Recommend specific products available in Kenya with doses
- Advise when to consult a vet or agricultural officer
- Be concise and practical for smallholder farmers

Always respond in the same language as the farmer (English or Swahili).
Keep responses practical and actionable."""


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
        "groq_configured": bool(GROQ_API_KEY),
        "image_analysis": bool(GEMINI_API_KEY) or bool(GROQ_API_KEY),
    }


@router.post("/chat")
async def chat(req: ChatReq, u: User = Depends(get_current_user)):
    if req.provider == "gemini" and GEMINI_API_KEY:
        return await _gemini_chat(req.message, req.history)
    elif req.provider == "groq" and GROQ_API_KEY:
        return await _groq_chat(req.message, req.history)
    elif GEMINI_API_KEY:
        return await _gemini_chat(req.message, req.history)
    elif GROQ_API_KEY:
        return await _groq_chat(req.message, req.history)
    raise HTTPException(400, "No AI API key configured. Add GEMINI_API_KEY or GROQ_API_KEY to backend/.env")


@router.post("/analyze-image")
async def analyze_image(req: ImageAnalysisReq, u: User = Depends(get_current_user)):
    # Try Gemini vision first
    if GEMINI_API_KEY:
        try:
            return await _gemini_vision(req.image, req.message)
        except Exception as e:
            err_str = str(e)
            # If vision model not available for this key, fall through to Groq
            if "404" in err_str or "vision" in err_str.lower() or "compatible" in err_str.lower():
                pass  # fall through
            else:
                raise

    # Fall back to Groq with image description request
    if GROQ_API_KEY:
        prompt = (
            f"A farmer has uploaded a photo of their crop or animal with this question: '{req.message or 'What is wrong with this?'}'\n\n"
            "Since I cannot view the image directly, please help by:\n"
            "1. Asking the farmer to describe what they see (color changes, spots, wilting, lesions, swelling, behavior changes etc.)\n"
            "2. Listing the 5 most common crop and livestock diseases in Kenya that cause visible symptoms\n"
            "3. Offering to diagnose once they describe the symptoms\n\n"
            "Be helpful and practical. Mention they can also switch to Gemini engine which supports photo analysis."
        )
        return await _groq_chat(prompt, [])

    raise HTTPException(400, "No AI API key configured.")


async def _gemini_vision(image_data: str, message: str):
    """Try Gemini vision models in order"""
    if "," in image_data:
        header, b64_data = image_data.split(",", 1)
        mime_type = header.split(":")[1].split(";")[0] if ":" in header else "image/jpeg"
    else:
        b64_data = image_data
        mime_type = "image/jpeg"

    # Models to try in order — gemini-1.5-flash is most likely to work
    models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro-vision"]
    last_error = ""

    for model in models:
        try:
            url = get_gemini_url(model)
            payload = {
                "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
                "contents": [{
                    "role": "user",
                    "parts": [
                        {"inline_data": {"mime_type": mime_type, "data": b64_data}},
                        {"text": message or "Analyze this crop/animal image. Identify any disease, pest damage, nutritional deficiency or health issue. Provide: 1) Diagnosis, 2) Severity, 3) Treatment with specific Kenya product names and doses, 4) Prevention measures."}
                    ]
                }],
                "generationConfig": {"temperature": 0.4, "maxOutputTokens": 1500}
            }
            async with httpx.AsyncClient(timeout=30) as client:
                r = await client.post(url, json=payload)
                if r.status_code == 200:
                    data = r.json()
                    reply = data["candidates"][0]["content"]["parts"][0]["text"]
                    return {"reply": reply, "provider": f"gemini-vision ({model})"}
                elif r.status_code in [404, 400]:
                    last_error = f"{r.status_code}"
                    continue
                else:
                    raise Exception(f"{r.status_code}: {r.text[:200]}")
        except Exception as e:
            last_error = str(e)
            if "404" in last_error or "400" in last_error:
                continue
            raise

    raise Exception(f"compatible Gemini vision model not found: {last_error}")


async def _gemini_chat(message: str, history: list):
    models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"]
    last_error = ""

    for model in models:
        try:
            contents = []
            for h in history[-10:]:
                role = "user" if h["role"] == "user" else "model"
                contents.append({"role": role, "parts": [{"text": h["content"]}]})
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
                    data = r.json()
                    reply = data["candidates"][0]["content"]["parts"][0]["text"]
                    return {"reply": reply, "provider": f"gemini ({model})"}
                elif r.status_code in [404, 400]:
                    last_error = str(r.status_code)
                    continue
                else:
                    raise HTTPException(500, f"Gemini error {r.status_code}: {r.text[:200]}")
        except HTTPException:
            raise
        except Exception as e:
            last_error = str(e)
            if "404" in last_error or "400" in last_error:
                continue
            raise HTTPException(500, f"Gemini failed: {last_error}")

    # All Gemini models failed — try Groq as fallback
    if GROQ_API_KEY:
        return await _groq_chat(message, history)

    raise HTTPException(500, f"No working AI model found. Get a new key from aistudio.google.com — {last_error}")


async def _groq_chat(message: str, history: list):
    try:
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for h in history[-10:]:
            messages.append({"role": h["role"], "content": h["content"]})
        messages.append({"role": "user", "content": message})

        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
                json={"model": "llama-3.3-70b-versatile", "messages": messages, "max_tokens": 1000, "temperature": 0.7}
            )
            if r.status_code != 200:
                raise HTTPException(500, f"Groq error: {r.text[:200]}")
            data = r.json()
            reply = data["choices"][0]["message"]["content"]
            return {"reply": reply, "provider": "groq"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Groq failed: {str(e)}")
