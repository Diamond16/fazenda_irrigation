"""Tests for Lovelace resource registration."""

from __future__ import annotations

import importlib.util
import sys
import unittest
from pathlib import Path
from unittest.mock import AsyncMock

ROOT = Path(__file__).parents[1]
MODULE_PATH = ROOT / "custom_components" / "fazenda_irrigation" / "lovelace.py"
SPEC = importlib.util.spec_from_file_location(
    "fazenda_irrigation_frontend", MODULE_PATH
)
assert SPEC and SPEC.loader
frontend = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = frontend
SPEC.loader.exec_module(frontend)

CARD_PATH = "/fazenda_irrigation/fazenda-irrigation-card.js"
CARD_URL = f"{CARD_PATH}?v=0.9.4"


class FakeResources:
    """Minimal storage-mode Lovelace resource collection."""

    def __init__(self, items: list[dict] | None = None) -> None:
        self._items = items or []
        self.async_get_info = AsyncMock()
        self.async_create_item = AsyncMock()
        self.async_update_item = AsyncMock()

    def async_items(self) -> list[dict]:
        return self._items


class FrontendRegistrationTests(unittest.IsolatedAsyncioTestCase):
    """Cover create, update, and no-op registration paths."""

    async def test_creates_missing_module_resource(self) -> None:
        resources = FakeResources()

        await frontend.async_register_resource(resources, CARD_PATH, CARD_URL)

        resources.async_get_info.assert_awaited_once()
        resources.async_create_item.assert_awaited_once_with(
            {"res_type": "module", "url": CARD_URL}
        )
        resources.async_update_item.assert_not_awaited()

    async def test_updates_existing_resource_version(self) -> None:
        resources = FakeResources(
            [{"id": "resource-id", "url": f"{CARD_PATH}?v=0.9.3"}]
        )

        await frontend.async_register_resource(resources, CARD_PATH, CARD_URL)

        resources.async_update_item.assert_awaited_once_with(
            "resource-id", {"res_type": "module", "url": CARD_URL}
        )
        resources.async_create_item.assert_not_awaited()

    async def test_keeps_current_resource(self) -> None:
        resources = FakeResources([{"id": "resource-id", "url": CARD_URL}])

        await frontend.async_register_resource(resources, CARD_PATH, CARD_URL)

        resources.async_update_item.assert_not_awaited()
        resources.async_create_item.assert_not_awaited()


if __name__ == "__main__":
    unittest.main()
