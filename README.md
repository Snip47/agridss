# AgriDSS Kenya
### Agricultural Decision Support System

A professional web platform providing AI-powered farming intelligence for Kenyan farmers across all 47 counties.

## Live URLs
- **Frontend:** https://agridss.vercel.app
- **Backend:** https://agridss-backend.onrender.com

## Login
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@agridss.co.ke | Admin@1234 |
| Farmer | farmer@agridss.co.ke | Farmer@1234 |

## Features
- **60+ Crops** with varieties, planting calendars and market prices
- **18 Livestock types** with breeds, feeding and vaccination schedules
- **56 Diseases** — crop and livestock with treatment and prevention
- **AI Farm Advisor** — Google Gemini and Groq with photo diagnosis
- **47 Counties** — County → Constituency → Ward location drill-down
- **Climate Analysis** — Rainfall, altitude, soil types and recommendations
- **Photo Diagnosis** — Upload crop/animal photos for instant AI diagnosis
- **Admin Panel** — Manage users, crops, livestock and diseases

## Tech Stack
- **Backend:** FastAPI + SQLAlchemy + PostgreSQL (Supabase)
- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **AI:** Google Gemini Flash (with vision) + Groq Llama 3.3
- **Deploy:** Render (backend) + Vercel (frontend)

## Local Development

### Backend
```bash
cd backend
pip install -r requirements.txt
python seed.py
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

### backend/.env
```
DATABASE_URL=your_supabase_postgresql_url
SECRET_KEY=your_secret_key
GEMINI_API_KEY=your_free_gemini_key_from_aistudio.google.com
GROQ_API_KEY=your_free_groq_key_from_console.groq.com
```

### frontend/.env
```
VITE_API_URL=https://agridss-backend.onrender.com/api
```

## Coverage
- All 47 Kenya counties with constituency and ward data
- Crops: cereals, legumes, vegetables, fruits, cash crops, flowers
- Livestock: cattle, goats, sheep, poultry, rabbits, pigs, fish, bees, camels, donkeys, ducks, quail, ostriches
- Diseases: all major Kenya crop and livestock diseases with treatment guides
