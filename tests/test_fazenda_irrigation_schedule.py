"""Tests for the pure Fazenda Irrigation scheduling algorithm."""

from __future__ import annotations

import importlib.util
import sys
import types
import unittest
from pathlib import Path

ROOT = Path(__file__).parents[1]
COMPONENT = ROOT / "custom_components" / "fazenda_irrigation"


def _load_module(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    assert spec and spec.loader
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


package = types.ModuleType("fazenda_irrigation_test")
package.__path__ = [str(COMPONENT)]
sys.modules[package.__name__] = package
_load_module(f"{package.__name__}.const", COMPONENT / "const.py")
schedule = _load_module(f"{package.__name__}.schedule", COMPONENT / "schedule.py")

ZoneSpec = schedule.ZoneSpec
build_plan = schedule.build_plan


class ScheduleTests(unittest.TestCase):
    """Verify watering totals, ordering and cooling constraints."""

    def test_three_sequential_zones_use_round_robin(self) -> None:
        zones = [
            ZoneSpec(f"switch.zone_{index}", 7200, 2400, 600) for index in range(3)
        ]
        plan = build_plan(zones, "sequential")

        self.assertEqual(plan.finish_offset, 21600)
        self.assertEqual(len(plan.segments), 9)
        self.assertEqual(
            [segment.entity_id for segment in plan.segments[:6]],
            [
                "switch.zone_0",
                "switch.zone_1",
                "switch.zone_2",
                "switch.zone_0",
                "switch.zone_1",
                "switch.zone_2",
            ],
        )
        for zone in zones:
            self.assertEqual(
                sum(segment.duration for segment in plan.for_zone(zone.entity_id)),
                zone.required_seconds,
            )

    def test_one_zone_includes_cooling_pauses(self) -> None:
        plan = build_plan([ZoneSpec("switch.zone", 7200, 2400, 600)], "sequential")

        self.assertEqual(plan.finish_offset, 8400)
        self.assertEqual(
            [(segment.start_offset, segment.duration) for segment in plan.segments],
            [(0, 2400), (3000, 2400), (6000, 2400)],
        )

    def test_parallel_zones_share_wall_clock(self) -> None:
        zones = [
            ZoneSpec(f"switch.zone_{index}", 7200, 2400, 600) for index in range(5)
        ]
        plan = build_plan(zones, "parallel")

        self.assertEqual(plan.finish_offset, 8400)
        self.assertEqual(len(plan.segments), 15)

    def test_source_settle_delay_offsets_every_zone(self) -> None:
        zones = [ZoneSpec("switch.a", 300, 300, 0), ZoneSpec("switch.b", 300, 300, 0)]
        plan = build_plan(zones, "parallel", source_settle_seconds=20)

        self.assertEqual(plan.finish_offset, 320)
        self.assertEqual({segment.start_offset for segment in plan.segments}, {20})

    def test_remaining_thermal_budget_shortens_first_segment(self) -> None:
        zone = ZoneSpec(
            "switch.zone",
            required_seconds=3600,
            max_on_seconds=2400,
            cooldown_seconds=600,
            initial_capacity_seconds=600,
        )

        for mode in ("sequential", "parallel"):
            with self.subTest(mode=mode):
                plan = build_plan([zone], mode)
                self.assertEqual(
                    [
                        (segment.start_offset, segment.duration)
                        for segment in plan.segments
                    ],
                    [(0, 600), (1200, 2400), (4200, 600)],
                )

    def test_required_initial_cooldown_delays_first_segment(self) -> None:
        zone = ZoneSpec(
            "switch.zone",
            required_seconds=300,
            max_on_seconds=2400,
            cooldown_seconds=600,
            initial_delay_seconds=420,
        )

        for mode in ("sequential", "parallel"):
            with self.subTest(mode=mode):
                plan = build_plan([zone], mode, source_settle_seconds=20)
                self.assertEqual(plan.finish_offset, 740)
                self.assertEqual(plan.segments[0].start_offset, 440)

    def test_arbitrary_zone_limits_are_preserved_in_both_modes(self) -> None:
        zones = [
            ZoneSpec(
                f"switch.zone_{index}",
                3700 + index * 137,
                900 + index * 83,
                120 + index * 29,
            )
            for index in range(7)
        ]

        for mode in ("sequential", "parallel"):
            with self.subTest(mode=mode):
                plan = build_plan(zones, mode)
                for zone in zones:
                    segments = plan.for_zone(zone.entity_id)
                    self.assertEqual(
                        sum(segment.duration for segment in segments),
                        zone.required_seconds,
                    )
                    self.assertTrue(
                        all(
                            segment.duration <= zone.max_on_seconds
                            for segment in segments
                        )
                    )
                    self.assertTrue(
                        all(
                            current.start_offset
                            >= previous.end_offset + zone.cooldown_seconds
                            for previous, current in zip(
                                segments, segments[1:], strict=False
                            )
                        )
                    )

    def test_invalid_mode_is_rejected(self) -> None:
        with self.assertRaises(ValueError):
            build_plan([ZoneSpec("switch.zone", 60, 60, 0)], "random")


if __name__ == "__main__":
    unittest.main()
