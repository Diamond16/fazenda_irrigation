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
  dispatchEvent(event) {
    this.lastEvent = event;
    return true;
  }
};
globalThis.CustomEvent = class {
  constructor(type, options) {
    this.type = type;
    Object.assign(this, options);
  }
};
globalThis.customElements = {
  define: (name, value) => registry.set(name, value),
  get: (name) => registry.get(name),
};
globalThis.document = {
  createElement(name) {
    const Element = registry.get(name);
    return Element ? new Element() : {};
  },
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
const Editor = registry.get("fazenda-irrigation-card-editor");
assert.ok(Editor, "visual editor is registered");
assert.ok(Card.getConfigElement() instanceof Editor);
assert.deepEqual(Card.getStubConfig(), {});
assert.throws(
  () => new Card().setConfig({ entity: "sensor.irrigation", zones: "switch.one" }),
  /zones must be a list/
);
assert.throws(
  () => new Card().setConfig({ zone_sensors: [] }),
  /zone_sensors must be an object/
);
assert.throws(
  () =>
    new Card().setConfig({
      zone_sensors: {
        "switch.one": ["sensor.one", "sensor.two", "sensor.three"],
      },
    }),
  /no more than two sensors/
);

const sensorCard = new Card();
sensorCard.setConfig({
  zone_sensors: {
    "switch.greenhouse": ["sensor.temperature", "sensor.humidity"],
  },
});
sensorCard._hass = {
  states: {
    "sensor.temperature": {
      state: "26.1",
      attributes: {
        friendly_name: "Greenhouse temperature",
        unit_of_measurement: "°C",
      },
    },
    "sensor.humidity": {
      state: "99.9",
      attributes: { unit_of_measurement: "%" },
    },
  },
  formatEntityState(stateObj) {
    return `${stateObj.state} ${stateObj.attributes.unit_of_measurement}`;
  },
};
assert.deepEqual(sensorCard._zoneSensorIds("switch.greenhouse"), [
  "sensor.temperature",
  "sensor.humidity",
]);
assert.match(
  sensorCard._zoneSensorsMarkup("switch.greenhouse"),
  /data-more-info="sensor\.temperature"/
);
assert.match(sensorCard._zoneSensorsMarkup("switch.greenhouse"), /26\.1 °C/);
const sensorStyles = sensorCard._styles();
assert.match(sensorStyles, /\.zone \{[^}]*min-height:56px[^}]*display:flex/);
assert.match(sensorStyles, /\.zone-sensors \{[^}]*margin-left:10px/);
assert.match(sensorStyles, /\.zone-sensor \{[^}]*background:transparent/);
assert.match(
  sensorStyles,
  /\.zone-sensor ha-state-icon \{[^}]*transform:translateY\(-3px\)/
);
assert.doesNotMatch(
  sensorStyles,
  /\.zone-sensor \{[^}]*background:var\(--secondary-background-color\)/
);
let sensorClickHandler = null;
const stateIcon = { dataset: { stateIcon: "sensor.temperature" } };
const sensorButton = {
  dataset: { moreInfo: "sensor.temperature" },
  addEventListener(type, handler) {
    if (type === "click") sensorClickHandler = handler;
  },
};
sensorCard.shadowRoot = {
  querySelectorAll(selector) {
    if (selector === "[data-state-icon]") return [stateIcon];
    if (selector === "[data-more-info]") return [sensorButton];
    return [];
  },
};
sensorCard._bindZoneSensors();
assert.equal(stateIcon.stateObj, sensorCard._hass.states["sensor.temperature"]);
assert.equal(typeof sensorClickHandler, "function");
sensorClickHandler({ preventDefault() {}, stopPropagation() {} });
assert.equal(sensorCard.lastEvent.type, "hass-more-info");
assert.deepEqual(sensorCard.lastEvent.detail, {
  entityId: "sensor.temperature",
});

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
assert.equal(card._formatRuntimeDuration(0), "0 sec");
assert.equal(card._formatRuntimeDuration(59.9), "59 sec");
assert.equal(card._formatRuntimeDuration(60), "1 min");
assert.equal(card._formatRuntimeDuration(3599), "59 min");
assert.equal(card._formatRuntimeDuration(3600), "1 h");
assert.equal(card._formatRuntimeDuration(3900), "1 h 5 min");
assert.equal(card._formatCountdown(19.1), "20 sec");
assert.equal(card._formatCountdown(60), "1 min");
assert.equal(card._formatCountdown(61), "2 min");
assert.equal(card._formatCountdown(3600), "1 h");
assert.equal(card._formatCountdown(3660), "1 h 1 min");

