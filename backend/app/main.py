from fastapi import FastAPI
from app.routes import tasks, users, groups, api_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Adjust this to restrict origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include your routers
app.include_router(tasks.router, prefix="/tasks", tags=["Tasks"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(groups.router, prefix="/groups", tags=["Groups"])
app.include_router(api_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Task Manager API"}
