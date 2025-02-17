from fastapi import APIRouter, HTTPException, Query, Depends
from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel
from typing import Optional, List
from app.db import db
from app.routes.users import get_current_user
from app.crud import (
    create_task,
    get_task_by_id,
    delete_task,
    assign_task_to_user,
    get_group_by_id
)

router = APIRouter()

# ✅ **Task Schema** (Pydantic)
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    board_id: str  # ✅ This is a MongoDB ID (we will convert it)

# 📌 **Retrieve all tasks (filter by `board_id`)**
@router.get("/", response_model=List[dict])
async def get_tasks(board_id: str = Query(None)):
    """
    Retrieve all tasks with an optional filter by `board_id`
    """
    if board_id and not ObjectId.is_valid(board_id):
        raise HTTPException(status_code=400, detail="Invalid board ID format")

    filter_query = {"board_id": ObjectId(board_id)} if board_id else {}
    tasks = await db.tasks.find(filter_query).to_list(length=100)

    return [
        {
            "id": str(task["_id"]),
            "title": task["title"],
            "description": task.get("description", ""),
            "status": task["status"],
            "priority": task["priority"],
            "board_id": str(task["board_id"]),
            "deadline": task.get("deadline", None)
        }
        for task in tasks
    ]


# 📌 **Create a new task**
@router.post("/", response_model=dict)
async def create_new_task(task: TaskCreate, user: dict = Depends(get_current_user)):
    """
    Create a new task under a specific board (`board_id` is required)
    """
    if not ObjectId.is_valid(task.board_id):
        raise HTTPException(status_code=400, detail="Invalid board ID format")

    # Validate if the board exists
    board = await get_group_by_id(task.board_id)
    if not board:
        raise HTTPException(status_code=404, detail=f"Board with ID {task.board_id} not found")

    # ✅ Convert `board_id` and `created_by` to MongoDB ObjectId
    new_task = {
        "title": task.title,
        "description": task.description or "",
        "status": task.status,
        "priority": task.priority,
        "board_id": ObjectId(task.board_id),
        "created_by": ObjectId(user["id"]),
        "created_at": datetime.utcnow(),
        "deadline": datetime.strptime(task.deadline, "%Y-%m-%d").isoformat() if task.deadline else None
    }

    result = await db.tasks.insert_one(new_task)
    return {"message": "Task created successfully", "task_id": str(result.inserted_id)}


# 📌 **Update a task**
@router.patch("/{task_id}", response_model=dict)
async def update_task(task_id: str, task_update: dict):
    if not ObjectId.is_valid(task_id):
        raise HTTPException(status_code=400, detail="Invalid task ID format")

    task = await get_task_by_id(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # ✅ Fix: Ensure deadline format before updating
    if "deadline" in task_update and task_update["deadline"]:
        try:
            task_update["deadline"] = datetime.strptime(task_update["deadline"], "%Y-%m-%d")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid deadline format. Use YYYY-MM-DD")

    await db.tasks.update_one({"_id": ObjectId(task_id)}, {"$set": task_update})

    # ✅ Debugging log to check saved values
    updated_task = await get_task_by_id(task_id)
    print(f"📌 Updated Task in DB: {updated_task}")

    return {"message": "Task updated successfully"}


# 📌 **Assign a task to a user**
@router.patch("/{task_id}/assign", response_model=dict)
async def assign_task(task_id: str, user_id: str):
    """
    Assign a task to a user (user must be in the same board)
    """
    if not ObjectId.is_valid(task_id) or not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid ID format")

    task = await get_task_by_id(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    board = await get_group_by_id(str(task["board_id"]))
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")

    if ObjectId(user_id) not in board["members"]:
        raise HTTPException(status_code=400, detail="User is not assigned to this board")

    await assign_task_to_user(task_id, user_id)
    return {"message": "Task assigned successfully"}


# 📌 **Retrieve task statistics (Dashboard)**
@router.get("/dashboard", response_model=dict)
async def get_task_dashboard(board_id: str = Query(None)):
    """
    Retrieve task statistics for a board or the entire system
    """
    if board_id and not ObjectId.is_valid(board_id):
        raise HTTPException(status_code=400, detail="Invalid board ID format")

    filter_query = {"board_id": ObjectId(board_id)} if board_id else {}
    tasks = await db.tasks.find(filter_query).to_list(length=100)

    stats = {
        "total": len(tasks),
        "not_started": sum(1 for task in tasks if task["status"] == "Not Started"),
        "working_on_it": sum(1 for task in tasks if task["status"] == "Working on It"),
        "done": sum(1 for task in tasks if task["status"] == "Done"),
    }
    return stats


# 📌 **Delete a task**
@router.delete("/{task_id}", response_model=dict)
async def remove_task(task_id: str):
    """
    Delete a task by `task_id`
    """
    if not ObjectId.is_valid(task_id):
        raise HTTPException(status_code=400, detail="Invalid task ID format")

    task = await get_task_by_id(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    await delete_task(task_id)
    return {"message": f"Task with ID {task_id} deleted successfully"}
