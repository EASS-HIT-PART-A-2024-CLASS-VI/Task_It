import pytest
from httpx import AsyncClient
from app.main import app
from .test_users import test_signup  # Import user creation test

test_group = {}

@pytest.mark.asyncio
async def test_create_group(async_client: AsyncClient, test_user_fixture):
    global test_group

    # ✅ Ensure user exists before creating a group
    if "access_token" not in test_user_fixture:
        await test_signup(async_client, test_user_fixture)  # Call user creation

    assert "access_token" in test_user_fixture, "User must be created first"

    headers = {"Authorization": f"Bearer {test_user_fixture['access_token']}"}
    response = await async_client.post(
        "/api/groups/",
        json={"name": "Test Group"},
        headers=headers
    )

    assert response.status_code in [200, 201], f"Group creation failed: {response.text}"
    test_group["group_id"] = response.json().get("group_id", None)  # ✅ Store group ID safely
    assert test_group["group_id"], "Group ID not received in response"

@pytest.mark.asyncio
async def test_get_groups(async_client: AsyncClient, test_user_fixture):
    headers = {"Authorization": f"Bearer {test_user_fixture['access_token']}"}
    response = await async_client.get("/api/groups/", headers=headers)
    assert response.status_code == 200, f"Get groups failed: {response.text}"

@pytest.mark.asyncio
async def test_delete_group(async_client: AsyncClient, test_user_fixture):
    global test_group
    assert "group_id" in test_group, "Group must be created first"

    headers = {"Authorization": f"Bearer {test_user_fixture['access_token']}"}
    response = await async_client.delete(f"/api/groups/{test_group['group_id']}", headers=headers)

    assert response.status_code in [200, 204], f"Delete group failed: {response.text}"
