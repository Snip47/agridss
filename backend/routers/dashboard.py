from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.database import get_db, User, Crop, Animal, Disease, ActivityLog
from models.auth import get_current_user

router = APIRouter()

def require_admin(u: User = Depends(get_current_user)):
    if u.role != "admin":
        raise HTTPException(403, "Admin access required")
    return u

@router.get("/stats")
def stats(db: Session = Depends(get_db), u: User = Depends(get_current_user)):
    logs = db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).limit(10).all()
    return {
        "crops": db.query(Crop).filter(Crop.is_active == True).count(),
        "animals": db.query(Animal).filter(Animal.is_active == True).count(),
        "diseases": db.query(Disease).filter(Disease.is_active == True).count(),
        "users": db.query(User).count(),
        "recent_activity": [{"action": l.action, "details": l.details, "created_at": str(l.created_at)} for l in logs]
    }

@router.get("/users")
def get_users(db: Session = Depends(get_db), u: User = Depends(require_admin)):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [{
        "id": u.id, "name": u.name, "email": u.email,
        "role": u.role, "county": u.county,
        "constituency": u.constituency,
        "profile_picture": u.profile_picture,
        "created_at": str(u.created_at)
    } for u in users]

@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), u: User = Depends(require_admin)):
    if u.id == user_id:
        raise HTTPException(400, "Cannot delete yourself")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    # Delete logs first
    db.query(ActivityLog).filter(ActivityLog.user_id == user_id).delete()
    db.delete(user)
    db.commit()
    return {"message": f"User {user.name} deleted"}
