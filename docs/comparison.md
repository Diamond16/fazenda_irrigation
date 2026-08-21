# Comparison with other Home Assistant irrigation projects

Home Assistant irrigation projects generally fall into three overlapping
categories:

1. **Execution controllers** open and close zones safely.
2. **Schedulers** decide when programs run and in what sequence.
3. **Demand calculators** estimate how much watering is needed from weather or
   sensors.

Fazenda Irrigation is intentionally concentrated on the first category and on
manual, on-demand operation.

## Capability comparison

This table compares the projects' documented primary capabilities. It is not a
quality ranking.

| Capability | Fazenda Irrigation | Irrigation Unlimited | Smart Irrigation | IrrigationProgram |
| --- | --- | --- | --- | --- |
| Main decision model | User selects zones, time, and scheme for each session | Schedule/sequence engine | Weather and moisture-based runtime calculation | Recurring UI-configured irrigation programs |
| Hardware-independent switch/valve control | Yes | Yes | Primarily outputs durations/events; an automation or controller performs watering | Yes |
| Arbitrary zone count | Yes | Yes | Multiple zones | Multiple zones/programs |
| UI setup | Yes | Yes, with YAML also extensively supported | Yes, dedicated panel | Yes, config flow |
| Bundled control card | Yes | Separate companion card | Dedicated configuration panel; example dashboard tooling | Yes |
| Sequential operation | Yes, round-robin across thermal cycles | Yes, sequences and delays | Depends on the automation/controller; integrates with Irrigation Unlimited | Yes, zone ordering/groups |
| Parallel operation | Yes | Multiple controllers/schedules can overlap | Depends on the automation/controller | Yes |
| Persistent electromagnetic-valve thermal budget across sessions/restarts | Core feature | Not the documented central model | Not the documented central model | ECO/max-time features, but not Fazenda's cross-session accounting model |
| Finish estimate including mandatory cooling | Yes, before start in the card | Schedule timelines/history | Calculates required duration | Program duration/countdown features |
| Calendar, sun, day/month, or cron scheduling | No | Yes | Yes, enhanced/recurring scheduling | Yes |
| Weather/ET/rain runtime calculation | No | External adjustments can be applied | Core feature | Rain sensor and adjustment features |
| History/statistics/volume model | Last-run timestamps only | Extensive history/statistics and volume features | Weather, bucket, zone and module data | Flow sensor/diagnostic features |
| Pump/master source | Optional simple source with settle delay | Controller/sequence ecosystem supports complex arrangements | Controller dependent | Extensive pump/master-solenoid options |
| Tank minimum interlock | Optional numeric threshold | Can be composed with HA configuration | Sensor/module oriented | Water-source sensor features |

Feature sets change over time. Use each project's current documentation before
selecting or migrating a controller.

## Irrigation Unlimited

[Irrigation Unlimited](https://github.com/rgc99/irrigation_unlimited) is a broad
controller and scheduling engine. Its documented model includes unlimited
controllers, zones, schedules, and sequences; calendar, sun, day/month and cron
rules; overlapping schedules; manual runs; time adjustments; history; and
water/volume-related entities. Its purpose is to model a complete irrigation
schedule inside Home Assistant.

Its configuration and action surface is therefore much larger. YAML remains a
major configuration option, UI configuration covers a subset, and its rich
[Lovelace card](https://github.com/rgc99/irrigation-unlimited-card) is a
separate repository.

Choose it instead of Fazenda Irrigation when recurring schedules, many
programs, calendar logic, or detailed irrigation history are more important
than a minimal manual-start workflow.

## Smart Irrigation

[Smart Irrigation](https://github.com/altmenorg/HAsmartirrigation) starts from a
different question: *how long should irrigation run?* Its documented modules
use evapotranspiration, precipitation, forecasts, sensor groups, and a moisture
“bucket” to calculate runtime. It provides a dedicated Home Assistant panel,
multiple zones, scheduling/automation features, and documented integration
with Irrigation Unlimited.

Fazenda Irrigation does not attempt to infer plant demand. The human selects a
duration, and Fazenda concentrates on executing it while respecting valve
cooldowns.

Choose Smart Irrigation when weather-driven demand calculation and seasonal
adjustment are the main goal. The two approaches can also be combined through
Home Assistant automations: a calculator can decide duration and call
`fazenda_irrigation.start`, although Fazenda does not provide a dedicated
adapter for Smart Irrigation.

## IrrigationProgram

[IrrigationProgram](https://github.com/petergridge/Irrigation-V5) is a
UI-configured program engine with a bundled card. Its documentation includes
program frequency, start times, repeats, zone ordering/groups, parallel zones,
rain and flow inputs, pump/master-solenoid control, ECO operation, pause,
interlocks, and detailed advanced timing options.

This is the closest of the compared projects to an all-in-one conventional
irrigation controller. Fazenda Irrigation intentionally omits recurring
programs, repeats, flow diagnostics, and advanced pump timing. It offers a
smaller form and a session-oriented card for manual decisions.

Choose IrrigationProgram when Home Assistant should own a recurring watering
program and hydraulic peripherals. Choose Fazenda when the program changes too
often to be worth maintaining and a person normally initiates each session.

## What is distinctive about Fazenda Irrigation

The key differentiator is the combination of:

- manual, per-session selection of zones, duration, and execution mode;
- actual requested **open time per zone**, excluding technical cooling pauses;
- a persistent thermal budget that cannot be reset by stopping, starting a new
  session, or restarting Home Assistant;
- a pre-start finish estimate that uses that current thermal state;
- sequential round-robin execution for low-pressure sources;
- optional, simple tank and upstream-source safeguards; and
- a bundled card and UI configuration with a deliberately small conceptual
  model.

This makes Fazenda Irrigation closer to a safe “manual session executor” than
to an irrigation calendar.

## Current limitations

Compared with the broader projects, Fazenda Irrigation currently has no:

- autonomous calendar, sun, cron, or seasonal schedule;
- weather, rain, evapotranspiration, crop, or soil-moisture calculation;
- flow meter, leak detection, consumption, or water-volume accounting;
- per-zone thermal limits (limits apply to the whole controller);
- dedicated integrations with third-party irrigation calculators;
- long-term irrigation statistics beyond last-session and last-zone-start
  timestamps; or
- hardware confirmation that a relay or valve physically changed state.

These are explicit scope boundaries, not claims that the broader features are
unnecessary. They keep the on-demand workflow understandable and make it easier
to reason about valve safety.

## Sources reviewed

- [Irrigation Unlimited repository and documentation](https://github.com/rgc99/irrigation_unlimited)
- [Irrigation Unlimited companion card](https://github.com/rgc99/irrigation-unlimited-card)
- [Smart Irrigation repository](https://github.com/altmenorg/HAsmartirrigation)
- [Smart Irrigation documentation](https://altmenorg.github.io/HAsmartirrigation/)
- [IrrigationProgram repository and documentation](https://github.com/petergridge/Irrigation-V5)
- [HACS integration repository documentation](https://www.hacs.xyz/docs/use/repositories/type/integration/)
