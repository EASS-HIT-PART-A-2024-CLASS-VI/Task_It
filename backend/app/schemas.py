from pydantic import BaseModel,EmailStr
from datetime import date
from typing import Optional

class TaskBase(BaseModel):
    title: str
    description: str
    status: str = "Pending"
    assigned_to: str = None
    deadline: date = None  # Include deadline

class TaskCreate(TaskBase):
    board_id: int

class TaskUpdate(BaseModel):
    status: str

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
    created_by: int

class Group(BaseModel):
    id: int
    name: str
    created_by: int 

    class Config:
        from_attributes = True
