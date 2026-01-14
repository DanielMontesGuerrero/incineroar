from typing import List

from playwright.sync_api import Cookie


def get_cookie(name: str, cookies: List[Cookie]):
    return next((c for c in cookies if c["name"] == name), None)
