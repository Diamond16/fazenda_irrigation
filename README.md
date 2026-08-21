# Fazenda Irrigation

<p align="center">
  <img src="custom_components/fazenda_irrigation/brand/icon.png" width="128" alt="Fazenda Irrigation icon">
</p>

Fazenda Irrigation is a manual irrigation controller for Home Assistant. You
select the zones, actual watering time per zone, and sequential or simultaneous
operation. The integration observes the configured valve duty cycle and adds
cooling pauses without subtracting them from the requested watering time.

It is intended for watering that changes with season, weather, and planting,
where maintaining a recurring schedule is less convenient than starting a
well-defined session when needed.

## Features

- Any number of Home Assistant `switch` or `valve` zones, with no
  vendor-specific hardware.
- Sequential round-robin watering for low-pressure sources, or simultaneous
  watering when the installation supports it.
- Configurable maximum continuous valve time and mandatory cooldown, retained
  across stops, sessions, and Home Assistant restarts.
- Configurable duration buttons and a separate custom-duration slider.
- Optional numeric tank-level interlock and optional pump or master-valve
  control.
- Bundled Lovelace card with zone selection, finish estimate, live progress,
  and a visual editor.
- Card settings for the displayed tank, zone subset and order, up to two
  additional sensors per zone, duration buttons, and custom slider range.
- Home Assistant actions for automations; no integration YAML is required.

Fazenda Irrigation does not calculate watering demand from weather or soil
moisture and does not create recurring schedules. Projects such as
[Irrigation Unlimited](https://github.com/rgc99/irrigation_unlimited),
[Smart Irrigation](https://github.com/altmenorg/HAsmartirrigation), and
[IrrigationProgram](https://github.com/petergridge/Irrigation-V5) are better
suited to those broader workflows.

## Install with HACS

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Diamond16&repository=fazenda_irrigation&category=integration)

1. In **HACS → Custom repositories**, add
   `https://github.com/Diamond16/fazenda_irrigation` as an **Integration**.
2. Open **Fazenda Irrigation**, select **Download**, and restart Home Assistant.
3. Open **Settings → Devices & services → Add integration**, search for
   **Fazenda Irrigation**, and create a controller.

The card is registered by the integration; do not add a Lovelace JavaScript
resource manually. See [Installation](docs/installation.md) for manual install,
updates, and removal.

## Configure the controller

Select the zone entities and set:

- quick durations and the allowed custom-duration range;
- the default sequential or simultaneous mode;
- the valve's maximum continuous energized time and required cooldown;
- optionally, a tank-level sensor and minimum level; and
- optionally, a pump/master valve and its settling delay.

The defaults are 15, 30, 60, and 120 minute buttons; a 5–360 minute range in
5-minute steps; sequential operation; 40 minutes maximum continuous operation;
and 10 minutes cooldown. Replace the thermal defaults with values suitable for
your actual valves.

See [Configuration](docs/configuration.md) for all controller and card options.

## Add the card

Add **Fazenda Irrigation** from the dashboard card picker. The visual editor
provides the normal card settings. Equivalent YAML:

```yaml
type: custom:fazenda-irrigation-card
title: Irrigation
tank_entity: sensor.irrigation_tank_level
zones:
  - switch.greenhouse_irrigation
  - valve.bed_1
zone_sensors:
  switch.greenhouse_irrigation:
    - sensor.greenhouse_temperature
    - sensor.greenhouse_humidity
duration_presets: [15, 30, 60, 120]
custom_duration_min: 5
custom_duration_max: 360
custom_duration_step: 5
```

The card finds the controller automatically. It initially selects all visible
zones and then remembers zone selection and watering mode in that browser.

See [Usage](docs/usage.md) for starting sessions and automation actions, or
[Troubleshooting](docs/troubleshooting.md) if installation or start fails.

## Safety

This software cannot detect a welded relay, blocked valve, broken cable, or a
command that never reaches an unavailable device. Thermal accounting covers
only sessions started through Fazenda Irrigation; direct control of the
underlying entities bypasses it.

Use normally closed valves, correctly rated electrical protection, and any
independent protection required by the installation. Test stop and restart
recovery while someone is present before relying on unattended operation.

## Development

```bash
python -m unittest discover -s tests -v
python -m ruff check .
python -m ruff format --check .
python -m compileall -q custom_components/fazenda_irrigation
node tests/test_fazenda_irrigation_card.mjs
```

See [CONTRIBUTING.md](CONTRIBUTING.md). Licensed under [MIT](LICENSE).
