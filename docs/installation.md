# Installation

## Prerequisites

Before installing Fazenda Irrigation:

- Home Assistant must already expose each irrigation zone as a `switch` or
  `valve` entity.
- The user performing the installation must be able to install integrations
  and restart Home Assistant.
- For the recommended installation method, install and configure
  [HACS](https://www.hacs.xyz/docs/use/).
- Create a Home Assistant backup before installing or updating any custom
  integration.

No integration-specific YAML, Python package, separate dashboard card, or
cloud account is required.

## Install with HACS

The repository is not yet part of the default HACS catalog, so add it as a
custom repository. This follows the official HACS
[custom repository](https://www.hacs.xyz/docs/faq/custom_repositories/) flow.

### 1. Add the repository

1. Open **HACS** from the Home Assistant sidebar.
2. Open the three-dot menu in the upper-right corner.
3. Select **Custom repositories**.
4. In **Repository**, enter:

   ```text
   https://github.com/Diamond16/fazenda_irrigation
   ```

5. Select **Integration** as the repository type.
6. Select **Add**.

You can also try the direct HACS link:

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Diamond16&repository=fazenda_irrigation&category=integration)

The direct link opens the repository only after HACS is installed and the
browser knows the URL of your Home Assistant instance.

### 2. Download the integration

1. Find and open **Fazenda Irrigation** in HACS.
2. Select **Download** in the lower-right corner.
3. Leave the newest release selected and confirm the download.
4. Wait until HACS shows **Pending restart**.
5. Restart Home Assistant from **Settings → System**.

HACS stores the integration under
`<Home Assistant config>/custom_components/fazenda_irrigation`.

### 3. Add a controller

1. Open **Settings → Devices & services**.
2. Select **Add integration**.
3. Search for **Fazenda Irrigation**.
4. Select it and complete the controller form.

If the integration is missing from search after the restart, refresh the
browser once. If that is not enough, follow
[Integration is missing](troubleshooting.md#integration-is-missing-after-download).

### 4. Verify the installation

After the form is saved:

- **Settings → Devices & services** contains a Fazenda Irrigation config entry.
- The entry contains one device and one controller `sensor` entity.
- The controller sensor state is `idle`.
- Adding `custom:fazenda-irrigation-card` to a manual dashboard card does not
  produce a “Custom element doesn't exist” error.

The card JavaScript is served and registered by the integration itself. Do not
add `/local/` resources or install a second HACS dashboard repository.

## Manual installation

Use this method only if HACS is not available.

1. Download a release archive from the repository's
   [Releases](https://github.com/Diamond16/fazenda_irrigation/releases) page.
2. Extract the archive on another computer.
3. Copy the complete directory
   `custom_components/fazenda_irrigation` to the Home Assistant configuration
   directory so the result is:

   ```text
   <config>/custom_components/fazenda_irrigation/__init__.py
   <config>/custom_components/fazenda_irrigation/manifest.json
   <config>/custom_components/fazenda_irrigation/frontend/fazenda-irrigation-card.js
   ...
   ```

4. Do not rename the `fazenda_irrigation` directory.
5. Restart Home Assistant.
6. Add the integration from **Settings → Devices & services → Add
   integration**.

Copying only `__init__.py`, or nesting the directory as
`custom_components/fazenda_irrigation/fazenda_irrigation`, will not work.

## Updating

### HACS installation

1. Create a Home Assistant backup.
2. Open HACS and find **Fazenda Irrigation**.
3. Review the [changelog](../CHANGELOG.md).
4. Select **Download** or **Redownload**, choose the latest release, and
   confirm.
5. Restart Home Assistant when HACS reports **Pending restart**.
6. Hard-refresh every browser or mobile WebView that displays the card. The
   JavaScript file is versioned, but an already-open dashboard may still hold
   the previous card in memory.

Selecting **Update information** in HACS refreshes repository metadata only;
it does not install the new version. This distinction is documented in the
official HACS [repository dashboard guide](https://www.hacs.xyz/docs/use/repositories/dashboard/).

### Manual installation

Replace the complete `custom_components/fazenda_irrigation` directory with the
directory from the new release, restart Home Assistant, and hard-refresh the
dashboard. Do not keep files removed by the newer release.

## Removing

1. Stop any active irrigation session and confirm that all physical valves are
   closed.
2. Remove Fazenda Irrigation cards from dashboards.
3. In **Settings → Devices & services**, open Fazenda Irrigation and delete each
   config entry.
4. In HACS, open the repository's three-dot menu and select **Remove**. For a
   manual installation, remove
   `<config>/custom_components/fazenda_irrigation` instead.
5. Restart Home Assistant.

Removing the integration does not remove the underlying `switch`, `valve`,
tank sensor, or water-source entities because they belong to other Home
Assistant integrations.
