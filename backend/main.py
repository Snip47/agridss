import os
import sys
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from models.database import Base, engine
from routers import auth, crops, livestock, diseases, ai_advisor, dashboard, climate

# Create all tables
Base.metadata.create_all(bind=engine)

# Startup event to seed database
async def startup_seed():
    """Run seed on app startup"""
    try:
        from models.database import SessionLocal, User
        from models.auth import hash_password
        import json

        db = SessionLocal()
        user_count = db.query(User).count()
        print(f"🔍 Users in database: {user_count}")

        if user_count == 0:
            print("🌱 No users found — running seed...")

            # Create admin
            admin = User(
                name="AgriDSS Admin",
                email="admin@agridss.co.ke",
                hashed_password=hash_password("Admin@1234"),
                role="admin",
                county="Nairobi",
                constituency="Westlands"
            )
            db.add(admin)

            # Create demo farmer
            farmer = User(
                name="Demo Farmer",
                email="farmer@agridss.co.ke",
                hashed_password=hash_password("Farmer@1234"),
                role="farmer",
                county="Murang'a",
                constituency="Murang'a South",
                ward="Township",
                village="Githunguri",
                farm_size_acres="2.5"
            )
            db.add(farmer)
            db.commit()
            print("✅ Admin created: admin@agridss.co.ke / Admin@1234")
            print("✅ Farmer created: farmer@agridss.co.ke / Farmer@1234")

            # Seed crops, animals, diseases from seed.py
            try:
                sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
                import importlib.util
                spec = importlib.util.spec_from_file_location("seed", os.path.join(os.path.dirname(__file__), "seed.py"))
                # Just run the full seed script
                os.system(f"{sys.executable} {os.path.join(os.path.dirname(__file__), 'seed.py')}")
                print("✅ Full seed completed!")
            except Exception as se:
                print(f"⚠️ Extended seed error: {se}")
        else:
            print(f"✅ Database already has {user_count} users — skipping seed")

        db.close()
    except Exception as e:
        print(f"❌ Seed error: {e}")
        import traceback
        traceback.print_exc()

# Lifespan context manager for startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await startup_seed()
    yield
    # Shutdown (if needed)

app = FastAPI(title="AgriDSS API v2", version="2.0.0", lifespan=lifespan)

# Dynamic CORS origins
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://agridss.vercel.app",
    os.getenv("FRONTEND_URL", ""),
]

app.add_middleware(CORSMiddleware,
    allow_origins=[o for o in origins if o],  # Filter out empty strings
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(auth.router,        prefix="/api/auth",      tags=["Authentication"])
app.include_router(crops.router,       prefix="/api/crops",     tags=["Crops"])
app.include_router(livestock.router,   prefix="/api/livestock", tags=["Livestock"])
app.include_router(diseases.router,    prefix="/api/diseases",  tags=["Diseases"])
app.include_router(ai_advisor.router,  prefix="/api/ai",        tags=["AI Advisor"])
app.include_router(dashboard.router,   prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(climate.router,     prefix="/api/location",  tags=["Location & Climate"])

@app.get("/")
def root():
    return {"message": "AgriDSS API v2 running ✅"}

@app.get("/health")
def health():
    from models.database import SessionLocal, User
    db = SessionLocal()
    users = db.query(User).count()
    db.close()
    return {"status": "ok", "users_in_db": users}
