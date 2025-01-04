from fastapi import APIRouter, Depends, HTTPException
from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import func
from app import crud, schemas
from app.db import get_db
from app.models import Task
from app.schemas import TaskCreate

router = APIRouter()

@router.get("/tasks", response_model=list[schemas.Task])
def read_tasks(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return crud.get_tasks(db, skip=skip, limit=limit)

@router.post("/tasks", response_model=schemas.Task)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    # Assuming owner_id is passed (e.g., via authentication)
    owner_id = 1
    return crud.create_task(db, task=task, owner_id=owner_id)

@router.patch("/tasks/{task_id}", response_model=schemas.Task)
def update_task_status(task_id: int, status: schemas.TaskUpdate, db: Session = Depends(get_db)):
    ALLOWED_STATUSES = ["Pending", "In Progress", "Completed"]

    if status.status not in ALLOWED_STATUSES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Allowed values: {ALLOWED_STATUSES}"
        )

    db_task = crud.update_task_status(db, task_id=task_id, status=status.status)
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task

@router.patch("/tasks/{task_id}/assign", response_model=schemas.Task)
def assign_task(task_id: int, assignment: schemas.TaskAssign, db: Session = Depends(get_db)):
    user = crud.get_user_by_username(db, assignment.assigned_to)
    if not user:
        raise HTTPException(status_code=400, detail="User does not exist")
    
    task = crud.assign_task_to_user(db, task_id, assignment.assigned_to)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.get("/tasks/dashboard", response_model=dict)
def get_tasks_dashboard(db: Session = Depends(get_db)):
    tasks_by_status = db.query(Task.status, func.count(Task.id)).group_by(Task.status).all()
    return {"tasks_by_status": dict(tasks_by_status)}

@router.get("/tasks/filter", response_model=list[schemas.Task])
def filter_tasks_by_deadline(deadline: date, db: Session = Depends(get_db)):
    return db.query(Task).filter(Task.deadline <= deadline).all()

@router.delete("/tasks/{task_id}", response_model=dict)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = crud.get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    crud.delete_task(db, task)
    return {"detail": f"Task with id {task_id} deleted successfully"}

@router.get("/")
def get_tasks(board_id: int = None, db: Session = Depends(get_db)):
    """
    Fetch tasks with optional filtering by board_id.
    """
    query = db.query(Task)
    if board_id:
        query = query.filter(Task.board_id == board_id)
    return query.all()

@router.get("/dashboard")
def task_dashboard(board_id: int = None, db: Session = Depends(get_db)):
    """
    Get task statistics grouped by status for a specific board.
    """
    query = db.query(Task)
    if board_id:
        query = query.filter(Task.board_id == board_id)
    
    tasks = query.all()
    stats = {
        "total": len(tasks),
        "pending": sum(1 for task in tasks if task.status == "Pending"),
        "in_progress": sum(1 for task in tasks if task.status == "In Progress"),
        "completed": sum(1 for task in tasks if task.status == "Completed"),
    }
    return stats

@router.post("/")
def create_task(task: TaskCreate, board_id: int, db: Session = Depends(get_db)):
    """
    Create a new task associated with a specific board.
    """
    new_task = Task(**task.dict(), board_id=board_id)
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task
