from sqlalchemy.orm import Session
from .models import Task, User, Group
from .schemas import TaskCreate, TaskUpdate, UserCreate, GroupCreate


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
        return None
    task.status = status
    db.commit()
    db.refresh(task)
    return task

def delete_task(db: Session, task_id: int):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        return None
    db.delete(task)
    db.commit()
    return {"detail": "Task deleted successfully"}

def assign_task_to_user(db: Session, task_id: int, username: str):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        return None
    task.assigned_to = username
    db.commit()
    db.refresh(task)
    return task

# Users
def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def get_user_by_email_or_username(db: Session, email: str, username: str):
    return db.query(User).filter(
        (User.email == email) | (User.username == username)
    ).first()

def create_user(db: Session, user: UserCreate):
    hashed_password = hash_password(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_all_users(db: Session):
    return db.query(User).all()

def get_user_by_id(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()

# Groups
def get_group_by_name(db: Session, name: str):
    return db.query(Group).filter(Group.name == name).first()

def create_group(db: Session, group: GroupCreate):
    db_group = Group(name=group.name)
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group

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