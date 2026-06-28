from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from models.database import get_db, Crop, Animal, Disease, ActivityLog, User
from models.auth import get_current_user, require_admin

router = APIRouter()

@router.get("/stats")
def stats(db: Session = Depends(get_db), u=Depends(get_current_user)):
    logs = db.query(ActivityLog).filter(ActivityLog.user_id == u.id).order_by(ActivityLog.created_at.desc()).limit(10).all()
    return {
        "crops": db.query(Crop).filter(Crop.is_active == True).count(),
        "animals": db.query(Animal).filter(Animal.is_active == True).count(),
        "diseases": db.query(Disease).filter(Disease.is_active == True).count(),
        "users": db.query(User).count(),
        "recent_activity": [{"action": l.action, "details": l.details, "time": l.created_at.isoformat()} for l in logs],
    }

@router.get("/users")
def get_users(db: Session = Depends(get_db), _=Depends(require_admin)):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [{"id": u.id, "name": u.name, "email": u.email, "role": u.role,
             "county": u.county, "created_at": u.created_at.isoformat()} for u in users]
