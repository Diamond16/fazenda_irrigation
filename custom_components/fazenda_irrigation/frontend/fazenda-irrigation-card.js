const FI_CARD_VERSION = "0.9.2";

const FI_TRANSLATIONS = {
  en: {
    zoneSensorsObject: "zone_sensors must be an object",
    zoneSensorsList: "zone_sensors.{zone} must be a list",
    zoneSensorsLimit: "Zone {zone} can have no more than two sensors",
    configList: "{key} must be a list",
    noData: "No data",
    unavailable: "Unavailable",
    zoneUnavailable: "Unavailable",
    minutes: "{value} min",
    seconds: "{value} sec",
    hours: "{value} h",
    days: "{value} d",
    parallelOrder: "Simultaneously:",
    sequentialOrder: "Order:",
    repeatCycles: "repeat {value} cycles",
    neverStarted: "never started",
    justNow: "just now",
    agoSeconds: "{value} sec ago",
    agoMinutes: "{value} min ago",
    agoHours: "{value} h ago",
    agoDays: "{value} d ago",
    integrationUnavailable: "Fazenda Irrigation is not configured or unavailable",
    previousSession: "Previous session — {value}",
    irrigationNeverStarted: "Irrigation has not started yet",
    irrigation: "Irrigation",
    sessionRunning: "Session in progress",
    tank: "Tank",
    alreadyOn: "Already on",
    today: "Today",
    tomorrow: "Tomorrow",
    zones: "Zones",
    selected: "Selected: {value}",
    durationPerZone: "Time for each zone",
    actualOpenTime: "Actual open time",
    customValue: "Custom value",
    customMinutes: "{value} minutes",
    mode: "Mode",
    sequential: "Sequential",
    parallel: "Simultaneously",
    plan: "Plan",
    coolingIncluded: "Including cooldown",
    finish: "Finish",
    totalTime: "Total time",
    thermalWarning: "Each valve: at most {max} minutes on, followed by at least {cooldown} minutes of cooldown.",
    lowTank: "The safety tank sensor prevents irrigation from starting: {value}.",
    start: "Start irrigation",
    valveOpening: "Opening valve",
    watering: "Watering",
    coolingRemaining: "Cooling — {value} min remaining",
    done: "Done",
    error: "Error",
    stopped: "Stopped",
    waiting: "Waiting for its turn",
    startsNow: "Starts now",
    startsIn: "Starts in {value}",
    remaining: "{value} remaining",
    parallelIrrigation: "Simultaneous irrigation",
    sequentialIrrigation: "Sequential irrigation",
    until: "until {value}",
    stop: "Stop",
    presetValidation: "Enter whole minutes from {min} to {max} in increments of {step}",
    rangeValidation: "Allowed: {min}–{max} minutes; the step must be a multiple of {step}",
    moveZone: "Move {value}",
    dragZone: "Drag to change order",
    remove: "Remove",
    cardTitle: "Card title",
    tankHelp: "Display only. Configure the tank safety threshold in the integration options.",
    zonesAndOrder: "Zones and irrigation order",
    noZonesSelected: "No zones selected.",
    addZone: "Add zone…",
    noIntegrationZones: "Fazenda Irrigation was not found or has no zones.",
    zonesHelp: "Drag zones by the handle on the left. Each zone can show up to two additional sensors; selecting a value opens its standard history. All zones are selected initially, then the card remembers the user's choice.",
    presetLabel: "Quick-button durations, minutes",
    presetHelp: "For example: 15, 30, 60, 120. Order is preserved.",
    customRange: "Custom range, minutes",
    minimum: "Minimum",
    maximum: "Maximum",
    step: "Step",
    customRangeHelp: "Range of the Custom slider. It cannot exceed the integration's safe duration range.",
    tankPicker: "Water level to display",
    additionalSensor: "Additional sensor {value}",
  },
  ru: {
    zoneSensorsObject: "zone_sensors должен быть объектом",
    zoneSensorsList: "zone_sensors.{zone} должен быть списком",
    zoneSensorsLimit: "Для зоны {zone} можно указать не более двух датчиков",
    configList: "{key} должен быть списком",
    noData: "Нет данных",
    unavailable: "Недоступен",
    zoneUnavailable: "Недоступна",
    minutes: "{value} мин",
    seconds: "{value} сек",
    hours: "{value} ч",
    days: "{value} дн",
    parallelOrder: "Одновременно:",
    sequentialOrder: "Порядок:",
    repeatCycles: "повторить {value} раз",
    neverStarted: "ещё не запускалась",
    justNow: "только что",
    agoSeconds: "{value} сек назад",
    agoMinutes: "{value} мин назад",
    agoHours: "{value} ч назад",
    agoDays: "{value} дн назад",
    integrationUnavailable: "Fazenda Irrigation не настроена или недоступна",
    previousSession: "Прошлая сессия — {value}",
    irrigationNeverStarted: "Полив ещё не запускался",
    irrigation: "Полив",
    sessionRunning: "Сессия выполняется",
    tank: "Бак",
    alreadyOn: "Уже включена",
    today: "Сегодня",
    tomorrow: "Завтра",
    zones: "Зоны",
    selected: "Выбрано: {value}",
    durationPerZone: "Время для каждой зоны",
    actualOpenTime: "Фактическое открытие",
    customValue: "Другое значение",
    customMinutes: "{value} минут",
    mode: "Схема",
    sequential: "По очереди",
    parallel: "Одновременно",
    plan: "План",
    coolingIncluded: "С учётом охлаждения",
    finish: "Завершение",
    totalTime: "Общее время",
    thermalWarning: "Каждый клапан: не более {max} минут работы, затем минимум {cooldown} минут охлаждения.",
    lowTank: "Защитный датчик бака не позволяет запустить полив: {value}.",
    start: "Запустить полив",
    valveOpening: "Открытие клапана",
    watering: "Полив",
    coolingRemaining: "Охлаждение — ещё {value} мин",
    done: "Готово",
    error: "Ошибка",
    stopped: "Остановлено",
    waiting: "Ожидает своей очереди",
    startsNow: "Включится сейчас",
    startsIn: "Включится через {value}",
    remaining: "Осталось {value}",
    parallelIrrigation: "Одновременный полив",
    sequentialIrrigation: "Полив по очереди",
    until: "до {value}",
    stop: "Остановить",
    presetValidation: "Укажите целые минуты от {min} до {max} с шагом {step}",
    rangeValidation: "Допустимо: от {min} до {max} минут; шаг должен быть кратен {step}",
    moveZone: "Переместить {value}",
    dragZone: "Перетащить для изменения порядка",
    remove: "Убрать",
    cardTitle: "Заголовок карточки",
    tankHelp: "Только отображение. Защитный порог бака настраивается в свойствах интеграции.",
    zonesAndOrder: "Зоны и порядок полива",
    noZonesSelected: "Зоны не выбраны.",
    addZone: "Добавить зону…",
    noIntegrationZones: "Интеграция Fazenda Irrigation не найдена или не содержит зон.",
    zonesHelp: "Перетаскивайте зоны за значок слева. Для каждой зоны можно выбрать до двух дополнительных датчиков: их значения появятся на плашке и откроют стандартную историю по нажатию. При первом открытии выбраны все зоны, далее карточка запоминает выбор пользователя.",
    presetLabel: "Времена быстрых кнопок, минуты",
    presetHelp: "Например: 15, 30, 60, 120. Порядок сохраняется.",
    customRange: "Диапазон «Другое», минуты",
    minimum: "Минимум",
    maximum: "Максимум",
    step: "Шаг",
    customRangeHelp: "Диапазон ползунка «Другое». Он не может выходить за безопасный диапазон интеграции.",
    tankPicker: "Уровень воды для показа",
    additionalSensor: "Дополнительный датчик {value}",
  },
};

function fiLanguage(hass) {
  const language = String(hass?.language || hass?.locale?.language || "en").toLowerCase();
  return language.startsWith("ru") ? "ru" : "en";
}

function fiText(hass, key, values = {}) {
  let result = FI_TRANSLATIONS[fiLanguage(hass)]?.[key] ?? FI_TRANSLATIONS.en[key] ?? key;
  for (const [name, value] of Object.entries(values)) {
    result = result.replaceAll(`{${name}}`, String(value));
  }
  return result;
}

