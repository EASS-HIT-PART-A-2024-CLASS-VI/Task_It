import pytest
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.main import app
from httpx import AsyncClient
import os

# Use a test database
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
TEST_DB_NAME = "test_db"

client = AsyncIOMotorClient(MONGO_URI)
test_db = client[TEST_DB_NAME]

@pytest.fixture(scope="session")
def event_loop():
    """Ensure a session-scoped event loop"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session")
async def db():
    """Fixture for using a test database"""
    yield test_db
    client.drop_database(TEST_DB_NAME)  # Cleanup after tests

@pytest.fixture(scope="session")
async def async_client():
    """Fixture for async test client"""
    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client

@pytest.fixture(scope="session")
def test_user_fixture():
    """Fixture for storing test user data across tests"""
    return {}