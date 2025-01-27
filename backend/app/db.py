from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import Base

# Update the path if needed
SQLALCHEMY_DATABASE_URL = "sqlite:///./sahartaskmanager.db"

# Create the database engine
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

# Configure the session maker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create all tables based on the models
Base.metadata.create_all(bind=engine)

# Dependency to get a session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
