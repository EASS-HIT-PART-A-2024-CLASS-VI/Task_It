from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, models, crud
from app.db import get_db

router = APIRouter()

@router.post("/users/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    existing_user = crud.get_user_by_email_or_username(db, user.email, user.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    return crud.create_user(db, user)

@router.get("/users", response_model=list[schemas.UserResponse])
def get_users(db: Session = Depends(get_db)):
    return crud.get_all_users(db)
