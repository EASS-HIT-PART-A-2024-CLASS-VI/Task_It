from pydantic import BaseModel, EmailStr
from typing import List, Optional
from bson import ObjectId
from datetime import datetime

class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

# ✅ User Schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(BaseModel):
    username: str
    first_name: str
    last_name: str
    email: EmailStr
    password: str

    model_config = {
        "json_schema_extra": {
            "example": {
                "username": "testuser",
                "first_name": "Test",
                "last_name": "User",
                "email": "test@example.com",
                "password": "123456"
            }
        }
    }

class UserResponse(UserBase):
    id: str
    groups: List[str] = []
    tasks: List[str] = []

    class Config:
        json_encoders = {ObjectId: str}

# ✅ Group Schemas
class GroupBase(BaseModel):
    name: str

class GroupCreate(GroupBase):
    created_by: str  # User ID

class GroupResponse(GroupBase):
    id: str
    created_by: str
    members: List[str] = []
    tasks: List[str] = []

    class Config:
        json_encoders = {ObjectId: str}

class GroupUpdate(BaseModel):
    name: str
    members: Optional[List[str]] = None
    tasks: Optional[List[str]] = None

# ✅ Task Schemas
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: str = "Pending"
    priority: str = "Medium"
    deadline: Optional[datetime] = None

class TaskCreate(TaskBase):
    board_id: str  # Group ID
    owner_id: str  # User ID

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    deadline: Optional[datetime] = None

class TaskResponse(TaskBase):
    id: str
    created_at: datetime
    board_id: str
    owner_id: str

    class Config:
        json_encoders = {ObjectId: str}
