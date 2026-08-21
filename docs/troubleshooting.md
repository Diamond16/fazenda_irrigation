# Troubleshooting

## The repository cannot be added to HACS

Confirm all three values in **HACS → three-dot menu → Custom repositories**:

- Repository: `https://github.com/Diamond16/fazenda_irrigation`
- Type: **Integration**
- Repository visibility: the URL opens without a GitHub login

If HACS already knows the repository, search for **Fazenda Irrigation** instead
of adding it again. Refresh HACS repository data from its menu if a newly
published release is missing.

## Integration is missing after download

1. Confirm HACS shows the repository as downloaded, not merely added.
2. Restart Home Assistant; reloading YAML is not sufficient.
3. Refresh or clear the browser cache, then search again under
   **Settings → Devices & services → Add integration**. HACS explicitly
   recommends clearing the browser cache when a downloaded integration does not
   appear in the add-integration dialog.
4. Check that this file exists:

   ```text
   <config>/custom_components/fazenda_irrigation/manifest.json
   ```

5. Open **Settings → System → Logs** and search for `fazenda_irrigation`.

For a manual installation, also check that the directory is not nested one
level too deep.

## “Custom element doesn't exist”

The card is bundled and registered when a Fazenda Irrigation config entry is
loaded.

1. Confirm the integration has a loaded config entry and controller sensor.
2. Use exactly:

   ```yaml
   type: custom:fazenda-irrigation-card
   ```

3. Hard-refresh the browser. Fully close and reopen the Home Assistant mobile
   app if necessary.
4. Do not add a `/local/fazenda-irrigation-card.js` resource; a stale duplicate
   resource can load the wrong version.
5. Check Home Assistant logs for an integration setup error.

## The card says the controller entity is missing

Open **Settings → Devices & services → Fazenda Irrigation → Devices**, select
the controller device, and copy its sensor entity ID into the card's `entity`
option. The entity ID depends on the controller name and may differ from an
example in this documentation.

## Start is disabled or rejected

Check each of these conditions:

- At least one configured zone is selected.
- Every selected zone exists, is available, and is currently `off` or `closed`.
- The optional tank-level entity is numeric and at or above the configured
  minimum.
- The controller is `idle`, not already `running` or `stopping`.
- The controller is not in `error`. Correct the physical/integration problem,
  then select **Stop** to retry emergency cleanup and reset it.
- The action's `zones` are all part of the targeted controller.
- `mode` is `sequential` or `parallel` and `duration_minutes` is 1–1440.

An already-open zone is rejected because the controller does not know how long
it has been energized outside its own accounting.

## A zone is cooling before a new session

This is expected if the zone has not completed its required closed cooldown
after the preceding session or stop. A new session does not reset thermal
history. The card includes the remaining delay in the plan.

An interrupted Home Assistant run causes an intentionally conservative full
cooldown for every zone that was selected in that session.

## Finish time is later than the selected duration

The selected duration is actual open time **per zone**. The finish also includes
other zones, cooling pauses, current thermal history, and optional source
settling. See the worked example in
[Valve thermal limits](configuration.md#valve-thermal-limits).

Minor additional delay can come from network and Home Assistant service-call
latency.

## Tank level has an unexpected meaning

The integration compares the raw numeric state with the configured minimum in
the entity's native unit. It does not convert percent, litres, distance, or an
inverted ultrasonic reading. Create a Home Assistant template sensor first if
the raw sensor needs conversion or inversion.

Set the minimum to `0` to disable the interlock while keeping the entity visible
on the card.

## A valve did not close

Treat this as a physical safety issue:

1. Isolate water and electrical power if necessary.
2. Do not start another session.
3. Inspect the relay, valve, network/device integration, and Home Assistant
   entity independently.
4. Review **Settings → System → Logs** for the affected entity and
   `fazenda_irrigation`.
5. Only after correcting the cause, run the Fazenda Irrigation **Stop** action
   to retry closing all configured zones and clear the controller error.

Software cannot guarantee closure when the device is unavailable or the relay
has failed mechanically.

## Two controllers cannot use the same entity

This is intentional. A zone or water-source entity can belong to only one
loaded Fazenda Irrigation controller. Otherwise each controller would have
incomplete duty-cycle history and could issue conflicting commands.

Use one controller for shared zones, or reorganize controllers so their zone
and source entity sets do not overlap.

## Collecting information for an issue

Before opening a [GitHub issue](https://github.com/Diamond16/fazenda_irrigation/issues):

- state whether the zone is a `switch` or `valve`;
- include the Fazenda Irrigation version and Home Assistant version;
- describe the selected zones, duration, and mode;
- include the controller state and visible error text;
- include relevant Home Assistant log lines with credentials, tokens, URLs,
  precise location data, and other secrets removed;
- explain the expected and actual physical valve sequence.

Never publish `secrets.yaml`, Home Assistant `.storage` contents, access tokens,
webhook URLs, or complete configuration backups.
