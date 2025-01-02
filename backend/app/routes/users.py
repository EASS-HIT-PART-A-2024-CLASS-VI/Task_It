from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.db import get_db
from app.models import User
from sqlalchemy.orm import Session
from app.crud import create_user, get_user_by_email, verify_user
from app.schemas import UserCreate
from app.db import SessionLocal

router = APIRouter()

# Login Request Model
class LoginRequest(BaseModel):
    email: str
    password: str

# Mock function to validate user (replace with hashed password check in production)
def validate_user(email: str, password: str, db: Session):
    user = db.query(User).filter(User.email == email).first()
    if not user or user.password != password:
        return None
    return user

# Login Endpoint
@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = verify_user(db, request.email, request.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"message": "Login successful", "username": user.username}


# Register Endpoint
@router.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    print(f"Received registration request: {user}");
    existing_user = get_user_by_email(db, email=user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = create_user(db=db, user=user)  # Plain password stored
    return {"message": "User created successfully", "user": {"email": new_user.email}}

