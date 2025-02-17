from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from bson import ObjectId
from app.routes.users import get_current_user
from app.db import db  # MongoDB connection
import logging

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

    # ✅ Query MongoDB using `_id`
    groups = await db.groups.find({"members": user["id"]}).to_list(length=100)

    return [{"id": str(group["_id"]), "name": group["name"]} for group in groups]

# 📌 **Create New Group
@router.post("/", response_model=dict)
async def create_new_group(group: GroupCreate, user: dict = Depends(get_current_user)):
    """Creates a new group and assigns the creator as the first member."""
    if not user or "id" not in user:
        raise HTTPException(status_code=401, detail="User authentication failed")

    new_group = {
        "name": group.name,
        "members": [ObjectId(user["id"])]  # Automatically add creator
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

# 📌 **Remove User from Group**
@router.delete("/{group_id}/remove_user/{user_id}")
async def remove_user_from_group_api(group_id: str, user_id: str):
    """Removes a user from a group."""
    group = await db.groups.find_one({"_id": ObjectId(group_id)})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if ObjectId(user_id) not in group["members"]:
        raise HTTPException(status_code=400, detail="User is not in this group")
    
    if ObjectId(user_id) == ObjectId(group["members"][0]):
        raise HTTPException(status_code=400, detail="Cannot remove group creator")

    # Remove user from group
    await db.groups.update_one(
        {"_id": ObjectId(group_id)},
        {"$pull": {"members": ObjectId(user_id)}}
    )
    return {"message": f"User {user['username']} removed from group {group['name']}"}  

# 📌 **Delete Group**
@router.delete("/{group_id}")
async def delete_group(group_id: str):
    """Deletes a group."""
    group = await db.groups.find_one({"_id": ObjectId(group_id)})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    await db.groups.delete_one({"_id": ObjectId(group_id)})
    return {"message": f"Group {group['name']} deleted successfully"}