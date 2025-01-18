from fastapi import HTTPException
from sqlalchemy.orm import Session
from .models import Task, User, Group
from .schemas import TaskCreate, TaskUpdate, UserCreate, GroupCreate
from passlib.context import CryptContext
from sqlalchemy.exc import IntegrityError

from app import models



# Tasks
def get_tasks(db: Session, skip: int = 0, limit: int = 10):
    return db.query(Task).offset(skip).limit(limit).all()

def create_task(db: Session, task: TaskCreate, owner_id: int):
    db_task = Task(**task.dict(), owner_id=owner_id)
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

def update_task_status(db: Session, task_id: int, status: str):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
       raise HTTPException(status_code=404, detail="Task not found")
    task.status = status
    db.commit()
    db.refresh(task)
    return task

def delete_task(db: Session, task_id: int):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"detail": "Task deleted successfully"}

def assign_task_to_user(db: Session, task_id: int, username: str):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    task.assigned_to = username
    db.commit()
    db.refresh(task)
    return task

def list_tasks(db: Session, user_id: int = None):
    if user_id:
        return db.query(Task).filter(Task.assigned_to == user_id).all()
    return db.query(Task).all()

# Users
def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()

def create_user(db: Session, user: UserCreate):
    existing_user = db.query(User).filter(User.username == user.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=user.password
    )
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Username or email already exists")

def verify_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email, User.hashed_password == password).first()
    return user

def get_all_users(db: Session):
    return db.query(User).all()

def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

# Groups
def get_all_groups(db: Session):
    return db.query(Group).all()

def create_group(db: Session, group: GroupCreate):
    try:
        new_group = models.Group(name=group.name)
        db.add(new_group)
        db.commit()
        db.refresh(new_group)
        return new_group
    except Exception as e:
        db.rollback()
        raise e

def get_group_by_id(db: Session, group_id: int):
    return db.query(Group).filter(Group.id == group_id).first()

def add_user_to_group(db: Session, user_id: int, group_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    group = db.query(Group).filter(Group.id == group_id).first()
    if not user or not group:
        return None
    user.group_id = group.id
    db.commit()
    db.refresh(user)
    return user