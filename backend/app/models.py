from sqlalchemy import Table,Column, Integer, String, Boolean, ForeignKey, Date, Enum
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

# Association table for many-to-many relationship
group_members = Table(
    "group_members",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("group_id", Integer, ForeignKey("groups.id"), primary_key=True),
)


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable=False)

    # Tasks owned by the user
    tasks = relationship("Task", back_populates="owner")

    # Groups created by the user
    created_groups = relationship("Group", back_populates="creator", foreign_keys="Group.created_by")

    # Groups the user is a member of
    groups = relationship("Group", secondary=group_members, back_populates="members")

class Group(Base):
    __tablename__ = "groups"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

    # User who created the group
    created_by = Column(Integer, ForeignKey("users.id"))
    creator = relationship("User", back_populates="created_groups", foreign_keys=[created_by])

    # Users who are members of the group
    members = relationship("User", secondary=group_members, back_populates="groups")

    # Tasks associated with the group
    tasks = relationship("Task", back_populates="board")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    status = Column(Enum("Not Started", "Working on It", "Done", name="task_status"), default="Not Started")
    deadline = Column(Date)
    assigned_to = Column(String)

    # Owner of the task
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="tasks")

    # Associated group/board
    board_id = Column(Integer, ForeignKey("groups.id"))
    board = relationship("Group", back_populates="tasks")


