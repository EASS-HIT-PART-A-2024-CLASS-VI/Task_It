from .db import db
from bson import ObjectId
from datetime import datetime
from app.models import User, Group, Task

### ✅ USER OPERATIONS ###
async def create_user(user_data: User):
    user = {
        "_id": ObjectId(),
        "username": user_data.username,
        "email": user_data.email,
        "hashed_password": user_data.hashed_password,
        "groups": [],
        "tasks": []
    }
    await db.users.insert_one(user)
    return user

async def get_user_by_email(email: str):
    return await db.users.find_one({"email": email})

async def get_user_by_id(user_id: str):
    return await db.users.find_one({"_id": ObjectId(user_id)})

### ✅ GROUP OPERATIONS ###
async def create_group(group_data: Group):
    group = {
        "_id": ObjectId(),
        "name": group_data.name,
        "created_by": ObjectId(group_data.created_by),
        "members": [],
        "tasks": []
    }
    await db.groups.insert_one(group)
    return group

async def add_user_to_group(user_id: str, group_id: str):
    await db.groups.update_one(
        {"_id": ObjectId(group_id)},
        {"$push": {"members": ObjectId(user_id)}}
    )
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$push": {"groups": ObjectId(group_id)}}
    )
    return {"message": "User added to group"}

async def remove_user_from_group(group_id: str, user_id: str):
    """
    Remove a user from a group in MongoDB
    """
    result = await db.groups.update_one(
        {"_id": ObjectId(group_id)},
        {"$pull": {"members": ObjectId(user_id)}}
    )
    return result.modified_count > 0  # Returns True if update was successful

async def get_group_by_id(group_id: str):
    return await db.groups.find_one({"_id": ObjectId(group_id)})

### ✅ TASK OPERATIONS ###
async def create_task(task_data: Task):
    task = {
        "_id": ObjectId(),
        "title": task_data.title,
        "description": task_data.description,
        "status": task_data.status,
        "priority": task_data.priority,
        "deadline": task_data.deadline,
        "created_at": datetime.utcnow(),
        "board_id": ObjectId(task_data.board_id),
        "owner_id": ObjectId(task_data.owner_id)
    }
    await db.tasks.insert_one(task)

    # Update group and user references
    await db.groups.update_one(
        {"_id": ObjectId(task_data.board_id)},
        {"$push": {"tasks": task["_id"]}}
    )
    await db.users.update_one(
        {"_id": ObjectId(task_data.owner_id)},
        {"$push": {"tasks": task["_id"]}}
    )

    return task

async def get_task_by_id(task_id: str):
    return await db.tasks.find_one({"_id": ObjectId(task_id)})

async def update_task_status(task_id: str, status: str):
    await db.tasks.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": {"status": status}}
    )
    return {"message": "Task status updated"}

async def assign_task_to_user(task_id: str, user_id: str):
    """
    Assigns a task to a specific user in MongoDB
    """
    result = await db.tasks.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": {"owner_id": ObjectId(user_id)}}
    )
    return result.modified_count > 0  # Returns True if update was successful

async def delete_task(task_id: str):
    task = await db.tasks.find_one({"_id": ObjectId(task_id)})
    if not task:
        return {"error": "Task not found"}

    # Remove task from group and user references
    await db.groups.update_one(
        {"_id": ObjectId(task["board_id"])},
        {"$pull": {"tasks": ObjectId(task_id)}}
    )
    await db.users.update_one(
        {"_id": ObjectId(task["created_by"])},
        {"$pull": {"tasks": ObjectId(task_id)}}
    )

    await db.tasks.delete_one({"_id": ObjectId(task_id)})
    return {"message": "Task deleted"}
