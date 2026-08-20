# Changelog

All notable changes to this project will be documented in this file. The
format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and
versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.0] - 2026-08-21

### Added

- Config-flow based irrigation controller with an arbitrary number of zones.
- Sequential and simultaneous operation with automatic valve cooldowns.
- Cross-session and restart-persistent thermal duty accounting.
- Optional tank-level interlock and water-source control.
- Bundled responsive Lovelace card with duration presets, draggable custom
  duration slider, live progress, finish estimate, and run history.
- Recovery cleanup after an interrupted Home Assistant run.
- English and Russian setup translations.
- Python scheduling, validation, controller safety, and JavaScript behavior
  tests.

[Unreleased]: https://github.com/Diamond16/fazenda_irrigation/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/Diamond16/fazenda_irrigation/releases/tag/v0.2.0
