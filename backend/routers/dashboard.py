from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models.database import get_db, User, Crop, Animal, Disease
from models.auth import get_current_user

router = APIRouter()

def require_admin(u: User = Depends(get_current_user)):
    if u.role != 'admin':
        raise HTTPException(403, "Admin access required")
    return u

def user_dict(u: User):
    return {
        "id": u.id, "name": u.name, "email": u.email, "role": u.role,
        "county": u.county, "constituency": u.constituency,
        "ward": getattr(u, 'ward', None),
        "created_at": str(u.created_at)
    }

@router.get("/stats")
def stats(db: Session = Depends(get_db), u: User = Depends(get_current_user)):
    return {
        "crops":   db.query(Crop).count(),
        "animals": db.query(Animal).count(),
        "diseases":db.query(Disease).count(),
        "users":   db.query(User).count(),
    }

@router.get("/users")
def list_users(db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [user_dict(u) for u in users]

@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "User not found")
    if user.role == 'admin':
        raise HTTPException(403, "Cannot delete admin accounts")
    if user.id == admin.id:
        raise HTTPException(403, "Cannot delete your own account")
    db.delete(user)
    db.commit()
    return {"message": f"User {user.name} deleted successfully"}
