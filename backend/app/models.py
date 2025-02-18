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

class User(BaseModel):
    id: Optional[PyObjectId] = None
    first_name: str
    last_name: str
    username: str
    email: EmailStr
    hashed_password: str
    groups: List[PyObjectId] = []  # Store references as ObjectId
    tasks: List[PyObjectId] = []
    photo: Optional[str] = None

    class Config:
        json_encoders = {ObjectId: str}

class Group(BaseModel):
    id: Optional[PyObjectId] = None
    name: str
    created_by: PyObjectId  # Reference to User ID
    members: List[PyObjectId] = []  # Store user references
    tasks: List[PyObjectId] = []
    

    class Config:
        json_encoders = {ObjectId: str}

class Task(BaseModel):
    id: Optional[PyObjectId] = None
    title: str
    description: str
    status: str = "Pending"
    priority: str = "Medium"
    deadline: Optional[datetime] = None
    created_at: datetime = datetime.utcnow()  # Automatically set timestamp
    board_id: PyObjectId  # Reference to Group ID
    created_by: PyObjectId  # Reference to User ID
    assigned_to: List[PyObjectId] = []  # Store user references

    class Config:
        json_encoders = {ObjectId: str}