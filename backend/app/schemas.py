from pydantic import BaseModel,EmailStr
from datetime import date
from typing import Optional

class TaskBase(BaseModel):
    title: str
    description: str
    status: str = "Pending"
    priority: str = "Medium"
    assigned_to: Optional[str] = None
    deadline: Optional[date] = None
    board_id: int  # ✅ This is actually `group_id`


class TaskCreate(TaskBase):
    board_id: int  # ✅ Ensure board_id is included


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    status: Optional[str] = None
    deadline: Optional[date] = None
    assigned_to: Optional[str] = None
    board_id: Optional[int] = None

class Task(TaskBase):
    id: int
    board_id: Optional[int]


    class Config:
        orm_mode = True


class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class User(UserBase):
    id: int
    tasks: list[Task] = []

    class Config:
        from_attributes = True

class TaskAssign(BaseModel):
    assigned_to: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class Config:
    from_attributes = True

class GroupCreate(BaseModel):
    name: str

class Group(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True
