from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List
from models.database import get_db, Crop, ActivityLog
from models.auth import get_current_user, require_admin
import json

router = APIRouter()

class CropCreate(BaseModel):
    name: str; category: str; subcategory: str = ""
    varieties: list = []
    suitable_aez: list = []
    rainfall_min_mm: int = 400; rainfall_max_mm: int = 1600
    altitude_min_m: int = 0; altitude_max_m: int = 3000
    water_requirement: str = "moderate"
    soil_types: list = []
    planting_months: list = []
    maturity_days: int = 90
    description: str = ""; care_tips: str = ""
    expected_yield: str = ""; market_price_ksh: str = ""
    diseases: list = []; best_counties: list = []

def to_dict(c: Crop):
    return {
        "id": c.id, "name": c.name, "category": c.category, "subcategory": c.subcategory,
        "varieties": json.loads(c.varieties or "[]"),
        "suitable_aez": json.loads(c.suitable_aez or "[]"),
        "rainfall_min_mm": c.rainfall_min_mm, "rainfall_max_mm": c.rainfall_max_mm,
        "altitude_min_m": c.altitude_min_m, "altitude_max_m": c.altitude_max_m,
        "water_requirement": c.water_requirement,
        "soil_types": json.loads(c.soil_types or "[]"),
        "planting_months": json.loads(c.planting_months or "[]"),
        "maturity_days": c.maturity_days,
        "description": c.description, "care_tips": c.care_tips,
        "expected_yield": c.expected_yield, "market_price_ksh": c.market_price_ksh,
        "diseases": json.loads(c.diseases or "[]"),
        "best_counties": json.loads(c.best_counties or "[]"),
        "is_active": c.is_active, "created_at": str(c.created_at),
    }

@router.get("/")
def get_crops(
    category: Optional[str] = None, aez: Optional[str] = None,
    search: Optional[str] = None, altitude: Optional[int] = None,
    rainfall: Optional[int] = None,
    db: Session = Depends(get_db)
):
    crops = db.query(Crop).filter(Crop.is_active == True).all()
    result = []
    for c in crops:
        if category and category.lower() != (c.category or "").lower(): continue
        if search and search.lower() not in c.name.lower() and search.lower() not in (c.description or "").lower(): continue
        if aez and aez not in json.loads(c.suitable_aez or "[]"): continue
        if altitude and not (c.altitude_min_m <= altitude <= c.altitude_max_m): continue
        if rainfall and not (c.rainfall_min_mm <= rainfall <= c.rainfall_max_mm): continue
        result.append(to_dict(c))
    return result

@router.get("/{crop_id}")
def get_crop(crop_id: int, db: Session = Depends(get_db)):
    c = db.query(Crop).filter(Crop.id == crop_id).first()
    if not c: raise HTTPException(404, "Crop not found")
    return to_dict(c)

@router.post("/")
def create_crop(data: CropCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    crop = Crop(
        name=data.name, category=data.category, subcategory=data.subcategory,
        varieties=json.dumps(data.varieties),
        suitable_aez=json.dumps(data.suitable_aez),
        rainfall_min_mm=data.rainfall_min_mm, rainfall_max_mm=data.rainfall_max_mm,
        altitude_min_m=data.altitude_min_m, altitude_max_m=data.altitude_max_m,
        water_requirement=data.water_requirement,
        soil_types=json.dumps(data.soil_types),
        planting_months=json.dumps(data.planting_months),
        maturity_days=data.maturity_days,
        description=data.description, care_tips=data.care_tips,
        expected_yield=data.expected_yield, market_price_ksh=data.market_price_ksh,
        diseases=json.dumps(data.diseases),
        best_counties=json.dumps(data.best_counties),
    )
    db.add(crop); db.commit(); db.refresh(crop)
    return to_dict(crop)

@router.put("/{crop_id}")
def update_crop(crop_id: int, data: CropCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    c = db.query(Crop).filter(Crop.id == crop_id).first()
    if not c: raise HTTPException(404, "Crop not found")
    for field, val in data.dict().items():
        if isinstance(val, list): setattr(c, field, json.dumps(val))
        else: setattr(c, field, val)
    db.commit(); db.refresh(c)
    return to_dict(c)

@router.delete("/{crop_id}")
def delete_crop(crop_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    c = db.query(Crop).filter(Crop.id == crop_id).first()
    if not c: raise HTTPException(404, "Crop not found")
    c.is_active = False
    db.commit()
    return {"message": "Crop deleted successfully"}
