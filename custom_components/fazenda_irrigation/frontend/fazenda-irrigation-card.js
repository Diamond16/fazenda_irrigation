const FI_CARD_VERSION = "0.2.1";

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
    return { entity: "sensor.fazenda_irrigation" };
  }

  setConfig(config) {
    if (!config?.entity) throw new Error("Укажите entity контроллера полива");
    this._config = config;
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

  disconnectedCallback() {
    this._stopTimer();
    this._stopRelativeTimer();
  }

  _stateObj() {
    return this._hass?.states?.[this._config?.entity];
  }

  _fingerprint() {
    const stateObj = this._stateObj();
    if (!stateObj) return `${this._config?.entity || ""}:missing`;
    const attrs = stateObj.attributes || {};
    const zoneStates = (attrs.zones || []).map((zone) => {
      const state = this._hass.states[zone.entity_id];
      return [zone.entity_id, state?.state, state?.last_changed];
    });
    const tank = attrs.tank_level_entity
      ? this._hass.states[attrs.tank_level_entity]
      : null;
    return JSON.stringify([
      stateObj.state,
      stateObj.last_updated,
      zoneStates,
      tank?.state,
    ]);
  }

  _normalizeDuration(value, attrs) {
    const minimum = Number(attrs.duration_min || 5);
    const maximum = Number(attrs.duration_max || 360);
    const step = Number(attrs.duration_step || 5);
    const numeric = Math.min(maximum, Math.max(minimum, Number(value) || minimum));
    return minimum + Math.round((numeric - minimum) / step) * step;
  }

  _customStorageKey(attrs) {
    return `fazenda-irrigation:${attrs.entry_id}:custom-duration`;
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

  _initialize(attrs) {
    if (this._initializedFor === attrs.entry_id) return;
    const zoneIds = (attrs.zones || []).map((zone) => zone.entity_id);
    const configuredDefaults = this._config.default_zones || zoneIds;
    this._selectedZones = new Set(
      configuredDefaults.filter((entityId) => zoneIds.includes(entityId))
    );
    this._duration = this._normalizeDuration(
      attrs.default_duration || attrs.duration_min || 5,
      attrs
    );
    this._customDuration = this._loadCustomDuration(attrs);
    this._durationSource = (attrs.duration_presets || []).includes(this._duration)
      ? "preset"
      : "custom";
    if (this._durationSource === "custom") {
      this._customDuration = this._duration;
    }
    this._mode = attrs.default_mode || "sequential";
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
    if (value < 60) return `${value} мин`;
    const hours = Math.floor(value / 60);
    const rest = value % 60;
    return rest ? `${hours} ч ${rest} мин` : `${hours} ч`;
  }

  _formatClock(date) {
    return new Intl.DateTimeFormat("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  _relativeTime(timestamp) {
    if (!timestamp) return "ещё не запускалась";
    const seconds = Math.max(
      0,
      Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000)
    );
    if (seconds < 10) return "только что";
    if (seconds < 60) return `${seconds} сек назад`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} мин назад`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ч назад`;
    const days = Math.floor(hours / 24);
    return `${days} дн назад`;
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
    const selected = (attrs.zones || []).filter((zone) =>
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
    const entityId = attrs.tank_level_entity;
    if (!entityId) return null;
    const state = this._hass.states[entityId];
    const numeric = Number(state?.state);
    return {
      entityId,
      value: Number.isFinite(numeric) ? numeric : null,
      text: state
        ? `${state.state}${state.attributes.unit_of_measurement || ""}`
        : "нет данных",
      low:
        Number(attrs.min_tank_level || 0) > 0 &&
        (!Number.isFinite(numeric) || numeric < Number(attrs.min_tank_level)),
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
      .zone,.preset,.mode-button,.start,.stop { border:1px solid var(--divider-color); background:var(--ha-card-background,var(--card-background-color)); color:var(--primary-text-color); cursor:pointer; touch-action:manipulation; user-select:none; }
      .zone { width:100%; display:flex; align-items:center; justify-content:space-between; gap:10px; padding:10px 11px; border-radius:10px; text-align:left; }
      .zone[selected] { border-color:var(--primary-color); background:color-mix(in srgb,var(--primary-color) 12%,var(--ha-card-background,var(--card-background-color))); }
      .check { width:20px; height:20px; flex:0 0 auto; display:flex; align-items:center; justify-content:center; border:1px solid var(--divider-color); border-radius:50%; color:transparent; line-height:0; overflow:hidden; }
      .check ha-icon { display:block; width:14px; height:14px; --mdc-icon-size:14px; }
      .zone[selected] .check,.custom[selected] .check { border-color:var(--primary-color); background:var(--primary-color); color:var(--text-primary-color,#fff); }
      .zone-name { font-weight:500; }
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
      .run-zone { display:grid; gap:7px; }
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
      this.shadowRoot.innerHTML = `<style>${this._styles()}</style><ha-card><div class="section error">Сущность ${this._escape(this._config.entity)} не найдена</div></ha-card>`;
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
      ? `Прошлая сессия — <span data-relative="${this._escape(previousSession)}">${this._relativeTime(previousSession)}</span>`
      : "Полив ещё не запускался";
    return `
      <div class="header">
        <div class="title"><ha-icon icon="mdi:sprinkler-variant"></ha-icon><div><h2>${this._escape(this._config.title || "Полив")}</h2><p class="caption">${running ? "Сессия выполняется" : idleCaption}</p></div></div>
        ${tank ? `<div class="tank ${tank.low ? "low" : ""}"><ha-icon icon="mdi:waves"></ha-icon><span>Бак <strong>${this._escape(tank.text)}</strong></span></div>` : ""}
      </div>`;
  }

  _renderSetup(stateObj, attrs) {
    const zones = attrs.zones || [];
    const presets = attrs.duration_presets || [];
    const plan = this._plan(attrs);
    const tank = this._tank(attrs);
    const maxOn = Math.max(0, ...zones.map((zone) => Number(zone.max_on_minutes || 0)));
    const cooldown = Math.max(0, ...zones.map((zone) => Number(zone.cooldown_minutes || 0)));
    const selectedZonesReady = plan.selected.every((zone) => {
      const state = this._hass.states[zone.entity_id]?.state;
      return state === "off" || state === "closed";
    });
    const canStart = plan.selected.length > 0 && selectedZonesReady && !tank?.low;
    const zoneButtons = zones
      .map((zone) => {
        const external = this._hass.states[zone.entity_id];
        const unavailable = !external || ["unavailable", "unknown"].includes(external.state);
        const active = external && !["off", "closed", "unavailable", "unknown"].includes(external.state);
        const selected = this._selectedZones.has(zone.entity_id);
        const status = unavailable
          ? "Недоступна"
          : active
            ? "Уже включена"
            : this._relativeTime(zone.last_started_at);
        const relative = !unavailable && !active && zone.last_started_at
          ? ` data-relative="${this._escape(zone.last_started_at)}"`
          : "";
        return `<button class="zone" data-zone="${this._escape(zone.entity_id)}" data-ready="${!unavailable && !active}" ${selected ? "selected" : ""}><span class="zone-main"><span class="check"><ha-icon icon="mdi:check"></ha-icon></span><span class="zone-name">${this._escape(this._zoneName(zone))}</span></span><span class="secondary"${relative}>${status}</span></button>`;
      })
      .join("");
    const presetButtons = presets
      .map((minutes) => `<button class="preset" data-preset="${Number(minutes)}" ${this._durationSource === "preset" && this._duration === Number(minutes) ? "selected" : ""}>${this._formatDuration(minutes)}</button>`)
      .join("");
    const order = plan.selected.map((zone) => this._escape(this._zoneName(zone))).join(" → ");
    const finishLabel = plan.finish.toDateString() === new Date().toDateString() ? "Сегодня" : "Завтра";
    this.shadowRoot.innerHTML = `
      <style>${this._styles()}</style>
      <ha-card>
        ${this._header(attrs)}
        <div class="section"><div class="section-head"><h3>Зоны</h3><span class="secondary">Выбрано: ${plan.selected.length}</span></div><div class="zones">${zoneButtons}</div></div>
        <div class="section">
          <div class="section-head"><h3>Время для каждой зоны</h3><span class="secondary">Фактическое открытие</span></div>
          <div class="duration">${this._formatDuration(this._duration)}</div>
          <div class="presets">${presetButtons}</div>
          <div class="custom" ${this._durationSource === "custom" ? "selected" : ""}>
            <div class="custom-head"><label class="custom-label" for="fi-duration"><span class="check"><ha-icon icon="mdi:check"></ha-icon></span><span>Другое значение</span></label><strong class="custom-value">${this._customDuration} минут</strong></div>
            <input id="fi-duration" type="range" min="${Number(attrs.duration_min)}" max="${Number(attrs.duration_max)}" step="${Number(attrs.duration_step)}" value="${this._customDuration}">
            <div class="range-scale"><span>${attrs.duration_min} мин</span><span>${this._formatDuration(attrs.duration_max)}</span></div>
          </div>
        </div>
        <div class="section"><div class="section-head"><h3>Схема</h3></div><div class="mode"><button class="mode-button" data-mode="sequential" ${this._mode === "sequential" ? "selected" : ""}>По очереди</button><button class="mode-button" data-mode="parallel" ${this._mode === "parallel" ? "selected" : ""}>Одновременно</button></div></div>
        <div class="section"><div class="section-head"><h3>План</h3><span class="secondary">С учётом охлаждения</span></div><div class="plan">
          <div class="summary-line"><span class="secondary">Завершение</span><strong>${finishLabel}, ${this._formatClock(plan.finish)}</strong></div>
          <div class="summary-line"><span class="secondary">Общее время</span><strong>${this._formatDuration(Math.ceil(plan.finishSeconds / 60))}</strong></div>
          ${plan.selected.length ? `<div class="order"><strong>Порядок:</strong> ${order}${this._mode === "sequential" && plan.cycles > 1 ? ` → повторить ${plan.cycles} цикла` : ""}</div>` : ""}
          <p class="warning">Каждый клапан: не более ${maxOn} минут работы, затем минимум ${cooldown} минут охлаждения.</p>
          ${tank?.low ? `<p class="error">Недостаточный уровень воды: ${this._escape(tank.text)}.</p>` : ""}
          ${stateObj.state === "error" && attrs.error ? `<p class="error">${this._escape(attrs.error)}</p>` : ""}
          ${this._error ? `<p class="error">${this._escape(this._error)}</p>` : ""}
        </div></div>
        <div class="footer"><button class="start" ${canStart ? "" : "disabled"}>Запустить полив</button></div>
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
    if (customValue) customValue.textContent = `${this._customDuration} минут`;
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

  _toggleZone(entityId, ready) {
    if (this._selectedZones.has(entityId)) {
      this._selectedZones.delete(entityId);
      return true;
    }
    if (!ready) return false;
    this._selectedZones.add(entityId);
    return true;
  }

  _bindSetup() {
    const attrs = this._stateObj()?.attributes || {};
    this.shadowRoot.querySelectorAll("[data-zone]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        const entityId = button.dataset.zone;
        this._toggleZone(entityId, button.dataset.ready === "true");
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
        this._render();
      });
    });
    this.shadowRoot.querySelector(".start")?.addEventListener("click", () => this._start());
  }

  async _start() {
    try {
      this._error = null;
      await this._hass.callService("fazenda_irrigation", "start", {
        entity_id: this._config.entity,
        zones: [...this._selectedZones],
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
    if (runtime.phase === "starting") return "Открытие клапана";
    if (runtime.phase === "watering") return "Полив";
    if (runtime.phase === "cooling") {
      const seconds = Math.max(0, Math.ceil((new Date(runtime.phase_ends_at).getTime() - Date.now()) / 1000));
      if (seconds === 0) return "Ожидает своей очереди";
      return `Охлаждение — ещё ${Math.ceil(seconds / 60)} мин`;
    }
    if (runtime.phase === "waiting") return "Ожидает своей очереди";
    if (runtime.phase === "done") return "Готово";
    if (runtime.phase === "error") return "Ошибка";
    return "Остановлено";
  }

  _renderRunning(stateObj, attrs) {
    const runtime = attrs.zone_status || [];
    const rows = runtime
      .map((zone) => {
        const effective = this._effectiveRuntime(zone);
        const progress = this._runtimeProgress(effective);
        return `<div class="run-zone" data-runtime-zone="${this._escape(zone.entity_id)}"><div class="run-head"><strong>${this._escape(zone.name || zone.entity_id)}</strong><span class="run-elapsed">${this._formatDuration(Math.floor(progress.delivered / 60))} / ${this._formatDuration(Math.ceil(Number(zone.required_seconds) / 60))}</span></div><div class="progress"><span style="width:${Math.max(0, Math.min(100, progress.percent))}%"></span></div><div class="run-head phase"><span class="phase-label">${this._phaseLabel(effective)}</span><span class="run-remaining">Осталось ${this._formatDuration(Math.ceil(progress.remaining / 60))}</span></div></div>`;
      })
      .join("");
    const finish = attrs.estimated_finish ? new Date(attrs.estimated_finish) : null;
    this.shadowRoot.innerHTML = `
      <style>${this._styles()}</style><ha-card>
        ${this._header(attrs, true)}
        <div class="section"><div class="section-head"><h3>${attrs.mode === "parallel" ? "Одновременный полив" : "Полив по очереди"}</h3>${finish ? `<span class="secondary">до ${this._formatClock(finish)}</span>` : ""}</div><div class="run-zones">${rows}</div>${attrs.error ? `<p class="error">${this._escape(attrs.error)}</p>` : ""}</div>
        <div class="footer"><button class="stop">Остановить</button></div>
      </ha-card>`;
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
      const elapsed = row.querySelector(".run-elapsed");
      const bar = row.querySelector(".progress > span");
      const phase = row.querySelector(".phase-label");
      const remaining = row.querySelector(".run-remaining");
      if (elapsed) {
        elapsed.textContent = `${this._formatDuration(Math.floor(progress.delivered / 60))} / ${this._formatDuration(Math.ceil(Number(zone.required_seconds) / 60))}`;
      }
      if (bar) bar.style.width = `${Math.max(0, Math.min(100, progress.percent))}%`;
      if (phase) phase.textContent = this._phaseLabel(effective);
      if (remaining) {
        remaining.textContent = `Осталось ${this._formatDuration(Math.ceil(progress.remaining / 60))}`;
      }
    });
  }

  async _stop() {
    try {
      await this._hass.callService("fazenda_irrigation", "stop", {
        entity_id: this._config.entity,
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

if (!customElements.get("fazenda-irrigation-card")) {
  customElements.define("fazenda-irrigation-card", FazendaIrrigationCard);
}

window.customCards = window.customCards || [];
if (!window.customCards.some((card) => card.type === "fazenda-irrigation-card")) {
  window.customCards.push({
    type: "fazenda-irrigation-card",
    name: "Fazenda Irrigation",
    description: "Безопасное ручное управление зонами полива",
    preview: false,
    documentationURL: "https://github.com/Diamond16/fazenda_irrigation",
  });
}

console.info(`%c FAZENDA-IRRIGATION-CARD %c ${FI_CARD_VERSION} `, "color:white;background:#03a9f4;font-weight:500", "color:#03a9f4;background:white;font-weight:500");
