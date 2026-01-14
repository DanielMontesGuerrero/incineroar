from typing import Callable

import pytest

from src.models.user import User
from src.util.data import load_users


def pytest_configure(config: pytest.Config):
    config.addinivalue_line("markers", "user: existing test user")


@pytest.fixture
def user(request: pytest.FixtureRequest):
    marker = request.node.get_closest_marker("user")

    if marker is None:
        return None

    username = marker.args[0]
    users = load_users()
    return User(username, users[username]["role"], users[username]["password"])


GetUser = Callable[[str], User]


@pytest.fixture
def get_user() -> GetUser:
    users = load_users()

    def _get_user(username: str):
        return User(username, users[username]["role"], users[username]["password"])

    return _get_user
