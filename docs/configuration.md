# Configuration

Fazenda Irrigation is configured entirely in the Home Assistant UI. One config
entry represents one irrigation controller and creates one controller sensor.

## Safety and equipment

The controller sends ordinary Home Assistant open/close or on/off commands. It
cannot detect a welded relay, blocked valve, broken cable, or command that did
not reach a disconnected device.

Before configuring it:

- Prefer normally closed irrigation valves, so loss of power closes the water.
- Follow the valve manufacturer's maximum energized time and cooling guidance.
- Use appropriately rated relays, power supplies, fuses, wiring, and flyback
  protection for inductive loads.
- Keep independent protection where overheating or flooding could cause harm.
- Confirm that `off` really closes every `switch` zone and `close_valve` closes
  every `valve` zone.
- Avoid giving users separate manual controls for the same physical valves.

Thermal accounting covers only sessions started through Fazenda Irrigation.
Operating an underlying entity directly, from another automation, or from
another integration bypasses that accounting.

## Create a controller

Open **Settings → Devices & services → Add integration**, search for **Fazenda
Irrigation**, and complete the form.

### Controller and zones

| Field | Required | Default | Description |
| --- | --- | --- | --- |
| Controller name | Yes | — | Device/config-entry name, for example `Garden irrigation`. |
| Irrigation zones | Yes | — | One or more `switch` or `valve` entities. Their order is also the initial sequential order. |
| Zone names | No | Entity names | One non-empty display name per selected zone, one per line and in the same order. Leave the entire field empty to use Home Assistant friendly names. |

There is no fixed maximum or hardcoded zone count. Practical limits are the
Home Assistant host, the underlying devices, network latency, and the capacity
of the water system.

All selected zones must be available and closed/off when a new session starts.
The controller rejects a session if any selected zone is `unknown`,
`unavailable`, already on, or already open.

### Duration controls

| Field | Required | Default | Allowed by the form | Description |
| --- | --- | --- | --- | --- |
| Duration presets | Yes | `15, 30, 60, 120` | Positive whole minutes | Comma-separated quick-button values. Duplicate values are removed and values are displayed in ascending order. |
| Minimum duration | Yes | `5` | 1–1440 min | Slider minimum. |
| Maximum duration | Yes | `360` | 1–1440 min | Slider maximum. Must be greater than the minimum. |
| Duration step | Yes | `5` | 1–60 min | Slider increment. The range must contain an exact whole number of steps. |
| Default duration | Yes | `120` | 1–1440 min | Initial card selection. It must be inside the slider range and aligned to its step. |

Every preset must also be inside the slider range and aligned to the step. For
example, with minimum `5` and step `5`, `15` is valid but `12` is not.

The card stores the value from **Other value** independently in the current
browser's local storage. Selecting a preset does not overwrite that custom
value. Different phones or browser profiles may therefore remember different
custom values.

### Watering scheme

| Field | Default | Description |
| --- | --- | --- |
| Default watering scheme | `Sequential` | Initial card selection: `Sequential` or `Simultaneous`. The user may change it before each session. |

**Sequential** uses one zone at a time. Zones run in the configured order; if
they need several thermal cycles, the controller returns to them round-robin.
This is useful when the source has low pressure or flow.

**Simultaneous** runs all selected zones independently at the same time. Each
zone still receives its own cooling pauses. Use it only when the water supply,
pipes, electrical supply, and relays can handle all selected zones together.

### Valve thermal limits

| Field | Required | Default | Allowed by the form | Description |
| --- | --- | --- | --- | --- |
| Maximum continuous valve time | Yes | `40` | 1–1440 min | Maximum uninterrupted energized/open segment. |
| Required valve cooldown | Yes | `10` | 0–1440 min | Required fully closed interval before the valve regains its complete on-time budget. |

These two values currently apply to every zone in this controller. If two
valve types need different limits, create separate controllers and do not
reuse a zone or source entity between them.

The requested duration is **actual open time for each zone**, not total wall
clock time. With 120 minutes requested, a 40-minute maximum, and a 10-minute
cooldown, a single zone follows this plan:

```text
open 40 min → closed 10 min → open 40 min → closed 10 min → open 40 min
```

It receives 120 minutes of water and finishes after about 140 minutes. In
sequential mode, another zone can water while the first one cools, so the
overall plan may be shorter than adding all pauses independently. The card
calculates and displays the expected finish using the current thermal budget.

