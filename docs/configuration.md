# Configuration

Fazenda Irrigation is configured in **Settings → Devices & services**. One
config entry creates one irrigation controller sensor.

## Controller settings

| Setting | Default | Purpose |
| --- | --- | --- |
| Controller name | — | Name of the device and controller. |
| Irrigation zones | — | One or more `switch` or `valve` entities. |
| Zone names | Entity names | Optional names, one per line and in zone order. |
| Duration presets | `15, 30, 60, 120` | Quick-button values in minutes. |
| Minimum / maximum / step | `5 / 360 / 5` | Allowed duration range. |
| Default duration | `120` | Initial duration selection. |
| Default scheme | Sequential | Sequential or simultaneous operation. |
| Maximum continuous valve time | `40` min | Maximum uninterrupted open time. |
| Required valve cooldown | `10` min | Closed time required after a full duty cycle. |
| Water level entity | None | Optional numeric tank-level entity. |
| Minimum water level | `0` | Blocks watering below this native value; `0` disables the interlock. |
| Water source control | None | Optional pump or master `switch`/`valve`. |
| Water source settling time | `0` sec | Delay between opening the source and starting zones. |

Preset and default durations must be inside the configured range and aligned to
its step. Zone names must either be empty or contain exactly one non-empty line
per zone.

### Watering schemes

**Sequential** runs one zone at a time in the selected card/action order. If a
session needs multiple thermal cycles, the controller returns to zones in
round-robin order. This is intended for sources with limited flow or pressure.

**Simultaneous** runs all selected zones independently. Use it only when the
water and electrical systems support the combined load.

### Valve cooling

The duration is actual open time **for each selected zone**. With 120 minutes
requested, a 40-minute continuous limit, and a 10-minute cooldown, one zone
runs:

```text
open 40 min → closed 10 min → open 40 min → closed 10 min → open 40 min
```

Cooling is not counted as watering. The remaining thermal budget is retained
when a session is stopped or another session starts. It is also stored across
Home Assistant restarts. After an interrupted active session, the integration
conservatively requires a full cooldown.

The thermal settings apply to every zone in a controller. Use separate,
non-overlapping controllers if valve types require different limits.

### Tank and water source

The optional tank threshold compares the entity's raw numeric state in its
native unit. The integration does not convert percent, litres, distance, or an
inverted level reading. If enabled, the interlock is checked before and during
watering.

The optional source opens before the zones and closes after them. Normal
cleanup closes it only if Fazenda Irrigation opened it; **Stop** and restart
recovery force an emergency close.

## Card settings

Add **Fazenda Irrigation** from the dashboard card picker. Its visual editor
supports:

- card title and optional tank entity for display;
- visible zone subset and drag-and-drop order;
- up to two `sensor` or `binary_sensor` entities per zone;
- ordered duration buttons; and
- minimum, maximum, and step for **Other value**.

The displayed tank is independent of the controller's safety interlock. Card
settings cannot weaken controller limits.

Equivalent YAML:

```yaml
type: custom:fazenda-irrigation-card
title: Irrigation
tank_entity: sensor.irrigation_tank_level
zones:
  - valve.bed_2
  - valve.bed_1
zone_sensors:
  valve.bed_2:
    - sensor.bed_2_soil_moisture
  valve.bed_1:
    - sensor.greenhouse_temperature
    - sensor.greenhouse_humidity
duration_presets: [15, 30, 60, 120]
custom_duration_min: 5
custom_duration_max: 360
custom_duration_step: 5
```

| Option | Description |
| --- | --- |
| `type` | Must be `custom:fazenda-irrigation-card`. |
| `title` | Optional heading. |
| `tank_entity` | Optional numeric entity shown in the header. |
| `zones` | Ordered subset of controller zones. This is the sequential execution order. |
| `zone_sensors` | One or two additional sensor IDs per zone. Selecting a value opens Home Assistant's standard entity details/history. |
| `duration_presets` | Ordered quick durations compatible with controller limits. |
| `custom_duration_min` / `max` / `step` | Range for **Other value**, constrained by controller limits. |
| `entity` | Optional YAML-only controller override, useful only with multiple controllers. |

The card normally finds the controller automatically. All visible zones are
selected initially; later zone selection, watering mode, and the custom slider
value are remembered in that browser. Multiple cards may expose different zone
subsets and orders.

## Edit or add controllers

Use **Settings → Devices & services → Fazenda Irrigation → Configure**. Changes
reload the entry automatically.

Multiple controllers are supported, but a zone or water-source entity may
belong to only one loaded controller. Overlap is rejected to prevent conflicting
commands and incomplete thermal accounting.

## Equipment safety

Prefer normally closed valves and correctly rated relays, power supplies,
fuses, wiring, and flyback protection. Confirm that `off` or `close_valve`
really closes each device. Direct control of underlying entities bypasses
Fazenda Irrigation's thermal accounting.

Software cannot confirm that a physical relay or valve followed a command. Keep
independent protection wherever overheating or flooding could cause harm.
