# Fazenda Irrigation

A configurable manual irrigation controller and Lovelace card for Home
Assistant. Choose any set of zones, watering time, and either sequential or
simultaneous operation. The controller automatically inserts valve cooldowns
while preserving the requested valve-open time for every zone.

## Features

- Any number of `switch` or `valve` entities; no garden-specific entity IDs.
- Sequential round-robin or simultaneous watering.
- Configurable duration presets plus a configurable slider range and step.
- Configurable maximum continuous on-time and mandatory cooldown.
- Thermal duty tracking survives stops, new sessions, and Home Assistant
  restarts.
- Optional tank-level interlock in the sensor's native unit.
- Optional water-source switch or valve with a settling delay.
- Session progress, estimated finish, last session, and last zone start in one
  responsive Lovelace card.
- English and Russian integration setup screens.

## Safety

Fazenda Irrigation is a software coordinator, not a hardware safety device.

- Duty-cycle protection only accounts for sessions started through Fazenda
  Irrigation. Directly operating an underlying zone entity bypasses accounting.
- Use normally closed valves and suitable fuses, power supplies, wiring,
  flyback protection, and independent thermal protection where required.
- A failed relay, disconnected device, network outage, or Home Assistant crash
  can prevent a software close command from reaching the valve.
- Do not expose manual controls for the same valves to untrusted users.
- Test stop, restart recovery, and each failure mode while someone is present
  before relying on unattended operation.

## Installation with HACS

Until this repository is included in the default HACS catalog, add it as a
custom repository:

1. Open HACS, select **Integrations**, then **Custom repositories**.
2. Add `https://github.com/Diamond16/fazenda_irrigation` with category
   **Integration**.
3. Install **Fazenda Irrigation** and restart Home Assistant.
4. Open **Settings → Devices & services → Add integration**, search for
   **Fazenda Irrigation**, and create a controller.

For a manual installation, copy
`custom_components/fazenda_irrigation` into the same path under the Home
Assistant configuration directory, then restart Home Assistant.

## Configuration

All site-specific values are configured in the Home Assistant UI:

| Setting | Purpose |
| --- | --- |
| Irrigation zones | Any number of `switch` or `valve` entities. |
| Zone names | Optional display names, one per selected entity. |
| Duration presets | Comma-separated whole minutes shown as quick buttons. |
| Minimum, maximum, step | Range used by the custom duration slider. |
| Default duration and scheme | Initial card selection. |
| Maximum continuous valve time | Valve-open budget before a forced rest. |
| Required valve cooldown | Full closed interval needed to restore the budget. |
| Water level entity | Optional numeric tank sensor. |
| Minimum water level | Blocks or stops watering below this value; `0` disables it. |
| Water source control | Optional upstream switch or valve. |
| Settling time | Delay between opening the source and starting a zone. |

One physical entity can be claimed by only one loaded Fazenda Irrigation
controller. This prevents two controllers from independently operating and
accounting for the same valve or source.

## Lovelace card

The integration serves and registers its bundled card automatically. Add a
manual card using YAML:

```yaml
type: custom:fazenda-irrigation-card
entity: sensor.your_irrigation_controller
title: Irrigation
```

The sensor entity is created by the integration. Its exact entity ID depends
on the controller name and can be found under the created device.

## Actions

Automations may call the entity actions directly:

```yaml
action: fazenda_irrigation.start
target:
  entity_id: sensor.your_irrigation_controller
data:
  zones:
    - switch.greenhouse_irrigation
    - valve.bed_1
  duration_minutes: 30
  mode: sequential
```

Stop and close all configured zones:

```yaml
action: fazenda_irrigation.stop
target:
  entity_id: sensor.your_irrigation_controller
```

## Development

Run the dependency-free unit and card behavior tests:

```bash
python -m unittest discover -s tests -v
node tests/test_fazenda_irrigation_card.mjs
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution and release checks.

## License

[MIT](LICENSE)
