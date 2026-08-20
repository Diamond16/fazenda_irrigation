"""Pure scheduling logic for Fazenda Irrigation."""

from __future__ import annotations

from dataclasses import dataclass

from .const import MODE_PARALLEL, MODE_SEQUENTIAL


@dataclass(frozen=True, slots=True)
class ZoneSpec:
    """A zone and its electrical safety limits."""

    entity_id: str
    required_seconds: int
    max_on_seconds: int
    cooldown_seconds: int
    initial_capacity_seconds: int | None = None
    initial_delay_seconds: int = 0


@dataclass(frozen=True, slots=True)
class Segment:
    """One continuous valve-open interval."""

    entity_id: str
    start_offset: int
    duration: int

    @property
    def end_offset(self) -> int:
        """Return the segment end offset."""
        return self.start_offset + self.duration


@dataclass(frozen=True, slots=True)
class IrrigationPlan:
    """A complete irrigation plan."""

    mode: str
    segments: tuple[Segment, ...]
    finish_offset: int

    def for_zone(self, entity_id: str) -> tuple[Segment, ...]:
        """Return segments for one zone."""
        return tuple(item for item in self.segments if item.entity_id == entity_id)


def build_plan(
    zones: list[ZoneSpec], mode: str, source_settle_seconds: int = 0
) -> IrrigationPlan:
    """Build a deterministic plan that observes every zone's duty cycle."""
    if not zones:
        raise ValueError("At least one zone is required")
    if mode not in (MODE_SEQUENTIAL, MODE_PARALLEL):
        raise ValueError(f"Unsupported irrigation mode: {mode}")
    for zone in zones:
        if zone.required_seconds <= 0:
            raise ValueError("Required watering time must be positive")
        if zone.max_on_seconds <= 0:
            raise ValueError("Maximum continuous on-time must be positive")
        if zone.cooldown_seconds < 0:
            raise ValueError("Cooldown must not be negative")
        if (
            zone.initial_capacity_seconds is not None
            and not 0 < zone.initial_capacity_seconds <= zone.max_on_seconds
        ):
            raise ValueError("Initial capacity must be inside the valve limit")
        if zone.initial_delay_seconds < 0:
            raise ValueError("Initial delay must not be negative")

    if mode == MODE_SEQUENTIAL:
        return _build_sequential(zones, max(0, source_settle_seconds))
    return _build_parallel(zones, max(0, source_settle_seconds))


def _build_sequential(zones: list[ZoneSpec], initial_offset: int) -> IrrigationPlan:
    remaining = {zone.entity_id: zone.required_seconds for zone in zones}
    available_at = {
        zone.entity_id: initial_offset + zone.initial_delay_seconds for zone in zones
    }
    next_capacity = {
        zone.entity_id: zone.initial_capacity_seconds or zone.max_on_seconds
        for zone in zones
    }
    offset = initial_offset
    segments: list[Segment] = []

    while any(seconds > 0 for seconds in remaining.values()):
        for zone in zones:
            if remaining[zone.entity_id] <= 0:
                continue
            start = max(offset, available_at[zone.entity_id])
            duration = min(next_capacity[zone.entity_id], remaining[zone.entity_id])
            segment = Segment(zone.entity_id, start, duration)
            segments.append(segment)
            remaining[zone.entity_id] -= duration
            offset = segment.end_offset
            if remaining[zone.entity_id] > 0:
                available_at[zone.entity_id] = offset + zone.cooldown_seconds
                next_capacity[zone.entity_id] = zone.max_on_seconds

    return IrrigationPlan(MODE_SEQUENTIAL, tuple(segments), offset)


def _build_parallel(zones: list[ZoneSpec], initial_offset: int) -> IrrigationPlan:
    segments: list[Segment] = []
    finish = initial_offset

    for zone in zones:
        remaining = zone.required_seconds
        offset = initial_offset + zone.initial_delay_seconds
        capacity = zone.initial_capacity_seconds or zone.max_on_seconds
        while remaining > 0:
            duration = min(capacity, remaining)
            segment = Segment(zone.entity_id, offset, duration)
            segments.append(segment)
            remaining -= duration
            offset = segment.end_offset
            if remaining > 0:
                offset += zone.cooldown_seconds
                capacity = zone.max_on_seconds
        finish = max(finish, segments[-1].end_offset)

    segments.sort(key=lambda item: (item.start_offset, item.entity_id))
    return IrrigationPlan(MODE_PARALLEL, tuple(segments), finish)
