# 🌾 AgriDSS Kenya v2.0 — Agricultural Decision Support System

A comprehensive, government-ready full-stack web application for Kenya agricultural decision-making.

## ✨ What's New in v2.0

| Feature | v1 | v2 |
|---------|----|----|
| Crops | 6 basic | **30+ with specific varieties** |
| Livestock | 5 types | **14 species with specific breeds** |
| Location | County only | **County → Constituency → Ward → Village** |
| Climate Analysis | ❌ | **✅ Agro-Ecological Zone matching** |
| AI Advisor | Claude (paid) | **FREE (Gemini Flash / Groq Llama)** |
| Admin Delete | ❌ | **✅ Delete crops, animals, diseases** |
| Varieties | None | **Maize: 6 varieties, Coffee: 5, Potato: 6...** |

## 🗂 Features

- 🌍 **Climate & Location Advisor** — County → Constituency → Ward drill-down with AEZ analysis
- 🌱 **Crop Advisor** — 30+ crops with specific varieties, altitude ranges, planting calendars
- 🐄 **Livestock Advisor** — 14 livestock with specific breeds (California White rabbit, Dorper sheep, etc.)
- 🦠 **Disease Diagnosis** — 13+ diseases with detailed treatment and prevention
- 🤖 **FREE AI Advisor** — Google Gemini Flash (free) or Groq Llama 3.3 (free)
- 📊 **Dashboard** — Stats, quick actions, farmer location info
- ⚙️ **Admin Panel** — Add/delete crops, livestock, diseases. View users.

## 🚀 Setup (VS Code)

### Backend

```cmd
cd agridss2\backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Edit `.env` — add your FREE AI key (see below).

```cmd
python seed.py
uvicorn main:app --reload
```

### Frontend

```cmd
cd agridss2\frontend
npm install
copy .env.example .env
npm run dev
```

Open: http://localhost:5173

### Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@agridss.co.ke | Admin@1234 |
| Farmer | farmer@agridss.co.ke | Farmer@1234 |

---

## 🤖 FREE AI API Keys

### Option 1: Google Gemini Flash (Recommended)
- **FREE:** 1,500 requests/day — No credit card needed
- Get key: https://aistudio.google.com/apikey
- Add to `.env`: `GEMINI_API_KEY=your_key_here`

### Option 2: Groq (Llama 3.3 70B)
- **FREE:** 14,400 requests/day — No credit card needed
- Get key: https://console.groq.com
- Add to `.env`: `GROQ_API_KEY=your_key_here`

You can configure **both** for redundancy.

---

## 🌍 Location Coverage

Currently covers constituencies in:
Nairobi, Machakos, Kiambu, Murang'a, Nakuru, Nyeri, Meru, Kisumu, Kericho, Uasin Gishu, Kajiado, Kilifi, Bungoma, Makueni, Trans Nzoia, Embu

*Admin can expand by editing `backend/data/kenya_locations.py`*

## 🌾 Agro-Ecological Zones Covered

| Code | Name | Example Crops |
|------|------|---------------|
| LH2 | Lower Highland Humid | Tea, Coffee, Dairy |
| LH3 | Lower Highland Semi-Humid | Coffee, Maize, Wheat |
| UM2 | Upper Midland Moist | Coffee, Horticulture |
| UM3 | Upper Midland Semi-Humid | Maize, Beans |
| UM4 | Upper Midland Transitional | Sorghum, Sunflower |
| LM2-5 | Lower Midland | Sugarcane → Arid Livestock |
| CL3-4 | Coastal Lowland | Cassava, Coconut, Mango |

## 🏛 Government Presentation Notes

This system demonstrates:
1. Kenya-specific AEZ classification (Jaetzold methodology)
2. Real variety-level recommendations (not just crop-level)
3. Specific breed recommendations for livestock
4. Location precision to ward level
5. Integrated climate × crop × livestock recommendations
6. Free AI advisor accessible to all farmers
7. Role-based access (admin vs farmer)
8. Expandable knowledge base via admin panel

## 📦 Deployment

- **Backend:** Render.com — Set Python 3.12, add environment variables
- **Frontend:** Vercel — Set `VITE_API_URL` to Render backend URL
- **Database:** Supabase PostgreSQL (free tier) for production

## 🔧 Tech Stack

- **Backend:** FastAPI + SQLAlchemy + SQLite/PostgreSQL
- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **AI:** Google Gemini Flash (free) / Groq Llama 3.3 (free)
- **Auth:** JWT + bcrypt
