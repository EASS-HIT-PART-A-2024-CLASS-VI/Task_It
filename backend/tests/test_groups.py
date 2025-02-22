import pytest
from httpx import AsyncClient
from app.main import app

test_group = {}

@pytest.mark.asyncio
async def test_create_group(async_client: AsyncClient, test_user_fixture):
    global test_group
    
    assert "access_token" in test_user_fixture, "User must be created first"

    headers = {"Authorization": f"Bearer {test_user_fixture['access_token']}"}
    response = await async_client.post(
        "/api/groups/",
        json={"name": "Test Group"},
        headers=headers
    )
    
    assert response.status_code == 200, f"Group creation failed: {response.text}"
    test_group["group_id"] = response.json()["group_id"]  # ✅ Store group ID

@pytest.mark.asyncio
async def test_get_groups(async_client: AsyncClient, test_user_fixture):
    headers = {"Authorization": f"Bearer {test_user_fixture['access_token']}"}
    response = await async_client.get("/api/groups/", headers=headers)
    assert response.status_code == 200, f"Get groups failed: {response.text}"

@pytest.mark.asyncio
async def test_add_user_to_group(async_client: AsyncClient, test_user_fixture):
    global test_group
    assert "group_id" in test_group, "Group must be created first"

    headers = {"Authorization": f"Bearer {test_user_fixture['access_token']}"}
    response = await async_client.patch(f"/api/groups/{test_group['group_id']}/add_user/{test_user_fixture['id']}", headers=headers)
    
    assert response.status_code == 200, f"Add user to group failed: {response.text}"

@pytest.mark.asyncio
async def test_delete_group(async_client: AsyncClient, test_user_fixture):
    global test_group
    assert "group_id" in test_group, "Group must be created first"

    headers = {"Authorization": f"Bearer {test_user_fixture['access_token']}"}
    response = await async_client.delete(f"/api/groups/{test_group['group_id']}", headers=headers)

    assert response.status_code == 200, f"Delete group failed: {response.text}"
