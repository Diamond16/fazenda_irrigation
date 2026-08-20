import assert from "node:assert/strict";

const registry = new Map();

globalThis.HTMLElement = class {
  attachShadow() {
    this.shadowRoot = {
      querySelector: () => null,
      querySelectorAll: () => [],
    };
    return this.shadowRoot;
  }
};
globalThis.customElements = {
  define: (name, value) => registry.set(name, value),
  get: (name) => registry.get(name),
};
globalThis.window = {
  customCards: [],
  localStorage: {
    values: new Map(),
    getItem(key) {
      return this.values.get(key) ?? null;
    },
    setItem(key, value) {
      this.values.set(key, value);
    },
  },
  setInterval,
  clearInterval,
};

await import(
  new URL(
    "../custom_components/fazenda_irrigation/frontend/fazenda-irrigation-card.js",
    import.meta.url
  )
);

const Card = registry.get("fazenda-irrigation-card");
assert.ok(Card, "custom element is registered");

const card = new Card();
const attrs = {
  entry_id: "test-entry",
  duration_min: 5,
  duration_max: 360,
  duration_step: 5,
};

assert.equal(card._normalizeDuration(143, attrs), 145);
assert.equal(card._normalizeDuration(1, attrs), 5);
assert.equal(card._normalizeDuration(500, attrs), 360);

card._customDuration = 145;
card._duration = 145;
card._durationSource = "custom";
card._selectPreset(120);
assert.equal(card._duration, 120);
assert.equal(card._durationSource, "preset");
assert.equal(card._customDuration, 145, "preset does not overwrite custom duration");
card._activateCustom(attrs, false);
assert.equal(card._duration, 145);
assert.equal(card._durationSource, "custom");
card._setCustomDuration(178, attrs);
assert.equal(card._customDuration, 180);
assert.equal(card._duration, 180);

card._selectedZones = new Set(["switch.first"]);
assert.equal(card._toggleZone("switch.first", true), true);
assert.deepEqual([...card._selectedZones], []);
assert.equal(card._toggleZone("switch.blocked", false), false);
assert.deepEqual([...card._selectedZones], []);
assert.equal(card._toggleZone("switch.second", true), true);
assert.deepEqual([...card._selectedZones], ["switch.second"]);

card._selectedZones = new Set(["switch.zone"]);
card._duration = 60;
card._mode = "parallel";
const thermalPlan = card._plan({
  source_settle_seconds: 0,
  zones: [
    {
      entity_id: "switch.zone",
      max_on_minutes: 40,
      cooldown_minutes: 10,
      initial_capacity_seconds: 600,
      initial_delay_seconds: 0,
    },
  ],
});
assert.equal(thermalPlan.finishSeconds, 4800);

card._hass = {
  states: {
    "switch.zone": {
      state: "on",
      last_changed: "2026-08-21T00:00:00+03:00",
    },
  },
};
const effective = card._effectiveRuntime({
  entity_id: "switch.zone",
  phase: "waiting",
  phase_started_at: null,
});
assert.equal(effective.phase, "watering");
assert.equal(effective.phase_started_at, "2026-08-21T00:00:00+03:00");

const fingerprintCard = new Card();
fingerprintCard._config = { entity: "sensor.irrigation" };
let renderCount = 0;
fingerprintCard._render = () => {
  renderCount += 1;
};
const relevantStates = {
  "sensor.irrigation": {
    state: "idle",
    last_updated: "2026-08-21T00:00:00+03:00",
    attributes: {
      zones: [{ entity_id: "switch.zone" }],
      tank_level_entity: "sensor.tank",
    },
  },
  "switch.zone": {
    state: "off",
    last_changed: "2026-08-21T00:00:00+03:00",
  },
  "sensor.tank": { state: "59" },
};
fingerprintCard.hass = { states: relevantStates };
fingerprintCard.hass = {
  states: {
    ...relevantStates,
    "sensor.unrelated": { state: "changed" },
  },
};
assert.equal(renderCount, 1, "unrelated HA updates do not replace the card DOM");

console.log("Card behavior checks passed");
