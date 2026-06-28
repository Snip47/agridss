from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from models.auth import get_current_user
from models.database import get_db, ActivityLog
from sqlalchemy.orm import Session
import httpx, os

router = APIRouter()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

def get_gemini_url():
    if GEMINI_API_KEY.startswith("AQ."):
        return "https://generativelanguage.googleapis.com/v1alpha/models/gemini-2.0-flash:generateContent"
    return "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

AI_SYSTEM_PROMPT = """You are AgriDSS AI — an expert agricultural advisor for Kenyan farmers.

Your expertise covers:
CROPS: All Kenyan crops including maize (H614D, Katumani), tea, coffee (Ruiru 11, Batian, SL28), avocado (Hass, Fuerte), beans, potatoes (Shangi, Markies), tomatoes, vegetables, fruits, cash crops. Specific varieties, planting calendars, inputs, yields.

LIVESTOCK: Dairy cattle (Friesian, Ayrshire, Sahiwal), beef cattle (Boran, Simmental), goats (Toggenburg, Galla, Boer), sheep (Dorper, Red Maasai), poultry (layers, broilers, kienyeji), rabbits (California White, NZ White), pigs (Large White, Landrace), fish (Tilapia, Trout), bees, camels, donkeys.

KENYA KNOWLEDGE:
- All 47 counties and agro-ecological zones
- Long rains (March-May) and short rains (October-December)
- ASAL zones and drought-tolerant farming
- Kenya inputs: DAP, CAN, NPK fertilizers, certified seeds
- Organizations: KTDA, DVS, KAGRC, KARLO, KDB
- Diseases: MLN, Coffee Berry Disease, Late Blight, ECF, FMD, PPR, Newcastle

RESPONSE STYLE:
- Practical, actionable advice with quantities and KSh costs
- Reference Kenya-specific brands (Osho, MEA, Twiga, Elgon)
- Respond in same language (English or Swahili)
- Use bullet points and clear sections"""

class ChatMessage(BaseModel):
    message: str
    history: list = []
    provider: str = "gemini"

async def call_gemini(message: str, history: list) -> str:
    if not GEMINI_API_KEY:
        raise HTTPException(500, "GEMINI_API_KEY not configured")

    contents = []
    for h in history[-8:]:
        role = "user" if h["role"] == "user" else "model"
        contents.append({"role": role, "parts": [{"text": h["content"]}]})
    contents.append({"role": "user", "parts": [{"text": message}]})

    url = get_gemini_url()
    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.post(
            f"{url}?key={GEMINI_API_KEY}",
            json={
                "system_instruction": {"parts": [{"text": AI_SYSTEM_PROMPT}]},
                "contents": contents,
                "generationConfig": {"maxOutputTokens": 1024, "temperature": 0.7},
            }
        )

    if r.status_code != 200:
        err = r.json()
        msg = err.get("error", {}).get("message", r.text[:300])
        raise HTTPException(502, f"Gemini error: {msg}")

    data = r.json()
    try:
        return data["candidates"][0]["content"]["parts"][0]["text"]
    except (KeyError, IndexError):
        raise HTTPException(502, f"Unexpected Gemini response: {str(data)[:300]}")

async def call_groq(message: str, history: list) -> str:
    if not GROQ_API_KEY:
        raise HTTPException(500, "GROQ_API_KEY not configured")

    messages = [{"role": "system", "content": AI_SYSTEM_PROMPT}]
    for h in history[-8:]:
        messages.append({"role": h["role"], "content": h["content"]})
    messages.append({"role": "user", "content": message})

    async with httpx.AsyncClient(timeout=30) as client:
        r = await client.post(
            GROQ_URL,
            headers={"Authorization": f"Bearer {GROQ_API_KEY}", "Content-Type": "application/json"},
            json={"model": "llama-3.3-70b-versatile", "messages": messages, "max_tokens": 1024, "temperature": 0.7}
        )

    if r.status_code != 200:
        raise HTTPException(502, f"Groq error: {r.text[:300]}")

    return r.json()["choices"][0]["message"]["content"]

@router.post("/chat")
async def chat(data: ChatMessage, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    reply = ""
    errors = []

    if data.provider == "groq" and GROQ_API_KEY:
        try:
            reply = await call_groq(data.message, data.history)
        except Exception as e:
            errors.append(f"Groq: {str(e)}")

    if not reply and GEMINI_API_KEY:
        try:
            reply = await call_gemini(data.message, data.history)
        except Exception as e:
            errors.append(f"Gemini: {str(e)}")

    if not reply and GROQ_API_KEY:
        try:
            reply = await call_groq(data.message, data.history)
        except Exception as e:
            errors.append(f"Groq fallback: {str(e)}")

    if not reply:
        detail = " | ".join(errors) if errors else "No AI API key configured"
        raise HTTPException(500, detail=detail)

    log = ActivityLog(user_id=current_user.id, action="ai_chat", details=data.message[:200])
    db.add(log); db.commit()

    return {"reply": reply, "provider": data.provider}

@router.get("/status")
def ai_status():
    key_type = "not set"
    if GEMINI_API_KEY:
        key_type = "AQ. (v1alpha)" if GEMINI_API_KEY.startswith("AQ.") else "AIza (v1beta)"
    return {
        "gemini_configured": bool(GEMINI_API_KEY),
        "groq_configured": bool(GROQ_API_KEY),
        "gemini_key_type": key_type,
        "gemini_key_url": "https://aistudio.google.com/apikey",
        "groq_key_url": "https://console.groq.com",
    }
