# Changelog

Notable changes are documented here using
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.9.3] - 2026-08-21

### Changed

- The displayed tank level now shows the entity name on hover and opens the
  standard Home Assistant entity history dialog when selected.

## [0.9.2] - 2026-08-21

### Changed

- The Lovelace card and visual editor now follow the Home Assistant interface
  language, with complete English and Russian text and English as the fallback.

### Documentation

- Added English and Russian README navigation and localized card previews for
  idle and running irrigation states.

## [0.9.1] - 2026-08-21

### Added

- Visual card editor for the displayed tank, visible zone subset/order,
  duration buttons, custom slider range, and up to two additional sensors per
  zone.
- Browser-local persistence for zone selection, watering mode, and custom
  duration.
- Live session plan, progress, next-zone start time, and last-run information.

### Changed

- Sequential actions preserve the requested zone order.
- Simultaneous plans present zones as a parallel group.
- Integration, card, and safety configuration remain separate: the card
  cannot weaken controller limits.

### Fixed

- Reliable full-row zone selection and draggable custom-duration input.
- Correct active-zone status when the physical entity changes before the
  controller sensor update.
- Emergency cleanup, restart cooldown, and thermal accounting after an
  interrupted or failed close.
- Card configuration remains complete when switching between visual and YAML
  editors.
- The card does not offer an enabled Start button while controller cleanup is
  in an error state.

### Documentation

- Added concise HACS/manual installation, configuration, usage, safety, and
  troubleshooting guides.

## [0.2.1] - 2026-08-21

### Fixed

- Conservatively require a full valve cooldown after recovering an active
  session interrupted by a Home Assistant crash or restart.
- Block a new session while the controller is in an error state until a
  successful emergency stop resets it.

## [0.2.0] - 2026-08-21

### Added

- Config-flow based controller with arbitrary `switch` or `valve` zones.
- Sequential and simultaneous operation with automatic cooldowns.
- Persistent thermal accounting, optional tank interlock, optional source
  control, bundled card, actions, recovery, and tests.

[Unreleased]: https://github.com/Diamond16/fazenda_irrigation/compare/v0.9.3...HEAD
[0.9.3]: https://github.com/Diamond16/fazenda_irrigation/compare/v0.9.2...v0.9.3
[0.9.2]: https://github.com/Diamond16/fazenda_irrigation/compare/v0.9.1...v0.9.2
[0.9.1]: https://github.com/Diamond16/fazenda_irrigation/compare/v0.2.1...v0.9.1
[0.2.1]: https://github.com/Diamond16/fazenda_irrigation/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/Diamond16/fazenda_irrigation/releases/tag/v0.2.0
