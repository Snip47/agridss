from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models.database import Base, engine
from routers import auth, crops, livestock, diseases, ai_advisor, dashboard, climate, location

app = FastAPI(title="AgriDSS Kenya API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth.router,       prefix="/auth",      tags=["auth"])
app.include_router(crops.router,      prefix="/crops",     tags=["crops"])
app.include_router(livestock.router,  prefix="/livestock", tags=["livestock"])
app.include_router(diseases.router,   prefix="/diseases",  tags=["diseases"])
app.include_router(ai_advisor.router, prefix="/ai",        tags=["ai"])
app.include_router(dashboard.router,  prefix="/dashboard", tags=["dashboard"])
app.include_router(climate.router,    prefix="/climate",   tags=["climate"])
app.include_router(location.router,   prefix="/location",  tags=["location"])

@app.get("/")
def root():
    return {"status": "AgriDSS Kenya API running", "version": "2.0"}

@app.get("/health")
def health():
    return {"status": "ok"}
