from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from models.database import get_db, User
from models.auth import hash_password, verify_password, create_token, get_current_user

router = APIRouter()

class RegisterReq(BaseModel):
    name: str; email: str; password: str
    county: str = None; constituency: str = None; ward: str = None
    village: str = None; farm_size_acres: str = None

class LoginReq(BaseModel):
    email: str; password: str

def user_dict(u: User):
    return {"id": u.id, "name": u.name, "email": u.email, "role": u.role,
            "county": u.county, "constituency": u.constituency, "ward": u.ward,
            "village": u.village, "farm_size_acres": u.farm_size_acres}

@router.post("/register")
def register(data: RegisterReq, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(400, "Email already registered")
    user = User(name=data.name, email=data.email,
                hashed_password=hash_password(data.password),
                county=data.county, constituency=data.constituency,
                ward=data.ward, village=data.village,
                farm_size_acres=data.farm_size_acres)
    db.add(user); db.commit(); db.refresh(user)
    return {"token": create_token({"sub": str(user.id)}), "user": user_dict(user)}

@router.post("/login")
def login(data: LoginReq, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(401, "Invalid credentials")
    return {"token": create_token({"sub": str(user.id)}), "user": user_dict(user)}

@router.get("/me")
def me(u: User = Depends(get_current_user)):
    return user_dict(u)
