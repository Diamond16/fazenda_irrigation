"""Fazenda Irrigation integration."""

from __future__ import annotations

import logging
from pathlib import Path

import voluptuous as vol
from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.http import StaticPathConfig
from homeassistant.components.sensor import DOMAIN as SENSOR_DOMAIN
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryError
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers import service
from homeassistant.helpers.typing import ConfigType

from .const import (
    ATTR_DURATION_MINUTES,
    ATTR_MODE,
    ATTR_ZONES,
    CONF_WATER_SOURCE_ENTITY,
    CONF_ZONE_ENTITIES,
    DOMAIN,
    MODES,
    SERVICE_START,
    SERVICE_STOP,
)
from .controller import IrrigationController

PLATFORMS = [Platform.SENSOR]
CARD_PATH = f"/{DOMAIN}/fazenda-irrigation-card.js"
CARD_URL = f"{CARD_PATH}?v=0.9.2"
CARD_FILE = Path(__file__).parent / "frontend" / "fazenda-irrigation-card.js"
DATA_CLAIMS = "entity_claims"

_LOGGER = logging.getLogger(__name__)

FazendaIrrigationConfigEntry = ConfigEntry[IrrigationController]


async def async_setup(hass: HomeAssistant, config: ConfigType) -> bool:
    """Register integration actions independently of loaded entries."""
    if await hass.async_add_executor_job(CARD_FILE.is_file):
        await hass.http.async_register_static_paths(
            [StaticPathConfig(CARD_PATH, str(CARD_FILE), cache_headers=True)]
        )
        add_extra_js_url(hass, CARD_URL)
    else:
        _LOGGER.warning("Dashboard card file is missing: %s", CARD_FILE)

    service.async_register_platform_entity_service(
        hass,
        DOMAIN,
        SERVICE_START,
        entity_domain=SENSOR_DOMAIN,
        schema={
            vol.Required(ATTR_ZONES): vol.All(cv.ensure_list, [cv.entity_id]),
            vol.Required(ATTR_DURATION_MINUTES): vol.All(
                vol.Coerce(int), vol.Range(min=1, max=1440)
            ),
            vol.Required(ATTR_MODE): vol.In(MODES),
        },
        func="async_start_irrigation",
    )
    service.async_register_platform_entity_service(
        hass,
        DOMAIN,
        SERVICE_STOP,
        entity_domain=SENSOR_DOMAIN,
        schema={},
        func="async_stop_irrigation",
    )
    return True


async def async_setup_entry(
    hass: HomeAssistant, entry: FazendaIrrigationConfigEntry
) -> bool:
    """Set up a controller entry."""
    domain_data = hass.data.setdefault(DOMAIN, {})
    claims: dict[str, set[str]] = domain_data.setdefault(DATA_CLAIMS, {})
    requested = set(entry.options[CONF_ZONE_ENTITIES])
    if source := entry.options.get(CONF_WATER_SOURCE_ENTITY):
        requested.add(source)
    overlap = sorted(
        requested.intersection(
            entity_id
            for entry_id, entity_ids in claims.items()
            if entry_id != entry.entry_id
            for entity_id in entity_ids
        )
    )
    if overlap:
        raise ConfigEntryError(
            "Entities already used by another Fazenda Irrigation controller: "
            + ", ".join(overlap)
        )
    claims[entry.entry_id] = requested
    controller = IrrigationController(hass, entry)
    try:
        await controller.async_initialize()
        entry.runtime_data = controller
        await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    except Exception:
        claims.pop(entry.entry_id, None)
        raise
    return True


async def async_unload_entry(
    hass: HomeAssistant, entry: FazendaIrrigationConfigEntry
) -> bool:
    """Unload a controller entry."""
    await entry.runtime_data.async_shutdown()
    unloaded = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if unloaded:
        hass.data.get(DOMAIN, {}).get(DATA_CLAIMS, {}).pop(entry.entry_id, None)
    return unloaded
