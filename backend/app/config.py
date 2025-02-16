import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables from .env file

class Settings:
    MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    DB_NAME: str = os.getenv("DB_NAME", "task_manager")
    PORT: int = int(os.getenv("PORT", 8000))

settings = Settings()
