import sys
import os
import random
import pytest
import shutil
from fastapi.testclient import TestClient
from app.main import app  # Import the FastAPI app
import asyncio
from httpx import AsyncClient

# Ensure our project root is in the path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../")))

client = TestClient(app)
test_user = {}  # ✅ Ensure this is accessible globally

@pytest.fixture(scope="session")
def event_loop():
    """Ensure a fresh event loop is created for async tests"""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session")
async def async_client():
    """Fixture for async HTTP client"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client

@pytest.fixture(scope="session")
def test_user_fixture():
    """Fixture for storing test user data"""
    return {}

# ✅ Fixing 422 Form Data Issue
@pytest.mark.asyncio
async def test_signup(async_client, test_user_fixture):
    """Test user signup"""
    unique_id = random.randint(1000, 9999)
    email = f"test{unique_id}@example.com"
    username = f"testuser{unique_id}"

    response = await async_client.post(
        "/api/users/signup",
        files={},
        data={  # ✅ Change from `json={}` to `data={}`
            "username": username,
            "first_name": "Test",
            "last_name": "User",
            "email": email,
            "password": "password123",
        }
    )

    assert response.status_code == 200, f"Signup failed: {response.text}"
    
    # ✅ Store user in fixture for reuse
    test_user_fixture["email"] = email
    test_user_fixture["access_token"] = response.json().get("access_token")
    assert test_user_fixture["access_token"], "Token not received in login response"

# ✅ Ensure Login Test Uses the Created User
@pytest.mark.asyncio
async def test_login(async_client, test_user_fixture):
    """Test user login"""
    assert "email" in test_user_fixture, "Signup must run before login!"

    response = await async_client.post(
        "/api/users/login",
        json={"email": test_user_fixture["email"], "password": "password123"},
    )

    assert response.status_code == 200, f"Login failed: {response.text}"
    
    # ✅ Store new token
    test_user_fixture["access_token"] = response.json().get("access_token")
    assert test_user_fixture["access_token"], "Token not received in login response"

# ✅ Fix JWT Authentication for Protected Endpoint
@pytest.mark.asyncio
async def test_get_current_user(async_client, test_user_fixture):
    """Test fetching current user"""
    assert "access_token" in test_user_fixture, "User must be logged in first"

    headers = {"Authorization": f"Bearer {test_user_fixture['access_token']}"}
    response = await async_client.get("/api/users/me", headers=headers)

    assert response.status_code == 200, f"Fetching current user failed: {response.text}"
