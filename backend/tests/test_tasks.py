from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the Task Manager API"}

def test_create_user():
    response = client.post(
        "/users",
        json={"username": "testuser", "email": "test@example.com", "password": "password123"},
    )
    assert response.status_code == 201
    assert response.json()["username"] == "testuser"

def test_create_task():
    response = client.post(
        "/tasks",
        json={"title": "Test Task", "description": "This is a test task", "status": "Pending", "assigned_to": "testuser"},
    )
    assert response.status_code == 201
    assert response.json()["title"] == "Test Task"

def test_update_task():
    response = client.patch(
        "/tasks/1",
        json={"status": "Completed"},
    )
    assert response.status_code == 200
    assert response.json()["status"] == "Completed"

def test_delete_task():
    response = client.delete("/tasks/1")
    assert response.status_code == 200
    assert response.json() == {"detail": "Task deleted successfully"}


def test_create_group():
    response = client.post(
        "/groups",
        json={"name": "Test Group"},
    )
    assert response.status_code == 201
    assert response.json()["name"] == "Test Group"

def test_assign_user_to_group():
    response = client.post(
        "/groups/1/users",
        json={"user_id": 1},
    )
    assert response.status_code == 200
    assert response.json()["detail"] == "User added to group successfully"
