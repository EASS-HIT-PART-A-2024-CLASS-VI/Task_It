import pytest
import asyncio

if __name__ == "__main__":
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    exit_code = pytest.main(["-v", "tests/"])
    loop.run_until_complete(asyncio.sleep(0.1))  # Ensure proper async handling
    loop.close()
