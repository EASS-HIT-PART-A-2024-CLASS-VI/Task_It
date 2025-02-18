from fastapi import APIRouter, HTTPException, Depends, Path, logger,  Query
from pydantic import BaseModel
from bson import ObjectId
from app.routes.users import get_current_user
from app.db import db  # MongoDB connection
import logging
from typing import Dict,List

router = APIRouter()

# 📌 **Group Schema**
class GroupCreate(BaseModel):
    name: str

#Retrieve all groups for a user
@router.get("/")
async def get_groups(user: dict = Depends(get_current_user)):
    """Retrieve all groups the user is part of."""
    logging.info(f"📌 Fetching groups for user: {user}")  # ✅ Debugging

    if not user or "id" not in user:
        logging.error(f"❌ User authentication failed, received: {user}")  # ✅ Debugging
        raise HTTPException(status_code=401, detail="User authentication failed")
    # Convert user ID to ObjectId
    user_id=ObjectId(user["id"])
    # ✅ Query MongoDB using `_id`
    groups = await db.groups.find({"members": user_id}).to_list(length=100)
    logging.info(f"📌 Found {len(groups)} groups for user {user['username']}")
    return [{"id": str(group["_id"]), "name": group["name"]} for group in groups]

# 📌 **Create New Group
@router.post("/", response_model=dict)
async def create_new_group(group: GroupCreate, user: dict = Depends(get_current_user)):
    """Creates a new group and assigns the creator as the first member."""
    if not user or "id" not in user:
        raise HTTPException(status_code=401, detail="User authentication failed")

    new_group = {
        "name": group.name,
        "members": [ObjectId(user["id"])], # Automatically add creator
        "created_by": ObjectId(user["id"])  # Store the creator's ID
    }

    result = await db.groups.insert_one(new_group)
    return {"message": "Group created successfully", "group_id": str(result.inserted_id)}

# 📌 **Retrieve a Single Group by ID**
@router.get("/{group_id}")
async def get_group(group_id: str):
    """Fetch a specific group by its ID."""
    group = await db.groups.find_one({"_id": ObjectId(group_id)})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    return {"id": str(group["_id"]), "name": group["name"], "members": [str(m) for m in group["members"]]}

# 📌 **Retrieve Board Dashboard Data**
@router.get("/{group_id}/dashboard", response_model=Dict)
async def get_board_dashboard(group_id: str = Path(...)):
    """
    Retrieve comprehensive task statistics for a board.
    """
    if not group_id or not ObjectId.is_valid(group_id):
        raise HTTPException(status_code=400, detail="Invalid board ID format")

    board = await db.groups.find_one({"_id": ObjectId(group_id)})
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")

    # ✅ Fetch all tasks for this board
    tasks = await db.tasks.find({"board_id": ObjectId(group_id)}).to_list(length=500)

    # ✅ Task Count by Status
    status_counts = {
        "not_started": sum(1 for task in tasks if task["status"] == "Not Started"),
        "working_on_it": sum(1 for task in tasks if task["status"] == "Working on It"),
        "done": sum(1 for task in tasks if task["status"] == "Done"),
    }

    # ✅ Task Count by Priority
    priority_counts = {
        "high": sum(1 for task in tasks if task["priority"] == "High"),
        "medium": sum(1 for task in tasks if task["priority"] == "Medium"),
        "low": sum(1 for task in tasks if task["priority"] == "Low"),
    }

    # ✅ Tasks Assigned to Users
    user_task_counts = {}
    for task in tasks:
        for user_id in task.get("assigned_to", []):
            user_task_counts[user_id] = user_task_counts.get(user_id, {"high": 0, "medium": 0, "low": 0})
            user_task_counts[user_id][task["priority"].lower()] += 1

    # ✅ Fetch Usernames for Assigned Tasks
    user_ids = list(user_task_counts.keys())
    users = await db.users.find({"_id": {"$in": [ObjectId(uid) for uid in user_ids]}}).to_list(length=100)

    # ✅ Format Assigned Tasks by Username
    assigned_tasks = [
        {
            "name": user["username"],
            "high": user_task_counts.get(str(user["_id"]), {}).get("high", 0),
            "medium": user_task_counts.get(str(user["_id"]), {}).get("medium", 0),
            "low": user_task_counts.get(str(user["_id"]), {}).get("low", 0),
        }
        for user in users
    ]

    # ✅ Priority Breakdown Per Status
    priority_breakdown = {
        "high": {
            "not_started": sum(1 for task in tasks if task["priority"] == "High" and task["status"] == "Not Started"),
            "working_on_it": sum(1 for task in tasks if task["priority"] == "High" and task["status"] == "Working on It"),
            "done": sum(1 for task in tasks if task["priority"] == "High" and task["status"] == "Done"),
        },
        "medium": {
            "not_started": sum(1 for task in tasks if task["priority"] == "Medium" and task["status"] == "Not Started"),
            "working_on_it": sum(1 for task in tasks if task["priority"] == "Medium" and task["status"] == "Working on It"),
            "done": sum(1 for task in tasks if task["priority"] == "Medium" and task["status"] == "Done"),
        },
        "low": {
            "not_started": sum(1 for task in tasks if task["priority"] == "Low" and task["status"] == "Not Started"),
            "working_on_it": sum(1 for task in tasks if task["priority"] == "Low" and task["status"] == "Working on It"),
            "done": sum(1 for task in tasks if task["priority"] == "Low" and task["status"] == "Done"),
        },
    }

    return {
        "total": len(tasks),
        "status_counts": status_counts,
        "priority_counts": priority_counts,
        "assigned_tasks": assigned_tasks,
        "priority_breakdown": priority_breakdown,
    }
   