const originalNow = Date.now;
Date.now = () => new Date("2026-08-21T10:00:00+03:00").getTime();
assert.equal(
  card._phaseLabel({
    phase: "waiting",
    next_start_at: "2026-08-21T10:00:19+03:00",
  }),
  "Starts in 19 sec"
);
assert.equal(
  card._phaseLabel({
    phase: "waiting",
    next_start_at: "2026-08-21T10:03:01+03:00",
  }),
  "Starts in 4 min"
);
assert.equal(
  card._phaseLabel({
    phase: "waiting",
    next_start_at: "2026-08-21T09:59:59+03:00",
  }),
  "Starts now"
);
Date.now = originalNow;

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

const defaultsCard = new Card();
defaultsCard._config = {
  entity: "sensor.irrigation",
  custom_duration_min: 10,
  custom_duration_max: 300,
  custom_duration_step: 10,
};
window.localStorage.setItem(
  "fazenda-irrigation:test-entry:selected-zones",
  JSON.stringify({
    selected: ["switch.second"],
    known: ["switch.first", "switch.second"],
  })
);
window.localStorage.setItem("fazenda-irrigation:test-entry:mode", "parallel");
defaultsCard._initialize({
  ...attrs,
  default_duration: 30,
  default_mode: "sequential",
  duration_presets: [30, 90],
  zones: [
    { entity_id: "switch.first" },
    { entity_id: "switch.second" },
    { entity_id: "switch.new" },
  ],
});
assert.deepEqual([...defaultsCard._selectedZones], ["switch.second", "switch.new"]);
assert.equal(defaultsCard._duration, 30);
assert.equal(defaultsCard._durationSource, "preset");
assert.equal(defaultsCard._mode, "parallel");
assert.deepEqual(defaultsCard._customDurationBounds(attrs), {
  minimum: 10,
  maximum: 300,
  step: 10,
});

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
    "switch.first": { attributes: { friendly_name: "Первая" } },
    "switch.second": { attributes: { friendly_name: "Вторая" } },
  },
};
const planZones = {
  selected: [
    { entity_id: "switch.first", name: "Первая" },
    { entity_id: "switch.second", name: "Вторая" },
  ],
  cycles: 3,
};
card._mode = "parallel";
assert.match(card._planZonesMarkup(planZones), /Simultaneously:/);
assert.match(card._planZonesMarkup(planZones), /Первая \+ Вторая/);
assert.doesNotMatch(card._planZonesMarkup(planZones), /→/);
card._mode = "sequential";
assert.match(card._planZonesMarkup(planZones), /Order:/);
assert.match(card._planZonesMarkup(planZones), /Первая → Вторая/);

const runningCard = new Card();
runningCard._config = {};
runningCard._hass = { states: {} };
runningCard.shadowRoot = {
  innerHTML: "",
  querySelector() {
    return null;
  },
  querySelectorAll() {
    return [];
  },
};
runningCard._renderRunning({}, {
  mode: "sequential",
  zone_status: [
    {
      entity_id: "switch.first",
      name: "Первая",
      phase: "watering",
      phase_started_at: null,
      delivered_seconds: 19,
      required_seconds: 7200,
    },
  ],
});
assert.match(runningCard.shadowRoot.innerHTML, /class="run-zone"[^>]* active/);
assert.match(runningCard.shadowRoot.innerHTML, /19 sec \/ 2 h/);
assert.match(runningCard._styles(), /\.run-zone\[active\]/);

