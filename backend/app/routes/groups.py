from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, models, crud
from app.db import get_db

router = APIRouter()

@router.post("/groups", response_model=schemas.GroupResponse)
def create_group(group: schemas.GroupCreate, db: Session = Depends(get_db)):
    existing_group = crud.get_group_by_name(db, group.name)
    if existing_group:
        raise HTTPException(status_code=400, detail="Group already exists")
    return crud.create_group(db, group)

@router.patch("/groups/{group_id}/add_user", response_model=schemas.GroupResponse)
def add_user_to_group(group_id: int, user_id: int, db: Session = Depends(get_db)):
    group = crud.get_group_by_id(db, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    crud.add_user_to_group(db, user, group)
    return group
