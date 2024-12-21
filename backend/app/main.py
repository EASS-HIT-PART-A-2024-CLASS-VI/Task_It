from fastapi import FastAPI
from app.routes import tasks, users, groups

app = FastAPI()

app.include_router(tasks.router, prefix="/tasks", tags=["Tasks"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(groups.router, prefix="/groups", tags=["Groups"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Task Manager API"}