let rowActive = false;
const elapsedLabel = { textContent: "" };
const progressBar = { style: { width: "" } };
const phaseLabel = { textContent: "" };
const remainingLabel = { textContent: "" };
const progressRow = {
  dataset: { runtimeZone: "switch.first" },
  toggleAttribute(name, value) {
    if (name === "active") rowActive = value;
  },
  querySelector(selector) {
    return {
      ".run-elapsed": elapsedLabel,
      ".progress > span": progressBar,
      ".phase-label": phaseLabel,
      ".run-remaining": remainingLabel,
    }[selector];
  },
};
runningCard._hass.states["switch.first"] = { state: "on" };
runningCard._stateObj = () => ({
  attributes: {
    zone_status: [
      {
        entity_id: "switch.first",
        phase: "watering",
        phase_started_at: null,
        delivered_seconds: 75,
        required_seconds: 300,
      },
    ],
  },
});
runningCard.shadowRoot = {
  querySelectorAll(selector) {
    return selector === "[data-runtime-zone]" ? [progressRow] : [];
  },
};
runningCard._updateRunningProgress();
assert.equal(rowActive, true);
assert.equal(elapsedLabel.textContent, "1 min / 5 min");
assert.equal(progressBar.style.width, "25%");
assert.equal(phaseLabel.textContent, "Watering");
assert.equal(remainingLabel.textContent, "4 min remaining");

const errorCard = new Card();
errorCard.setConfig({});
errorCard._hass = {
  states: {
    "switch.zone": {
      state: "off",
      attributes: { friendly_name: "Zone" },
    },
  },
};
errorCard._selectedZones = new Set(["switch.zone"]);
errorCard._duration = 5;
errorCard._customDuration = 5;
errorCard._durationSource = "preset";
errorCard._mode = "sequential";
errorCard.shadowRoot = {
  innerHTML: "",
  querySelector() {
    return null;
  },
  querySelectorAll() {
    return [];
  },
};
errorCard._renderSetup(
  { state: "error" },
  {
    entry_id: "error-entry",
    duration_min: 5,
    duration_max: 60,
    duration_step: 5,
    duration_presets: [5],
    zones: [
      {
        entity_id: "switch.zone",
        name: "Zone",
        max_on_minutes: 40,
        cooldown_minutes: 10,
      },
    ],
    error: "Cleanup failed",
  }
);
assert.match(
  errorCard.shadowRoot.innerHTML,
  /class="start" disabled/,
  "an error-state controller cannot offer an enabled Start button"
);

card._config = {
  entity: "sensor.irrigation",
  zones: ["switch.second", "switch.first"],
  duration_presets: [60, 15, 60, 17],
  tank_entity: "sensor.display_tank",
};
const configuredAttrs = {
  duration_min: 5,
  duration_max: 360,
  duration_step: 5,
  duration_presets: [30, 120],
  tank_level_entity: "sensor.safety_tank",
  min_tank_level: 50,
  zones: [
    { entity_id: "switch.first" },
    { entity_id: "switch.second" },
    { entity_id: "switch.hidden" },
  ],
};
assert.deepEqual(
  card._visibleZones(configuredAttrs).map((zone) => zone.entity_id),
  ["switch.second", "switch.first"],
  "card zone subset and order override controller display order"
);
assert.deepEqual(card._durationPresets(configuredAttrs), [60, 15]);
card._hass = {
  states: {
    "sensor.display_tank": {
      state: "12",
      attributes: { unit_of_measurement: "%" },
    },
    "sensor.safety_tank": {
      state: "40",
      attributes: { unit_of_measurement: "%" },
    },
  },
};
assert.deepEqual(card._tank(configuredAttrs), {
  entityId: "sensor.display_tank",
  value: 12,
  text: "12%",
  low: false,
});
assert.deepEqual(card._safetyTank(configuredAttrs), {
  entityId: "sensor.safety_tank",
  value: 40,
  text: "40%",
  low: true,
});

