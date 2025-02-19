import logging
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
    deadline: Optional[datetime] # ✅ Accept deadline as a string

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

    # ✅ Fetch all unique user IDs from assigned_to field
    user_ids = set()
    for task in tasks:
        for user_id in task.get("assigned_to", []):
            if ObjectId.is_valid(user_id):
                user_ids.add(ObjectId(user_id))

    logging.info(f"📌 Extracted User IDs: {user_ids}")  # ✅ Debug user IDs

    # ✅ Fetch user details for mapping
    users = await db.users.find({"_id": {"$in": list(user_ids)}}).to_list(length=len(user_ids))
    user_map = {str(user["_id"]): user["username"] for user in users}  # ✅ Ensure keys are strings

    logging.info(f"📌 User Map: {user_map}")  # ✅ Debug user mapping

    response = []
    for task in tasks:
        assigned_users = []
        for user_id in task.get("assigned_to", []):
            assigned_users.append(user_map.get(str(user_id), "Unknown User"))  # ✅ Ensure string lookup

        logging.info(f"📌 Task {task['_id']} Assigned To: {assigned_users}")  # ✅ Log assigned users

        response.append({
            "id": str(task["_id"]),
            "title": task["title"],
            "description": task.get("description", ""),
            "status": task["status"],
            "priority": task["priority"],
            "board_id": str(task["board_id"]),
            "deadline": task.get("deadline", None),
            "assigned_to": assigned_users,  # ✅ Should now show usernames
            "created_by": str(task["created_by"]),
        })

    return response

# 📌 **Retrive all user tasks
@router.get("/user/{user_id}", response_model=List[dict])
async def get_users_tasks(user_id: str):
    logging.info(f"📌 Fetching tasks for User ID: {user_id}")

    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID format")

    tasks = await db.tasks.find({"assigned_to": user_id}).to_list(length=100)

    # Fetch board names
    board_ids = {task["board_id"] for task in tasks}  # Get unique board IDs
    boards = await db.groups.find({"_id": {"$in": list(board_ids)}}).to_list(length=len(board_ids))
    board_map = {str(board["_id"]): board["name"] for board in boards}  # Map {board_id: board_name}

    return [
        {
            "id": str(task["_id"]),
            "title": task["title"],
            "description": task.get("description", ""),
            "status": task["status"],
            "priority": task["priority"],
            "board_Name": board_map.get(str(task["board_id"]), "Unknown Board"),  # ✅ Get board name
            "deadline": task.get("deadline", None),
            "assigned_to": [str(user) for user in task.get("assigned_to", [])],
            "created_by": str(task["created_by"]),
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

    # ✅ Convert deadline only if provided
    deadline_dt = None
    if task.deadline:
        try:
            deadline_dt = datetime.strptime(task.deadline, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid deadline format. Use YYYY-MM-DD")

    # ✅ Prepare new task object
    new_task = {
        "title": task.title,
        "description": task.description or "",
        "status": task.status,
        "priority": task.priority,
        "board_id": ObjectId(task.board_id),
        "created_by": ObjectId(user["id"]),
        "created_at": datetime.utcnow(),
        "deadline": deadline_dt  # ✅ Store as a `datetime` object for MongoDB
    }

    # ✅ Insert into MongoDB
    result = await db.tasks.insert_one(new_task)

    return {"message": "Task created successfully", "task_id": str(result.inserted_id)}

# 📌 Update a task
@router.patch("/{task_id}", response_model=dict)
async def update_task(task_id: str, task_update: dict):
    if not ObjectId.is_valid(task_id):
        raise HTTPException(status_code=400, detail="Invalid task ID format")

    task = await get_task_by_id(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # ✅ Validate deadline format before updating
    if "deadline" in task_update and task_update["deadline"]:
        try:
            task_update["deadline"] = datetime.strptime(task_update["deadline"], "%Y-%m-%d")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid deadline format. Use YYYY-MM-DD")

    # ✅ Ensure assigned users are in the board
    if "assigned_to" in task_update and task_update["assigned_to"]:
        board = await db.groups.find_one({"_id": ObjectId(task["board_id"])})
        if not board:
            raise HTTPException(status_code=404, detail="Board not found")

        # Convert string IDs to ObjectIds and validate membership
        assigned_user_ids = [ObjectId(user_id) for user_id in task_update["assigned_to"]]
        board_member_ids = board["members"]

        # Check if all assigned users are in the board
        if not all(user_id in board_member_ids for user_id in assigned_user_ids):
            raise HTTPException(status_code=400, detail="One or more users are not members of this board")

    # ✅ Perform the update
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

# 📌 **Unassign a task from a user**
@router.patch("/{user_id}", response_model=dict)
async def unassign_task(task_id: str, user_id: str):
    """
    Unassign a task from a user
    """
    if not ObjectId.is_valid(user_id) or not ObjectId.is_valid(task_id):
        raise HTTPException(status_code=400, detail="Invalid ID format")

    task = await get_users_tasks(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    await db.tasks.update_one(
        {"_id": ObjectId(task_id)},
        {"$pull": {"assigned_to": ObjectId(user_id)}}
    )
    return {"message": "Task unassigned successfully"}

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
