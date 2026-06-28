from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from models.database import get_db, Animal
from models.auth import require_admin
import json

router = APIRouter()

class AnimalCreate(BaseModel):
    name: str; category: str; purpose: str
    breeds: list = []; suitable_aez: list = []
    description: str = ""; feeding_guide: str = ""
    housing_requirements: str = ""; vaccination_schedule: list = []
    common_diseases: list = []; breeding_info: str = ""
    market_info: str = ""; water_requirement: str = ""
    space_required: str = ""

def to_dict(a: Animal):
    return {
        "id": a.id, "name": a.name, "category": a.category, "purpose": a.purpose,
        "breeds": json.loads(a.breeds or "[]"),
        "suitable_aez": json.loads(a.suitable_aez or "[]"),
        "description": a.description, "feeding_guide": a.feeding_guide,
        "housing_requirements": a.housing_requirements,
        "vaccination_schedule": json.loads(a.vaccination_schedule or "[]"),
        "common_diseases": json.loads(a.common_diseases or "[]"),
        "breeding_info": a.breeding_info, "market_info": a.market_info,
        "water_requirement": a.water_requirement, "space_required": a.space_required,
        "is_active": a.is_active, "created_at": str(a.created_at),
    }

@router.get("/")
def get_animals(category: Optional[str] = None, purpose: Optional[str] = None,
               search: Optional[str] = None, aez: Optional[str] = None,
               db: Session = Depends(get_db)):
    animals = db.query(Animal).filter(Animal.is_active == True).all()
    result = []
    for a in animals:
        if category and category.lower() != (a.category or "").lower(): continue
        if purpose and purpose.lower() not in (a.purpose or "").lower(): continue
        if search and search.lower() not in a.name.lower(): continue
        if aez and aez not in json.loads(a.suitable_aez or "[]"): continue
        result.append(to_dict(a))
    return result

@router.get("/{animal_id}")
def get_animal(animal_id: int, db: Session = Depends(get_db)):
    a = db.query(Animal).filter(Animal.id == animal_id).first()
    if not a: raise HTTPException(404, "Animal not found")
    return to_dict(a)

@router.post("/")
def create_animal(data: AnimalCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    a = Animal(
        name=data.name, category=data.category, purpose=data.purpose,
        breeds=json.dumps(data.breeds), suitable_aez=json.dumps(data.suitable_aez),
        description=data.description, feeding_guide=data.feeding_guide,
        housing_requirements=data.housing_requirements,
        vaccination_schedule=json.dumps(data.vaccination_schedule),
        common_diseases=json.dumps(data.common_diseases),
        breeding_info=data.breeding_info, market_info=data.market_info,
        water_requirement=data.water_requirement, space_required=data.space_required,
    )
    db.add(a); db.commit(); db.refresh(a)
    return to_dict(a)

@router.put("/{animal_id}")
def update_animal(animal_id: int, data: AnimalCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    a = db.query(Animal).filter(Animal.id == animal_id).first()
    if not a: raise HTTPException(404, "Animal not found")
    for field, val in data.dict().items():
        if isinstance(val, list): setattr(a, field, json.dumps(val))
        else: setattr(a, field, val)
    db.commit(); db.refresh(a)
    return to_dict(a)

@router.delete("/{animal_id}")
def delete_animal(animal_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    a = db.query(Animal).filter(Animal.id == animal_id).first()
    if not a: raise HTTPException(404, "Animal not found")
    a.is_active = False
    db.commit()
    return {"message": "Animal deleted successfully"}
