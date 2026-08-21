# Usage

## Start a session from the card

When the controller is idle:

1. Select one or more zones. Unavailable or already-open zones cannot be
   selected for a new session.
2. Select a preset duration or select **Other value** and drag the slider.
   This is actual valve-open time **for each selected zone**.
3. Select **Sequential** or **Simultaneous**.
4. Review the order, number of cycles, and estimated finish.
5. Select **Start**.

The card's finish estimate includes:

- the requested watering time for every selected zone;
- current thermal budget remaining from earlier sessions;
- mandatory valve cooldowns;
- sequential or simultaneous execution; and
- the optional water-source settling delay.

Small differences between the estimate and the actual finish are normal due to
Home Assistant service latency, device/network response time, and scheduling.

## During watering

The card shows the session scheme, expected finish, and one row per selected
zone. A zone may be:

- watering;
- cooling;
- waiting for its turn;
- completed; or
- in an error state.

Progress is based on delivered open time, not elapsed wall-clock time. A
cooldown advances the finish time but does not advance the zone's delivered
watering time.

## Stop and recover

Select **Stop** to end the session and close all configured irrigation zones.
The optional water-source entity is also force-closed. Delivered time and
thermal usage up to the stop are retained, so immediately starting another
session cannot reset the valve's duty-cycle protection.

If a valve or source cannot be closed, the controller enters `error`. A new
session is blocked until **Stop** successfully completes emergency cleanup and
resets the error. Inspect the physical installation before retrying.

After a Home Assistant restart, an interrupted session is not resumed. The
integration first attempts to close its zones and source, records a
conservative thermal cooldown, and returns to idle only if cleanup succeeds.

## Home Assistant actions

The integration provides `fazenda_irrigation.start` and
`fazenda_irrigation.stop`. The target is the controller `sensor`, not the
underlying zone entities.

### Start

```yaml
action: fazenda_irrigation.start
target:
  entity_id: sensor.garden_irrigation
data:
  zones:
    - switch.greenhouse_irrigation
    - valve.bed_1
  duration_minutes: 30
  mode: sequential
```

Parameters:

| Parameter | Required | Description |
| --- | --- | --- |
| `zones` | Yes | One or more zone entity IDs configured in the targeted controller. |
| `duration_minutes` | Yes | Positive whole minutes of actual open time per zone. It must be inside this controller's configured minimum/maximum and aligned to its step. |
| `mode` | Yes | `sequential` or `parallel`. |

An action may use a value that is not one of the quick presets, but it must
still match the controller's slider range and step. All normal controller
safety checks and thermal cooldowns apply.

### Stop

```yaml
action: fazenda_irrigation.stop
target:
  entity_id: sensor.garden_irrigation
```

This action is also useful as an emergency cleanup while the controller is
idle: it attempts to close every configured zone and the optional source.

## Automation example

Fazenda Irrigation does not create a schedule, but ordinary Home Assistant
automations can start it. This example runs only when an explicit helper is
turned on; replace all entity IDs with your own:

```yaml
alias: Water selected beds in the morning
triggers:
  - trigger: time
    at: "07:00:00"
conditions:
  - condition: state
    entity_id: input_boolean.enable_morning_irrigation
    state: "on"
actions:
  - action: fazenda_irrigation.start
    target:
      entity_id: sensor.garden_irrigation
    data:
      zones:
        - valve.bed_1
        - valve.bed_2
      duration_minutes: 30
      mode: sequential
mode: single
```

Use Home Assistant conditions for rain, season, occupancy, or any other policy.
Fazenda Irrigation remains responsible only for validating and safely
executing the requested session.

## Controller entity

The controller sensor has one of four states:

| State | Meaning |
| --- | --- |
| `idle` | No active session; a valid new session may be started. |
| `running` | A session is watering, cooling, waiting, or preparing the source. |
| `stopping` | Cleanup is in progress. |
| `error` | Execution or cleanup failed; inspect the error and run Stop after correcting the cause. |

Its attributes contain the configured zones, limits, plan/runtime state,
history timestamps, and error details used by the bundled card. Treat these as
read-only implementation data; use the actions to control irrigation.

## What Fazenda Irrigation does not do

- It does not calculate demand from weather, evapotranspiration, rain, soil
  moisture, crop type, or season.
- It does not provide recurring calendars, sunrise rules, or cron schedules.
- It does not measure flow, consumption, leaks, or delivered water volume.
- It does not verify that a physical relay or valve followed a Home Assistant
  command.
- It does not protect direct manual or automation control of the underlying
  entities.

These boundaries keep manual operation predictable. Use Home Assistant
automations or a specialized irrigation project when those features are
required.
