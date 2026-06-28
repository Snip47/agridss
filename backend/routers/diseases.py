from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from models.database import get_db, Disease
from models.auth import require_admin

router = APIRouter()

class DiseaseCreate(BaseModel):
    name: str; type: str; affects: str
    symptoms: str; causes: str; treatment: str
    prevention: str; severity: str

def to_dict(d: Disease):
    return {"id": d.id, "name": d.name, "type": d.type, "affects": d.affects,
            "symptoms": d.symptoms, "causes": d.causes, "treatment": d.treatment,
            "prevention": d.prevention, "severity": d.severity}

@router.get("/")
def get_diseases(type: Optional[str] = None, affects: Optional[str] = None,
                keyword: Optional[str] = None, db: Session = Depends(get_db)):
    diseases = db.query(Disease).filter(Disease.is_active == True).all()
    result = []
    for d in diseases:
        if type and type.lower() != (d.type or "").lower(): continue
        if affects and affects.lower() not in (d.affects or "").lower(): continue
        if keyword:
            kw = keyword.lower()
            if kw not in f"{d.name} {d.symptoms} {d.affects}".lower(): continue
        result.append(to_dict(d))
    return result

@router.get("/{did}")
def get_disease(did: int, db: Session = Depends(get_db)):
    d = db.query(Disease).filter(Disease.id == did).first()
    if not d: raise HTTPException(404, "Disease not found")
    return to_dict(d)

@router.post("/")
def create_disease(data: DiseaseCreate, db: Session = Depends(get_db), _=Depends(require_admin)):
    d = Disease(**data.dict()); db.add(d); db.commit(); db.refresh(d)
    return to_dict(d)

@router.delete("/{did}")
def delete_disease(did: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    d = db.query(Disease).filter(Disease.id == did).first()
    if not d: raise HTTPException(404, "Disease not found")
    d.is_active = False; db.commit()
    return {"message": "Disease deleted"}