# 📌 **Add User to Group**
@router.patch("/{group_id}/add_user/{user_id}")
async def add_user(group_id: str, user_id: str):
    """Adds a user to a group."""
    group = await db.groups.find_one({"_id": ObjectId(group_id)})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if ObjectId(user_id) in group["members"]:
        raise HTTPException(status_code=400, detail="User is already in this group")

    await db.groups.update_one(
        {"_id": ObjectId(group_id)},
        {"$push": {"members": ObjectId(user_id)}}
    )
    return {"message": f"User {user['username']} added to group {group['name']}"}

# 📌 **Get Users in a Group**
@router.get("/{group_id}/users")
async def get_group_users(group_id: str):
    """Fetches all users in a given group."""
    group = await db.groups.find_one({"_id": ObjectId(group_id)})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    users = await db.users.find({"_id": {"$in": group["members"]}}).to_list(length=100)

    return [{"id": str(user["_id"]), "username": user["username"], "email": user["email"]} for user in users]

# 📌 **Remove User from Group & Unassign from Tasks**
@router.delete("/{group_id}/remove_user/{user_id}")
async def remove_user_from_group_api(group_id: str, user_id: str):
    """Removes a user from a group and all assigned tasks."""

    # ✅ Ensure valid ObjectId format
    try:
        group_oid = ObjectId(group_id)
        user_oid = ObjectId(user_id)  # Convert to ObjectId
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid ObjectId format")

    # ✅ Find the group
    group = await db.groups.find_one({"_id": group_oid})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # ✅ Find the user
    user = await db.users.find_one({"_id": user_oid})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # ✅ Prevent group creator from being removed
    if "created_by" in group and str(group["created_by"]) == str(user_id):
        raise HTTPException(status_code=400, detail="Cannot remove the group creator")

    # ✅ Ensure the user is in the group
    if str(user_id) not in [str(member) for member in group["members"]]:
        raise HTTPException(status_code=400, detail="User is not a member of this group")
    
    # ✅ **Unassign user from ALL TASKS (convert IDs to match stored format)**
    task_update_result = await db.tasks.update_many(
        {"board_id": group_oid},  # Filter for tasks in the correct board
        {"$pull": {"assigned_to": str(user_id)}}  # Ensure user ID format matches the database
    )

    if task_update_result.modified_count > 0:
        logging.info(f"✅ User {user_id} unassigned from {task_update_result.modified_count} tasks in group {group_id}.")
    else:
        logging.warning(f"⚠️ No tasks updated. User may not have been assigned.")

    # ✅ **Remove user from the group**
    group_update_result = await db.groups.update_one(
        {"_id": group_oid},
        {"$pull": {"members": user_oid}}
    )

    if group_update_result.modified_count == 0:
        raise HTTPException(status_code=500, detail="Failed to remove user from group.")

    return {"message": f"User {user['username']} removed from group {group['name']} and all assigned tasks."}

# 📌 **Delete Group**
@router.delete("/{group_id}")
async def delete_group(group_id: str):
    """Deletes a group."""
    group = await db.groups.find_one({"_id": ObjectId(group_id)})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    await db.groups.delete_one({"_id": ObjectId(group_id)})
    return {"message": f"Group {group['name']} deleted successfully"}

