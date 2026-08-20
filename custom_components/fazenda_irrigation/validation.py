"""Pure validation helpers for Fazenda Irrigation configuration."""

from __future__ import annotations

from typing import Any

from .const import (
    CONF_DEFAULT_DURATION,
    CONF_DURATION_MAX,
    CONF_DURATION_MIN,
    CONF_DURATION_PRESETS,
    CONF_DURATION_STEP,
    CONF_WATER_SOURCE_ENTITY,
    CONF_ZONE_ENTITIES,
    CONF_ZONE_NAMES,
)


class IrrigationValidationError(ValueError):
    """A user-facing config-flow validation error."""

    def __init__(self, code: str) -> None:
        super().__init__(code)
        self.code = code


def parse_presets(value: str) -> list[int]:
    """Parse and normalize a comma-separated duration list."""
    try:
        presets = sorted(
            {int(item.strip()) for item in value.split(",") if item.strip()}
        )
    except ValueError as err:
        raise IrrigationValidationError("invalid_presets") from err
    if not presets or any(item <= 0 for item in presets):
        raise IrrigationValidationError("invalid_presets")
    return presets


def parse_zone_names(value: str, count: int) -> list[str]:
    """Parse one optional display name per selected zone."""
    names = [item.strip() for item in value.splitlines() if item.strip()]
    if names and len(names) != count:
        raise IrrigationValidationError("zone_name_count")
    return names


def validate_options(options: dict[str, Any]) -> None:
    """Validate cross-field controller settings."""
    entities = list(options[CONF_ZONE_ENTITIES])
    if not entities:
        raise IrrigationValidationError("no_zones")
    if len(set(entities)) != len(entities):
        raise IrrigationValidationError("duplicate_zones")
    if options.get(CONF_WATER_SOURCE_ENTITY) in entities:
        raise IrrigationValidationError("source_is_zone")

    parse_zone_names(str(options.get(CONF_ZONE_NAMES, "")), len(entities))
    presets = parse_presets(str(options[CONF_DURATION_PRESETS]))
    minimum = int(options[CONF_DURATION_MIN])
    maximum = int(options[CONF_DURATION_MAX])
    step = int(options[CONF_DURATION_STEP])
    default = int(options[CONF_DEFAULT_DURATION])
    if minimum >= maximum or step <= 0 or (maximum - minimum) % step:
        raise IrrigationValidationError("invalid_duration_range")
    if not minimum <= default <= maximum or (default - minimum) % step:
        raise IrrigationValidationError("invalid_default_duration")
    if any(
        item < minimum or item > maximum or (item - minimum) % step for item in presets
    ):
        raise IrrigationValidationError("preset_out_of_range")
