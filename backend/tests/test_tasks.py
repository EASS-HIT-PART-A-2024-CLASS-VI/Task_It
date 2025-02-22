import sys
import os
# Add current test directory to path so that test_users and test_groups can be imported
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from test_users import test_user
from test_groups import test_group

client = TestClient(app)
test_task = {}

def test_create_task():
    global test_task
    assert "id" in test_user, "User must be created first"
    assert "id" in test_group, "Group must be created first"

    headers = {"Authorization": f"Bearer {test_user['token']}"}
    response = client.post(
        "/api/tasks",
        json={
            "title": "Test Task",
            "description": "This is a test task",
            "status": "Pending",
            "priority": "Medium",
            "board_id": test_group["id"]
        },
        headers=headers
    )
    assert response.status_code == 201, f"Task creation failed: {response.text}"
    test_task = response.json()


def test_get_tasks():
    headers = {"Authorization": f"Bearer {test_user['token']}"}
    response = client.get("/api/tasks", headers=headers)
    assert response.status_code == 200, f"Get tasks failed: {response.text}"
    response_data = response.json()
    assert isinstance(response_data, list), "Expected a list of tasks"

def test_update_task():
    global test_task
    assert "id" in test_task, "Task must be created first"
    headers = {"Authorization": f"Bearer {test_user['token']}"}
    response = client.patch(
        f"/api/tasks/{test_task['id']}",
        json={"status": "Completed"},
        headers=headers
    )
    assert response.status_code == 200, f"Update task failed: {response.text}"
    response_data = response.json()
    assert response_data.get("message") == "Task updated successfully", "Unexpected response message"

def test_delete_task():
    global test_task
    assert "id" in test_task, "Task must be created first"
    headers = {"Authorization": f"Bearer {test_user['token']}"}
    response = client.delete(f"/api/tasks/{test_task['id']}", headers=headers)
    assert response.status_code == 200, f"Delete task failed: {response.text}"
    response_data = response.json()
    expected_message = f"Task with ID {test_task['id']} deleted successfully"
    assert response_data.get("message") == expected_message, "Unexpected response message"
