from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import crud, schemas
from app.db import get_db
from app.models import Task

router = APIRouter()

@router.get("/")
def get_tasks(board_id: int = None, db: Session = Depends(get_db)):
    """
    Fetch tasks with optional filtering by board_id.
    """
    if not board_id:
        raise HTTPException(status_code=400, detail="Board ID is required")
    
    tasks = crud.get_tasks_for_board(db, board_id)
    if not tasks:
        raise HTTPException(status_code=404, detail=f"No tasks found for board ID {board_id}")
    
    return tasks

@router.get("/board-info", response_model=schemas.Group)
def get_board_info(board_id: int, db: Session = Depends(get_db)):
    """
    Fetch board details (name and ID).
    """
    board = crud.get_group_by_id(db, board_id)
    if not board:
        raise HTTPException(status_code=404, detail=f"Board with ID {board_id} not found")
    
    return board

@router.post("/", response_model=schemas.Task)
def create_task_for_board(board_id: int, task: schemas.TaskCreate, db: Session = Depends(get_db)):
    """
    Create a task for a specific board.
    """
    if not board_id:
        raise HTTPException(status_code=400, detail="Board ID is required")
    return crud.create_task_for_board(db, board_id, task)
