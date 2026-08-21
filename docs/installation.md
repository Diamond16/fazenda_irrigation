# Installation

Home Assistant must already expose every irrigation zone as a `switch` or
`valve`. Create a Home Assistant backup before installing or updating a custom
integration.

## HACS

This repository is currently installed as a custom HACS repository:

1. Open **HACS**, then its upper-right three-dot menu and **Custom
   repositories**.
2. Add `https://github.com/Diamond16/fazenda_irrigation` with type
   **Integration**.
3. Open **Fazenda Irrigation**, select **Download**, and restart Home Assistant
   when HACS requests it.
4. Open **Settings → Devices & services → Add integration**, search for
   **Fazenda Irrigation**, and complete the controller form.

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Diamond16&repository=fazenda_irrigation&category=integration)

The integration installs to
`<config>/custom_components/fazenda_irrigation`. Its dashboard card is bundled
and registered automatically; do not add a separate `/local/` resource.

## Manual installation

1. Download the latest archive from
   [Releases](https://github.com/Diamond16/fazenda_irrigation/releases).
2. Copy its complete `custom_components/fazenda_irrigation` directory to the
   Home Assistant configuration directory.
3. Confirm that
   `<config>/custom_components/fazenda_irrigation/manifest.json` exists.
4. Restart Home Assistant and add the integration from **Settings → Devices &
   services**.

Do not nest the directory one level deeper or copy only individual files.

## Update

In HACS, open the repository, select **Download** or **Redownload**, choose the
latest version, and restart Home Assistant. Then reload the dashboard or fully
close and reopen the mobile app.

For a manual installation, replace the complete integration directory with the
new release and restart Home Assistant.

## Remove

1. Stop irrigation and confirm every physical valve is closed.
2. Remove the cards and delete each Fazenda Irrigation config entry.
3. Remove the repository in HACS, or delete the integration directory for a
   manual installation.
4. Restart Home Assistant.

The underlying zone, tank, and pump entities belong to their hardware
integrations and are not removed.
