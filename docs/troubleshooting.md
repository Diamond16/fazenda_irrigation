# Troubleshooting

## Integration is missing

- Confirm HACS downloaded the repository as type **Integration**.
- Restart Home Assistant; reloading YAML is not sufficient.
- Refresh the browser and check that
  `<config>/custom_components/fazenda_irrigation/manifest.json` exists.
- Search **Settings → System → Logs** for `fazenda_irrigation`.
- For a manual install, make sure the directory is not nested twice.

## “Custom element doesn't exist”

The card is bundled with the integration. Confirm the integration entry loads,
use `type: custom:fazenda-irrigation-card`, then hard-refresh the browser or
fully reopen the mobile app. Remove any manually added
`/local/fazenda-irrigation-card.js` resource.

## A session will not start

Check that:

- at least one zone is selected;
- every selected zone is available and currently off/closed;
- the controller is `idle`, not `running`, `stopping`, or `error`;
- the optional tank entity is numeric and above its threshold; and
- action duration and mode match the controller settings.

An already-open zone is rejected because the integration cannot know how long
it was energized outside its accounting.

## Finish is later than the duration

The selected duration is open time per zone. Total wall-clock time also includes
other sequential zones, cooling, retained thermal state, and optional source
settling. Minor service and network latency is expected.

## A zone starts with cooling

A previous run or stop may have left part of its thermal budget in use. Starting
a new session or restarting Home Assistant does not reset that protection.

## Tank level is wrong

The threshold uses the raw state in the entity's native unit. Create a template
sensor if distance must be inverted or converted. A minimum of `0` disables
the interlock.

## A valve did not close

Treat this as a physical safety issue. Isolate water or power if necessary,
inspect the relay, valve, network, and hardware integration, and review Home
Assistant logs. After correcting the cause, run the Fazenda Irrigation **Stop**
action to retry closing all configured equipment and clear the error.

Software cannot guarantee closure when a device is unavailable or hardware has
failed.

## Reporting a problem

Open a [GitHub issue](https://github.com/Diamond16/fazenda_irrigation/issues)
with the Fazenda Irrigation and Home Assistant versions, zone type, selected
mode/duration, controller error, expected physical sequence, and relevant logs.
Remove credentials, tokens, URLs, location data, `secrets.yaml`, and
`.storage` contents.
