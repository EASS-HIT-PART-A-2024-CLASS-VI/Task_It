from fastapi import APIRouter, HTTPException, Query
from datetime import datetime
from app.models import Task
from app.db import db
from app.crud import (
    create_task,
    get_task_by_id,
    delete_task,
    assign_task_to_user,
    get_group_by_id
)
from bson import ObjectId

router = APIRouter()

# 📌 Retrieve all tasks (optional: filter by board_id)
@router.get("/", response_model=list)
async def get_tasks(board_id: str = Query(None)):
    """
    Retrieve all tasks with an optional filter by `board_id`
    """
    filter_query = {"board_id": ObjectId(board_id)} if board_id else {}
    tasks = await db.tasks.find(filter_query).to_list(length=100)

    if not tasks:
        raise HTTPException(status_code=404, detail=f"No tasks found{' for board ID ' + board_id if board_id else ''}")

    return [{"id": str(task["_id"]), "title": task["title"], "status": task["status"]} for task in tasks]

# 📌 Create a new task
@router.post("/", response_model=dict)
async def create_new_task(task: Task):
    """
    Create a new task under a specific board (`board_id` is required)
    """
    if not task.board_id:
        raise HTTPException(status_code=400, detail="Board ID is required")

    # Validate if board exists
    board = await get_group_by_id(str(task.board_id))
    if not board:
        raise HTTPException(status_code=404, detail=f"Board with ID {task.board_id} not found")

    # Create task
    new_task = await create_task(task)
    return {"message": "Task created", "task_id": str(new_task["_id"])}

# 📌 Update task details
@router.patch("/{task_id}", response_model=dict)
async def update_task(task_id: str, task_update: dict):
    """
    Update task details (e.g., title, status, priority)
    """
    task = await get_task_by_id(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Update provided fields
    update_fields = {k: v for k, v in task_update.items() if v is not None}
    if "deadline" in update_fields:
        update_fields["deadline"] = datetime.strptime(update_fields["deadline"], "%Y-%m-%dT%H:%M:%S")

    await db.tasks.update_one({"_id": ObjectId(task_id)}, {"$set": update_fields})
    return {"message": "Task updated successfully"}

# 📌 Assign a task to a user
@router.patch("/{task_id}/assign", response_model=dict)
async def assign_task(task_id: str, user_id: str):
    """
    Assign a task to a user (user must be in the same board)
    """
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

# 📌 Retrieve task statistics (e.g., total tasks, status breakdown)
@router.get("/dashboard", response_model=dict)
async def get_task_dashboard(board_id: str = Query(None)):
    """
    Retrieve task statistics for a board or the entire system
    """
    filter_query = {"board_id": ObjectId(board_id)} if board_id else {}
    tasks = await db.tasks.find(filter_query).to_list(length=100)

    stats = {
        "total": len(tasks),
        "not_started": sum(1 for task in tasks if task["status"] == "Not Started"),
        "working_on_it": sum(1 for task in tasks if task["status"] == "Working on It"),
        "done": sum(1 for task in tasks if task["status"] == "Done"),
    }
    return stats

# 📌 Delete a task
@router.delete("/{task_id}", response_model=dict)
async def remove_task(task_id: str):
    """
    Delete a task by `task_id`
    """
    task = await get_task_by_id(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    await delete_task(task_id)
    return {"message": f"Task with ID {task_id} deleted successfully"}
