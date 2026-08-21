# Usage

## Start from the card

1. Select one or more available zones.
2. Select a duration button or **Other value**. The duration is actual valve-open
   time for every selected zone.
3. Select **Sequential** or **Simultaneous**.
4. Review the plan and estimated finish, then select **Start**.

The estimate includes cooling pauses, prior thermal use, selected scheme, and
optional water-source settling. Small differences caused by device and network
latency are normal.

Select **Stop** to end the session and close all configured zones and the
optional source. Watering already delivered and thermal usage remain accounted
for.

If cleanup fails, the controller enters `error` and blocks new sessions.
Correct the device or physical problem, then use **Stop** to retry emergency
cleanup and reset the controller.

An interrupted session is not resumed after a Home Assistant restart. The
integration closes its equipment and applies a conservative cooldown.

## Home Assistant actions

Target the Fazenda Irrigation controller `sensor`, not a zone.

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

`zones` must belong to the targeted controller. `duration_minutes` must be
inside its configured range and aligned to its step. `mode` is `sequential`
or `parallel`.

### Stop

```yaml
action: fazenda_irrigation.stop
target:
  entity_id: sensor.garden_irrigation
```

The stop action also performs emergency cleanup while the controller is idle.

## Automation example

```yaml
alias: Water beds when explicitly enabled
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

Home Assistant conditions can decide when to start. Fazenda Irrigation only
validates and executes the requested session; it does not calculate demand or
create recurring schedules.