function normalizeZoneSensors(value, hass = null) {
  if (value === undefined) return {};
  if (!value || Array.isArray(value) || typeof value !== "object") {
    throw new Error(fiText(hass, "zoneSensorsObject"));
  }
  const normalized = {};
  for (const [zoneEntityId, sensors] of Object.entries(value)) {
    if (!Array.isArray(sensors)) {
      throw new Error(fiText(hass, "zoneSensorsList", { zone: zoneEntityId }));
    }
    if (sensors.length > 2) {
      throw new Error(fiText(hass, "zoneSensorsLimit", { zone: zoneEntityId }));
    }
    const entityIds = [...new Set(sensors.filter((entityId) => typeof entityId === "string" && entityId))];
    if (entityIds.length) normalized[zoneEntityId] = entityIds;
  }
  return normalized;
}

function findIrrigationEntity(hass, preferred) {
  const isController = (state) =>
    Array.isArray(state?.attributes?.zones) &&
    state?.attributes?.entry_id &&
    state?.attributes?.duration_min !== undefined &&
    state?.attributes?.duration_max !== undefined;
  if (preferred && isController(hass?.states?.[preferred])) return preferred;
  return (
    Object.entries(hass?.states || {}).find(([, state]) =>
      isController(state)
    )?.[0] || preferred || null
  );
}

class FazendaIrrigationCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._selectedZones = new Set();
    this._duration = null;
    this._customDuration = null;
    this._durationSource = "preset";
    this._mode = null;
    this._initializedFor = null;
    this._timer = null;
    this._relativeTimer = null;
    this._renderFingerprint = null;
    this._error = null;
  }

  static getStubConfig() {
    return {};
  }

  static getConfigElement() {
    return document.createElement("fazenda-irrigation-card-editor");
  }

  setConfig(config) {
    for (const key of ["zones", "duration_presets"]) {
      if (config[key] !== undefined && !Array.isArray(config[key])) {
        throw new Error(fiText(this._hass, "configList", { key }));
      }
    }
    this._config = {
      ...config,
      ...(config.zone_sensors === undefined
        ? {}
        : { zone_sensors: normalizeZoneSensors(config.zone_sensors, this._hass) }),
    };
    this._initializedFor = null;
    this._renderFingerprint = null;
  }

  set hass(value) {
    this._hass = value;
    const fingerprint = this._fingerprint();
    if (fingerprint !== this._renderFingerprint) {
      this._renderFingerprint = fingerprint;
      this._render();
    }
  }

  getCardSize() {
    return 8;
  }

  getGridOptions() {
    return { columns: 12, min_columns: 6 };
  }

  _t(key, values = {}) {
    return fiText(this._hass, key, values);
  }

  disconnectedCallback() {
    this._stopTimer();
    this._stopRelativeTimer();
  }

  _stateObj() {
    const entityId = findIrrigationEntity(this._hass, this._config?.entity);
    return entityId ? this._hass?.states?.[entityId] : null;
  }

  _controllerEntity() {
    return findIrrigationEntity(this._hass, this._config?.entity);
  }

  _fingerprint() {
    const stateObj = this._stateObj();
    if (!stateObj) return `${this._config?.entity || "auto"}:missing`;
    const attrs = stateObj.attributes || {};
    const zoneStates = this._visibleZones(attrs).map((zone) => {
      const state = this._hass.states[zone.entity_id];
      return [zone.entity_id, state?.state, state?.last_changed];
    });
    const additionalSensorStates = this._visibleZones(attrs).flatMap((zone) =>
      this._zoneSensorIds(zone.entity_id).map((entityId) => {
        const state = this._hass.states[entityId];
        return [entityId, state?.state, state?.last_updated];
      })
    );
    const displayTankEntity = this._config.tank_entity || attrs.tank_level_entity;
    const displayTank = displayTankEntity
      ? this._hass.states[displayTankEntity]
      : null;
    const safetyTank = attrs.tank_level_entity
      ? this._hass.states[attrs.tank_level_entity]
      : null;
    return JSON.stringify([
      fiLanguage(this._hass),
      stateObj.state,
      stateObj.last_updated,
      zoneStates,
      additionalSensorStates,
      displayTank?.state,
      safetyTank?.state,
    ]);
  }

  _normalizeDuration(value, attrs) {
    const { minimum, maximum, step } = this._customDurationBounds(attrs);
    const numeric = Math.min(maximum, Math.max(minimum, Number(value) || minimum));
    return minimum + Math.round((numeric - minimum) / step) * step;
  }

  _customDurationBounds(attrs) {
    const controller = {
      minimum: Number(attrs.duration_min || 5),
      maximum: Number(attrs.duration_max || 360),
      step: Number(attrs.duration_step || 5),
    };
    const minimum = Number(this._config?.custom_duration_min ?? controller.minimum);
    const maximum = Number(this._config?.custom_duration_max ?? controller.maximum);
    const step = Number(this._config?.custom_duration_step ?? controller.step);
    const valid =
      Number.isInteger(minimum) &&
      Number.isInteger(maximum) &&
      Number.isInteger(step) &&
      minimum >= controller.minimum &&
      maximum <= controller.maximum &&
      minimum < maximum &&
      step >= controller.step &&
      step % controller.step === 0 &&
      (minimum - controller.minimum) % controller.step === 0 &&
      (maximum - minimum) % step === 0;
    return valid ? { minimum, maximum, step } : controller;
  }

  _customStorageKey(attrs) {
    return `fazenda-irrigation:${attrs.entry_id}:custom-duration`;
  }

  _preferenceStorageKey(attrs, name) {
    return `fazenda-irrigation:${attrs.entry_id}:${name}`;
  }

  _loadCustomDuration(attrs) {
    let stored = null;
    try {
      stored = window.localStorage.getItem(this._customStorageKey(attrs));
    } catch (_error) {
      stored = null;
    }
    return this._normalizeDuration(
      stored ?? attrs.default_duration ?? attrs.duration_min ?? 5,
      attrs
    );
  }

  _visibleZones(attrs) {
    const zones = attrs.zones || [];
    if (!Array.isArray(this._config?.zones)) return zones;
    const byId = new Map(zones.map((zone) => [zone.entity_id, zone]));
    return [...new Set(this._config.zones)]
      .map((entityId) => byId.get(entityId))
      .filter(Boolean);
  }

  _zoneSensorIds(zoneEntityId) {
    const configured = this._config?.zone_sensors?.[zoneEntityId];
    return Array.isArray(configured) ? configured.slice(0, 2) : [];
  }

  _formatSensorState(stateObj) {
    if (!stateObj) return this._t("noData");
    if (typeof this._hass?.formatEntityState === "function") {
      try {
        return this._hass.formatEntityState(stateObj);
      } catch (_error) {
        // Fall back to the raw state below.
      }
    }
    if (["unknown", "unavailable"].includes(stateObj.state)) return this._t("unavailable");
    const unit = stateObj.attributes?.unit_of_measurement;
    return `${stateObj.state}${unit ? ` ${unit}` : ""}`;
  }

  _zoneSensorsMarkup(zoneEntityId) {
    const sensors = this._zoneSensorIds(zoneEntityId);
    if (!sensors.length) return "";
    const buttons = sensors
      .map((entityId) => {
        const stateObj = this._hass.states[entityId];
        const name = stateObj?.attributes?.friendly_name || entityId;
        return `<button type="button" class="zone-sensor" data-more-info="${this._escape(entityId)}" title="${this._escape(name)}" aria-label="${this._escape(`${name}: ${this._formatSensorState(stateObj)}`)}"><ha-state-icon data-state-icon="${this._escape(entityId)}"></ha-state-icon><span>${this._escape(this._formatSensorState(stateObj))}</span></button>`;
      })
      .join("");
    return `<div class="zone-sensors">${buttons}</div>`;
  }

  _openMoreInfo(entityId) {
    const event = new Event("hass-more-info", {
      bubbles: true,
      composed: true,
    });
    event.detail = { entityId };
    this.dispatchEvent(event);
  }

  _bindZoneSensors() {
    this.shadowRoot.querySelectorAll("[data-state-icon]").forEach((icon) => {
      icon.hass = this._hass;
      icon.stateObj = this._hass.states[icon.dataset.stateIcon];
    });
    this.shadowRoot.querySelectorAll("[data-more-info]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        this._openMoreInfo(button.dataset.moreInfo);
      });
    });
  }

  _durationPresets(attrs) {
    const configured = this._config?.duration_presets;
    const source = Array.isArray(configured) ? configured : attrs.duration_presets || [];
    const minimum = Number(attrs.duration_min || 1);
    const maximum = Number(attrs.duration_max || 1440);
    const step = Number(attrs.duration_step || 1);
    return [...new Set(source.map(Number))].filter(
      (value) =>
        Number.isInteger(value) &&
        value >= minimum &&
        value <= maximum &&
        (value - minimum) % step === 0
    );
  }

  _saveCustomDuration(attrs) {
    try {
      window.localStorage.setItem(
        this._customStorageKey(attrs),
        String(this._customDuration)
      );
    } catch (_error) {
      // Private browsing may disallow localStorage; the in-memory value still works.
    }
  }

  _loadSelectedZones(attrs, zoneIds) {
    try {
      const raw = window.localStorage.getItem(
        this._preferenceStorageKey(attrs, "selected-zones")
      );
      if (!raw) return zoneIds;
      const stored = JSON.parse(raw);
      const selected = new Set(Array.isArray(stored.selected) ? stored.selected : []);
      const known = new Set(Array.isArray(stored.known) ? stored.known : []);
      return zoneIds.filter((entityId) => selected.has(entityId) || !known.has(entityId));
    } catch (_error) {
      return zoneIds;
    }
  }

  _saveSelectedZones(attrs) {
    const known = this._visibleZones(attrs).map((zone) => zone.entity_id);
    try {
      window.localStorage.setItem(
        this._preferenceStorageKey(attrs, "selected-zones"),
        JSON.stringify({ selected: [...this._selectedZones], known })
      );
    } catch (_error) {
      // The in-memory choice remains usable when browser storage is disabled.
    }
  }

  _loadMode(attrs) {
    try {
      const stored = window.localStorage.getItem(
        this._preferenceStorageKey(attrs, "mode")
      );
      if (["sequential", "parallel"].includes(stored)) return stored;
    } catch (_error) {
      // Fall back to the integration default.
    }
    return attrs.default_mode || "sequential";
  }

  _saveMode(attrs) {
    try {
      window.localStorage.setItem(
        this._preferenceStorageKey(attrs, "mode"),
        this._mode
      );
    } catch (_error) {
      // The in-memory choice remains usable when browser storage is disabled.
    }
  }

  _initialize(attrs) {
    if (this._initializedFor === attrs.entry_id) return;
    const zoneIds = this._visibleZones(attrs).map((zone) => zone.entity_id);
    this._selectedZones = new Set(this._loadSelectedZones(attrs, zoneIds));
    this._duration = this._normalizeDuration(
      attrs.default_duration ?? attrs.duration_min ?? 5,
      attrs
    );
    this._customDuration = this._loadCustomDuration(attrs);
    this._durationSource = this._durationPresets(attrs).includes(this._duration)
      ? "preset"
      : "custom";
    if (this._durationSource === "custom") {
      this._customDuration = this._duration;
    }
    this._mode = this._loadMode(attrs);
    this._initializedFor = attrs.entry_id;
  }

  _escape(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  _formatDuration(minutes) {
    const value = Math.max(0, Math.round(Number(minutes)));
    if (value < 60) return this._t("minutes", { value });
    const hours = Math.floor(value / 60);
    const rest = value % 60;
    return rest
      ? `${this._t("hours", { value: hours })} ${this._t("minutes", { value: rest })}`
      : this._t("hours", { value: hours });
  }

  _formatRuntimeDuration(seconds) {
    const value = Math.max(0, Math.floor(Number(seconds) || 0));
    if (value < 60) return this._t("seconds", { value });
    const minutes = Math.floor(value / 60);
    if (minutes < 60) return this._t("minutes", { value: minutes });
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest
      ? `${this._t("hours", { value: hours })} ${this._t("minutes", { value: rest })}`
      : this._t("hours", { value: hours });
  }

  _formatCountdown(seconds) {
    const value = Math.max(0, Math.ceil(Number(seconds) || 0));
    if (value < 60) return this._t("seconds", { value });
    const minutes = Math.ceil(value / 60);
    if (minutes < 60) return this._t("minutes", { value: minutes });
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest
      ? `${this._t("hours", { value: hours })} ${this._t("minutes", { value: rest })}`
      : this._t("hours", { value: hours });
  }

  _planZonesMarkup(plan) {
    if (!plan.selected.length) return "";
    const names = plan.selected.map((zone) =>
      this._escape(this._zoneName(zone))
    );
    if (this._mode === "parallel") {
      return `<div class="order"><strong>${this._t("parallelOrder")}</strong> ${names.join(" + ")}</div>`;
    }
    return `<div class="order"><strong>${this._t("sequentialOrder")}</strong> ${names.join(" → ")}${plan.cycles > 1 ? ` → ${this._t("repeatCycles", { value: plan.cycles })}` : ""}</div>`;
  }

  _formatClock(date) {
    return new Intl.DateTimeFormat(fiLanguage(this._hass) === "ru" ? "ru-RU" : "en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  _relativeTime(timestamp) {
    if (!timestamp) return this._t("neverStarted");
    const seconds = Math.max(
      0,
      Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)
    );
    if (seconds < 10) return this._t("justNow");
    if (seconds < 60) return this._t("agoSeconds", { value: seconds });
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return this._t("agoMinutes", { value: minutes });
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return this._t("agoHours", { value: hours });
    const days = Math.floor(hours / 24);
    return this._t("agoDays", { value: days });
  }

  _updateRelativeLabels() {
    this.shadowRoot?.querySelectorAll("[data-relative]").forEach((element) => {
      element.textContent = this._relativeTime(element.dataset.relative);
    });
  }

  _startRelativeTimer() {
    this._stopRelativeTimer();
    this._relativeTimer = window.setInterval(
      () => this._updateRelativeLabels(),
      30000
    );
  }

  _stopRelativeTimer() {
    if (!this._relativeTimer) return;
    window.clearInterval(this._relativeTimer);
    this._relativeTimer = null;
  }

  _zoneName(zone) {
    const state = this._hass.states[zone.entity_id];
    return zone.name || state?.attributes?.friendly_name || zone.entity_id;
  }

  _plan(attrs) {
    const selected = this._visibleZones(attrs).filter((zone) =>
      this._selectedZones.has(zone.entity_id)
    );
    const required = this._duration * 60;
    let finishSeconds = Number(attrs.source_settle_seconds || 0);
    let cycles = 0;

    if (this._mode === "parallel") {
      finishSeconds = Math.max(
        finishSeconds,
        ...selected.map((zone) => {
          const maxOn = Math.max(60, Number(zone.max_on_minutes) * 60);
          const cooldown = Math.max(0, Number(zone.cooldown_minutes) * 60);
          const firstCapacity = Math.max(
            1,
            Math.min(maxOn, Number(zone.initial_capacity_seconds || maxOn))
          );
          let remaining = required;
          let offset =
            Number(attrs.source_settle_seconds || 0) +
            Number(zone.initial_delay_seconds || 0);
          let segmentCount = 0;
          let capacity = firstCapacity;
          while (remaining > 0) {
            const duration = Math.min(capacity, remaining);
            offset += duration;
            remaining -= duration;
            segmentCount += 1;
            if (remaining > 0) offset += cooldown;
            capacity = maxOn;
          }
          cycles = Math.max(cycles, segmentCount);
          return offset;
        })
      );
    } else {
      const remaining = new Map(selected.map((zone) => [zone.entity_id, required]));
      const availableAt = new Map(
        selected.map((zone) => [
          zone.entity_id,
          finishSeconds + Number(zone.initial_delay_seconds || 0),
        ])
      );
      const capacities = new Map(
        selected.map((zone) => {
          const maximum = Math.max(60, Number(zone.max_on_minutes) * 60);
          return [
            zone.entity_id,
            Math.max(
              1,
              Math.min(
                maximum,
                Number(zone.initial_capacity_seconds || maximum)
              )
            ),
          ];
        })
      );
      const segmentCounts = new Map(selected.map((zone) => [zone.entity_id, 0]));
      let offset = finishSeconds;
      while ([...remaining.values()].some((value) => value > 0)) {
        selected.forEach((zone) => {
          const left = remaining.get(zone.entity_id);
          if (left <= 0) return;
          offset = Math.max(offset, availableAt.get(zone.entity_id));
          const maxOn = Math.max(60, Number(zone.max_on_minutes) * 60);
          const duration = Math.min(capacities.get(zone.entity_id), left);
          offset += duration;
          remaining.set(zone.entity_id, left - duration);
          segmentCounts.set(zone.entity_id, segmentCounts.get(zone.entity_id) + 1);
          if (left - duration > 0) {
            availableAt.set(
              zone.entity_id,
              offset + Math.max(0, Number(zone.cooldown_minutes) * 60)
            );
            capacities.set(zone.entity_id, maxOn);
          }
        });
      }
      finishSeconds = offset;
      cycles = Math.max(0, ...segmentCounts.values());
    }

    return {
      selected,
      finishSeconds,
      cycles,
      finish: new Date(Date.now() + finishSeconds * 1000),
    };
  }

  _tank(attrs) {
    const entityId = this._config.tank_entity || attrs.tank_level_entity;
    if (!entityId) return null;
    const state = this._hass.states[entityId];
    const numeric = Number(state?.state);
    const isSafetyEntity = entityId === attrs.tank_level_entity;
    return {
      entityId,
      value: Number.isFinite(numeric) ? numeric : null,
      text: state
        ? `${state.state}${state.attributes.unit_of_measurement || ""}`
        : this._t("noData"),
      low:
        isSafetyEntity &&
        Number(attrs.min_tank_level || 0) > 0 &&
        (!Number.isFinite(numeric) || numeric < Number(attrs.min_tank_level)),
    };
  }

  _safetyTank(attrs) {
    const entityId = attrs.tank_level_entity;
    const minimum = Number(attrs.min_tank_level || 0);
    if (!entityId || minimum <= 0) return null;
    const state = this._hass.states[entityId];
    const numeric = Number(state?.state);
    return {
      entityId,
      value: Number.isFinite(numeric) ? numeric : null,
      text: state
        ? `${state.state}${state.attributes.unit_of_measurement || ""}`
        : this._t("noData"),
      low: !Number.isFinite(numeric) || numeric < minimum,
    };
  }

  _styles() {
    return `
      :host { display:block; min-width:0; }
      * { box-sizing:border-box; min-width:0; }
      ha-card { overflow:hidden; color:var(--primary-text-color); }
      .header,.section,.footer { padding:16px 18px; }
      .header { display:flex; align-items:flex-start; justify-content:space-between; gap:12px; border-bottom:1px solid var(--divider-color); }
      .title,.tank,.zone-main,.summary-line,.custom-label { display:flex; align-items:center; gap:9px; }
      .title ha-icon { color:var(--primary-color); }
      h2,h3,p { margin:0; }
      h2 { font-size:20px; font-weight:500; }
      h3 { font-size:14px; font-weight:500; }
      .caption,.secondary,.range-scale { color:var(--secondary-text-color); font-size:12px; }
      .caption { margin-top:3px; }
      .tank { flex:0 0 auto; font-size:13px; color:var(--secondary-text-color); }
      .tank.low { color:var(--error-color); }
      .section + .section { border-top:1px solid var(--divider-color); }
      .section-head { display:flex; align-items:baseline; justify-content:space-between; gap:12px; margin-bottom:11px; }
      .zones { display:grid; gap:7px; }
      button { font:inherit; }
      .zone,.preset,.mode-button,.start,.stop { border:1px solid var(--divider-color); background:var(--ha-card-background,var(--card-background-color)); color:var(--primary-text-color); touch-action:manipulation; user-select:none; }
      .preset,.mode-button,.start,.stop { cursor:pointer; }
      .zone { width:100%; min-height:56px; display:flex; align-items:center; gap:0; padding:9px 11px; border-radius:10px; cursor:pointer; }
      .zone-select { display:flex; flex:0 1 auto; min-width:0; align-items:center; padding:0; border:0; background:transparent; color:var(--primary-text-color); cursor:pointer; text-align:left; touch-action:manipulation; }
      .zone[selected] { border-color:var(--primary-color); background:color-mix(in srgb,var(--primary-color) 12%,var(--ha-card-background,var(--card-background-color))); }
      .check { width:20px; height:20px; flex:0 0 auto; display:flex; align-items:center; justify-content:center; border:1px solid var(--divider-color); border-radius:50%; color:transparent; line-height:0; overflow:hidden; }
      .check ha-icon { display:block; width:14px; height:14px; --mdc-icon-size:14px; }
      .zone[selected] .check,.custom[selected] .check { border-color:var(--primary-color); background:var(--primary-color); color:var(--text-primary-color,#fff); }
      .zone-name { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-weight:500; }
      .zone-sensors { display:flex; flex:0 0 auto; align-items:center; gap:10px; margin-left:10px; }
      .zone-sensor { display:flex; align-items:center; gap:4px; min-height:28px; padding:2px 0; border:0; background:transparent; color:var(--primary-text-color); cursor:pointer; font-size:12px; touch-action:manipulation; opacity:.82; }
      .zone-sensor:hover { color:var(--primary-color); opacity:1; }
      .zone-sensor:focus-visible { outline:2px solid var(--primary-color); outline-offset:1px; }
      .zone-sensor ha-state-icon { width:16px; height:16px; transform:translateY(-3px); color:var(--primary-color); --mdc-icon-size:16px; }
      .zone > .secondary { flex:0 1 auto; overflow:hidden; margin-left:auto; padding-left:10px; text-overflow:ellipsis; white-space:nowrap; }
      .duration { text-align:center; font-size:24px; font-weight:500; margin:4px 0 10px; }
      .presets { display:grid; grid-template-columns:repeat(auto-fit,minmax(68px,1fr)); gap:6px; }
      .preset { padding:8px 4px; border-radius:9px; font-size:12px; }
      .preset[selected],.mode-button[selected] { border-color:var(--primary-color); background:color-mix(in srgb,var(--primary-color) 12%,var(--ha-card-background,var(--card-background-color))); }
      .custom { display:grid; gap:7px; margin-top:14px; padding:11px 12px; border:1px solid var(--divider-color); border-radius:10px; cursor:pointer; touch-action:manipulation; }
      .custom[selected] { border-color:var(--primary-color); background:color-mix(in srgb,var(--primary-color) 12%,var(--ha-card-background,var(--card-background-color))); }
      .custom-head,.range-scale { display:flex; align-items:center; justify-content:space-between; gap:12px; }
      .custom-head { font-size:13px; }
      .custom-head strong { color:var(--primary-color); font-weight:500; }
      .custom .check { width:18px; height:18px; }
      .custom .check ha-icon { width:12px; height:12px; --mdc-icon-size:12px; }
      input[type=range] { width:100%; min-height:32px; margin:-5px 0; accent-color:var(--primary-color); cursor:grab; touch-action:pan-y; }
      input[type=range]:active { cursor:grabbing; }
      .range-scale { font-size:11px; }
      .mode { display:grid; grid-template-columns:1fr 1fr; gap:7px; }
      .mode-button { padding:10px 6px; border-radius:9px; }
      .plan { display:grid; gap:9px; }
      .summary-line { justify-content:space-between; gap:12px; }
      .summary-line strong { text-align:right; }
      .order { padding:10px 11px; border-radius:9px; background:color-mix(in srgb,var(--primary-color) 12%,var(--ha-card-background,var(--card-background-color))); line-height:1.45; font-size:13px; overflow-wrap:anywhere; }
      .warning { color:var(--warning-color,#d97706); font-size:12px; }
      .error { color:var(--error-color); font-size:13px; }
      .footer { border-top:1px solid var(--divider-color); }
      .start,.stop { width:100%; padding:12px 16px; border-radius:10px; font-weight:500; }
      .start { border-color:var(--primary-color); background:var(--primary-color); color:var(--text-primary-color,#fff); }
      .stop { border-color:var(--error-color); background:var(--error-color); color:#fff; }
      .start[disabled] { opacity:.5; cursor:not-allowed; }
      .run-zones { display:grid; gap:12px; }
      .run-zone { display:grid; gap:7px; padding:9px 10px; border:1px solid transparent; border-radius:10px; transition:background-color .2s,border-color .2s,box-shadow .2s; }
      .run-zone[active] { border-color:var(--primary-color); background:color-mix(in srgb,var(--primary-color) 10%,var(--ha-card-background,var(--card-background-color))); box-shadow:inset 3px 0 var(--primary-color); }
      .run-zone .zone-sensors { margin-left:0; }
      .run-head { display:flex; justify-content:space-between; gap:10px; font-size:13px; }
      .progress { height:8px; overflow:hidden; border-radius:999px; background:var(--divider-color); }
      .progress > span { display:block; height:100%; background:var(--primary-color); }
      .phase { color:var(--secondary-text-color); font-size:12px; }
      @media(max-width:360px){ .header,.section,.footer{padding:14px}.mode{grid-template-columns:1fr}.presets{grid-template-columns:1fr 1fr} }
    `;
  }

  _render() {
    if (!this.shadowRoot || !this._hass || !this._config) return;
    const stateObj = this._stateObj();
    if (!stateObj) {
      this.shadowRoot.innerHTML = `<style>${this._styles()}</style><ha-card><div class="section error">${this._t("integrationUnavailable")}</div></ha-card>`;
      return;
    }
    const attrs = stateObj.attributes || {};
    this._initialize(attrs);
    if (stateObj.state === "running" || stateObj.state === "stopping") {
      this._stopRelativeTimer();
      this._renderRunning(stateObj, attrs);
      this._startTimer();
    } else {
      this._stopTimer();
      this._renderSetup(stateObj, attrs);
      this._startRelativeTimer();
    }
  }

  _header(attrs, running = false) {
    const tank = this._tank(attrs);
    const previousSession = attrs.last_session_finished_at;
    const idleCaption = previousSession
      ? this._t("previousSession", { value: `<span data-relative="${this._escape(previousSession)}">${this._relativeTime(previousSession)}</span>` })
      : this._t("irrigationNeverStarted");
    return `
      <div class="header">
        <div class="title"><ha-icon icon="mdi:sprinkler-variant"></ha-icon><div><h2>${this._escape(this._config.title || attrs.friendly_name || this._t("irrigation"))}</h2><p class="caption">${running ? this._t("sessionRunning") : idleCaption}</p></div></div>
        ${tank ? `<div class="tank ${tank.low ? "low" : ""}"><ha-icon icon="mdi:waves"></ha-icon><span>${this._t("tank")} <strong>${this._escape(tank.text)}</strong></span></div>` : ""}
      </div>`;
  }

  _renderSetup(stateObj, attrs) {
    const zones = this._visibleZones(attrs);
    const presets = this._durationPresets(attrs);
    const customBounds = this._customDurationBounds(attrs);
    const plan = this._plan(attrs);
    const tank = this._tank(attrs);
    const safetyTank = this._safetyTank(attrs);
    const maxOn = Math.max(0, ...zones.map((zone) => Number(zone.max_on_minutes || 0)));
    const cooldown = Math.max(0, ...zones.map((zone) => Number(zone.cooldown_minutes || 0)));
    const selectedZonesReady = plan.selected.every((zone) => {
      const state = this._hass.states[zone.entity_id]?.state;
      return state === "off" || state === "closed";
    });
    const canStart =
      stateObj.state === "idle" &&
      plan.selected.length > 0 &&
      selectedZonesReady &&
      !safetyTank?.low;
    const zoneButtons = zones
      .map((zone) => {
        const external = this._hass.states[zone.entity_id];
        const unavailable = !external || ["unavailable", "unknown"].includes(external.state);
        const active = external && !["off", "closed", "unavailable", "unknown"].includes(external.state);
        const selected = this._selectedZones.has(zone.entity_id);
        const status = unavailable
          ? this._t("zoneUnavailable")
          : active
            ? this._t("alreadyOn")
            : this._relativeTime(zone.last_started_at);
        const relative = !unavailable && !active && zone.last_started_at
          ? ` data-relative="${this._escape(zone.last_started_at)}"`
          : "";
        return `<div class="zone" data-zone="${this._escape(zone.entity_id)}" data-ready="${!unavailable && !active}" ${selected ? "selected" : ""}><button type="button" class="zone-select" aria-label="${this._escape(this._zoneName(zone))}"><span class="zone-main"><span class="check"><ha-icon icon="mdi:check"></ha-icon></span><span class="zone-name">${this._escape(this._zoneName(zone))}</span></span></button>${this._zoneSensorsMarkup(zone.entity_id)}<span class="secondary"${relative}>${status}</span></div>`;
      })
      .join("");
    const presetButtons = presets
      .map((minutes) => `<button class="preset" data-preset="${Number(minutes)}" ${this._durationSource === "preset" && this._duration === Number(minutes) ? "selected" : ""}>${this._formatDuration(minutes)}</button>`)
      .join("");
    const planZones = this._planZonesMarkup(plan);
    const finishLabel = plan.finish.toDateString() === new Date().toDateString() ? this._t("today") : this._t("tomorrow");
    this.shadowRoot.innerHTML = `
      <style>${this._styles()}</style>
      <ha-card>
        ${this._header(attrs)}
        <div class="section"><div class="section-head"><h3>${this._t("zones")}</h3><span class="secondary">${this._t("selected", { value: plan.selected.length })}</span></div><div class="zones">${zoneButtons}</div></div>
        <div class="section">
          <div class="section-head"><h3>${this._t("durationPerZone")}</h3><span class="secondary">${this._t("actualOpenTime")}</span></div>
          <div class="duration">${this._formatDuration(this._duration)}</div>
          <div class="presets">${presetButtons}</div>
          <div class="custom" ${this._durationSource === "custom" ? "selected" : ""}>
            <div class="custom-head"><label class="custom-label" for="fi-duration"><span class="check"><ha-icon icon="mdi:check"></ha-icon></span><span>${this._t("customValue")}</span></label><strong class="custom-value">${this._t("customMinutes", { value: this._customDuration })}</strong></div>
            <input id="fi-duration" type="range" min="${customBounds.minimum}" max="${customBounds.maximum}" step="${customBounds.step}" value="${this._customDuration}">
            <div class="range-scale"><span>${this._t("minutes", { value: customBounds.minimum })}</span><span>${this._formatDuration(customBounds.maximum)}</span></div>
          </div>
        </div>
        <div class="section"><div class="section-head"><h3>${this._t("mode")}</h3></div><div class="mode"><button class="mode-button" data-mode="sequential" ${this._mode === "sequential" ? "selected" : ""}>${this._t("sequential")}</button><button class="mode-button" data-mode="parallel" ${this._mode === "parallel" ? "selected" : ""}>${this._t("parallel")}</button></div></div>
        <div class="section"><div class="section-head"><h3>${this._t("plan")}</h3><span class="secondary">${this._t("coolingIncluded")}</span></div><div class="plan">
          <div class="summary-line"><span class="secondary">${this._t("finish")}</span><strong>${finishLabel}, ${this._formatClock(plan.finish)}</strong></div>
          <div class="summary-line"><span class="secondary">${this._t("totalTime")}</span><strong>${this._formatDuration(Math.ceil(plan.finishSeconds / 60))}</strong></div>
          ${planZones}
          <p class="warning">${this._t("thermalWarning", { max: maxOn, cooldown })}</p>
          ${safetyTank?.low ? `<p class="error">${this._t("lowTank", { value: this._escape(safetyTank.text) })}</p>` : ""}
          ${stateObj.state === "error" && attrs.error ? `<p class="error">${this._escape(attrs.error)}</p>` : ""}
          ${this._error ? `<p class="error">${this._escape(this._error)}</p>` : ""}
        </div></div>
        <div class="footer"><button class="start" ${canStart ? "" : "disabled"}>${this._t("start")}</button></div>
      </ha-card>`;
    this._bindSetup();
  }

  _reflectDurationSelection() {
    const customSelected = this._durationSource === "custom";
    this.shadowRoot
      .querySelector(".custom")
      ?.toggleAttribute("selected", customSelected);
    this.shadowRoot.querySelectorAll("[data-preset]").forEach((button) => {
      button.toggleAttribute(
        "selected",
        !customSelected && Number(button.dataset.preset) === this._duration
      );
    });
    const duration = this.shadowRoot.querySelector(".duration");
    if (duration) duration.textContent = this._formatDuration(this._duration);
    const customValue = this.shadowRoot.querySelector(".custom-value");
    if (customValue) customValue.textContent = this._t("customMinutes", { value: this._customDuration });
  }

  _activateCustom(attrs, render = true) {
    this._durationSource = "custom";
    this._duration = this._customDuration;
    this._error = null;
    this._saveCustomDuration(attrs);
    if (render) this._render();
    else this._reflectDurationSelection();
  }

  _selectPreset(minutes) {
    this._duration = Number(minutes);
    this._durationSource = "preset";
    this._error = null;
  }

  _setCustomDuration(value, attrs) {
    this._customDuration = this._normalizeDuration(value, attrs);
    this._duration = this._customDuration;
    this._durationSource = "custom";
    this._error = null;
    this._saveCustomDuration(attrs);
  }

  _toggleZone(entityId, ready, attrs = null) {
    if (this._selectedZones.has(entityId)) {
      this._selectedZones.delete(entityId);
      if (attrs) this._saveSelectedZones(attrs);
      return true;
    }
    if (!ready) return false;
    this._selectedZones.add(entityId);
    if (attrs) this._saveSelectedZones(attrs);
    return true;
  }

  _bindSetup() {
    const attrs = this._stateObj()?.attributes || {};
    this._bindZoneSensors();
    this.shadowRoot.querySelectorAll("[data-zone]").forEach((zoneElement) => {
      zoneElement.addEventListener("click", (event) => {
        if (event.target.closest?.("[data-more-info]")) return;
        event.preventDefault();
        const entityId = zoneElement.dataset.zone;
        this._toggleZone(
          entityId,
          zoneElement.dataset.ready === "true",
          attrs
        );
        this._error = null;
        this._render();
      });
    });
    this.shadowRoot.querySelectorAll("[data-preset]").forEach((button) => {
      button.addEventListener("click", () => {
        this._selectPreset(button.dataset.preset);
        this._render();
      });
    });
    const custom = this.shadowRoot.querySelector(".custom");
    const range = this.shadowRoot.querySelector("#fi-duration");
    custom?.addEventListener("click", (event) => {
      if (event.target.closest?.("#fi-duration")) return;
      this._activateCustom(attrs);
    });
    range?.addEventListener("pointerdown", () => {
      this._activateCustom(attrs, false);
    });
    range?.addEventListener("input", (event) => {
      this._setCustomDuration(event.target.value, attrs);
      this._reflectDurationSelection();
    });
    range?.addEventListener("change", () => this._render());
    this.shadowRoot.querySelectorAll("[data-mode]").forEach((button) => {
      button.addEventListener("click", () => {
        this._mode = button.dataset.mode;
        this._saveMode(attrs);
        this._render();
      });
    });
    this.shadowRoot.querySelector(".start")?.addEventListener("click", () => this._start());
  }

  async _start() {
    try {
      this._error = null;
      const attrs = this._stateObj()?.attributes || {};
      const zones = this._plan(attrs).selected.map((zone) => zone.entity_id);
      await this._hass.callService("fazenda_irrigation", "start", {
        entity_id: this._controllerEntity(),
        zones,
        duration_minutes: this._duration,
        mode: this._mode,
      });
    } catch (error) {
      this._error = error?.message || String(error);
      this._render();
    }
  }

  _runtimeProgress(runtime) {
    let delivered = Number(runtime.delivered_seconds || 0);
    if (runtime.phase === "watering" && runtime.phase_started_at) {
      delivered += Math.max(0, (Date.now() - new Date(runtime.phase_started_at).getTime()) / 1000);
    }
    delivered = Math.min(Number(runtime.required_seconds || 0), delivered);
    return {
      delivered,
      remaining: Math.max(0, Number(runtime.required_seconds || 0) - delivered),
      percent: Number(runtime.required_seconds) > 0 ? (delivered / Number(runtime.required_seconds)) * 100 : 0,
    };
  }

  _effectiveRuntime(runtime) {
    const external = this._hass.states[runtime.entity_id];
    const active = external && ["on", "open", "opening"].includes(external.state);
    if (!active || runtime.phase === "watering") return runtime;
    return {
      ...runtime,
      phase: "watering",
      phase_started_at: external.last_changed || runtime.phase_started_at,
    };
  }

  _phaseLabel(runtime) {
    if (runtime.phase === "starting") return this._t("valveOpening");
    if (runtime.phase === "watering") return this._t("watering");
    if (runtime.phase === "cooling") {
      const seconds = Math.max(0, Math.ceil((new Date(runtime.phase_ends_at).getTime() - Date.now()) / 1000));
      if (seconds === 0) return this._nextStartLabel(runtime);
      return this._t("coolingRemaining", { value: Math.ceil(seconds / 60) });
    }
    if (runtime.phase === "waiting") return this._nextStartLabel(runtime);
    if (runtime.phase === "done") return this._t("done");
    if (runtime.phase === "error") return this._t("error");
    return this._t("stopped");
  }

  _nextStartLabel(runtime) {
    if (!runtime.next_start_at) return this._t("waiting");
    const seconds = Math.ceil(
      (new Date(runtime.next_start_at).getTime() - Date.now()) / 1000
    );
    if (!Number.isFinite(seconds) || seconds <= 0) return this._t("startsNow");
    return this._t("startsIn", { value: this._formatCountdown(seconds) });
  }

  _renderRunning(stateObj, attrs) {
    const runtime = attrs.zone_status || [];
    const rows = runtime
      .map((zone) => {
        const effective = this._effectiveRuntime(zone);
        const progress = this._runtimeProgress(effective);
        return `<div class="run-zone" data-runtime-zone="${this._escape(zone.entity_id)}" ${effective.phase === "watering" ? "active" : ""}><div class="run-head"><strong>${this._escape(zone.name || zone.entity_id)}</strong><span class="run-elapsed">${this._formatRuntimeDuration(progress.delivered)} / ${this._formatDuration(Math.ceil(Number(zone.required_seconds) / 60))}</span></div>${this._zoneSensorsMarkup(zone.entity_id)}<div class="progress"><span style="width:${Math.max(0, Math.min(100, progress.percent))}%"></span></div><div class="run-head phase"><span class="phase-label">${this._phaseLabel(effective)}</span><span class="run-remaining">${this._t("remaining", { value: this._formatDuration(Math.ceil(progress.remaining / 60)) })}</span></div></div>`;
      })
      .join("");
    const finish = attrs.estimated_finish ? new Date(attrs.estimated_finish) : null;
    this.shadowRoot.innerHTML = `
      <style>${this._styles()}</style><ha-card>
        ${this._header(attrs, true)}
        <div class="section"><div class="section-head"><h3>${attrs.mode === "parallel" ? this._t("parallelIrrigation") : this._t("sequentialIrrigation")}</h3>${finish ? `<span class="secondary">${this._t("until", { value: this._formatClock(finish) })}</span>` : ""}</div><div class="run-zones">${rows}</div>${attrs.error ? `<p class="error">${this._escape(attrs.error)}</p>` : ""}</div>
        <div class="footer"><button class="stop">${this._t("stop")}</button></div>
      </ha-card>`;
    this._bindZoneSensors();
    this.shadowRoot.querySelector(".stop")?.addEventListener("click", () => this._stop());
  }

  _updateRunningProgress() {
    const attrs = this._stateObj()?.attributes || {};
    (attrs.zone_status || []).forEach((zone) => {
      const row = [...this.shadowRoot.querySelectorAll("[data-runtime-zone]")].find(
        (element) => element.dataset.runtimeZone === zone.entity_id
      );
      if (!row) return;
      const effective = this._effectiveRuntime(zone);
      const progress = this._runtimeProgress(effective);
      row.toggleAttribute("active", effective.phase === "watering");
      const elapsed = row.querySelector(".run-elapsed");
      const bar = row.querySelector(".progress > span");
      const phase = row.querySelector(".phase-label");
      const remaining = row.querySelector(".run-remaining");
      if (elapsed) {
        elapsed.textContent = `${this._formatRuntimeDuration(progress.delivered)} / ${this._formatDuration(Math.ceil(Number(zone.required_seconds) / 60))}`;
      }
      if (bar) bar.style.width = `${Math.max(0, Math.min(100, progress.percent))}%`;
      if (phase) phase.textContent = this._phaseLabel(effective);
      if (remaining) {
        remaining.textContent = this._t("remaining", { value: this._formatDuration(Math.ceil(progress.remaining / 60)) });
      }
    });
  }

  async _stop() {
    try {
      await this._hass.callService("fazenda_irrigation", "stop", {
        entity_id: this._controllerEntity(),
      });
    } catch (error) {
      this._error = error?.message || String(error);
    }
  }

  _startTimer() {
    if (this._timer) return;
    this._timer = window.setInterval(() => this._updateRunningProgress(), 1000);
  }

  _stopTimer() {
    if (!this._timer) return;
    window.clearInterval(this._timer);
    this._timer = null;
  }
}

class FazendaIrrigationCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._config = {};
    this._hass = null;
    this._renderKey = null;
  }

  set hass(value) {
    this._hass = value;
    this.shadowRoot
      ?.querySelectorAll("ha-entity-picker")
      .forEach((picker) => (picker.hass = value));
    this._renderIfNeeded();
  }

  setConfig(config) {
    const {
      default_zones: _defaultZones,
      default_duration: _defaultDuration,
      default_mode: _defaultMode,
      ...supportedConfig
    } = config;
    this._config = {
      ...supportedConfig,
      ...(supportedConfig.zone_sensors === undefined
        ? {}
        : { zone_sensors: normalizeZoneSensors(supportedConfig.zone_sensors, this._hass) }),
    };
    this._renderKey = null;
    this._renderIfNeeded();
  }

  _escape(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  _t(key, values = {}) {
    return fiText(this._hass, key, values);
  }

  _controllerEntity() {
    return findIrrigationEntity(this._hass, this._config.entity);
  }

  _controllerState() {
    const entityId = this._controllerEntity();
    return entityId ? this._hass?.states?.[entityId] : null;
  }

  _allowedZones() {
    return this._controllerState()?.attributes?.zones || [];
  }

  _selectedZoneIds() {
    const allowed = this._allowedZones().map((zone) => zone.entity_id);
    if (!Array.isArray(this._config.zones)) return allowed;
    return [...new Set(this._config.zones)];
  }

  _zoneName(entityId) {
    const zone = this._allowedZones().find((item) => item.entity_id === entityId);
    return (
      zone?.name ||
      this._hass?.states?.[entityId]?.attributes?.friendly_name ||
      entityId
    );
  }

  _zoneSensorIds(zoneEntityId) {
    const configured = this._config.zone_sensors?.[zoneEntityId];
    return Array.isArray(configured) ? configured.slice(0, 2) : [];
  }

  _configuredPresets() {
    const attrs = this._controllerState()?.attributes || {};
    const source = Array.isArray(this._config.duration_presets)
      ? this._config.duration_presets
      : attrs.duration_presets || [];
    return source.join(", ");
  }

  _durationBounds() {
    const attrs = this._controllerState()?.attributes || {};
    return {
      minimum: Number(attrs.duration_min || 1),
      maximum: Number(attrs.duration_max || 1440),
      step: Number(attrs.duration_step || 1),
    };
  }

  _configuredCustomBounds() {
    const { minimum, maximum, step } = this._durationBounds();
    return {
      minimum: Number(this._config.custom_duration_min ?? minimum),
      maximum: Number(this._config.custom_duration_max ?? maximum),
      step: Number(this._config.custom_duration_step ?? step),
    };
  }

  _materializedConfig() {
    const attrs = this._controllerState()?.attributes;
    if (!attrs) return { ...this._config };
    const {
      default_zones: _defaultZones,
      default_duration: _defaultDuration,
      default_mode: _defaultMode,
      ...next
    } = this._config;
    if (next.tank_entity === undefined && attrs.tank_level_entity) {
      next.tank_entity = attrs.tank_level_entity;
    }
    if (!Array.isArray(next.zones)) {
      next.zones = (attrs.zones || []).map((zone) => zone.entity_id);
    }
    if (!Array.isArray(next.duration_presets)) {
      next.duration_presets = [...(attrs.duration_presets || [])];
    }
    next.custom_duration_min ??= Number(attrs.duration_min || 1);
    next.custom_duration_max ??= Number(attrs.duration_max || 1440);
    next.custom_duration_step ??= Number(attrs.duration_step || 1);
    return next;
  }

  _materializeConfig() {
    const next = this._materializedConfig();
    if (JSON.stringify(next) === JSON.stringify(this._config)) return false;
    this._config = next;
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: next },
        bubbles: true,
        composed: true,
      })
    );
    return true;
  }

  _renderIfNeeded() {
    if (!this._hass || !this.shadowRoot) return;
    this._materializeConfig();
    const attrs = this._controllerState()?.attributes || {};
    const zones = this._allowedZones().map((zone) => [zone.entity_id, zone.name]);
    const renderKey = JSON.stringify([
      fiLanguage(this._hass),
      this._config,
      zones,
      attrs.duration_presets,
      attrs.duration_min,
      attrs.duration_max,
      attrs.duration_step,
      attrs.tank_level_entity,
    ]);
    if (renderKey === this._renderKey) return;
    this._renderKey = renderKey;
    this._render();
  }

  _emit(nextConfig) {
    this._config = nextConfig;
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: nextConfig },
        bubbles: true,
        composed: true,
      })
    );
    this._renderKey = null;
    this._renderIfNeeded();
  }

  _setValue(key, value) {
    const next = { ...this._config };
    if (value === "" || value === undefined || value === null) delete next[key];
    else next[key] = value;
    this._emit(next);
  }

  _setZones(zones) {
    const normalizedZones = [...new Set(zones)];
    const next = { ...this._config, zones: normalizedZones };
    const zoneSensors = Object.fromEntries(
      Object.entries(this._config.zone_sensors || {}).filter(([zoneEntityId]) =>
        normalizedZones.includes(zoneEntityId)
      )
    );
    if (Object.keys(zoneSensors).length) next.zone_sensors = zoneSensors;
    else delete next.zone_sensors;
    this._emit(next);
  }

  _setZoneSensor(zoneEntityId, slot, sensorEntityId) {
    const zoneSensors = { ...(this._config.zone_sensors || {}) };
    const sensors = [...(zoneSensors[zoneEntityId] || [])];
    sensors[slot] = sensorEntityId;
    const normalized = [...new Set(sensors.filter(Boolean))].slice(0, 2);
    if (normalized.length) zoneSensors[zoneEntityId] = normalized;
    else delete zoneSensors[zoneEntityId];
    const next = { ...this._config };
    if (Object.keys(zoneSensors).length) next.zone_sensors = zoneSensors;
    else delete next.zone_sensors;
    this._emit(next);
  }

  _moveZone(index, offset) {
    return this._moveZoneTo(index, index + offset);
  }

  _moveZoneTo(oldIndex, newIndex) {
    const zones = this._selectedZoneIds();
    if (
      !Number.isInteger(oldIndex) ||
      !Number.isInteger(newIndex) ||
      oldIndex < 0 ||
      newIndex < 0 ||
      oldIndex >= zones.length ||
      newIndex >= zones.length ||
      oldIndex === newIndex
    ) {
      return false;
    }
    const [zone] = zones.splice(oldIndex, 1);
    zones.splice(newIndex, 0, zone);
    this._setZones(zones);
    return true;
  }

  _parsePresetInput(value) {
    const { minimum, maximum, step } = this._durationBounds();
    const parts = value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    const values = parts.map(Number);
    const valid =
      values.length > 0 &&
      values.every(
        (item) =>
          Number.isInteger(item) &&
          item >= minimum &&
          item <= maximum &&
          (item - minimum) % step === 0
      );
    return {
      valid,
      values: [...new Set(values)],
      message: this._t("presetValidation", { min: minimum, max: maximum, step }),
    };
  }

  _validateCustomBounds(bounds) {
    const controller = this._durationBounds();
    const { minimum, maximum, step } = bounds;
    const valid =
      Number.isInteger(minimum) &&
      Number.isInteger(maximum) &&
      Number.isInteger(step) &&
      minimum >= controller.minimum &&
      maximum <= controller.maximum &&
      minimum < maximum &&
      step >= controller.step &&
      step % controller.step === 0 &&
      (minimum - controller.minimum) % controller.step === 0 &&
      (maximum - minimum) % step === 0;
    return {
      valid,
      message: this._t("rangeValidation", { min: controller.minimum, max: controller.maximum, step: controller.step }),
    };
  }

  _render() {
    const selected = this._selectedZoneIds();
    const allowed = this._allowedZones();
    const customBounds = this._configuredCustomBounds();
    const allowedIds = new Set(allowed.map((zone) => zone.entity_id));
    const available = allowed.filter((zone) => !selected.includes(zone.entity_id));
    const zoneRows = selected
      .map((entityId, index) => `
          <div class="zone-row ${allowedIds.has(entityId) ? "" : "invalid"}" data-zone="${this._escape(entityId)}">
            <div class="zone-handle" data-drag-handle data-index="${index}" tabindex="0" aria-label="${this._escape(this._t("moveZone", { value: this._zoneName(entityId) }))}" title="${this._t("dragZone")}">
              <ha-icon icon="mdi:drag-horizontal-variant"></ha-icon>
            </div>
            <div class="zone-label">
              <strong>${this._escape(this._zoneName(entityId))}</strong>
              <span>${this._escape(entityId)}</span>
            </div>
            <div class="zone-actions">
              <button type="button" data-remove data-index="${index}" title="${this._t("remove")}"><ha-icon icon="mdi:close"></ha-icon></button>
            </div>
            <div class="zone-sensor-pickers">
              <ha-entity-picker data-zone-sensor data-zone-id="${this._escape(entityId)}" data-slot="0"></ha-entity-picker>
              <ha-entity-picker data-zone-sensor data-zone-id="${this._escape(entityId)}" data-slot="1"></ha-entity-picker>
            </div>
          </div>`)
      .join("");
    const addOptions = available
      .map(
        (zone) =>
          `<option value="${this._escape(zone.entity_id)}">${this._escape(this._zoneName(zone.entity_id))}</option>`
      )
      .join("");
    this.shadowRoot.innerHTML = `
      <style>
        :host { display:block; color:var(--primary-text-color); }
        * { box-sizing:border-box; }
        .editor { display:grid; gap:20px; padding:4px 0; }
        .field { display:grid; gap:7px; }
        .label { font-size:12px; color:var(--secondary-text-color); }
        .help { margin:0; color:var(--secondary-text-color); font-size:12px; line-height:1.4; }
        .error { color:var(--error-color); }
        ha-entity-picker { width:100%; }
        .text-input { width:100%; min-height:48px; padding:0 12px; border:1px solid var(--divider-color); border-radius:8px; background:var(--card-background-color); color:var(--primary-text-color); font:inherit; }
        .range-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; }
        .range-field { display:grid; gap:5px; }
        .range-field .text-input { min-width:0; }
        ha-sortable { display:grid; gap:8px; }
        .zone-row { display:grid; grid-template-columns:36px minmax(0,1fr) 36px; align-items:center; gap:8px; min-height:52px; padding:7px 8px 9px 4px; border:1px solid var(--divider-color); border-radius:10px; background:var(--card-background-color); }
        .zone-row.invalid { border-color:var(--error-color); }
        .zone-handle { display:flex; flex:0 0 36px; align-items:center; justify-content:center; align-self:stretch; border-radius:8px; color:var(--secondary-text-color); cursor:grab; touch-action:none; }
        .zone-handle:active { cursor:grabbing; }
        .zone-handle:focus-visible { outline:2px solid var(--primary-color); outline-offset:-2px; }
        .zone-handle ha-icon { --mdc-icon-size:22px; pointer-events:none; }
        .zone-label { display:grid; flex:1; min-width:0; gap:2px; }
        .zone-label strong,.zone-label span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
        .zone-label strong { font-size:14px; font-weight:500; }
        .zone-label span { font-size:11px; color:var(--secondary-text-color); }
        .zone-actions { display:flex; flex:0 0 auto; }
        .zone-sensor-pickers { grid-column:2 / -1; display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:8px; }
        button { display:flex; align-items:center; justify-content:center; width:36px; height:36px; border:0; border-radius:50%; background:transparent; color:var(--primary-text-color); cursor:pointer; }
        button:hover { background:var(--secondary-background-color); }
        button:disabled { opacity:.3; cursor:default; }
        button ha-icon { --mdc-icon-size:20px; }
        select { width:100%; min-height:48px; padding:0 12px; border:1px solid var(--divider-color); border-radius:8px; background:var(--card-background-color); color:var(--primary-text-color); font:inherit; }
        h3 { margin:0; font-size:14px; font-weight:500; }
        @media(max-width:520px){ .zone-sensor-pickers{grid-template-columns:1fr} }
      </style>
      <div class="editor">
        <div class="field">
          <label class="label" for="title">${this._t("cardTitle")}</label>
          <input class="text-input" id="title" type="text" value="${this._escape(this._config.title || "")}">
        </div>
        <div class="field">
          <ha-entity-picker id="tank"></ha-entity-picker>
          <p class="help">${this._t("tankHelp")}</p>
        </div>
        <div class="field">
          <h3>${this._t("zonesAndOrder")}</h3>
          ${zoneRows ? `<ha-sortable id="zone-sortable" handle-selector=".zone-handle" draggable-selector=".zone-row" group="fazenda-irrigation-zones" invert-swap>${zoneRows}</ha-sortable>` : `<p class="help">${this._t("noZonesSelected")}</p>`}
          ${available.length ? `<select id="add-zone"><option value="">${this._t("addZone")}</option>${addOptions}</select>` : ""}
          ${!allowed.length ? `<p class="help error">${this._t("noIntegrationZones")}</p>` : ""}
          <p class="help">${this._t("zonesHelp")}</p>
        </div>
        <div class="field">
          <label class="label" for="presets">${this._t("presetLabel")}</label>
          <input class="text-input" id="presets" type="text" value="${this._escape(this._configuredPresets())}">
          <p id="preset-help" class="help">${this._t("presetHelp")}</p>
        </div>
        <div class="field">
          <h3>${this._t("customRange")}</h3>
          <div class="range-grid">
            <label class="range-field"><span class="label">${this._t("minimum")}</span><input class="text-input" id="custom-min" type="number" value="${customBounds.minimum}"></label>
            <label class="range-field"><span class="label">${this._t("maximum")}</span><input class="text-input" id="custom-max" type="number" value="${customBounds.maximum}"></label>
            <label class="range-field"><span class="label">${this._t("step")}</span><input class="text-input" id="custom-step" type="number" value="${customBounds.step}"></label>
          </div>
          <p id="custom-range-help" class="help">${this._t("customRangeHelp")}</p>
        </div>
      </div>`;
    this._bindEditor();
  }

  _bindEditor() {
    const tank = this.shadowRoot.querySelector("#tank");
    if (tank) {
      tank.hass = this._hass;
      tank.value =
        this._config.tank_entity ||
        this._controllerState()?.attributes?.tank_level_entity ||
        "";
      tank.label = this._t("tankPicker");
      tank.includeDomains = ["sensor", "input_number", "number"];
      tank.addEventListener("value-changed", (event) =>
        this._setValue("tank_entity", event.detail?.value || "")
      );
    }
    this.shadowRoot.querySelector("#title")?.addEventListener("change", (event) =>
      this._setValue("title", event.target.value.trim())
    );
    this.shadowRoot.querySelectorAll("[data-zone-sensor]").forEach((picker) => {
      const slot = Number(picker.dataset.slot);
      picker.hass = this._hass;
      picker.value = this._zoneSensorIds(picker.dataset.zoneId)[slot] || "";
      picker.label = this._t("additionalSensor", { value: slot + 1 });
      picker.includeDomains = ["sensor", "binary_sensor"];
      picker.addEventListener("value-changed", (event) =>
        this._setZoneSensor(
          picker.dataset.zoneId,
          slot,
          event.detail?.value || ""
        )
      );
    });
    this.shadowRoot.querySelector("#zone-sortable")?.addEventListener("item-moved", (event) => {
      const oldIndex = Number(event.detail?.oldIndex);
      const newIndex = Number(event.detail?.newIndex);
      this._moveZoneTo(oldIndex, newIndex);
    });
    this.shadowRoot.querySelectorAll("[data-drag-handle]").forEach((handle) => {
      handle.addEventListener("keydown", (event) => {
        const offset = event.key === "ArrowUp" ? -1 : event.key === "ArrowDown" ? 1 : 0;
        if (!offset) return;
        event.preventDefault();
        event.stopPropagation();
        this._moveZone(Number(handle.dataset.index), offset);
      });
    });
    this.shadowRoot.querySelectorAll("[data-remove]").forEach((button) => {
      button.addEventListener("click", () => {
        const zones = this._selectedZoneIds();
        zones.splice(Number(button.dataset.index), 1);
        this._setZones(zones);
      });
    });
    this.shadowRoot.querySelector("#add-zone")?.addEventListener("change", (event) => {
      if (event.target.value) {
        this._setZones([...this._selectedZoneIds(), event.target.value]);
      }
    });
    const presets = this.shadowRoot.querySelector("#presets");
    presets?.addEventListener("change", (event) => {
      const raw = event.target.value.trim();
      if (!raw) {
        this._setValue("duration_presets", null);
        return;
      }
      const parsed = this._parsePresetInput(raw);
      if (!parsed.valid) {
        const help = this.shadowRoot.querySelector("#preset-help");
        if (help) {
          help.textContent = parsed.message;
          help.classList.add("error");
        }
        return;
      }
      this._setValue("duration_presets", parsed.values);
    });
    const rangeInputs = ["#custom-min", "#custom-max", "#custom-step"]
      .map((selector) => this.shadowRoot.querySelector(selector))
      .filter(Boolean);
    rangeInputs.forEach((input) => {
      input.addEventListener("change", () => {
        const bounds = {
          minimum: Number(this.shadowRoot.querySelector("#custom-min").value),
          maximum: Number(this.shadowRoot.querySelector("#custom-max").value),
          step: Number(this.shadowRoot.querySelector("#custom-step").value),
        };
        const validation = this._validateCustomBounds(bounds);
        if (!validation.valid) {
          const help = this.shadowRoot.querySelector("#custom-range-help");
          if (help) {
            help.textContent = validation.message;
            help.classList.add("error");
          }
          return;
        }
        this._emit({
          ...this._config,
          custom_duration_min: bounds.minimum,
          custom_duration_max: bounds.maximum,
          custom_duration_step: bounds.step,
        });
      });
    });
  }
}

if (!customElements.get("fazenda-irrigation-card")) {
  customElements.define("fazenda-irrigation-card", FazendaIrrigationCard);
}

if (!customElements.get("fazenda-irrigation-card-editor")) {
  customElements.define(
    "fazenda-irrigation-card-editor",
    FazendaIrrigationCardEditor
  );
}

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === "fazenda-irrigation-card")) {
  window.customCards.push({
    type: "fazenda-irrigation-card",
    name: "Fazenda Irrigation",
    description: "Safe manual control of irrigation zones",
    preview: false,
    documentationURL: "https://github.com/Diamond16/fazenda_irrigation",
  });
}

console.info(`%c FAZENDA-IRRIGATION-CARD %c ${FI_CARD_VERSION} `, "color:white;background:#03a9f4;font-weight:500", "color:#03a9f4;background:white;font-weight:500");
