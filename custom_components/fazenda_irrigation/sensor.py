"""Controller sensor for Fazenda Irrigation."""

from __future__ import annotations

from typing import Any

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from . import FazendaIrrigationConfigEntry
from .const import DOMAIN, STATUSES
from .controller import IrrigationController


async def async_setup_entry(
    hass: HomeAssistant,
    entry: FazendaIrrigationConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up the controller sensor."""
    async_add_entities([FazendaIrrigationSensor(entry.runtime_data)])


class FazendaIrrigationSensor(SensorEntity):
    """Expose controller state to Home Assistant and Lovelace."""

    _attr_device_class = SensorDeviceClass.ENUM
    _attr_has_entity_name = True
    _attr_name = None
    _attr_options = STATUSES
    _attr_should_poll = False
    _attr_translation_key = "controller"

    def __init__(self, controller: IrrigationController) -> None:
        """Initialize the controller sensor."""
        self.controller = controller
        self._attr_unique_id = controller.entry.entry_id
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, controller.entry.entry_id)},
            name=controller.entry.title,
            manufacturer="Fazenda Irrigation",
            model="Irrigation controller",
        )
        self._remove_listener = None

    @property
    def native_value(self) -> str:
        """Return controller state."""
        return self.controller.status

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return card configuration and session state."""
        return self.controller.state_attributes

    async def async_added_to_hass(self) -> None:
        """Subscribe to coordinator changes."""
        await super().async_added_to_hass()
        self._remove_listener = self.controller.async_add_listener(
            self.async_write_ha_state
        )

    async def async_will_remove_from_hass(self) -> None:
        """Unsubscribe from coordinator changes."""
        if self._remove_listener:
            self._remove_listener()
            self._remove_listener = None
        await super().async_will_remove_from_hass()

    async def async_start_irrigation(
        self, zones: list[str], duration_minutes: int, mode: str
    ) -> None:
        """Handle the start entity action."""
        await self.controller.async_start(zones, duration_minutes, mode)

    async def async_stop_irrigation(self) -> None:
        """Handle the stop entity action."""
        await self.controller.async_stop()
