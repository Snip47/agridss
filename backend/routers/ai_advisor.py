import os
import httpx
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from models.auth import get_current_user
from models.database import User
import base64

router = APIRouter()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

SYSTEM_PROMPT = """You are AgriDSS AI Advisor, an expert agricultural assistant specifically for Kenya.

You have deep knowledge of:
- Kenya's 47 counties, agro-ecological zones (AEZ), rainfall patterns and soil types
- 40+ Kenyan crops: maize, tea, coffee, avocado, beans, sorghum, millet, cassava, potatoes, tomatoes, kale, bananas, passion fruit, sugarcane and more
- 14+ livestock species: Friesian/Ayrshire/Jersey dairy cattle, Boran beef cattle, Toggenburg/Saanen goats, Dorper/Merino sheep, broiler/layer poultry, rabbits, pigs, fish farming, bees, camels
- Kenyan crop diseases: Maize Lethal Necrosis, Fall Armyworm, Late Blight, Coffee Berry Disease, Banana Xanthomonas Wilt
- Livestock diseases: East Coast Fever, Newcastle Disease, Foot and Mouth, Mastitis, PPR
- Kenya's planting calendars (long rains March-May, short rains October-December)
- Market prices, inputs, fertilizers available in Kenya
- KALRO, Kenya Meteorological Department, county agriculture offices

When analyzing photos:
- Identify visible symptoms clearly (color changes, lesions, wilting, spots, physical abnormalities)
- Give a probable diagnosis with confidence level
- Suggest immediate actions the farmer can take
- Recommend specific products available in Kenya (e.g. Dithane, Ridomil, Karate, Actara)
- Advise when to consult a vet or agricultural officer

Always respond in the same language as the farmer (English or Swahili).
Be practical, specific and actionable for small-scale Kenyan farmers."""

def get_gemini_url():
    key = GEMINI_API_KEY.strip()
    if key.startswith("AQ.") or key.startswith("AIzaSy"):
        if key.startswith("AQ."):
            return f"https://generativelanguage.googleapis.com/v1alpha/models/gemini-2.0-flash-exp:generateContent?key={key}"
        return f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={key}"
    return f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={key}"

class ChatReq(BaseModel):
    message: str
    history: List[dict] = []
    provider: str = "gemini"

class ImageAnalysisReq(BaseModel):
    image: str  # base64 data URL
    message: str = "Analyze this crop or animal image and diagnose any problems"
    provider: str = "gemini"

@router.get("/status")
def status():
    return {
        "gemini_configured": bool(GEMINI_API_KEY),
        "groq_configured": bool(GROQ_API_KEY),
        "image_analysis": bool(GEMINI_API_KEY),  # Only Gemini supports images
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
    else:
        raise HTTPException(400, "No AI API key configured. Add GEMINI_API_KEY or GROQ_API_KEY to backend/.env")

@router.post("/analyze-image")
async def analyze_image(req: ImageAnalysisReq, u: User = Depends(get_current_user)):
    if not GEMINI_API_KEY:
        if GROQ_API_KEY:
            # Groq doesn't support images, fall back to text response
            return await _groq_chat(
                f"A farmer has uploaded an image of their crop/animal with this question: {req.message}. "
                "Since I cannot see the image, please provide general advice on common crop and livestock diseases in Kenya, "
                "ask the farmer to describe what they see (color, spots, wilting, lesions etc.) so you can help diagnose.",
                []
            )
        raise HTTPException(400, "Image analysis requires GEMINI_API_KEY. Add it to backend/.env")

    return await _gemini_vision(req.image, req.message)

async def _gemini_vision(image_data: str, message: str):
    """Send image to Gemini for analysis"""
    try:
        # Extract base64 data and mime type from data URL
        # Format: data:image/jpeg;base64,<data>
        if "," in image_data:
            header, b64_data = image_data.split(",", 1)
            mime_type = header.split(":")[1].split(";")[0] if ":" in header else "image/jpeg"
        else:
            b64_data = image_data
            mime_type = "image/jpeg"

        url = get_gemini_url()
        payload = {
            "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
            "contents": [{
                "role": "user",
                "parts": [
                    {
                        "inline_data": {
                            "mime_type": mime_type,
                            "data": b64_data
                        }
                    },
                    {
                        "text": message or "Please analyze this crop/animal image. Identify any disease, pest damage, nutritional deficiency or health issue. Provide diagnosis, severity, recommended treatment with specific product names available in Kenya, and prevention measures."
                    }
                ]
            }],
            "generationConfig": {
                "temperature": 0.4,
                "maxOutputTokens": 1500,
            }
        }

        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(url, json=payload)
            if r.status_code != 200:
                raise HTTPException(500, f"Gemini vision error: {r.text[:200]}")
            data = r.json()
            reply = data["candidates"][0]["content"]["parts"][0]["text"]
            return {"reply": reply, "provider": "gemini-vision"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Image analysis failed: {str(e)}")

async def _gemini_chat(message: str, history: list):
    try:
        contents = []
        for h in history[-10:]:
            role = "user" if h["role"] == "user" else "model"
            contents.append({"role": role, "parts": [{"text": h["content"]}]})
        contents.append({"role": "user", "parts": [{"text": message}]})

        url = get_gemini_url()
        payload = {
            "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
            "contents": contents,
            "generationConfig": {"temperature": 0.7, "maxOutputTokens": 1000}
        }

        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(url, json=payload)
            if r.status_code != 200:
                raise HTTPException(500, f"Gemini error: {r.text[:200]}")
            data = r.json()
            reply = data["candidates"][0]["content"]["parts"][0]["text"]
            return {"reply": reply, "provider": "gemini"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Gemini failed: {str(e)}")

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
