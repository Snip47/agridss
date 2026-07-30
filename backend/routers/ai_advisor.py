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
- Kenya's 47 counties, farming regions, rainfall patterns and soil types
- 60+ Kenyan crops: maize, tea, coffee, avocado, beans, sorghum, potatoes, tomatoes, kale, bananas, passion fruit, oranges, mangoes, strawberries, roses and more
- 18 livestock types: dairy cattle (Friesian, Ayrshire), beef cattle (Boran), goats, sheep (Dorper), broilers, layers, Kienyeji chickens, turkeys, rabbits, pigs, fish, bees, camels, donkeys, ducks, quail, ostriches
- All major Kenyan crop and livestock diseases with treatment using locally available products
- Planting calendars (long rains March-May, short rains October-December)
- Market prices, inputs and products available in Kenya (Dithane, Ridomil, Karate, Actara, DAP, CAN)

When a farmer describes symptoms or uploads a photo:
- Identify the most likely problem based on symptoms described
- Give a clear diagnosis with confidence level
- Recommend specific products available in Kenya with doses
- Advise when to consult a vet or agricultural officer
- Be concise and practical for smallholder farmers

Always respond in the same language as the farmer (English or Swahili).
Keep responses practical and actionable."""

VISION_PROMPT = """You are AgriDSS AI Advisor for Kenya. A farmer has uploaded a photo of their crop or animal.

Based on common Kenyan farming problems, provide a helpful diagnostic response by:
1. Acknowledging the photo was received
2. Asking the farmer 3-4 specific questions about what they can see:
   - What color are the leaves/skin (yellow, brown, black, white spots?)
   - Are there any visible insects or worms?
   - Is the plant/animal wilting, stunted or showing abnormal growth?
   - How long has this problem been present?
   - Which county/area is the farm located?
3. List the 3 most likely problems it could be based on Kenya farming context
4. Give preliminary advice while waiting for their description

Be warm, helpful and practical. Remember you are helping a Kenyan smallholder farmer."""


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
        "image_analysis": True,  # Always true — we handle images via text fallback
    }


@router.post("/chat")
async def chat(req: ChatReq, u: User = Depends(get_current_user)):
    # Try requested provider first, then fallback
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
    raise HTTPException(400, "No AI API key configured. Add GEMINI_API_KEY or GROQ_API_KEY to backend/.env")


@router.post("/analyze-image")
async def analyze_image(req: ImageAnalysisReq, u: User = Depends(get_current_user)):
    """
    Try Gemini Vision first. If it fails (AQ. key limitation),
    use Groq with a smart prompt that helps the farmer describe symptoms.
    """
    # Try Gemini vision models
    if GEMINI_API_KEY:
        try:
            return await _gemini_vision(req.image, req.message)
        except Exception as e:
            # Vision not supported by this key — fall through to smart text fallback
            pass

    # Smart fallback: Use Groq to guide farmer through symptom description
    if GROQ_API_KEY:
        farmer_msg = req.message or "I uploaded a photo of my crop/animal"
        prompt = f"""A farmer has uploaded a photo of their crop or animal and said: "{farmer_msg}"

Since I cannot view the image directly with the current AI configuration, I need to help this farmer by:
1. Saying I received their photo but need them to describe what they see
2. Asking very specific diagnostic questions about:
   - Colors (yellowing, browning, black spots, white powder, etc.)
   - Presence of insects, worms, or holes
   - Wilting, stunting, or abnormal growth
   - Parts affected (leaves, stems, roots, fruits, skin, eyes, etc.)
   - How many plants/animals are affected
   - How long the problem has been visible
3. Based on common Kenya farming problems, list the 3-5 most likely diagnoses they should consider
4. Give immediate first-aid advice they can take right now

Make this response warm, helpful and practical for a Kenyan smallholder farmer."""

        result = await _groq_chat(prompt, [])
        return {"reply": result["reply"], "provider": "groq-assisted"}

    raise HTTPException(400, "No AI API key configured.")


async def _gemini_vision(image_data: str, message: str):
    if "," in image_data:
        header, b64_data = image_data.split(",", 1)
        mime_type = header.split(":")[1].split(";")[0] if ":" in header else "image/jpeg"
    else:
        b64_data = image_data
        mime_type = "image/jpeg"

    models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro-vision"]

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
                elif r.status_code in [400, 404]:
                    continue
                else:
                    raise Exception(f"Gemini error {r.status_code}")
        except Exception as e:
            if "400" in str(e) or "404" in str(e):
                continue
            raise

    raise Exception("No compatible Gemini vision model for this API key")


async def _gemini_chat(message: str, history: list):
    models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"]

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
                elif r.status_code in [400, 404]:
                    continue
                else:
                    raise HTTPException(500, f"Gemini error {r.status_code}: {r.text[:200]}")
        except HTTPException:
            raise
        except Exception as e:
            if "400" in str(e) or "404" in str(e):
                continue
            raise HTTPException(500, str(e))

    # All Gemini models failed — try Groq
    if GROQ_API_KEY:
        return await _groq_chat(message, history)

    raise HTTPException(500, "No working AI model. Get a standard key from aistudio.google.com")


async def _groq_chat(message: str, history: list):
    try:
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for h in history[-10:]:
            messages.append({"role": h["role"], "content": h["content"]})
        messages.append({"role": "user", "content": message})

        async with httpx.AsyncClient(timeout=30) as client:
            r = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": messages,
                    "max_tokens": 1000,
                    "temperature": 0.7
                }
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
