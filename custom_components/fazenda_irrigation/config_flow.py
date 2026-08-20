"""Config flow for Fazenda Irrigation."""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any, cast, override

import voluptuous as vol
from homeassistant.helpers import selector
from homeassistant.helpers.schema_config_entry_flow import (
    SchemaCommonFlowHandler,
    SchemaConfigFlowHandler,
    SchemaFlowError,
    SchemaFlowFormStep,
)

from .const import (
    CONF_CONTROLLER_NAME,
    CONF_COOLDOWN_MINUTES,
    CONF_DEFAULT_DURATION,
    CONF_DEFAULT_MODE,
    CONF_DURATION_MAX,
    CONF_DURATION_MIN,
    CONF_DURATION_PRESETS,
    CONF_DURATION_STEP,
    CONF_MAX_ON_MINUTES,
    CONF_MIN_TANK_LEVEL,
    CONF_SOURCE_SETTLE_SECONDS,
    CONF_TANK_LEVEL_ENTITY,
    CONF_WATER_SOURCE_ENTITY,
    CONF_ZONE_ENTITIES,
    CONF_ZONE_NAMES,
    DEFAULT_COOLDOWN_MINUTES,
    DEFAULT_DEFAULT_DURATION,
    DEFAULT_DURATION_MAX,
    DEFAULT_DURATION_MIN,
    DEFAULT_DURATION_PRESETS,
    DEFAULT_DURATION_STEP,
    DEFAULT_MAX_ON_MINUTES,
    DEFAULT_MIN_TANK_LEVEL,
    DEFAULT_MODE,
    DEFAULT_SOURCE_SETTLE_SECONDS,
    DOMAIN,
    MODES,
)
from .validation import IrrigationValidationError, validate_options


async def _validate_options(
    _: SchemaCommonFlowHandler, user_input: dict[str, Any]
) -> dict[str, Any]:
    """Validate cross-field settings."""
    try:
        validate_options(user_input)
    except IrrigationValidationError as err:
        raise SchemaFlowError(err.code) from err
    return user_input


OPTIONS_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_CONTROLLER_NAME): selector.TextSelector(),
        vol.Required(CONF_ZONE_ENTITIES): selector.EntitySelector(
            selector.EntitySelectorConfig(domain=["switch", "valve"], multiple=True)
        ),
        vol.Optional(CONF_ZONE_NAMES, default=""): selector.TextSelector(
            selector.TextSelectorConfig(multiline=True)
        ),
        vol.Required(
            CONF_DURATION_PRESETS, default=DEFAULT_DURATION_PRESETS
        ): selector.TextSelector(),
        vol.Required(
            CONF_DURATION_MIN, default=DEFAULT_DURATION_MIN
        ): selector.NumberSelector(
            selector.NumberSelectorConfig(
                min=1, max=1440, step=1, mode=selector.NumberSelectorMode.BOX
            )
        ),
        vol.Required(
            CONF_DURATION_MAX, default=DEFAULT_DURATION_MAX
        ): selector.NumberSelector(
            selector.NumberSelectorConfig(
                min=1, max=1440, step=1, mode=selector.NumberSelectorMode.BOX
            )
        ),
        vol.Required(
            CONF_DURATION_STEP, default=DEFAULT_DURATION_STEP
        ): selector.NumberSelector(
            selector.NumberSelectorConfig(
                min=1, max=60, step=1, mode=selector.NumberSelectorMode.BOX
            )
        ),
        vol.Required(
            CONF_DEFAULT_DURATION, default=DEFAULT_DEFAULT_DURATION
        ): selector.NumberSelector(
            selector.NumberSelectorConfig(
                min=1, max=1440, step=1, mode=selector.NumberSelectorMode.BOX
            )
        ),
        vol.Required(CONF_DEFAULT_MODE, default=DEFAULT_MODE): selector.SelectSelector(
            selector.SelectSelectorConfig(
                options=MODES, translation_key=CONF_DEFAULT_MODE
            )
        ),
        vol.Required(
            CONF_MAX_ON_MINUTES, default=DEFAULT_MAX_ON_MINUTES
        ): selector.NumberSelector(
            selector.NumberSelectorConfig(
                min=1, max=1440, step=1, mode=selector.NumberSelectorMode.BOX
            )
        ),
        vol.Required(
            CONF_COOLDOWN_MINUTES, default=DEFAULT_COOLDOWN_MINUTES
        ): selector.NumberSelector(
            selector.NumberSelectorConfig(
                min=0, max=1440, step=1, mode=selector.NumberSelectorMode.BOX
            )
        ),
        vol.Optional(CONF_TANK_LEVEL_ENTITY): selector.EntitySelector(
            selector.EntitySelectorConfig(domain=["sensor", "input_number", "number"])
        ),
        vol.Required(
            CONF_MIN_TANK_LEVEL, default=DEFAULT_MIN_TANK_LEVEL
        ): selector.NumberSelector(
            selector.NumberSelectorConfig(
                min=0,
                max=1_000_000,
                step=0.1,
                mode=selector.NumberSelectorMode.BOX,
            )
        ),
        vol.Optional(CONF_WATER_SOURCE_ENTITY): selector.EntitySelector(
            selector.EntitySelectorConfig(domain=["switch", "valve"])
        ),
        vol.Required(
            CONF_SOURCE_SETTLE_SECONDS, default=DEFAULT_SOURCE_SETTLE_SECONDS
        ): selector.NumberSelector(
            selector.NumberSelectorConfig(
                min=0, max=600, step=1, mode=selector.NumberSelectorMode.BOX
            )
        ),
    }
)

CONFIG_FLOW = {
    "user": SchemaFlowFormStep(OPTIONS_SCHEMA, validate_user_input=_validate_options),
}

OPTIONS_FLOW = {
    "init": SchemaFlowFormStep(OPTIONS_SCHEMA, validate_user_input=_validate_options),
}


class FazendaIrrigationConfigFlow(SchemaConfigFlowHandler, domain=DOMAIN):
    """Handle config and options flows."""

    VERSION = 1
    config_flow = CONFIG_FLOW
    options_flow = OPTIONS_FLOW
    options_flow_reloads = True

    @override
    def async_config_entry_title(self, options: Mapping[str, Any]) -> str:
        """Return the config entry title."""
        return cast(str, options[CONF_CONTROLLER_NAME])
