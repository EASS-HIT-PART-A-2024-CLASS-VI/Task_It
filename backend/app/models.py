from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable=False)
    tasks = relationship("Task", back_populates="owner")
    group_id = Column(Integer, ForeignKey('groups.id'))
    group = relationship("Group", back_populates="members")

class Group(Base):
    __tablename__ = "groups"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    members = relationship("User", back_populates="group")

    # Add task relationship
    tasks = relationship("Task", back_populates="board")

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    status = Column(String, default="Pending")
    deadline = Column(Date)
    assigned_to = Column(String)
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="tasks")

    # Add board association
    board_id = Column(Integer, ForeignKey("groups.id"))
    board = relationship("Group", back_populates="tasks")


