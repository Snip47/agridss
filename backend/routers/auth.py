import re
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from models.database import get_db, User
from models.auth import hash_password, verify_password, create_token, get_current_user

router = APIRouter()

RESERVED_DOMAINS = ['agridss.co.ke']
BLOCKED_DOMAINS = [
    'mailinator.com','guerrillamail.com','temp-mail.org','throwaway.email',
    'fakeinbox.com','trashmail.com','yopmail.com','tempmail.com',
    'sharklasers.com','grr.la','spam4.me','dispostable.com',
    'maildrop.cc','spamgourmet.com','mailnull.com','getnada.com',
]
EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')

def validate_email(email: str, allow_reserved: bool = False) -> str:
    email = email.strip().lower()
    if not email:
        raise HTTPException(400, "Email is required")
    if not EMAIL_REGEX.match(email):
        raise HTTPException(400, "Please enter a valid email address (e.g. yourname@gmail.com)")
    domain = email.split('@')[1]
    if not allow_reserved and domain in RESERVED_DOMAINS:
        raise HTTPException(400, "This email domain is reserved. Please use your personal email (e.g. gmail.com, yahoo.com)")
    if domain in BLOCKED_DOMAINS:
        raise HTTPException(400, "Please use a real email address (gmail.com, yahoo.com, outlook.com). Temporary emails are not allowed.")
    parts = domain.split('.')
    if len(parts) < 2 or len(parts[-1]) < 2:
        raise HTTPException(400, "Invalid email domain")
    return email

class RegisterReq(BaseModel):
    name: str
    email: str
    password: str
    county: Optional[str] = None
    constituency: Optional[str] = None
    ward: Optional[str] = None
    village: Optional[str] = None
    farm_size_acres: Optional[str] = None

class LoginReq(BaseModel):
    email: str
    password: str

class UpdateProfileReq(BaseModel):
    name: Optional[str] = None
    county: Optional[str] = None
    constituency: Optional[str] = None
    ward: Optional[str] = None
    village: Optional[str] = None
    farm_size_acres: Optional[str] = None
    profile_picture: Optional[str] = None

def user_dict(u: User):
    return {
        "id": u.id, "name": u.name, "email": u.email, "role": u.role,
        "county": u.county, "constituency": u.constituency,
        "ward": u.ward, "village": u.village,
        "farm_size_acres": u.farm_size_acres,
        "profile_picture": u.profile_picture,
        "created_at": str(u.created_at)
    }

@router.post("/register")
def register(data: RegisterReq, db: Session = Depends(get_db)):
    if not data.name or len(data.name.strip()) < 2:
        raise HTTPException(400, "Please enter your full name")
    clean_email = validate_email(data.email, allow_reserved=False)
    if not data.password or len(data.password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters")
    if db.query(User).filter(User.email == clean_email).first():
        raise HTTPException(400, "This email is already registered. Please sign in instead.")
    user = User(
        name=data.name.strip(), email=clean_email,
        hashed_password=hash_password(data.password),
        county=data.county, constituency=data.constituency,
        ward=data.ward, village=data.village,
        farm_size_acres=data.farm_size_acres
    )
    db.add(user); db.commit(); db.refresh(user)
    return {"token": create_token({"sub": str(user.id)}), "user": user_dict(user)}

@router.post("/login")
def login(data: LoginReq, db: Session = Depends(get_db)):
    if not data.email or not data.password:
        raise HTTPException(400, "Email and password are required")
    clean_email = data.email.strip().lower()
    user = db.query(User).filter(User.email == clean_email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(401, "Invalid email or password. Please check your details.")
    return {"token": create_token({"sub": str(user.id)}), "user": user_dict(user)}

@router.get("/me")
def me(u: User = Depends(get_current_user)):
    return user_dict(u)

@router.put("/profile")
def update_profile(data: UpdateProfileReq, db: Session = Depends(get_db), u: User = Depends(get_current_user)):
    if data.name: u.name = data.name.strip()
    if data.county is not None: u.county = data.county
    if data.constituency is not None: u.constituency = data.constituency
    if data.ward is not None: u.ward = data.ward
    if data.village is not None: u.village = data.village
    if data.farm_size_acres is not None: u.farm_size_acres = data.farm_size_acres
    if data.profile_picture is not None: u.profile_picture = data.profile_picture
    db.commit(); db.refresh(u)
    return user_dict(u)
