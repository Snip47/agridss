from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, Enum, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import enum, os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./agridss.db")
if DATABASE_URL.startswith("postgres://"): DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try: yield db
    finally: db.close()

class UserRole(str, enum.Enum):
    admin = "admin"
    farmer = "farmer"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.farmer)
    county = Column(String)
    constituency = Column(String)
    ward = Column(String)
    village = Column(String)
    farm_size_acres = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    logs = relationship("ActivityLog", back_populates="user")

class Crop(Base):
    __tablename__ = "crops"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    category = Column(String)
    subcategory = Column(String)
    varieties = Column(Text)         # JSON
    suitable_aez = Column(Text)      # JSON list of AEZ codes
    rainfall_min_mm = Column(Integer)
    rainfall_max_mm = Column(Integer)
    altitude_min_m = Column(Integer)
    altitude_max_m = Column(Integer)
    water_requirement = Column(String)
    soil_types = Column(Text)        # JSON
    planting_months = Column(Text)   # JSON
    maturity_days = Column(Integer)
    description = Column(Text)
    care_tips = Column(Text)
    expected_yield = Column(String)
    market_price_ksh = Column(String)
    diseases = Column(Text)          # JSON
    best_counties = Column(Text)     # JSON
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Animal(Base):
    __tablename__ = "animals"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    category = Column(String)
    purpose = Column(String)
    breeds = Column(Text)             # JSON
    suitable_aez = Column(Text)       # JSON
    description = Column(Text)
    feeding_guide = Column(Text)
    housing_requirements = Column(Text)
    vaccination_schedule = Column(Text)  # JSON
    common_diseases = Column(Text)       # JSON
    breeding_info = Column(Text)
    market_info = Column(Text)
    water_requirement = Column(String)
    space_required = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Disease(Base):
    __tablename__ = "diseases"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    type = Column(String)
    affects = Column(String)
    symptoms = Column(Text)
    causes = Column(Text)
    treatment = Column(Text)
    prevention = Column(Text)
    severity = Column(String)
    is_active = Column(Boolean, default=True)

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String)
    details = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="logs")
