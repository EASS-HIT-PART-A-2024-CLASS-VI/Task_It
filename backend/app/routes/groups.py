from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, models, crud
from app.db import get_db

router = APIRouter()  # Remove the prefix here since it's handled in main.py

@router.post("/", response_model=schemas.Group)
def create_group(group: schemas.GroupCreate, db: Session = Depends(get_db)):
    try:
        existing_group = crud.get_group_by_id(db, group.name)
        if existing_group:
            raise HTTPException(status_code=400, detail="Group already exists")
        return crud.create_group(db, group)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=list[schemas.Group])
def get_groups(db: Session = Depends(get_db)):
    return crud.get_all_groups(db)

@router.patch("/{group_id}/add_user", response_model=schemas.Group)
def add_user_to_group(group_id: int, user_id: int, db: Session = Depends(get_db)):
    group = crud.get_group_by_id(db, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    user = crud.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    crud.add_user_to_group(db, user_id, group_id)
    return group