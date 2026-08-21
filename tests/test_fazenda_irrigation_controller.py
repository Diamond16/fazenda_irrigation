"""Focused async tests for valve accounting and cleanup."""

from __future__ import annotations

import asyncio
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
const = _load_module(f"{PACKAGE}.const", COMPONENT / "const.py")
schedule = _load_module(f"{PACKAGE}.schedule", COMPONENT / "schedule.py")
_install_home_assistant_stubs()
controller_module = _load_module(f"{PACKAGE}.controller", COMPONENT / "controller.py")

IrrigationController = controller_module.IrrigationController
IrrigationStopped = controller_module.IrrigationStopped
IrrigationPlan = schedule.IrrigationPlan
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
            "next_start_at": None,
        }
    }
    controller._zone_start_queue = {}
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
    controller.status = const.STATUS_IDLE
    controller.options = {}
    controller._stop_event = asyncio.Event()
    controller._abort_error = None
    controller._source_started_by_us = False
    events: list[bool] = []

    async def set_zone(_entity_id: str, active: bool) -> None:
        events.append(active)
        state.state = "on" if active else "off"
        state.last_changed = datetime.now(UTC)

    controller._async_set_zone = set_zone
    return controller, clock, events


class ControllerTests(unittest.IsolatedAsyncioTestCase):
    """Verify runtime accounting without a full Home Assistant process."""

    def test_runtime_schedule_tracks_each_next_segment(self) -> None:
        controller, _clock, _events = _make_controller()
        started_at = datetime(2026, 8, 21, 10, 0, tzinfo=UTC)
        plan = IrrigationPlan(
            "sequential",
            (
                Segment("switch.zone", 15, 40),
                Segment("switch.zone", 90, 20),
            ),
            110,
        )

        controller._set_runtime_schedule(plan, started_at)

        self.assertEqual(
            controller._zone_runtime["switch.zone"]["next_start_at"],
            "2026-08-21T10:00:15+00:00",
        )
        controller._advance_runtime_schedule("switch.zone")
        self.assertEqual(
            controller._zone_runtime["switch.zone"]["next_start_at"],
            "2026-08-21T10:01:30+00:00",
        )
        controller._advance_runtime_schedule("switch.zone")
        self.assertIsNone(controller._zone_runtime["switch.zone"]["next_start_at"])

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

    def test_interrupted_session_marks_full_recovery_cooldown(self) -> None:
        controller, _clock, _events = _make_controller()

        controller._mark_recovery_cooldown(["switch.zone", "switch.unknown"])

        self.assertEqual(controller._zone_duty_used_seconds["switch.zone"], 60)
        _used, capacity, delay = controller._thermal_limits(controller.zones[0])
        self.assertEqual(capacity, 60)
        self.assertGreaterEqual(delay, 59)
        self.assertNotIn("switch.unknown", controller._zone_duty_used_seconds)

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

    def test_selected_zones_preserve_card_order(self) -> None:
        controller, _clock, _events = _make_controller()
        controller.zones = [
            {"entity_id": "switch.first", "name": "First"},
            {"entity_id": "switch.second", "name": "Second"},
            {"entity_id": "switch.third", "name": "Third"},
        ]

        selected = controller._ordered_selected_zones(["switch.third", "switch.first"])

        self.assertEqual(
            [zone["entity_id"] for zone in selected],
            ["switch.third", "switch.first"],
        )

    def test_unavailable_or_open_zone_is_rejected_before_start(self) -> None:
        controller, _clock, _events = _make_controller()

        for state in ("unknown", "unavailable", "on", "open", "opening"):
            with self.subTest(state=state):
                controller.hass.states["switch.zone"].state = state
                with self.assertRaises(controller_module.ServiceValidationError):
                    controller._validate_zone_states(["switch.zone"])

        controller.hass.states["switch.zone"].state = "off"
        controller._validate_zone_states(["switch.zone"])

    def test_tank_level_interlock_rejects_bad_or_low_values(self) -> None:
        controller, _clock, _events = _make_controller()
        controller.options = {
            const.CONF_TANK_LEVEL_ENTITY: "sensor.tank",
            const.CONF_MIN_TANK_LEVEL: 50,
        }

        for value in ("unknown", "unavailable", "not-a-number", "49.9"):
            with self.subTest(value=value):
                controller.hass.states["sensor.tank"] = FakeState(value)
                with self.assertRaises(controller_module.ServiceValidationError):
                    controller._validate_tank_level()

        controller.hass.states["sensor.tank"] = FakeState("50")
        controller._validate_tank_level()

    def test_tank_drop_requests_session_abort(self) -> None:
        controller, _clock, _events = _make_controller()
        controller.status = const.STATUS_RUNNING
        controller.options = {
            const.CONF_TANK_LEVEL_ENTITY: "sensor.tank",
            const.CONF_MIN_TANK_LEVEL: 50,
        }
        controller.hass.states["sensor.tank"] = FakeState("10")

        controller._async_tank_changed(None)

        self.assertTrue(controller._stop_event.is_set())
        self.assertIn("below", controller._abort_error)

    async def test_source_is_closed_only_when_owned_unless_forced(self) -> None:
        controller, _clock, events = _make_controller()
        controller.options = {const.CONF_WATER_SOURCE_ENTITY: "switch.source"}
        controller.hass.states["switch.source"] = FakeState("on")

        await controller._async_set_source(True)
        await controller._async_set_source(False)
        self.assertEqual(events, [])

        await controller._async_set_source(False, force=True)
        self.assertEqual(events, [False])

        events.clear()
        controller.hass.states["switch.source"].state = "off"
        await controller._async_set_source(True)
        await controller._async_set_source(False)
        self.assertEqual(events, [True, False])


if __name__ == "__main__":
    unittest.main()