const editor = new Editor();
editor.setConfig({
  entity: "sensor.irrigation",
  default_zones: ["switch.first"],
  default_duration: 30,
  default_mode: "parallel",
});
assert.equal(editor._config.entity, "sensor.irrigation");
assert.equal("default_zones" in editor._config, false);
assert.equal("default_duration" in editor._config, false);
assert.equal("default_mode" in editor._config, false);
editor._config.zones = ["switch.first", "switch.second"];
editor._setZoneSensor("switch.first", 0, "sensor.temperature");
editor._setZoneSensor("switch.first", 1, "sensor.humidity");
assert.deepEqual(editor._config.zone_sensors, {
  "switch.first": ["sensor.temperature", "sensor.humidity"],
});
editor._setZones(["switch.second"]);
assert.equal("zone_sensors" in editor._config, false);
editor.setConfig({ entity: "sensor.irrigation" });
editor._hass = {
  states: {
    "sensor.irrigation": {
      attributes: {
        entry_id: "test-entry",
        duration_min: 5,
        duration_max: 360,
        duration_step: 5,
        duration_presets: [15, 30, 60, 120],
        tank_level_entity: "sensor.tank",
        zones: [
          { entity_id: "switch.first", name: "First" },
          { entity_id: "switch.second", name: "Second" },
        ],
      },
    },
  },
};
assert.equal(editor._materializeConfig(), true);
assert.deepEqual(editor._config, {
  entity: "sensor.irrigation",
  tank_entity: "sensor.tank",
  zones: ["switch.first", "switch.second"],
  duration_presets: [15, 30, 60, 120],
  custom_duration_min: 5,
  custom_duration_max: 360,
  custom_duration_step: 5,
});
assert.equal(editor.lastEvent.type, "config-changed");
assert.deepEqual(editor.lastEvent.detail.config, editor._config);
editor._config = {
  zones: ["switch.first", "switch.second"],
  custom_duration_min: 10,
  custom_duration_max: 300,
  custom_duration_step: 10,
};
assert.deepEqual(editor._parsePresetInput("15, 60, 15").values, [15, 60]);
assert.equal(editor._parsePresetInput("17").valid, false);
assert.deepEqual(editor._configuredCustomBounds(), {
  minimum: 10,
  maximum: 300,
  step: 10,
});
assert.equal(
  editor._validateCustomBounds({ minimum: 10, maximum: 300, step: 10 }).valid,
  true
);
assert.equal(
  editor._validateCustomBounds({ minimum: 5, maximum: 359, step: 5 }).valid,
  false
);
let reordered = null;
editor._setZones = (zones) => {
  reordered = zones;
};
assert.equal(editor._moveZone(1, -1), true);
assert.deepEqual(reordered, ["switch.second", "switch.first"]);
editor._config.zones = ["switch.first", "switch.second", "switch.third"];
assert.equal(editor._moveZoneTo(0, 2), true);
assert.deepEqual(reordered, ["switch.second", "switch.third", "switch.first"]);
assert.equal(editor._moveZoneTo(2, 2), false);

let itemMovedHandler = null;
let handleKeydownHandler = null;
const sortable = {
  addEventListener(type, handler) {
    if (type === "item-moved") itemMovedHandler = handler;
  },
};
const dragHandle = {
  dataset: { index: "1" },
  addEventListener(type, handler) {
    if (type === "keydown") handleKeydownHandler = handler;
  },
};
editor.shadowRoot = {
  querySelector(selector) {
    return selector === "#zone-sortable" ? sortable : null;
  },
  querySelectorAll(selector) {
    return selector === "[data-drag-handle]" ? [dragHandle] : [];
  },
};
editor._bindEditor();
assert.equal(typeof itemMovedHandler, "function");
assert.equal(typeof handleKeydownHandler, "function");
editor._config.zones = ["switch.first", "switch.second", "switch.third"];
itemMovedHandler({ detail: { oldIndex: 2, newIndex: 0 } });
assert.deepEqual(reordered, ["switch.third", "switch.first", "switch.second"]);
let prevented = false;
handleKeydownHandler({
  key: "ArrowUp",
  preventDefault() {
    prevented = true;
  },
  stopPropagation() {},
});
assert.equal(prevented, true);
assert.deepEqual(reordered, ["switch.second", "switch.first", "switch.third"]);

