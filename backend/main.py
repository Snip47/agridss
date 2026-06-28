import os
from dotenv import load_dotenv
load_dotenv()  # Must be first before any other imports

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models.database import Base, engine
from routers import auth, crops, livestock, diseases, ai_advisor, dashboard, climate

Base.metadata.create_all(bind=engine)

app = FastAPI(title="AgriDSS API v2", version="2.0.0")

app.add_middleware(CORSMiddleware,
    allow_origins=["http://localhost:5173","http://localhost:3000","https://*.vercel.app"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

app.include_router(auth.router,        prefix="/api/auth",      tags=["Authentication"])
app.include_router(crops.router,       prefix="/api/crops",     tags=["Crops"])
app.include_router(livestock.router,   prefix="/api/livestock", tags=["Livestock"])
app.include_router(diseases.router,    prefix="/api/diseases",  tags=["Diseases"])
app.include_router(ai_advisor.router,  prefix="/api/ai",        tags=["AI Advisor"])
app.include_router(dashboard.router,   prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(climate.router,     prefix="/api/location",  tags=["Location & Climate"])

@app.get("/")
def root():
    return {"message": "AgriDSS API v2 running"}
