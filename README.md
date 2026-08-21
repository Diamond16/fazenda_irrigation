# Fazenda Irrigation

<p align="center">
  <img src="custom_components/fazenda_irrigation/brand/icon.png" width="128" alt="Fazenda Irrigation icon">
</p>

Fazenda Irrigation is a manual, hardware-independent irrigation controller for
Home Assistant. Select the zones, actual watering time per zone, and either
sequential or simultaneous operation. The controller handles mandatory valve
cooldowns and still delivers the requested valve-open time.

It is deliberately not a seasonal scheduler or a weather-based runtime
calculator. It is intended for situations where a person decides *what needs
watering today*, but should not have to calculate valve duty cycles or the
resulting finish time.

## Highlights

- Any number of `switch` or `valve` entities; no vendor-specific hardware and
  no hardcoded zone count.
- Sequential round-robin or simultaneous watering.
- Configurable duration presets and a separate draggable duration slider.
- Configurable maximum continuous on-time and mandatory cooldown.
- Exact requested valve-open time per zone; cooling pauses are not counted as
  watering.
- Thermal duty tracking across stops, new sessions, and Home Assistant
  restarts.
- Optional tank-level interlock and optional upstream water-source control.
- Bundled responsive Lovelace card with a plan, estimated finish, live
  progress, and last-run times.
- UI-based configuration; no integration YAML is required.
- English and Russian integration setup screens.

## When to choose it

Choose Fazenda Irrigation when watering decisions depend on what is currently
planted, the season, or a visual inspection, and you want a simple **select →
set duration → start** workflow with automatic valve protection.

Other projects solve broader but different problems:

| Project | Primary model | Key difference from Fazenda Irrigation |
| --- | --- | --- |
| [Irrigation Unlimited](https://github.com/rgc99/irrigation_unlimited) | Controllers, schedules, sequences, calendar/sun/cron rules, history and adjustments | Much more capable autonomous scheduling. Fazenda is smaller, manually initiated, and has a bundled card plus persistent valve thermal accounting. |
| [Smart Irrigation](https://github.com/altmenorg/HAsmartirrigation) | Weather, evapotranspiration, precipitation and moisture-bucket based runtime calculation | Decides *how long* watering should run from environmental data. Fazenda intentionally lets the user choose the duration and focuses on safe execution. |
| [IrrigationProgram](https://github.com/petergridge/Irrigation-V5) | UI-configured recurring programs with pumps, rain/flow inputs, repeats and zone groups | A full irrigation program engine. Fazenda omits calendars and most hydraulic automation in exchange for a shorter setup and an on-demand UI. |

See [the detailed comparison](docs/comparison.md) for capabilities,
limitations, and guidance on combining these approaches.

## Installation with HACS

Fazenda Irrigation is currently installed as a HACS custom repository.

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Diamond16&repository=fazenda_irrigation&category=integration)

1. Open **HACS** in Home Assistant.
2. Open the three-dot menu in the upper-right corner and select
   **Custom repositories**.
3. Enter `https://github.com/Diamond16/fazenda_irrigation`, select
   **Integration**, and select **Add**.
4. Open **Fazenda Irrigation**, select **Download**, and choose the latest
   release.
5. Restart Home Assistant when HACS reports **Pending restart**.
6. Open **Settings → Devices & services → Add integration**, search for
   **Fazenda Irrigation**, and create a controller.

The integration installs into
`<Home Assistant config>/custom_components/fazenda_irrigation`. The bundled
card is registered automatically when the integration loads; do not add a
Lovelace resource manually.

Read the [complete installation guide](docs/installation.md) for prerequisites,
manual installation, updates, verification, and removal.

## Quick configuration

Before adding the controller, create or identify the Home Assistant `switch`
or `valve` entities that physically control the irrigation zones. Then provide:

1. A controller name and one or more zone entities.
2. Optional display names in the same order as the selected zones.
3. Quick duration presets and the custom-duration slider range.
4. The default watering mode.
5. The valve's maximum continuous energized time and required closed cooldown.
6. Optionally, a tank-level entity and/or an upstream water-source entity.

The defaults provide buttons for 15, 30, 60, and 120 minutes, a 5–360 minute
slider in 5-minute steps, sequential watering, 40 minutes maximum continuous
on-time, and 10 minutes cooldown.

See [Configuration](docs/configuration.md) for every field, validation rule,
worked cooldown examples, optional equipment, and multiple-controller rules.

## Add the card

Add a **Manual** card to a dashboard:

```yaml
type: custom:fazenda-irrigation-card
entity: sensor.your_irrigation_controller
title: Irrigation
```

Replace the example entity with the controller sensor created by the
integration. Find it under **Settings → Devices & services → Fazenda
Irrigation → Devices**.

For card options, daily use, actions, and automation examples, see
[Usage](docs/usage.md). If something does not load or start, use the
[Troubleshooting guide](docs/troubleshooting.md).

## Safety

Fazenda Irrigation is a software coordinator, not a hardware safety device.

- Duty-cycle protection only accounts for sessions started through Fazenda
  Irrigation. Directly operating an underlying zone entity bypasses accounting.
- Use normally closed valves and suitable fuses, power supplies, wiring,
  flyback protection, and independent thermal protection where required.
- A failed relay, disconnected device, network outage, or Home Assistant crash
  can prevent a software close command from reaching the valve.
- Test stop, restart recovery, and each relevant failure mode while someone is
  present before relying on unattended operation.

Read the full [safety and equipment guidance](docs/configuration.md#safety-and-equipment).

## Documentation

- [Installation and updates](docs/installation.md)
- [Controller and card configuration](docs/configuration.md)
- [Using the card, actions, and automations](docs/usage.md)
- [Troubleshooting](docs/troubleshooting.md)
- [Comparison with other irrigation projects](docs/comparison.md)
- [Contributing](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)

## Development

Run the local checks:

```bash
python -m unittest discover -s tests -v
python -m ruff check .
python -m ruff format --check .
python -m compileall -q custom_components/fazenda_irrigation
node tests/test_fazenda_irrigation_card.mjs
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution and release checks.

## License

[MIT](LICENSE)
