"""Tests for config-flow validation without Home Assistant dependencies."""

from __future__ import annotations

import importlib.util
import sys
import types
import unittest
from pathlib import Path

ROOT = Path(__file__).parents[1]
COMPONENT = ROOT / "custom_components" / "fazenda_irrigation"
PACKAGE = "fazenda_irrigation_validation_test"


def _load_module(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


package = types.ModuleType(PACKAGE)
package.__path__ = [str(COMPONENT)]
sys.modules[PACKAGE] = package
const = _load_module(f"{PACKAGE}.const", COMPONENT / "const.py")
validation = _load_module(f"{PACKAGE}.validation", COMPONENT / "validation.py")


def _valid_options() -> dict:
    return {
        const.CONF_ZONE_ENTITIES: ["switch.one", "switch.two"],
        const.CONF_ZONE_NAMES: "One\nTwo",
        const.CONF_DURATION_PRESETS: "15, 30, 60, 120",
        const.CONF_DURATION_MIN: 5,
        const.CONF_DURATION_MAX: 360,
        const.CONF_DURATION_STEP: 5,
        const.CONF_DEFAULT_DURATION: 120,
        const.CONF_WATER_SOURCE_ENTITY: "switch.source",
    }


class ValidationTests(unittest.TestCase):
    """Cover every config-flow error code."""

    def assert_error(self, code: str, **changes) -> None:
        options = _valid_options()
        options.update(changes)
        with self.assertRaises(validation.IrrigationValidationError) as raised:
            validation.validate_options(options)
        self.assertEqual(raised.exception.code, code)

    def test_valid_options_and_normalized_presets(self) -> None:
        validation.validate_options(_valid_options())
        self.assertEqual(validation.parse_presets("60, 15, 60, 30"), [15, 30, 60])

    def test_invalid_presets(self) -> None:
        self.assert_error(
            "invalid_presets", **{const.CONF_DURATION_PRESETS: "15, invalid"}
        )
        self.assert_error("invalid_presets", **{const.CONF_DURATION_PRESETS: ""})

    def test_zone_name_count(self) -> None:
        self.assert_error("zone_name_count", **{const.CONF_ZONE_NAMES: "Only one"})

    def test_at_least_one_zone_is_required(self) -> None:
        self.assert_error("no_zones", **{const.CONF_ZONE_ENTITIES: []})

    def test_duplicate_zones(self) -> None:
        self.assert_error(
            "duplicate_zones",
            **{const.CONF_ZONE_ENTITIES: ["switch.one", "switch.one"]},
        )

    def test_source_is_zone(self) -> None:
        self.assert_error(
            "source_is_zone",
            **{const.CONF_WATER_SOURCE_ENTITY: "switch.one"},
        )

    def test_duration_range(self) -> None:
        self.assert_error(
            "invalid_duration_range",
            **{const.CONF_DURATION_MAX: 361},
        )

    def test_default_duration(self) -> None:
        self.assert_error(
            "invalid_default_duration",
            **{const.CONF_DEFAULT_DURATION: 122},
        )

    def test_preset_out_of_range(self) -> None:
        self.assert_error(
            "preset_out_of_range",
            **{const.CONF_DURATION_PRESETS: "15, 30, 361"},
        )


if __name__ == "__main__":
    unittest.main()
