import pytest
from httpx import AsyncClient
from app.main import app
from .test_users import test_signup
from .test_groups import test_create_group, test_group

test_task = {}

@pytest.mark.asyncio
async def test_create_task(async_client: AsyncClient, test_user_fixture):
    global test_task

    # Ensure user and group exist before creating a task
    if "access_token" not in test_user_fixture:
        await test_signup(async_client, test_user_fixture)

    if "group_id" not in test_group:
        await test_create_group(async_client, test_user_fixture)

    assert "access_token" in test_user_fixture, "User must be created first"
    assert "group_id" in test_group, "Group must be created first"

    headers = {"Authorization": f"Bearer {test_user_fixture['access_token']}"}

    # ✅ Do not send "deadline" since it's optional
    response = await async_client.post(
        "/api/tasks/",
        json={
            "title": "Test Task",
            "description": "This is a test task",
            "status": "Pending",
            "priority": "Medium",
            "board_id": test_group["group_id"]  # Ensure correct key
        },
        headers=headers
    )

    assert response.status_code in [200, 201], f"Task creation failed: {response.text}"

    # ✅ Store the created task for later tests
    test_task.update(response.json())

@pytest.mark.asyncio
async def test_get_tasks(async_client: AsyncClient, test_user_fixture):
    headers = {"Authorization": f"Bearer {test_user_fixture['access_token']}"}
    response = await async_client.get("/api/tasks/", headers=headers)
    assert response.status_code == 200, f"Get tasks failed: {response.text}"
    response_data = response.json()
    assert isinstance(response_data, list), "Expected a list of tasks"

@pytest.mark.asyncio
async def test_update_task(async_client: AsyncClient, test_user_fixture):
    global test_task
    assert "id" in test_task, "Task must be created first"

    headers = {"Authorization": f"Bearer {test_user_fixture['access_token']}"}
    response = await async_client.patch(
        f"/api/tasks/{test_task['id']}",
        json={"status": "Completed"},
        headers=headers
    )
    assert response.status_code == 200, f"Update task failed: {response.text}"
    response_data = response.json()
    assert response_data.get("message") == "Task updated successfully", "Unexpected response message"

@pytest.mark.asyncio
async def test_delete_task(async_client: AsyncClient, test_user_fixture):
    global test_task
    assert "id" in test_task, "Task must be created first"

    headers = {"Authorization": f"Bearer {test_user_fixture['access_token']}"}
    response = await async_client.delete(f"/api/tasks/{test_task['id']}", headers=headers)
    assert response.status_code in [200, 204], f"Delete task failed: {response.text}"
    
    response_data = response.json()
    expected_message = f"Task with ID {test_task['id']} deleted successfully"
    assert response_data.get("message") == expected_message, "Unexpected response message"
