"""Helpers for registering the bundled Lovelace card."""

from __future__ import annotations

from typing import Any


async def async_register_resource(
    resources: Any, card_path: str, card_url: str
) -> None:
    """Create or update the storage-mode Lovelace module resource."""
    await resources.async_get_info()
    for item in resources.async_items():
        if not item.get("url", "").startswith(card_path):
            continue
        if item["url"] != card_url:
            await resources.async_update_item(
                item["id"], {"res_type": "module", "url": card_url}
            )
        return

    await resources.async_create_item({"res_type": "module", "url": card_url})
