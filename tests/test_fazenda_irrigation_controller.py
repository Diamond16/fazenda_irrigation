"""Focused async tests for valve accounting and cleanup."""

from __future__ import annotations

import importlib.util
import sys
import types
import unittest
from datetime import UTC, datetime, timedelta
from pathlib import Path

ROOT = Path(__file__).parents[1]
COMPONENT = ROOT / "custom_components" / "fazenda_irrigation"
PACKAGE = "fazenda_irrigation_controller_test"


def _load_module(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


def _install_home_assistant_stubs() -> None:
    homeassistant = types.ModuleType("homeassistant")
    config_entries = types.ModuleType("homeassistant.config_entries")
    config_entries.ConfigEntry = object
    core = types.ModuleType("homeassistant.core")
    core.Event = object
    core.HomeAssistant = object
    core.callback = lambda function: function
    exceptions = types.ModuleType("homeassistant.exceptions")
    exceptions.ServiceValidationError = type("ServiceValidationError", (Exception,), {})
    helpers = types.ModuleType("homeassistant.helpers")
    event = types.ModuleType("homeassistant.helpers.event")
    event.async_track_state_change_event = lambda *_args, **_kwargs: lambda: None
    storage = types.ModuleType("homeassistant.helpers.storage")

    class Store:
        def __init__(self, *_args, **_kwargs) -> None:
            pass

    storage.Store = Store
    util = types.ModuleType("homeassistant.util")
    dt = types.ModuleType("homeassistant.util.dt")
    dt.now = lambda: datetime.now(UTC)
    dt.parse_datetime = datetime.fromisoformat
    util.dt = dt

    modules = {
        "homeassistant": homeassistant,
        "homeassistant.config_entries": config_entries,
        "homeassistant.core": core,
        "homeassistant.exceptions": exceptions,
        "homeassistant.helpers": helpers,
        "homeassistant.helpers.event": event,
        "homeassistant.helpers.storage": storage,
        "homeassistant.util": util,
        "homeassistant.util.dt": dt,
    }
    sys.modules.update(modules)


package = types.ModuleType(PACKAGE)
package.__path__ = [str(COMPONENT)]
sys.modules[PACKAGE] = package
_load_module(f"{PACKAGE}.const", COMPONENT / "const.py")
schedule = _load_module(f"{PACKAGE}.schedule", COMPONENT / "schedule.py")
_install_home_assistant_stubs()
controller_module = _load_module(f"{PACKAGE}.controller", COMPONENT / "controller.py")

IrrigationController = controller_module.IrrigationController
IrrigationStopped = controller_module.IrrigationStopped
Segment = schedule.Segment


class FakeClock:
    """Controllable monotonic clock."""

    def __init__(self) -> None:
        self.value = 1000.0

    def time(self) -> float:
        return self.value


class FakeState:
    def __init__(self, state: str) -> None:
        self.state = state
        self.last_changed = datetime.now(UTC)


class FakeStore:
    def __init__(self) -> None:
        self.saved: list[dict] = []

    async def async_save(self, value: dict) -> None:
        self.saved.append(value)


def _make_controller() -> tuple[IrrigationController, FakeClock, list[bool]]:
    controller = object.__new__(IrrigationController)
    clock = FakeClock()
    state = FakeState("off")
    controller.hass = types.SimpleNamespace(
        loop=clock,
        states={"switch.zone": state},
    )
    controller.zones = [
        {
            "entity_id": "switch.zone",
            "name": "Zone",
            "max_on_minutes": 1,
            "cooldown_minutes": 1,
        }
    ]
    controller._zone_runtime = {
        "switch.zone": {
            "entity_id": "switch.zone",
            "delivered_seconds": 0.0,
            "phase": "waiting",
            "phase_started_at": None,
            "phase_ends_at": None,
        }
    }
    controller._zone_last_started_at = {}
    controller._zone_duty_used_seconds = {}
    controller._zone_cooldown_until = {}
    controller._selected_zones = ["switch.zone"]
    controller._listeners = []
    controller._store = FakeStore()
    controller.started_at = datetime.now(UTC).isoformat()
    controller.last_session_started_at = controller.started_at
    controller.last_session_finished_at = None
    controller.last_result = None
    events: list[bool] = []

    async def set_zone(_entity_id: str, active: bool) -> None:
        events.append(active)
        state.state = "on" if active else "off"
        state.last_changed = datetime.now(UTC)

    controller._async_set_zone = set_zone
    return controller, clock, events


class ControllerTests(unittest.IsolatedAsyncioTestCase):
    """Verify runtime accounting without a full Home Assistant process."""

    async def test_completed_segment_is_closed_and_accounted(self) -> None:
        controller, clock, events = _make_controller()

        async def advance(seconds: float) -> None:
            clock.value += seconds

        controller._async_wait = advance
        await controller._async_run_segment(Segment("switch.zone", 0, 40))

        self.assertEqual(events, [True, False])
        self.assertAlmostEqual(
            controller._zone_runtime["switch.zone"]["delivered_seconds"],
            40,
            places=3,
        )
        self.assertAlmostEqual(
            controller._zone_duty_used_seconds["switch.zone"], 40, places=3
        )
        self.assertIn("switch.zone", controller._zone_cooldown_until)

    async def test_interrupted_segment_still_closes_and_accounts(self) -> None:
        controller, clock, events = _make_controller()

        async def interrupt(_seconds: float) -> None:
            clock.value += 17
            raise IrrigationStopped

        controller._async_wait = interrupt
        with self.assertRaises(IrrigationStopped):
            await controller._async_run_segment(Segment("switch.zone", 0, 40))

        self.assertEqual(events, [True, False])
        self.assertAlmostEqual(
            controller._zone_runtime["switch.zone"]["delivered_seconds"],
            17,
            places=3,
        )
        self.assertAlmostEqual(
            controller._zone_duty_used_seconds["switch.zone"], 17, places=3
        )

    async def test_close_failure_still_accounts_thermal_budget(self) -> None:
        controller, clock, events = _make_controller()

        async def set_zone(_entity_id: str, active: bool) -> None:
            events.append(active)
            if not active:
                raise RuntimeError("relay did not close")

        async def advance(seconds: float) -> None:
            clock.value += seconds

        controller._async_set_zone = set_zone
        controller._async_wait = advance

        with self.assertRaisesRegex(RuntimeError, "relay did not close"):
            await controller._async_run_segment(Segment("switch.zone", 0, 40))

        self.assertEqual(events, [True, False])
        self.assertAlmostEqual(
            controller._zone_runtime["switch.zone"]["delivered_seconds"],
            40,
            places=3,
        )
        self.assertAlmostEqual(
            controller._zone_duty_used_seconds["switch.zone"], 40, places=3
        )

    async def test_full_budget_waits_for_persisted_cooldown(self) -> None:
        controller, _clock, _events = _make_controller()
        controller._zone_duty_used_seconds["switch.zone"] = 60
        controller._zone_cooldown_until["switch.zone"] = (
            datetime.now(UTC) + timedelta(seconds=30)
        ).isoformat()
        waits: list[float] = []

        async def wait(seconds: float) -> None:
            waits.append(seconds)

        controller._async_wait = wait
        await controller._async_prepare_zone("switch.zone")

        self.assertEqual(len(waits), 1)
        self.assertGreaterEqual(waits[0], 29)
        self.assertNotIn("switch.zone", controller._zone_duty_used_seconds)
        self.assertNotIn("switch.zone", controller._zone_cooldown_until)

    async def test_emergency_close_is_sent_for_unavailable_entity(self) -> None:
        controller, _clock, _events = _make_controller()
        calls: list[tuple[str, str, dict, bool]] = []

        async def call(domain: str, service: str, data: dict, blocking: bool) -> None:
            calls.append((domain, service, data, blocking))

        controller.hass.states["switch.zone"].state = "unavailable"
        controller.hass.services = types.SimpleNamespace(async_call=call)

        await IrrigationController._async_set_zone(controller, "switch.zone", False)

        self.assertEqual(
            calls,
            [
                (
                    "switch",
                    "turn_off",
                    {"entity_id": "switch.zone"},
                    True,
                )
            ],
        )

    async def test_unavailable_entity_cannot_be_opened(self) -> None:
        controller, _clock, _events = _make_controller()
        controller.hass.states["switch.zone"].state = "unavailable"

        with self.assertRaisesRegex(RuntimeError, "unavailable"):
            await IrrigationController._async_set_zone(controller, "switch.zone", True)


if __name__ == "__main__":
    unittest.main()
