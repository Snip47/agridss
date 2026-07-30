import os
import httpx
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
- Kenya's farming regions, rainfall patterns and soil types
- 60+ Kenyan crops: maize, tea, coffee, avocado, beans, sorghum, millet, cassava, potatoes, tomatoes, kale, bananas, passion fruit, sugarcane, oranges, mangoes, strawberries, roses and more
- Livestock: Friesian/Ayrshire/Jersey cattle, Boran beef cattle, goats, Dorper sheep, broilers, layers, rabbits, pigs, fish, bees, camels
- Crop diseases: Maize Lethal Necrosis, Fall Armyworm, Late Blight, Coffee Berry Disease, Banana Xanthomonas Wilt
- Livestock diseases: East Coast Fever, Newcastle Disease, Foot and Mouth, Mastitis, PPR
- Kenya's planting calendars (long rains March-May, short rains October-December)
- Market prices, fertilizers and pesticides available in Kenya
- Products: Dithane, Ridomil, Karate, Actara, DAP, CAN, Mancozeb

When analyzing photos:
- Identify visible symptoms clearly
- Give probable diagnosis with confidence level
- Suggest immediate actions the farmer can take
- Recommend specific products available in Kenya
- Advise when to consult a vet or agricultural officer

Always respond in the same language as the farmer (English or Swahili).
Be practical, specific and actionable for small-scale Kenyan farmers."""

def get_gemini_url(model="gemini-1.5-flash"):
    """Build correct Gemini URL based on key type"""
    key = GEMINI_API_KEY.strip()
    # AQ. keys use v1alpha, standard AIzaSy keys use v1beta
    if key.startswith("AQ."):
        return f"https://generativelanguage.googleapis.com/v1alpha/models/{model}:generateContent?key={key}"
    return f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"

class ChatReq(BaseModel):
    message: str
    history: List[dict] = []
    provider: str = "gemini"

class ImageAnalysisReq(BaseModel):
    image: str
    message: str = "Analyze this crop or animal image and diagnose any problems"
    provider: str = "gemini"

@router.get("/status")
def status():
    return {
        "gemini_configured": bool(GEMINI_API_KEY),
        "groq_configured": bool(GROQ_API_KEY),
        "image_analysis": bool(GEMINI_API_KEY),
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
            return await _groq_chat(
                f"A farmer uploaded a photo with this question: {req.message}. "
                "Since you cannot see the image, ask them to describe what they see — color, spots, wilting, lesions — so you can help diagnose the problem.",
                []
            )
        raise HTTPException(400, "Image analysis requires GEMINI_API_KEY in backend/.env")
    return await _gemini_vision(req.image, req.message)

async def _gemini_vision(image_data: str, message: str):
    try:
        if "," in image_data:
            header, b64_data = image_data.split(",", 1)
            mime_type = header.split(":")[1].split(";")[0] if ":" in header else "image/jpeg"
        else:
            b64_data = image_data
            mime_type = "image/jpeg"

        # Try gemini-1.5-flash first (most reliable with AQ. keys)
        models_to_try = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro-vision"]

        for model in models_to_try:
            url = get_gemini_url(model)
            payload = {
                "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
                "contents": [{
                    "role": "user",
                    "parts": [
                        {"inline_data": {"mime_type": mime_type, "data": b64_data}},
                        {"text": message or "Please analyze this crop/animal image. Identify any disease, pest damage, nutritional deficiency or health issue. Provide diagnosis, severity, recommended treatment with specific product names available in Kenya, and prevention measures."}
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
                elif r.status_code == 404:
                    continue  # try next model
                else:
                    raise HTTPException(500, f"Gemini vision error: {r.text[:300]}")

        raise HTTPException(500, "No compatible Gemini vision model found for your API key. Try getting a new key from aistudio.google.com")
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

        models_to_try = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"]

        for model in models_to_try:
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
                elif r.status_code == 404:
                    continue
                else:
                    raise HTTPException(500, f"Gemini error: {r.text[:300]}")

        raise HTTPException(500, "No compatible Gemini model found. Check your API key at aistudio.google.com")
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
                raise HTTPException(500, f"Groq error: {r.text[:300]}")
            data = r.json()
            reply = data["choices"][0]["message"]["content"]
            return {"reply": reply, "provider": "groq"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Groq failed: {str(e)}")
