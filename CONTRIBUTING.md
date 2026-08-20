# Contributing

Bug reports and focused pull requests are welcome. For safety-related changes,
describe the physical valve behavior, failure mode, and recovery behavior.

## Local checks

Run before opening a pull request:

```bash
python -m unittest discover -s tests -v
python -m ruff check .
python -m ruff format --check .
python -m compileall -q custom_components/fazenda_irrigation
node tests/test_fazenda_irrigation_card.mjs
```

Keep runtime files inside `custom_components/fazenda_irrigation`. Never commit
Home Assistant storage, tokens, webhook URLs, credentials, or `secrets.yaml`.

## Pull requests

- Keep each pull request scoped to one behavior or fix.
- Add tests for scheduling, state recovery, error handling, or card interaction
  changes.
- Update `CHANGELOG.md` for user-visible changes.
- Bump the manifest and card versions together for releases.
- Confirm hassfest, HACS validation, Python tests, and JavaScript tests pass.
