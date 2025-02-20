from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
from fastapi.staticfiles import StaticFiles

# Import routers
from app.routes.users import router as user_router
from app.routes.groups import router as group_router
from app.routes.tasks import router as task_router
from app.routes.chatbot import router as chatbot_router


# Ensure the 'static' directory exists
STATIC_FOLDER = "static/profile_pics"
os.makedirs(STATIC_FOLDER, exist_ok=True)

# Load environment variables
load_dotenv()
PORT = int(os.getenv("PORT", 8000))

# Initialize FastAPI app
app = FastAPI(title="Task Management API", version="1.0")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.mount("/static/profile_pics", StaticFiles(directory="static/profile_pics"), name="static")
app.include_router(user_router, prefix="/api/users", tags=["Users"])
app.include_router(group_router, prefix="/api/groups", tags=["Groups"])
app.include_router(task_router, prefix="/api/tasks", tags=["Tasks"])
app.include_router(chatbot_router, prefix="/api", tags=["Chatbot"])

@app.get("/")
async def root():
    return {"message": "Welcome to the Task Management API 🚀"}

# Run the application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)
