"""Irrigation session controller."""

from __future__ import annotations

import asyncio
import logging
from collections.abc import Callable
from datetime import timedelta
from typing import Any

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import Event, HomeAssistant, callback
from homeassistant.exceptions import ServiceValidationError
from homeassistant.helpers.event import async_track_state_change_event
from homeassistant.helpers.storage import Store
from homeassistant.util import dt as dt_util

from .const import (
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
    DOMAIN,
    MODE_PARALLEL,
    MODE_SEQUENTIAL,
    STATUS_ERROR,
    STATUS_IDLE,
    STATUS_RUNNING,
    STATUS_STOPPING,
    STORAGE_VERSION,
)
from .schedule import IrrigationPlan, Segment, ZoneSpec, build_plan

_LOGGER = logging.getLogger(__name__)


class IrrigationStopped(Exception):
    """Raised when a running session is stopped intentionally."""


class IrrigationController:
    """Run and report one configurable irrigation controller."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        """Initialize a controller from config-entry options."""
        self.hass = hass
        self.entry = entry
        self.options = dict(entry.options)
        self.status = STATUS_IDLE
        self.mode: str | None = None
        self.duration_minutes: int | None = None
        self.started_at: str | None = None
        self.estimated_finish: str | None = None
        self.last_session_started_at: str | None = None
        self.last_session_finished_at: str | None = None
        self.last_result: str | None = None
        self.error: str | None = None
        self._listeners: list[Callable[[], None]] = []
        self._task: asyncio.Task[None] | None = None
        self._stop_event = asyncio.Event()
        self._abort_error: str | None = None
        self._zone_runtime: dict[str, dict[str, Any]] = {}
        self._zone_last_started_at: dict[str, str] = {}
        self._zone_duty_used_seconds: dict[str, float] = {}
        self._zone_cooldown_until: dict[str, str] = {}
        self._selected_zones: list[str] = []
        self._source_started_by_us = False
        self._store = Store(
            hass, STORAGE_VERSION, f"{DOMAIN}.{entry.entry_id}", private=True
        )
        self._remove_tank_listener: Callable[[], None] | None = None
        self._configure_zones()

    def _configure_zones(self) -> None:
        entity_ids = list(self.options[CONF_ZONE_ENTITIES])
        configured_names = [
            item.strip()
            for item in str(self.options.get(CONF_ZONE_NAMES, "")).splitlines()
            if item.strip()
        ]
        max_on = int(self.options[CONF_MAX_ON_MINUTES])
        cooldown = int(self.options[CONF_COOLDOWN_MINUTES])
        self.zones: list[dict[str, Any]] = []
        for index, entity_id in enumerate(entity_ids):
            state = self.hass.states.get(entity_id)
            fallback_name = (
                state.attributes.get("friendly_name", entity_id) if state else entity_id
            )
            self.zones.append(
                {
                    "entity_id": entity_id,
                    "name": configured_names[index]
                    if index < len(configured_names)
                    else fallback_name,
                    "max_on_minutes": max_on,
                    "cooldown_minutes": cooldown,
                }
            )

    async def async_initialize(self) -> None:
        """Recover safely after a previous interrupted Home Assistant run."""
        stored = await self._store.async_load()
        if stored:
            self.last_session_started_at = stored.get("last_session_started_at")
            self.last_session_finished_at = stored.get("last_session_finished_at")
            self._zone_last_started_at = dict(stored.get("zone_last_started_at", {}))
            self._zone_duty_used_seconds = {
                entity_id: float(seconds)
                for entity_id, seconds in stored.get(
                    "zone_duty_used_seconds", {}
                ).items()
            }
            self._zone_cooldown_until = dict(stored.get("zone_cooldown_until", {}))
            self.last_result = stored.get("last_result")
        if stored and stored.get("active"):
            zone_ids = stored.get("zones") or [zone["entity_id"] for zone in self.zones]
            cleanup_errors = await self._async_turn_off_many(zone_ids)
            source_error = await self._async_close_source_safely(force=True)
            if source_error:
                cleanup_errors.append(source_error)
            self._mark_recovery_cooldown(zone_ids)
            if cleanup_errors:
                self.status = STATUS_ERROR
                self.last_result = "recovery_failed"
                self.error = "; ".join(cleanup_errors)
            else:
                self.last_result = "interrupted_by_restart"
            self.last_session_finished_at = dt_util.now().isoformat()
            await self._store.async_save(self._storage_payload(active=False))

        tank_entity = self.options.get(CONF_TANK_LEVEL_ENTITY)
        if tank_entity:
            self._remove_tank_listener = async_track_state_change_event(
                self.hass, [tank_entity], self._async_tank_changed
            )

    @callback
    def _async_tank_changed(self, event: Event) -> None:
        if self.status != STATUS_RUNNING:
            return
        try:
            self._validate_tank_level()
        except ServiceValidationError as err:
            self._abort_error = str(err)
            self._stop_event.set()

    @callback
    def async_add_listener(self, listener: Callable[[], None]) -> Callable[[], None]:
        """Subscribe an entity to controller changes."""
        self._listeners.append(listener)

        def remove_listener() -> None:
            if listener in self._listeners:
                self._listeners.remove(listener)

        return remove_listener

    @callback
    def _notify(self) -> None:
        for listener in tuple(self._listeners):
            listener()

    def _thermal_limits(self, zone: dict[str, Any]) -> tuple[float, int, int]:
        """Return used budget, initial capacity and mandatory initial delay."""
        entity_id = zone["entity_id"]
        maximum = int(zone["max_on_minutes"]) * 60
        used = min(
            maximum,
            max(0.0, self._zone_duty_used_seconds.get(entity_id, 0.0)),
        )
        until_raw = self._zone_cooldown_until.get(entity_id)
        until = dt_util.parse_datetime(until_raw) if until_raw else None
        remaining = (
            max(0, int((until - dt_util.now()).total_seconds() + 0.999)) if until else 0
        )
        if until and remaining == 0:
            used = 0.0
            self._zone_duty_used_seconds.pop(entity_id, None)
            self._zone_cooldown_until.pop(entity_id, None)
        if used >= maximum and remaining > 0:
            return used, maximum, remaining
        return used, max(1, int(maximum - used)), 0

    async def async_start(
        self, zone_ids: list[str], duration_minutes: int, mode: str
    ) -> None:
        """Validate and start a new irrigation session."""
        if self._task and not self._task.done():
            raise ServiceValidationError("Irrigation is already running")
        if self.status == STATUS_ERROR:
            raise ServiceValidationError(
                "Reset the controller with Stop before starting a new session"
            )
        if not zone_ids:
            raise ServiceValidationError("Select at least one irrigation zone")
        configured_ids = {zone["entity_id"] for zone in self.zones}
        unknown = [
            entity_id for entity_id in zone_ids if entity_id not in configured_ids
        ]
        if unknown:
            raise ServiceValidationError(
                f"Unknown irrigation zones: {', '.join(unknown)}"
            )
        if len(set(zone_ids)) != len(zone_ids):
            raise ServiceValidationError(
                "An irrigation zone was selected more than once"
            )
        if mode not in (MODE_SEQUENTIAL, MODE_PARALLEL):
            raise ServiceValidationError(f"Unsupported irrigation mode: {mode}")
        minimum = int(self.options[CONF_DURATION_MIN])
        maximum = int(self.options[CONF_DURATION_MAX])
        step = int(self.options[CONF_DURATION_STEP])
        if not minimum <= duration_minutes <= maximum:
            raise ServiceValidationError(
                f"Duration must be between {minimum} and {maximum} minutes"
            )
        if (duration_minutes - minimum) % step:
            raise ServiceValidationError(f"Duration must use a {step}-minute step")

        self._validate_tank_level()
        self._validate_zone_states(zone_ids)

        selected = [zone for zone in self.zones if zone["entity_id"] in zone_ids]
        specs: list[ZoneSpec] = []
        for zone in selected:
            _, initial_capacity, initial_delay = self._thermal_limits(zone)
            specs.append(
                ZoneSpec(
                    zone["entity_id"],
                    duration_minutes * 60,
                    int(zone["max_on_minutes"]) * 60,
                    int(zone["cooldown_minutes"]) * 60,
                    initial_capacity_seconds=initial_capacity,
                    initial_delay_seconds=initial_delay,
                )
            )
        plan = build_plan(
            specs, mode, int(self.options.get(CONF_SOURCE_SETTLE_SECONDS, 0))
        )
        now = dt_util.now()
        self.mode = mode
        self.duration_minutes = duration_minutes
        self.started_at = now.isoformat()
        self.last_session_started_at = self.started_at
        self.estimated_finish = (
            now + timedelta(seconds=plan.finish_offset)
        ).isoformat()
        self.last_result = None
        self.error = None
        self._abort_error = None
        self._selected_zones = [zone["entity_id"] for zone in selected]
        self._zone_runtime = {
            zone.entity_id: {
                "entity_id": zone.entity_id,
                "name": next(
                    item["name"]
                    for item in selected
                    if item["entity_id"] == zone.entity_id
                ),
                "required_seconds": zone.required_seconds,
                "delivered_seconds": 0,
                "phase": "waiting",
                "phase_started_at": None,
                "phase_ends_at": None,
            }
            for zone in specs
        }
        self._stop_event = asyncio.Event()
        self.status = STATUS_RUNNING
        try:
            await self._store.async_save(self._storage_payload(active=True))
        except Exception:
            self.status = STATUS_IDLE
            self.last_result = "start_failed"
            self.last_session_finished_at = dt_util.now().isoformat()
            raise
        self._notify()
        self._task = self.hass.async_create_task(
            self._async_run(plan), f"{DOMAIN}_{self.entry.entry_id}"
        )

    def _validate_zone_states(self, zone_ids: list[str]) -> None:
        for entity_id in zone_ids:
            state = self.hass.states.get(entity_id)
            if state is None or state.state in ("unknown", "unavailable"):
                raise ServiceValidationError(f"Zone {entity_id} is unavailable")
            if state.state in ("on", "open", "opening"):
                raise ServiceValidationError(
                    f"Zone {entity_id} is already active; turn it off before starting"
                )

    def _validate_tank_level(self) -> None:
        tank_entity = self.options.get(CONF_TANK_LEVEL_ENTITY)
        minimum = float(self.options.get(CONF_MIN_TANK_LEVEL, 0))
        if not tank_entity or minimum <= 0:
            return
        state = self.hass.states.get(tank_entity)
        if state is None or state.state in ("unknown", "unavailable"):
            raise ServiceValidationError(
                "The configured water-level entity is unavailable"
            )
        try:
            level = float(state.state)
        except ValueError as err:
            raise ServiceValidationError(
                "The configured water level is not numeric"
            ) from err
        if level < minimum:
            raise ServiceValidationError(
                f"Water level {level:g} is below the configured minimum {minimum:g}"
            )

    async def _async_run(self, plan: IrrigationPlan) -> None:
        tasks: list[asyncio.Task[None]] = []
        try:
            await self._async_set_source(True)
            await self._async_wait(int(self.options.get(CONF_SOURCE_SETTLE_SECONDS, 0)))
            if plan.mode == MODE_SEQUENTIAL:
                await self._async_run_sequential(plan)
            else:
                for zone in self._selected_zones:
                    tasks.append(
                        self.hass.async_create_task(
                            self._async_run_zone(zone, plan.for_zone(zone)),
                            f"{DOMAIN}_{zone}",
                        )
                    )
                await asyncio.gather(*tasks)
            self.last_result = "completed"
            self.status = STATUS_IDLE
        except IrrigationStopped:
            self.last_result = "stopped"
            self.status = STATUS_IDLE
        except Exception as err:  # noqa: BLE001 - cleanup must run for every failure
            _LOGGER.exception("Irrigation session failed")
            self.error = str(err)
            self.last_result = "error"
            self.status = STATUS_ERROR
        finally:
            for task in tasks:
                if not task.done():
                    task.cancel()
            if tasks:
                await asyncio.gather(*tasks, return_exceptions=True)
            cleanup_errors = await self._async_turn_off_many(self._selected_zones)
            source_error = await self._async_close_source_safely()
            if source_error:
                cleanup_errors.append(source_error)
            if cleanup_errors:
                self.status = STATUS_ERROR
                self.last_result = "error"
                self.error = "; ".join(cleanup_errors)
            self.last_session_finished_at = dt_util.now().isoformat()
            await self._store.async_save(self._storage_payload(active=False))
            for runtime in self._zone_runtime.values():
                if runtime["phase"] != "done":
                    runtime["phase"] = (
                        "stopped" if self.status == STATUS_IDLE else "error"
                    )
                runtime["phase_started_at"] = None
                runtime["phase_ends_at"] = None
            self._notify()

    async def _async_run_sequential(self, plan: IrrigationPlan) -> None:
        """Run the planned round-robin order with no valve overlap."""
        totals = {
            entity_id: len(plan.for_zone(entity_id))
            for entity_id in self._selected_zones
        }
        completed = {entity_id: 0 for entity_id in self._selected_zones}
        for segment in plan.segments:
            await self._async_prepare_zone(segment.entity_id)
            await self._async_run_segment(segment)
            completed[segment.entity_id] += 1
            self._set_phase_after_segment(
                segment.entity_id,
                completed[segment.entity_id] == totals[segment.entity_id],
            )

    async def _async_run_zone(
        self, entity_id: str, segments: tuple[Segment, ...]
    ) -> None:
        for index, segment in enumerate(segments):
            await self._async_prepare_zone(entity_id)
            await self._async_run_segment(segment)
            self._set_phase_after_segment(entity_id, index + 1 == len(segments))

    async def _async_prepare_zone(self, entity_id: str) -> None:
        """Wait for a mandatory cooldown or continue a partial duty cycle."""
        zone = next(item for item in self.zones if item["entity_id"] == entity_id)
        used, _, delay = self._thermal_limits(zone)
        runtime = self._zone_runtime[entity_id]
        if delay > 0:
            runtime["phase"] = "cooling"
            runtime["phase_started_at"] = None
            runtime["phase_ends_at"] = (
                dt_util.now() + timedelta(seconds=delay)
            ).isoformat()
            self._notify()
            await self._async_wait(delay)
            self._zone_duty_used_seconds.pop(entity_id, None)
            self._zone_cooldown_until.pop(entity_id, None)
            await self._store.async_save(self._storage_payload(active=True))
        elif used > 0:
            self._zone_cooldown_until.pop(entity_id, None)

    async def _async_run_segment(self, segment: Segment) -> None:
        """Open one valve, account actual runtime, and always close it."""
        entity_id = segment.entity_id
        runtime = self._zone_runtime[entity_id]
        runtime["phase"] = "starting"
        runtime["phase_started_at"] = None
        runtime["phase_ends_at"] = None
        self._notify()

        turned_on = False
        started_monotonic: float | None = None
        delivered = 0.0
        try:
            await self._async_set_zone(entity_id, True)
            turned_on = True
            now = dt_util.now()
            state = self.hass.states.get(entity_id)
            phase_start = (
                state.last_changed
                if state and state.state in ("on", "open", "opening")
                else now
            )
            already_open = max(0.0, (now - phase_start).total_seconds())
            already_open = min(float(segment.duration), already_open)
            started_monotonic = self.hass.loop.time() - already_open
            runtime["phase"] = "watering"
            runtime["phase_started_at"] = phase_start.isoformat()
            runtime["phase_ends_at"] = (
                phase_start + timedelta(seconds=segment.duration)
            ).isoformat()
            self._zone_last_started_at[entity_id] = phase_start.isoformat()
            await self._store.async_save(self._storage_payload(active=True))
            self._notify()
            await self._async_wait(max(0.0, segment.duration - already_open))
        finally:
            if turned_on:
                assert started_monotonic is not None
                delivered = min(
                    float(segment.duration),
                    max(0.0, self.hass.loop.time() - started_monotonic),
                )
                close_error: Exception | None = None
                try:
                    await self._async_set_zone(entity_id, False)
                except Exception as err:  # noqa: BLE001 - account heat first
                    close_error = err
                runtime["delivered_seconds"] += delivered
                self._record_zone_closed(entity_id, delivered)
                await self._store.async_save(self._storage_payload(active=True))
                if close_error:
                    raise close_error

    def _record_zone_closed(self, entity_id: str, delivered: float) -> None:
        """Persist consumed duty budget and the time a full rest completes."""
        if delivered <= 0:
            return
        zone = next(item for item in self.zones if item["entity_id"] == entity_id)
        maximum = int(zone["max_on_minutes"]) * 60
        used = self._zone_duty_used_seconds.get(entity_id, 0.0) + delivered
        self._zone_duty_used_seconds[entity_id] = min(float(maximum), used)
        self._zone_cooldown_until[entity_id] = (
            dt_util.now() + timedelta(minutes=int(zone["cooldown_minutes"]))
        ).isoformat()

    def _mark_recovery_cooldown(self, entity_ids: list[str]) -> None:
        """Assume the worst-case duty after an interrupted active session."""
        now = dt_util.now()
        zones_by_id = {zone["entity_id"]: zone for zone in self.zones}
        for entity_id in entity_ids:
            zone = zones_by_id.get(entity_id)
            if zone is None:
                continue
            self._zone_duty_used_seconds[entity_id] = float(
                int(zone["max_on_minutes"]) * 60
            )
            self._zone_cooldown_until[entity_id] = (
                now + timedelta(minutes=int(zone["cooldown_minutes"]))
            ).isoformat()

    def _set_phase_after_segment(self, entity_id: str, done: bool) -> None:
        runtime = self._zone_runtime[entity_id]
        runtime["phase_started_at"] = None
        if done:
            runtime["phase"] = "done"
            runtime["phase_ends_at"] = None
        else:
            runtime["phase"] = "cooling"
            runtime["phase_ends_at"] = self._zone_cooldown_until.get(entity_id)
        self._notify()

    async def _async_wait_until(self, deadline: float) -> None:
        await self._async_wait(max(0, deadline - self.hass.loop.time()))

    async def _async_wait(self, seconds: float) -> None:
        if seconds <= 0:
            if self._stop_event.is_set():
                self._raise_stopped()
            return
        try:
            await asyncio.wait_for(self._stop_event.wait(), timeout=seconds)
        except TimeoutError:
            return
        self._raise_stopped()

    def _raise_stopped(self) -> None:
        if self._abort_error:
            raise RuntimeError(self._abort_error)
        raise IrrigationStopped

    async def async_stop(self) -> None:
        """Stop the active session, or perform an emergency close while idle."""
        if self._task and not self._task.done():
            self.status = STATUS_STOPPING
            self._notify()
            self._stop_event.set()
            await self._task
            return

        was_error = self.status == STATUS_ERROR
        self.status = STATUS_STOPPING
        self._notify()
        cleanup_errors = await self._async_turn_off_many(
            [zone["entity_id"] for zone in self.zones]
        )
        source_error = await self._async_close_source_safely(force=True)
        if source_error:
            cleanup_errors.append(source_error)
        if cleanup_errors:
            self.status = STATUS_ERROR
            self.last_result = "error"
            self.error = "; ".join(cleanup_errors)
        else:
            self.status = STATUS_IDLE
            self.last_result = "emergency_stop"
            self.error = None
            if was_error:
                self._mark_recovery_cooldown([zone["entity_id"] for zone in self.zones])
        await self._store.async_save(self._storage_payload(active=False))
        self._notify()

    def _storage_payload(self, active: bool) -> dict[str, Any]:
        """Return persistent, non-secret session history and recovery state."""
        return {
            "active": active,
            "zones": self._selected_zones if active else [],
            "started_at": self.started_at if active else None,
            "last_session_started_at": self.last_session_started_at,
            "last_session_finished_at": self.last_session_finished_at,
            "zone_last_started_at": self._zone_last_started_at,
            "zone_duty_used_seconds": self._zone_duty_used_seconds,
            "zone_cooldown_until": self._zone_cooldown_until,
            "last_result": self.last_result,
        }

    async def _async_set_zone(self, entity_id: str, active: bool) -> None:
        state = self.hass.states.get(entity_id)
        if active and (state is None or state.state in ("unknown", "unavailable")):
            raise RuntimeError(f"Zone {entity_id} is unavailable")
        domain = entity_id.split(".", 1)[0]
        if domain == "switch":
            service = "turn_on" if active else "turn_off"
        elif domain == "valve":
            service = "open_valve" if active else "close_valve"
        else:
            raise RuntimeError(f"Unsupported zone domain: {domain}")
        await self.hass.services.async_call(
            domain, service, {"entity_id": entity_id}, blocking=True
        )

    async def _async_turn_off_many(self, entity_ids: list[str]) -> list[str]:
        results = await asyncio.gather(
            *(self._async_set_zone(entity_id, False) for entity_id in entity_ids),
            return_exceptions=True,
        )
        errors: list[str] = []
        for entity_id, result in zip(entity_ids, results, strict=True):
            if isinstance(result, Exception):
                _LOGGER.error(
                    "Could not close irrigation zone %s: %s", entity_id, result
                )
                errors.append(f"Could not close {entity_id}: {result}")
        return errors

    async def _async_close_source_safely(self, force: bool = False) -> str | None:
        """Close the optional source without preventing remaining cleanup."""
        try:
            await self._async_set_source(False, force=force)
        except Exception as err:  # noqa: BLE001 - report cleanup failures in state
            entity_id = self.options.get(CONF_WATER_SOURCE_ENTITY)
            _LOGGER.error("Could not close irrigation source %s: %s", entity_id, err)
            return f"Could not close {entity_id}: {err}"
        return None

    async def _async_set_source(self, active: bool, force: bool = False) -> None:
        entity_id = self.options.get(CONF_WATER_SOURCE_ENTITY)
        if not entity_id:
            return
        state = self.hass.states.get(entity_id)
        source_is_active = state is not None and state.state in (
            "on",
            "open",
            "opening",
        )
        if active:
            self._source_started_by_us = not source_is_active
            if not source_is_active:
                await self._async_set_zone(entity_id, True)
        elif force or self._source_started_by_us:
            await self._async_set_zone(entity_id, False)
            self._source_started_by_us = False

    @property
    def state_attributes(self) -> dict[str, Any]:
        """Return compact state used by the Lovelace card."""
        presets = sorted(
            {
                int(item.strip())
                for item in str(self.options[CONF_DURATION_PRESETS]).split(",")
                if item.strip()
            }
        )
        zones: list[dict[str, Any]] = []
        for zone in self.zones:
            used, initial_capacity, initial_delay = self._thermal_limits(zone)
            zones.append(
                {
                    **zone,
                    "last_started_at": self._zone_last_started_at.get(
                        zone["entity_id"]
                    ),
                    "duty_used_seconds": round(used, 3),
                    "initial_capacity_seconds": initial_capacity,
                    "initial_delay_seconds": initial_delay,
                }
            )
        return {
            "entry_id": self.entry.entry_id,
            "zones": zones,
            "zone_status": list(self._zone_runtime.values()),
            "duration_presets": presets,
            "duration_min": int(self.options[CONF_DURATION_MIN]),
            "duration_max": int(self.options[CONF_DURATION_MAX]),
            "duration_step": int(self.options[CONF_DURATION_STEP]),
            "default_duration": int(self.options[CONF_DEFAULT_DURATION]),
            "default_mode": self.options[CONF_DEFAULT_MODE],
            "mode": self.mode,
            "duration_minutes": self.duration_minutes,
            "selected_zones": self._selected_zones,
            "started_at": self.started_at,
            "estimated_finish": self.estimated_finish,
            "last_session_started_at": self.last_session_started_at,
            "last_session_finished_at": self.last_session_finished_at,
            "tank_level_entity": self.options.get(CONF_TANK_LEVEL_ENTITY),
            "min_tank_level": float(self.options.get(CONF_MIN_TANK_LEVEL, 0)),
            "water_source_entity": self.options.get(CONF_WATER_SOURCE_ENTITY),
            "source_settle_seconds": int(
                self.options.get(CONF_SOURCE_SETTLE_SECONDS, 0)
            ),
            "last_result": self.last_result,
            "error": self.error,
        }

    async def async_shutdown(self) -> None:
        """Unload safely."""
        if self._remove_tank_listener:
            self._remove_tank_listener()
            self._remove_tank_listener = None
        if self._task and not self._task.done():
            await self.async_stop()