If a new session starts before a valve has cooled fully, the remaining budget
and delay are carried into the new plan. Thermal state is stored across Home
Assistant restarts. After recovering an interrupted active session, the
controller conservatively assumes that every selected valve used its full
budget and requires a complete cooldown.

### Optional tank-level interlock

| Field | Required | Default | Description |
| --- | --- | --- | --- |
| Water level entity | No | None | A numeric `sensor`, `input_number`, or `number`. |
| Minimum water level | Yes | `0` | Compared with the entity's numeric state in its native unit. `0` disables blocking. |

Examples of native units are percent, litres, or centimetres. Fazenda
Irrigation does not convert units, estimate volume, or calibrate the sensor.

When the threshold is enabled, watering cannot start if the sensor is missing,
unavailable, non-numeric, or below the minimum. During an active session the
controller listens for level changes and stops the session if the threshold is
crossed.

### Optional water-source control

| Field | Required | Default | Description |
| --- | --- | --- | --- |
| Water source control | No | None | Upstream `switch` or `valve`, such as a pump, master valve, or irrigation supply. It cannot also be a zone. |
| Water source settling time | Yes | `0` sec | Delay after opening the source and before the first zone begins. Allowed range: 0–600 seconds. |

At session start, the source is opened before the zones. In normal cleanup it
is closed only if Fazenda Irrigation opened it. The explicit **Stop** action and
restart recovery force a close as an emergency cleanup.

Do not choose a tank-fill valve unless opening that entity really supplies the
irrigation line. Tank filling and tank-level maintenance are outside the scope
of this integration.

## Example five-zone controller

Assume Home Assistant already has these entities:

```text
switch.greenhouse_irrigation
valve.bed_1
valve.bed_2
valve.bed_3
valve.bed_4
sensor.irrigation_tank_level
switch.irrigation_pump
```

One possible form configuration is:

| Field | Example value |
| --- | --- |
| Controller name | `Garden irrigation` |
| Irrigation zones | the five zone entities above |
| Zone names | `Greenhouse`, then `Bed 1` through `Bed 4`, one per line |
| Duration presets | `15, 30, 60, 120` |
| Minimum / maximum / step | `5` / `360` / `5` |
| Default duration | `120` |
| Default scheme | `Sequential` |
| Maximum continuous valve time | the valve manufacturer's safe value, for example `40` |
| Required cooldown | the manufacturer's required value, for example `10` |
| Water level entity | `sensor.irrigation_tank_level` |
| Minimum water level | for example `15` if the sensor reports percent |
| Water source control | `switch.irrigation_pump` |
| Settling time | for example `5` seconds |

The values `40`, `10`, `15`, and `5` are examples, not hardware
recommendations. Use values appropriate for the actual equipment.

## Card configuration

The integration registers the bundled `fazenda-irrigation-card` resource
automatically. Add a **Manual** card in a dashboard:

```yaml
type: custom:fazenda-irrigation-card
entity: sensor.garden_irrigation
title: Irrigation
```

| Card option | Required | Description |
| --- | --- | --- |
| `type` | Yes | Must be `custom:fazenda-irrigation-card`. |
| `entity` | Yes | Controller sensor created by this integration. |
| `title` | No | Card heading. Defaults to the controller/entity friendly name. |
| `default_zones` | No | List of configured zone entity IDs initially selected in this browser. If omitted, all zones are initially selected. |

Example with only two zones selected by default:

```yaml
type: custom:fazenda-irrigation-card
entity: sensor.garden_irrigation
title: Garden irrigation
default_zones:
  - valve.bed_1
  - valve.bed_2
```

`default_zones` affects only the initial card selection. It does not change the
controller configuration or prevent the user or an automation from selecting
other configured zones.

## Edit an existing controller

1. Open **Settings → Devices & services**.
2. Find **Fazenda Irrigation**.
3. Select **Configure** on the relevant entry.
4. Save the changed options.

The config entry reloads automatically. Do not edit `.storage` files or the
controller sensor attributes by hand.

## Multiple controllers

You may create multiple config entries, for example for valve groups with
different thermal requirements. One physical zone or water-source entity may
be claimed by only one loaded Fazenda Irrigation controller. The integration
rejects overlapping entries so two controllers cannot independently command
or account for the same device.
