from fastapi import FastAPI
from app.routes import tasks, users, groups, api_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS middleware settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(groups.router, prefix="/api/groups", tags=["groups"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Task Manager API"}