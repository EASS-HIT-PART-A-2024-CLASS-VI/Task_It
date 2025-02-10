from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import func
from app import crud, schemas
from app.db import get_db
from app.models import Task
from app.schemas import TaskCreate, TaskUpdate, TaskAssign

router = APIRouter()

# 📌 שליפת כל המשימות (אופציונלי: סינון לפי board_id)
@router.get("/", response_model=list[schemas.Task])
def get_tasks(board_id: int = Query(None), db: Session = Depends(get_db)):
    """
    שליפת כל המשימות עם אפשרות לסינון לפי `board_id`
    """
    query = db.query(Task)
    if board_id:
        query = query.filter(Task.board_id == board_id)

    tasks = query.all()
    if not tasks:
        raise HTTPException(status_code=404, detail=f"No tasks found{f' for board ID {board_id}' if board_id else ''}")
    return tasks

# 📌 יצירת משימה חדשה תחת לוח מסוים
@router.post("/", response_model=schemas.Task)
def create_task(task: schemas.TaskCreate, db: Session = Depends(get_db)):
    """
    יצירת משימה חדשה תחת לוח מסוים (ה-`board_id` חייב להיות בגוף הבקשה)
    """
    print(f"Received Task Data: {task.dict()}")  # ✅ Debugging log

    # Ensure `board_id` is present
    if not hasattr(task, "board_id") or task.board_id is None:
        raise HTTPException(status_code=400, detail="Board ID is required")

    # Validate board exists
    board = crud.get_group_by_id(db, task.board_id)
    if not board:
        raise HTTPException(status_code=404, detail=f"Board with ID {task.board_id} not found")

    # Create task
    new_task = Task(**task.dict())
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return new_task


# 📌 עדכון סטטוס של משימה
@router.patch("/{task_id}", response_model=schemas.Task)
def update_task_status(task_id: int, status: TaskUpdate, db: Session = Depends(get_db)):
    """
    עדכון סטטוס של משימה לפי `task_id`
    """
    ALLOWED_STATUSES = ["Not Started", "Working on It", "Done"]

    if status.status not in ALLOWED_STATUSES:
        raise HTTPException(status_code=400, detail=f"Invalid status. Allowed values: {ALLOWED_STATUSES}")

    task = crud.update_task_status(db, task_id=task_id, status=status.status)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

# 📌 שיוך משימה למשתמש
@router.patch("/{task_id}/assign", response_model=schemas.Task)
def assign_task(task_id: int, assignment: TaskAssign, db: Session = Depends(get_db)):
    """
    שיוך משימה למשתמש לפי `task_id`
    """
    user = crud.get_user_by_username(db, assignment.assigned_to)
    if not user:
        raise HTTPException(status_code=400, detail="User does not exist")
    
    task = crud.assign_task_to_user(db, task_id, assignment.assigned_to)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

# 📌 שליפת סטטיסטיקות של משימות
@router.get("/dashboard", response_model=dict)
def get_tasks_dashboard(board_id: int = Query(None), db: Session = Depends(get_db)):
    """
    שליפת סטטיסטיקות של משימות לכלל המערכת או לפי `board_id`
    """
    query = db.query(Task)
    if board_id:
        query = query.filter(Task.board_id == board_id)

    tasks = query.all()
    stats = {
        "total": len(tasks),
        "not_started": sum(1 for task in tasks if task.status == "Not Started"),
        "working_on_it": sum(1 for task in tasks if task.status == "Working on It"),
        "done": sum(1 for task in tasks if task.status == "Done"),
    }
    return stats

# 📌 מחיקת משימה לפי `task_id`
@router.delete("/{task_id}", response_model=dict)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    """
    מחיקת משימה לפי `task_id`
    """
    task = crud.get_task_by_id(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    crud.delete_task(db, task)
    return {"detail": f"Task with id {task_id} deleted successfully"}
