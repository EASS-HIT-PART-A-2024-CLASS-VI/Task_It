from pydantic import BaseModel

class TaskBase(BaseModel):
    title: str
    description: str
    status: str = "Pending"
    assigned_to: str = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    status: str

class Task(TaskBase):
    id: int
    owner_id: int = None

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
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

    class Config:
        from_attributes = True

class GroupCreate(BaseModel):
    name: str

class GroupResponse(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True