editor._hass.states["sensor.unrelated"] = { attributes: {} };
editor.shadowRoot = {
  querySelector() {
    return null;
  },
  querySelectorAll() {
    return [];
  },
};
editor._bindEditor();
assert.equal(editor._controllerEntity(), "sensor.irrigation");

editor.shadowRoot = {
  innerHTML: "",
  querySelector() {
    return null;
  },
  querySelectorAll() {
    return [];
  },
};
editor._render();
assert.match(editor.shadowRoot.innerHTML, /id="presets"/);
assert.match(editor.shadowRoot.innerHTML, /id="custom-min"/);
assert.match(editor.shadowRoot.innerHTML, /id="custom-max"/);
assert.match(editor.shadowRoot.innerHTML, /id="custom-step"/);
assert.match(editor.shadowRoot.innerHTML, /<ha-sortable/);
assert.match(editor.shadowRoot.innerHTML, /handle-selector="\.zone-handle"/);
assert.match(editor.shadowRoot.innerHTML, /draggable-selector="\.zone-row"/);
assert.match(editor.shadowRoot.innerHTML, /mdi:drag-horizontal-variant/);
assert.match(editor.shadowRoot.innerHTML, /data-zone-sensor/);
assert.match(editor.shadowRoot.innerHTML, /data-slot="0"/);
assert.match(editor.shadowRoot.innerHTML, /data-slot="1"/);
assert.doesNotMatch(editor.shadowRoot.innerHTML, /data-move/);
assert.doesNotMatch(editor.shadowRoot.innerHTML, /Контроллер полива/);
assert.doesNotMatch(editor.shadowRoot.innerHTML, /Начальная схема полива/);
assert.match(editor.shadowRoot.innerHTML, /Card title/);
assert.match(editor.shadowRoot.innerHTML, /Quick-button durations, minutes/);
assert.doesNotMatch(editor.shadowRoot.innerHTML, /[А-Яа-яЁё]/);

const russianCard = new Card();
russianCard._hass = { language: "ru", states: {} };
assert.equal(russianCard._formatRuntimeDuration(3900), "1 ч 5 мин");
assert.equal(russianCard._phaseLabel({ phase: "watering" }), "Полив");
const russianEditor = new Editor();
russianEditor._hass = editor._hass;
russianEditor._hass.language = "ru";
russianEditor._config = editor._config;
russianEditor.shadowRoot = {
  innerHTML: "",
  querySelector() { return null; },
  querySelectorAll() { return []; },
};
russianEditor._render();
assert.match(russianEditor.shadowRoot.innerHTML, /Заголовок карточки/);

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
fingerprintCard._config = {
  entity: "sensor.irrigation",
  tank_entity: "sensor.display_tank",
};
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
  "sensor.display_tank": { state: "75" },
};
fingerprintCard.hass = { states: relevantStates };
fingerprintCard.hass = {
  states: {
    ...relevantStates,
    "sensor.unrelated": { state: "changed" },
  },
};
assert.equal(renderCount, 1, "unrelated HA updates do not replace the card DOM");
fingerprintCard.hass = {
  states: {
    ...relevantStates,
    "sensor.tank": { state: "10" },
  },
};
assert.equal(renderCount, 2, "safety tank updates are tracked independently");
fingerprintCard.hass = { language: "ru", states: relevantStates };
assert.equal(renderCount, 3, "changing the Home Assistant language rerenders the card");

console.log("Card behavior checks passed");
