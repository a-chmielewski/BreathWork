(function () {
  const GET_READY_SECONDS = 3;
  const CUE_TICK_MS = 100;
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * 54;
  const MIN_SESSION_MS_FOR_CONFIRM = 8000;
  const LOADER_DELAY_MS = 280;
  const GOAL_FILTER_IDS = ['all', 'favorites', 'calm', 'sleep', 'focus', 'energizing'];
  const INTENSITY_FILTER_IDS = ['all', 'gentle', 'moderate', 'intense'];
  const THEME_IDS = ['system', 'dark', 'warm', 'high-contrast'];
  const LOCALE_OPTIONS = [
    { id: 'en', labelKey: 'settings.langEn' },
    { id: 'pl', labelKey: 'settings.langPl' }
  ];

  let getReadyIntervalId = null;
  let exerciseEndCallback = null;
  let activeExerciseSession = null;
  let pendingStartAfterAck = false;
  let safetyModalReturnFocus = null;
  let sessionStartMs = 0;
  let sessionStats = null;
  let startInProgress = false;
  let pauseToggleLock = false;
  let abandonConfirmHandler = null;
  let lastAnnouncedPhase = '';

  var audioCues = AudioCues.createAudioCuePlayer({
    enabled: false,
    AudioContext: window.AudioContext || window.webkitAudioContext,
    vibrate: navigator.vibrate ? navigator.vibrate.bind(navigator) : null
  });

  let pendingHistoryEntry = null;

  let state = {
    currentTechnique: null,
    durationMinutes: null,
    durationRounds: null,
    soundEnabled: false,
    hapticsEnabled: false,
    volume: 0.7,
    showCountdown: true,
    useCustomDuration: false,
    theme: 'system',
    listGoalFilter: 'all',
    listIntensityFilter: 'all'
  };

  const screens = {
    list: document.getElementById('screen-list'),
    detail: document.getElementById('screen-detail'),
    duration: document.getElementById('screen-duration'),
    exercise: document.getElementById('screen-exercise'),
    completion: document.getElementById('screen-completion'),
    history: document.getElementById('screen-history'),
    settings: document.getElementById('screen-settings')
  };

  const elements = {
    srAnnouncer: document.getElementById('sr-announcer'),
    continueLastBtn: document.getElementById('continue-last-btn'),
    continueLastDetail: document.getElementById('continue-last-detail'),
    goalFilters: document.getElementById('goal-filters'),
    intensityFilters: document.getElementById('intensity-filters'),
    listHistoryBtn: document.getElementById('list-history-btn'),
    listSettingsBtn: document.getElementById('list-settings-btn'),
    techniqueList: document.getElementById('technique-list'),
    detailBack: document.getElementById('detail-back'),
    detailTitle: document.getElementById('detail-title'),
    detailMeta: document.getElementById('detail-meta'),
    detailPosture: document.getElementById('detail-posture'),
    detailSteps: document.getElementById('detail-steps'),
    detailSequence: document.getElementById('detail-sequence'),
    detailSensations: document.getElementById('detail-sensations'),
    detailNotes: document.getElementById('detail-notes'),
    detailSafetyWarning: document.getElementById('detail-safety-warning'),
    detailContinue: document.getElementById('detail-continue'),
    detailFavorite: document.getElementById('detail-favorite'),
    durationBack: document.getElementById('duration-back'),
    durationTitle: document.getElementById('duration-title'),
    durationLegend: document.getElementById('duration-legend'),
    durationEstimate: document.getElementById('duration-estimate'),
    durationOptions: document.getElementById('duration-options'),
    durationCustomWrap: document.getElementById('duration-custom-wrap'),
    durationCustom: document.getElementById('duration-custom'),
    durationCustomUnit: document.getElementById('duration-custom-unit'),
    durationStart: document.getElementById('duration-start'),
    durationSound: document.getElementById('duration-sound'),
    durationHaptics: document.getElementById('duration-haptics'),
    durationShowCountdown: document.getElementById('duration-show-countdown'),
    durationVolume: document.getElementById('duration-volume'),
    audioStatus: document.getElementById('audio-status'),
    exerciseStop: document.getElementById('exercise-stop'),
    exerciseGetReady: document.getElementById('exercise-get-ready'),
    exerciseGetReadyCountdown: document.getElementById('exercise-get-ready-countdown'),
    exerciseGetReadyHint: document.getElementById('exercise-get-ready-hint'),
    exerciseGetReadySkip: document.getElementById('exercise-get-ready-skip'),
    exerciseTechniqueName: document.getElementById('exercise-technique-name'),
    exerciseSessionLeft: document.getElementById('exercise-session-left'),
    exerciseRoundInfo: document.getElementById('exercise-round-info'),
    exercisePause: document.getElementById('exercise-pause'),
    exercisePhaseLabel: document.getElementById('exercise-phase-label'),
    exerciseCountdown: document.getElementById('exercise-countdown'),
    exerciseNextPhase: document.getElementById('exercise-next-phase'),
    exerciseTapHold: document.getElementById('exercise-tap-hold'),
    exerciseNeedBreathe: document.getElementById('exercise-need-breathe'),
    exercisePaused: document.getElementById('exercise-paused'),
    exercisePausedMessage: document.getElementById('exercise-paused-message'),
    exerciseResume: document.getElementById('exercise-resume'),
    exerciseEndSession: document.getElementById('exercise-end-session'),
    completionMessage: document.getElementById('completion-message'),
    completionStats: document.getElementById('completion-stats'),
    completionNote: document.getElementById('completion-note'),
    completionSave: document.getElementById('completion-save'),
    completionAgain: document.getElementById('completion-again'),
    completionList: document.getElementById('completion-list'),
    historyBack: document.getElementById('history-back'),
    historySummary: document.getElementById('history-summary'),
    historyList: document.getElementById('history-list'),
    historyEmpty: document.getElementById('history-empty'),
    historyExport: document.getElementById('history-export'),
    historyClear: document.getElementById('history-clear'),
    settingsBack: document.getElementById('settings-back'),
    settingsPrefs: document.getElementById('settings-prefs'),
    settingsLanguageOptions: document.getElementById('settings-language-options'),
    settingsThemeOptions: document.getElementById('settings-theme-options'),
    settingsDiagnostics: document.getElementById('settings-diagnostics'),
    settingsShowOnboarding: document.getElementById('settings-show-onboarding'),
    settingsStoredKeys: document.getElementById('settings-stored-keys'),
    settingsClearData: document.getElementById('settings-clear-data'),
    onboardingModal: document.getElementById('onboarding-modal'),
    onboardingDismiss: document.getElementById('onboarding-dismiss'),
    circleWrap: document.getElementById('circle-wrap'),
    circleProgress: document.querySelector('.circle-progress'),
    durationSafetyWarning: document.getElementById('duration-safety-warning'),
    durationSafetyLink: document.getElementById('duration-safety-link'),
    safetyInfoLink: document.getElementById('safety-info-link'),
    safetyModal: document.getElementById('safety-modal'),
    safetyModalBody: document.getElementById('safety-modal-body'),
    safetyAckWrap: document.getElementById('safety-ack-wrap'),
    safetyAckCheckbox: document.getElementById('safety-ack-checkbox'),
    safetyModalClose: document.getElementById('safety-modal-close'),
    safetyModalContinue: document.getElementById('safety-modal-continue'),
    abandonDialog: document.getElementById('abandon-dialog'),
    abandonKeepGoing: document.getElementById('abandon-keep-going'),
    abandonConfirm: document.getElementById('abandon-confirm')
  };

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReducedMotion.matches) {
    document.body.classList.add('reduced-motion-ui');
  }
  prefersReducedMotion.addEventListener('change', function (e) {
    document.body.classList.toggle('reduced-motion-ui', e.matches);
  });

  function localizeTechnique(tech) {
    return I18n.localizeTechnique(tech);
  }

  function resolveCurrentTechnique() {
    if (!state.currentTechnique) return null;
    return localizeTechnique(state.currentTechnique);
  }

  function getPaceLabel(pace) {
    if (pace === 'slow') return I18n.t('meta.paceSlow');
    if (pace === 'moderate') return I18n.t('meta.paceModerate');
    if (pace === 'rapid') return I18n.t('meta.paceRapid');
    return pace;
  }

  function getLocalizedSafetyWarning(techniqueId) {
    var safety = I18n.getSafety();
    if (safety.techniqueWarnings && safety.techniqueWarnings[techniqueId]) {
      return safety.techniqueWarnings[techniqueId];
    }
    return SAFETY.getTechniqueWarning(techniqueId);
  }

  function applyDocumentI18n() {
    I18n.applyHtml(document);
    document.title = I18n.t('app.title');
  }

  function refreshLocalizedUi() {
    applyDocumentI18n();
    renderFilterChips();
    renderTechniqueList();
    updateContinueShortcut();
    if (state.currentTechnique && screens.detail.classList.contains('screen-active')) {
      renderDetailScreen(resolveCurrentTechnique());
    }
    if (state.currentTechnique && screens.duration.classList.contains('screen-active')) {
      var tech = resolveCurrentTechnique();
      elements.durationTitle.textContent = I18n.t('duration.setupTitle', { name: tech.name });
      renderDurationOptions(tech);
      bindDurationPrefs();
    }
    if (screens.history.classList.contains('screen-active')) {
      renderHistoryScreen();
    }
    if (screens.settings.classList.contains('screen-active')) {
      bindSettingsPrefs();
      renderLanguageOptions();
      renderThemeOptions();
      renderSettingsDiagnostics();
    }
    if (window.refreshPwaStatus) window.refreshPwaStatus();
  }

  function setLocale(locale) {
    state.locale = locale;
    I18n.setLocale(locale);
    var prefs = AppStorage.getPrefs();
    prefs.locale = locale;
    AppStorage.savePrefs(prefs);
    refreshLocalizedUi();
  }

  function loadState() {
    const prefs = AppStorage.getPrefs();
    I18n.init({ locale: prefs.locale });
    state.locale = I18n.getLocale();
    state.soundEnabled = prefs.sound;
    state.hapticsEnabled = prefs.haptics;
    state.volume = prefs.volume / 100;
    state.showCountdown = prefs.showCountdown;
    state.theme = prefs.theme;
    if (prefs.lastTechId) {
      const tech = TECHNIQUES.find(function (t) {
        return t.id === prefs.lastTechId;
      });
      if (tech) {
        state.currentTechnique = tech;
        if (tech.durationMode === 'time') {
          state.durationMinutes = prefs.lastMins;
          state.durationRounds = null;
        } else {
          state.durationRounds = prefs.lastRounds;
          state.durationMinutes = null;
        }
      }
    }
    applyTheme(state.theme);
  }

  function saveState() {
    const prefs = AppStorage.getPrefs();
    if (state.currentTechnique) {
      prefs.lastTechId = state.currentTechnique.id;
      if (state.currentTechnique.durationMode === 'time') {
        prefs.lastMins = state.durationMinutes;
        prefs.lastRounds = null;
      } else {
        prefs.lastRounds = state.durationRounds;
        prefs.lastMins = null;
      }
    }
    prefs.sound = state.soundEnabled;
    prefs.haptics = state.hapticsEnabled;
    prefs.volume = Math.round(state.volume * 100);
    prefs.showCountdown = state.showCountdown;
    prefs.theme = state.theme;
    prefs.locale = state.locale;
    AppStorage.savePrefs(prefs);
  }

  function applyTheme(themeId) {
    const theme = themeId === 'dark' ? 'system' : themeId;
    if (theme === 'system') document.documentElement.removeAttribute('data-theme');
    else document.documentElement.setAttribute('data-theme', theme);
  }

  function techniqueMatchesFilters(tech) {
    if (state.listGoalFilter === 'favorites' && !AppStorage.isFavorite(tech.id)) return false;
    if (
      state.listGoalFilter !== 'all' &&
      state.listGoalFilter !== 'favorites' &&
      (!tech.goals || tech.goals.indexOf(state.listGoalFilter) === -1)
    ) {
      return false;
    }
    if (state.listIntensityFilter !== 'all' && tech.intensity !== state.listIntensityFilter) {
      return false;
    }
    return true;
  }

  function renderFilterChips() {
    if (elements.goalFilters) {
      elements.goalFilters.innerHTML = '';
      GOAL_FILTER_IDS.forEach(function (filterId) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'filter-chip';
        btn.textContent = I18n.t('goal.' + filterId);
        btn.setAttribute('aria-pressed', state.listGoalFilter === filterId ? 'true' : 'false');
        btn.addEventListener('click', function () {
          state.listGoalFilter = filterId;
          renderFilterChips();
          renderTechniqueList();
        });
        elements.goalFilters.appendChild(btn);
      });
    }
    if (elements.intensityFilters) {
      elements.intensityFilters.innerHTML = '';
      INTENSITY_FILTER_IDS.forEach(function (filterId) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'filter-chip';
        btn.textContent = I18n.t('intensity.' + filterId);
        btn.setAttribute('aria-pressed', state.listIntensityFilter === filterId ? 'true' : 'false');
        btn.addEventListener('click', function () {
          state.listIntensityFilter = filterId;
          renderFilterChips();
          renderTechniqueList();
        });
        elements.intensityFilters.appendChild(btn);
      });
    }
  }

  function updateContinueShortcut() {
    if (!elements.continueLastBtn || !elements.continueLastDetail) return;
    const prefs = AppStorage.getPrefs();
    if (!prefs.lastTechId) {
      elements.continueLastBtn.classList.add('hidden');
      return;
    }
    const tech = localizeTechnique(
      TECHNIQUES.find(function (t) {
        return t.id === prefs.lastTechId;
      })
    );
    if (!tech) {
      elements.continueLastBtn.classList.add('hidden');
      return;
    }
    let detail = tech.name;
    if (tech.durationMode === 'time' && prefs.lastMins) {
      detail = I18n.t('continueDetail.min', { name: tech.name, n: prefs.lastMins });
    } else if (prefs.lastRounds) {
      detail = I18n.t('continueDetail.rounds', { name: tech.name, n: prefs.lastRounds });
    }
    elements.continueLastDetail.textContent = detail;
    elements.continueLastBtn.classList.remove('hidden');
  }

  function continueWithLastSettings() {
    const prefs = AppStorage.getPrefs();
    const tech = TECHNIQUES.find(function (t) {
      return t.id === prefs.lastTechId;
    });
    if (!tech) return;
    state.currentTechnique = tech;
    if (tech.durationMode === 'time') {
      state.durationMinutes = prefs.lastMins;
      state.durationRounds = null;
    } else {
      state.durationRounds = prefs.lastRounds;
      state.durationMinutes = null;
    }
    state.soundEnabled = prefs.sound;
    state.hapticsEnabled = prefs.haptics;
    state.volume = prefs.volume / 100;
    state.showCountdown = prefs.showCountdown;
    applyAudioSettings();
    if (SAFETY.isHighIntensity(tech) && !SAFETY.hasAcknowledged()) {
      openSafetyModal('acknowledge', tech);
      return;
    }
    unlockAudioFromUserGesture();
    beginSession();
  }

  function updateFavoriteButton(tech) {
    if (!elements.detailFavorite || !tech) return;
    const fav = AppStorage.isFavorite(tech.id);
    elements.detailFavorite.setAttribute('aria-pressed', fav ? 'true' : 'false');
    elements.detailFavorite.textContent = fav ? '★' : '☆';
    elements.detailFavorite.setAttribute(
      'aria-label',
      fav ? I18n.t('detail.removeFavorite') : I18n.t('detail.addFavorite')
    );
  }

  function renderHistoryScreen() {
    const history = AppStorage.getHistory();
    if (elements.historySummary) {
      elements.historySummary.textContent =
        AppStorage.getConsistencySummary(history) || I18n.t('history.noSessions');
    }
    if (elements.historyEmpty) {
      elements.historyEmpty.classList.toggle('hidden', history.length > 0);
    }
    if (!elements.historyList) return;
    elements.historyList.innerHTML = '';
    history.forEach(function (entry) {
      const li = document.createElement('li');
      li.className = 'history-item';
      const date = new Date(entry.timestamp);
      let meta = date.toLocaleString();
      if (entry.durationMinutes) meta += ' · ' + entry.durationMinutes + ' ' + I18n.t('duration.min');
      if (entry.durationRounds) meta += ' · ' + entry.durationRounds + ' ' + I18n.t('duration.rounds');
      if (entry.elapsedMs) meta += ' · ' + formatMinutesSeconds(entry.elapsedMs);
      li.innerHTML =
        '<p class="history-item-title">' +
        escapeHtml(entry.techniqueName || I18n.t('history.sessionFallback')) +
        '</p><p class="history-item-meta">' +
        escapeHtml(meta) +
        '</p>';
      if (entry.note) {
        const note = document.createElement('p');
        note.className = 'history-item-note';
        note.textContent = entry.note;
        li.appendChild(note);
      }
      elements.historyList.appendChild(li);
    });
  }

  function openHistoryScreen() {
    renderHistoryScreen();
    navigateTo('screen-history');
  }

  function renderSettingsDiagnostics() {
    if (!elements.settingsDiagnostics) return;
    elements.settingsDiagnostics.innerHTML = '';
    const rows = [
      [I18n.t('diagnostics.appVersion'), 'v' + APP_VERSION],
      [I18n.t('diagnostics.online'), navigator.onLine ? I18n.t('diagnostics.yes') : I18n.t('diagnostics.no')],
      [
        I18n.t('diagnostics.serviceWorker'),
        'serviceWorker' in navigator ? I18n.t('diagnostics.supported') : I18n.t('diagnostics.unavailable')
      ],
      [
        I18n.t('diagnostics.wakeLock'),
        'wakeLock' in navigator ? I18n.t('diagnostics.supported') : I18n.t('diagnostics.unavailable')
      ],
      [I18n.t('diagnostics.audio'), audioCues.getLastError() ? I18n.t('diagnostics.error') : I18n.t('diagnostics.ready')],
      [
        I18n.t('diagnostics.lastError'),
        AppLog.getLastError() ? AppLog.getLastError().message : I18n.t('diagnostics.none')
      ]
    ];
    rows.forEach(function (row) {
      const dt = document.createElement('dt');
      dt.textContent = row[0];
      const dd = document.createElement('dd');
      dd.textContent = row[1];
      elements.settingsDiagnostics.appendChild(dt);
      elements.settingsDiagnostics.appendChild(dd);
    });
    if (elements.settingsStoredKeys) {
      elements.settingsStoredKeys.innerHTML = '';
      AppStorage.listStoredKeys().forEach(function (item) {
        const li = document.createElement('li');
        li.textContent = item.key + ' — ' + item.description;
        elements.settingsStoredKeys.appendChild(li);
      });
    }
  }

  function bindSettingsPrefs() {
    if (!elements.settingsPrefs) return;
    elements.settingsPrefs.innerHTML = '';
    const toggles = [
      { id: 'settings-sound', labelKey: 'settings.soundCues', key: 'soundEnabled' },
      { id: 'settings-haptics', labelKey: 'settings.vibration', key: 'hapticsEnabled' },
      { id: 'settings-countdown', labelKey: 'settings.countdown', key: 'showCountdown' }
    ];
    toggles.forEach(function (toggle) {
      const label = document.createElement('label');
      label.className = 'switch-toggle';
      label.innerHTML =
        '<input type="checkbox" id="' +
        toggle.id +
        '" role="switch" /><span class="switch-track" aria-hidden="true"></span><span class="switch-label">' +
        I18n.t(toggle.labelKey) +
        '</span>';
      const input = label.querySelector('input');
      input.checked = state[toggle.key];
      input.setAttribute('aria-checked', input.checked ? 'true' : 'false');
      input.onchange = function () {
        state[toggle.key] = input.checked;
        input.setAttribute('aria-checked', input.checked ? 'true' : 'false');
        applyAudioSettings();
        saveState();
        bindDurationPrefs();
      };
      elements.settingsPrefs.appendChild(label);
    });
    const volumeWrap = document.createElement('div');
    volumeWrap.className = 'volume-control';
    volumeWrap.innerHTML =
      '<label class="volume-label" for="settings-volume">' +
      I18n.t('settings.cueVolume') +
      '</label><input type="range" id="settings-volume" min="0" max="100" />';
    const volInput = volumeWrap.querySelector('input');
    volInput.value = String(Math.round(state.volume * 100));
    volInput.oninput = function () {
      state.volume = parseInt(volInput.value, 10) / 100;
      applyAudioSettings();
      saveState();
      if (elements.durationVolume) {
        elements.durationVolume.value = volInput.value;
        elements.durationVolume.setAttribute('aria-valuenow', volInput.value);
      }
    };
    elements.settingsPrefs.appendChild(volumeWrap);
  }

  function renderLanguageOptions() {
    if (!elements.settingsLanguageOptions) return;
    elements.settingsLanguageOptions.innerHTML = '';
    LOCALE_OPTIONS.forEach(function (option) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'duration-option';
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', state.locale === option.id ? 'true' : 'false');
      if (state.locale === option.id) btn.classList.add('selected');
      btn.textContent = I18n.t(option.labelKey);
      btn.addEventListener('click', function () {
        setLocale(option.id);
      });
      elements.settingsLanguageOptions.appendChild(btn);
    });
  }

  function renderThemeOptions() {
    if (!elements.settingsThemeOptions) return;
    elements.settingsThemeOptions.innerHTML = '';
    THEME_IDS.forEach(function (themeId) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'duration-option';
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', state.theme === themeId ? 'true' : 'false');
      if (state.theme === themeId) btn.classList.add('selected');
      var themeKey = themeId === 'high-contrast' ? 'highContrast' : themeId;
      btn.textContent = I18n.t('theme.' + themeKey);
      btn.addEventListener('click', function () {
        state.theme = themeId;
        applyTheme(state.theme);
        saveState();
        renderThemeOptions();
      });
      elements.settingsThemeOptions.appendChild(btn);
    });
  }

  function openSettingsScreen() {
    bindSettingsPrefs();
    renderLanguageOptions();
    renderThemeOptions();
    renderSettingsDiagnostics();
    navigateTo('screen-settings');
  }

  function openOnboarding() {
    if (!elements.onboardingModal) return;
    elements.onboardingModal.classList.remove('hidden');
    elements.onboardingModal.setAttribute('aria-hidden', 'false');
    if (elements.onboardingDismiss) elements.onboardingDismiss.focus();
  }

  function closeOnboarding() {
    if (!elements.onboardingModal) return;
    elements.onboardingModal.classList.add('hidden');
    elements.onboardingModal.setAttribute('aria-hidden', 'true');
    const prefs = AppStorage.getPrefs();
    prefs.onboardingDismissed = true;
    AppStorage.savePrefs(prefs);
  }

  function maybeShowOnboarding() {
    const prefs = AppStorage.getPrefs();
    if (!prefs.onboardingDismissed) openOnboarding();
  }

  function saveCompletedSession(note) {
    if (!pendingHistoryEntry) return;
    const entry = Object.assign({}, pendingHistoryEntry);
    if (note) entry.note = note.trim().slice(0, 200);
    AppStorage.addHistoryEntry(entry);
    pendingHistoryEntry = null;
    updateContinueShortcut();
  }

  function hideLoader() {
    const loader = document.getElementById('app-loader');
    if (!loader) return;
    loader.classList.remove('visible');
    loader.classList.add('loaded');
    window.setTimeout(function () {
      if (loader.parentNode) loader.parentNode.removeChild(loader);
    }, 300);
  }

  function applyAudioSettings() {
    audioCues.setEnabled(state.soundEnabled);
    audioCues.setHapticsEnabled(state.hapticsEnabled);
    audioCues.setVolume(state.volume);
  }

  function showAudioStatus(message) {
    if (!elements.audioStatus) return;
    elements.audioStatus.textContent = message;
    elements.audioStatus.classList.remove('hidden');
  }

  function hideAudioStatus() {
    if (!elements.audioStatus) return;
    elements.audioStatus.textContent = '';
    elements.audioStatus.classList.add('hidden');
  }

  function unlockAudioFromUserGesture() {
    applyAudioSettings();
    if (!state.soundEnabled) {
      hideAudioStatus();
      return true;
    }
    if (audioCues.unlock()) {
      hideAudioStatus();
      return true;
    }
    showAudioStatus(audioCues.getLastError() || I18n.t('audio.couldNotStart'));
    return false;
  }

  function playSessionCue(snapshot) {
    if (!snapshot || !snapshot.phaseChanged || snapshot.paused) return;
    applyAudioSettings();
    if (snapshot.phase && snapshot.phase.tapHold) {
      audioCues.playPhaseCue('hold');
      return;
    }
    audioCues.playPhaseCue(snapshot.phase ? snapshot.phase.type : 'inhale');
  }

  function playCompletionCue() {
    applyAudioSettings();
    audioCues.playPhaseCue('completion');
  }

  function announceToScreenReader(message) {
    if (!elements.srAnnouncer || !message) return;
    elements.srAnnouncer.textContent = '';
    window.setTimeout(function () {
      elements.srAnnouncer.textContent = message;
    }, 30);
  }

  function getFocusTarget(screenId) {
    const map = {
      list: document.getElementById('list-heading'),
      detail: elements.detailContinue,
      duration: elements.durationStart,
      exercise: elements.exercisePause,
      completion: elements.completionSave,
      history: elements.historyBack,
      settings: elements.settingsBack
    };
    return map[screenId] || null;
  }

  function setScreenAccessibility(screenId) {
    Object.keys(screens).forEach(function (key) {
      const el = screens[key];
      if (!el) return;
      const active = key === screenId;
      el.classList.toggle('screen-active', active);
      el.setAttribute('aria-hidden', active ? 'false' : 'true');
      if ('inert' in el) {
        if (active) el.removeAttribute('inert');
        else el.setAttribute('inert', '');
      }
    });
  }

  function showScreen(screenId, options) {
    options = options || {};
    const key = screenId.replace('screen-', '');
    if (!screens[key]) return;
    setScreenAccessibility(key);
    if (key === 'list') updateContinueShortcut();
    if (!options.skipFocus) {
      const target = getFocusTarget(key);
      if (target && target.focus) {
        window.setTimeout(function () {
          target.focus({ preventScroll: true });
        }, 0);
      }
    }
  }

  function navigateTo(screenId, replace) {
    const key = screenId.replace('screen-', '');
    AppNavigation.go(key, {}, !!replace);
    showScreen(screenId);
  }

  function getDurationLimits(tech) {
    if (tech.durationMode === 'time') {
      return tech.durationLimits || { min: 3, max: 20, presets: [5, 10, 15] };
    }
    return tech.roundsLimits || { min: 1, max: 10, presets: tech.roundsOptions || [3, 4, 5] };
  }

  function clampDurationValue(tech, value) {
    const limits = getDurationLimits(tech);
    return Math.max(limits.min, Math.min(limits.max, value));
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function renderMetaChips(container, tech) {
    if (!container || !tech.metadata) return;
    container.innerHTML = '';
    const meta = tech.metadata;
    const chips = [];
    chips.push({
      label: meta.beginnerFriendly ? I18n.t('meta.beginnerFriendly') : I18n.t('meta.someExperience'),
      className: meta.beginnerFriendly ? 'meta-chip--beginner' : ''
    });
    chips.push({ label: I18n.t('meta.pace', { pace: getPaceLabel(meta.pace) }), className: '' });
    chips.push({
      label: meta.includesHolds ? I18n.t('meta.includesHolds') : I18n.t('meta.noHolds'),
      className: ''
    });
    chips.push({ label: meta.typicalSession, className: '' });
    if (meta.nasalControl) chips.push({ label: I18n.t('meta.nasalControl'), className: '' });
    chips.push({
      label: I18n.t('intensity.' + tech.intensity),
      className: 'meta-chip--' + tech.intensity
    });
    chips.forEach(function (chip) {
      const span = document.createElement('span');
      span.className = 'meta-chip' + (chip.className ? ' ' + chip.className : '');
      span.textContent = chip.label;
      container.appendChild(span);
    });
  }

  function renderSafetyWarningBlock(el, tech) {
    if (!el) return;
    const warning = getLocalizedSafetyWarning(tech.id);
    if (!warning) {
      el.classList.add('hidden');
      el.innerHTML = '';
      return;
    }
    el.classList.remove('hidden');
    el.innerHTML =
      '<p class="duration-safety-title">' +
      escapeHtml(warning.title) +
      '</p><ul class="safety-list">' +
      warning.points
        .map(function (point) {
          return '<li>' + escapeHtml(point) + '</li>';
        })
        .join('') +
      '</ul>';
  }

  function renderDetailScreen(tech) {
    elements.detailTitle.textContent = tech.name;
    renderMetaChips(elements.detailMeta, tech);
    updateFavoriteButton(tech);
    const instr = tech.instructions || {};
    elements.detailPosture.textContent = instr.posture || '';
    elements.detailSteps.innerHTML = '';
    (instr.steps || []).forEach(function (step) {
      const li = document.createElement('li');
      li.textContent = step;
      elements.detailSteps.appendChild(li);
    });
    elements.detailSequence.textContent = instr.phaseSequence || '';
    elements.detailSensations.textContent = instr.sensations || '';
    if (instr.notes) {
      elements.detailNotes.textContent = instr.notes;
      elements.detailNotes.classList.remove('hidden');
    } else {
      elements.detailNotes.classList.add('hidden');
    }
    renderSafetyWarningBlock(elements.detailSafetyWarning, tech);
  }

  function buildEstimateText(tech) {
    const engine = SessionEngine.createSessionEngine({
      technique: tech,
      durationMinutes: state.durationMinutes,
      durationRounds: state.durationRounds
    });
    if (tech.durationMode === 'time') {
      const cycles = engine.estimateCycles();
      const effectiveMin = Math.round(engine.getEffectiveDurationMs() / 60000);
      return (
        I18n.t('duration.estimateTime', {
          cycles: cycles,
          minutes: effectiveMin
        })
      );
    }
    const estMs = engine.estimateDurationMs();
    if (estMs) {
      const min = Math.max(1, Math.round(estMs / 60000));
      return I18n.t('duration.estimateRounds', { rounds: state.durationRounds, minutes: min });
    }
    return I18n.t('duration.estimateRoundsVary', { rounds: state.durationRounds });
  }

  function updateDurationEstimate() {
    if (!state.currentTechnique || !elements.durationEstimate) return;
    elements.durationEstimate.textContent = buildEstimateText(state.currentTechnique);
  }

  function setDurationSelection(value, fromCustom) {
    const tech = state.currentTechnique;
    if (!tech) return;
    state.useCustomDuration = !!fromCustom;
    if (tech.durationMode === 'time') {
      state.durationMinutes = clampDurationValue(tech, value);
      state.durationRounds = null;
      if (elements.durationCustom) {
        elements.durationCustom.value = String(state.durationMinutes);
      }
    } else {
      state.durationRounds = clampDurationValue(tech, value);
      state.durationMinutes = null;
      if (elements.durationCustom) {
        elements.durationCustom.value = String(state.durationRounds);
      }
    }
    document.querySelectorAll('.duration-option').forEach(function (btn) {
      const selected = !fromCustom && String(btn.getAttribute('data-value')) === String(value);
      btn.classList.toggle('selected', selected);
      btn.setAttribute('aria-checked', selected ? 'true' : 'false');
    });
    updateDurationEstimate();
    saveState();
  }

  function renderDurationOptions(tech) {
    const limits = getDurationLimits(tech);
    elements.durationOptions.innerHTML = '';
    elements.durationLegend.textContent =
      tech.durationMode === 'time' ? I18n.t('duration.sessionLength') : I18n.t('duration.numberOfRounds');
    if (elements.durationCustomUnit) {
      elements.durationCustomUnit.textContent =
        tech.durationMode === 'time' ? I18n.t('duration.min') : I18n.t('duration.rounds');
    }
    if (elements.durationCustom) {
      elements.durationCustom.min = String(limits.min);
      elements.durationCustom.max = String(limits.max);
    }

    const presets = limits.presets || (tech.durationMode === 'time' ? [5, 10, 15] : tech.roundsOptions);
    const current =
      tech.durationMode === 'time'
        ? state.durationMinutes || presets[0]
        : state.durationRounds || presets[0];

    presets.forEach(function (val) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'duration-option';
      btn.setAttribute('role', 'radio');
      btn.setAttribute('data-value', String(val));
      const selected = !state.useCustomDuration && current === val;
      btn.setAttribute('aria-checked', selected ? 'true' : 'false');
      if (selected) btn.classList.add('selected');
      btn.textContent =
        tech.durationMode === 'time'
          ? I18n.t('duration.minOption', { n: val })
          : I18n.plural('duration.roundOption', val, { n: val });
      btn.addEventListener('click', function () {
        setDurationSelection(val, false);
      });
      elements.durationOptions.appendChild(btn);
    });

    if (tech.durationMode === 'time') {
      if (!presets.includes(state.durationMinutes) && state.durationMinutes != null) {
        setDurationSelection(state.durationMinutes, true);
      } else if (state.durationMinutes == null) {
        setDurationSelection(presets[0], false);
      }
    } else if (!presets.includes(state.durationRounds) && state.durationRounds != null) {
      setDurationSelection(state.durationRounds, true);
    } else if (state.durationRounds == null) {
      setDurationSelection(presets[0], false);
    }

    updateDurationEstimate();
  }

  function bindDurationPrefs() {
    if (elements.durationSound) {
      elements.durationSound.checked = state.soundEnabled;
      elements.durationSound.setAttribute('aria-checked', state.soundEnabled ? 'true' : 'false');
      elements.durationSound.onchange = function () {
        state.soundEnabled = elements.durationSound.checked;
        elements.durationSound.setAttribute('aria-checked', state.soundEnabled ? 'true' : 'false');
        applyAudioSettings();
        saveState();
        if (state.soundEnabled) {
          if (unlockAudioFromUserGesture() && audioCues.playPreview()) hideAudioStatus();
          else if (audioCues.getLastError()) showAudioStatus(audioCues.getLastError());
        } else hideAudioStatus();
      };
    }
    if (elements.durationHaptics) {
      elements.durationHaptics.checked = state.hapticsEnabled;
      elements.durationHaptics.setAttribute('aria-checked', state.hapticsEnabled ? 'true' : 'false');
      elements.durationHaptics.onchange = function () {
        state.hapticsEnabled = elements.durationHaptics.checked;
        elements.durationHaptics.setAttribute('aria-checked', state.hapticsEnabled ? 'true' : 'false');
        applyAudioSettings();
        saveState();
      };
    }
    if (elements.durationShowCountdown) {
      elements.durationShowCountdown.checked = state.showCountdown;
      elements.durationShowCountdown.setAttribute('aria-checked', state.showCountdown ? 'true' : 'false');
      elements.durationShowCountdown.onchange = function () {
        state.showCountdown = elements.durationShowCountdown.checked;
        elements.durationShowCountdown.setAttribute('aria-checked', state.showCountdown ? 'true' : 'false');
        saveState();
      };
    }
    if (elements.durationVolume) {
      elements.durationVolume.value = String(Math.round(state.volume * 100));
      elements.durationVolume.setAttribute('aria-valuenow', elements.durationVolume.value);
      elements.durationVolume.oninput = function () {
        state.volume = parseInt(elements.durationVolume.value, 10) / 100;
        elements.durationVolume.setAttribute('aria-valuenow', elements.durationVolume.value);
        applyAudioSettings();
        saveState();
      };
    }
    if (elements.durationCustom) {
      elements.durationCustom.onchange = function () {
        const parsed = parseInt(elements.durationCustom.value, 10);
        if (!isNaN(parsed)) setDurationSelection(parsed, true);
      };
    }
  }

  function openDetail(tech) {
    state.currentTechnique = tech;
    const limits = getDurationLimits(tech);
    const presets = limits.presets || [];
    if (tech.durationMode === 'time') {
      if (!state.durationMinutes || (!presets.includes(state.durationMinutes) && !state.useCustomDuration)) {
        state.durationMinutes = presets[0] || limits.min;
      }
      state.durationRounds = null;
    } else {
      if (!state.durationRounds || (!presets.includes(state.durationRounds) && !state.useCustomDuration)) {
        state.durationRounds = presets[0] || limits.min;
      }
      state.durationMinutes = null;
    }
    renderDetailScreen(localizeTechnique(tech));
    saveState();
    navigateTo('screen-detail');
  }

  function openDurationSetup() {
    const tech = resolveCurrentTechnique();
    if (!tech) return;
    elements.durationTitle.textContent = I18n.t('duration.setupTitle', { name: tech.name });
    renderDurationOptions(tech);
    bindDurationPrefs();
    renderSafetyWarningBlock(elements.durationSafetyWarning, tech);
    saveState();
    navigateTo('screen-duration');
  }

  function renderTechniqueList() {
    elements.techniqueList.innerHTML = '';
    TECHNIQUES.forEach(function (baseTech) {
      if (!techniqueMatchesFilters(baseTech)) return;
      const tech = localizeTechnique(baseTech);
      const li = document.createElement('li');
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'technique-card';
      card.setAttribute('data-id', tech.id);
      const chips = document.createElement('div');
      chips.className = 'meta-chips';
      renderMetaChips(chips, tech);
      if (AppStorage.isFavorite(tech.id)) {
        const fav = document.createElement('span');
        fav.className = 'meta-chip meta-chip--beginner';
        fav.textContent = I18n.t('meta.favorite');
        chips.appendChild(fav);
      }
      card.innerHTML =
        '<p class="technique-name">' +
        escapeHtml(tech.name) +
        '</p><p class="technique-desc">' +
        escapeHtml(tech.shortDescription) +
        '</p>';
      card.appendChild(chips);
      card.addEventListener('click', function () {
        openDetail(tech);
      });
      li.appendChild(card);
      elements.techniqueList.appendChild(li);
    });
    updateContinueShortcut();
  }

  function renderSafetyList(items) {
    const ul = document.createElement('ul');
    ul.className = 'safety-list';
    items.forEach(function (item) {
      const li = document.createElement('li');
      li.textContent = item;
      ul.appendChild(li);
    });
    return ul;
  }

  function renderSafetyModalBody(technique) {
    if (!elements.safetyModalBody) return;
    elements.safetyModalBody.innerHTML = '';
    const disclaimer = document.createElement('p');
    disclaimer.className = 'safety-disclaimer';
    const safety = I18n.getSafety();
    disclaimer.textContent = safety.wellnessDisclaimer || SAFETY.wellnessDisclaimer;
    elements.safetyModalBody.appendChild(disclaimer);
    const generalHeading = document.createElement('h3');
    generalHeading.className = 'safety-section-title';
    generalHeading.textContent = I18n.t('safety.generalGuidance');
    elements.safetyModalBody.appendChild(generalHeading);
    elements.safetyModalBody.appendChild(
      renderSafetyList(safety.globalGuidance || SAFETY.globalGuidance)
    );
    if (!technique || SAFETY.isHighIntensity(technique)) {
      const intenseHeading = document.createElement('h3');
      intenseHeading.className = 'safety-section-title';
      intenseHeading.textContent = I18n.t('safety.highIntensity');
      elements.safetyModalBody.appendChild(intenseHeading);
      elements.safetyModalBody.appendChild(
        renderSafetyList(safety.highIntensityExtra || SAFETY.highIntensityExtra)
      );
    }
    if (technique) {
      const warning = getLocalizedSafetyWarning(technique.id);
      if (warning) {
        const techHeading = document.createElement('h3');
        techHeading.className = 'safety-section-title';
        techHeading.textContent = warning.title;
        elements.safetyModalBody.appendChild(techHeading);
        elements.safetyModalBody.appendChild(renderSafetyList(warning.points));
        if (warning.attribution) {
          const attribution = document.createElement('p');
          attribution.className = 'safety-attribution';
          attribution.textContent = warning.attribution;
          elements.safetyModalBody.appendChild(attribution);
        }
      }
    }
  }

  function openSafetyModal(mode, technique) {
    if (!elements.safetyModal) return;
    pendingStartAfterAck = mode === 'acknowledge';
    safetyModalReturnFocus = document.activeElement;
    renderSafetyModalBody(technique || state.currentTechnique);
    if (elements.safetyAckWrap) elements.safetyAckWrap.classList.toggle('hidden', mode !== 'acknowledge');
    if (elements.safetyModalContinue) {
      elements.safetyModalContinue.classList.toggle('hidden', mode !== 'acknowledge');
      elements.safetyModalContinue.disabled = true;
    }
    if (elements.safetyAckCheckbox) elements.safetyAckCheckbox.checked = false;
    elements.safetyModal.classList.remove('hidden');
    elements.safetyModal.setAttribute('aria-hidden', 'false');
    if (elements.safetyModalClose) elements.safetyModalClose.focus();
  }

  function closeSafetyModal() {
    if (!elements.safetyModal) return;
    elements.safetyModal.classList.add('hidden');
    elements.safetyModal.setAttribute('aria-hidden', 'true');
    pendingStartAfterAck = false;
    if (safetyModalReturnFocus && safetyModalReturnFocus.focus) safetyModalReturnFocus.focus();
    safetyModalReturnFocus = null;
  }

  function openAbandonDialog(onConfirm) {
    if (!elements.abandonDialog) {
      onConfirm();
      return;
    }
    abandonConfirmHandler = onConfirm;
    elements.abandonDialog.classList.remove('hidden');
    elements.abandonDialog.setAttribute('aria-hidden', 'false');
    if (elements.abandonKeepGoing) elements.abandonKeepGoing.focus();
  }

  function closeAbandonDialog() {
    if (!elements.abandonDialog) return;
    elements.abandonDialog.classList.add('hidden');
    elements.abandonDialog.setAttribute('aria-hidden', 'true');
    abandonConfirmHandler = null;
  }

  function sessionIsMeaningful() {
    return activeExerciseSession && Date.now() - sessionStartMs >= MIN_SESSION_MS_FOR_CONFIRM;
  }

  function requestAbandonSession(onConfirm) {
    if (sessionIsMeaningful()) {
      openAbandonDialog(onConfirm);
    } else {
      onConfirm();
    }
  }

  function cleanupExercise() {
    if (getReadyIntervalId != null) {
      clearInterval(getReadyIntervalId);
      getReadyIntervalId = null;
    }
    if (elements.exerciseGetReady) {
      elements.exerciseGetReady.classList.add('hidden');
      elements.exerciseGetReady.setAttribute('aria-hidden', 'true');
    }
    if (activeExerciseSession) {
      activeExerciseSession.cleanup();
      activeExerciseSession = null;
    }
    if (exerciseEndCallback) {
      exerciseEndCallback();
      exerciseEndCallback = null;
    }
    startInProgress = false;
    lastAnnouncedPhase = '';
  }

  function exitExerciseScreen(immediate) {
    const doExit = function () {
      cleanupExercise();
      navigateTo('screen-list');
    };
    if (immediate) doExit();
    else requestAbandonSession(doExit);
  }

  function formatMinutesSeconds(ms) {
    const totalSec = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function getNextPhaseLabel(tech, snapshot) {
    if (!tech || !snapshot || !snapshot.phase) return '';
    const engine = SessionEngine.createSessionEngine({
      technique: tech,
      durationMinutes: state.durationMinutes,
      durationRounds: state.durationRounds
    });
    const list = engine.getPhaseList();
    if (snapshot.phase.tapHold) return I18n.t('exercise.nextRecoveryInhale');
    var idx = snapshot.phaseIndex;
    var nextIdx = (idx + 1) % list.length;
    var next = list[nextIdx];
    return next ? I18n.t('exercise.next', { phase: next.label || next.type }) : '';
  }

  function setBreathVisual(snapshot) {
    if (!elements.circleWrap || !snapshot || !snapshot.phase) return;
    const p = snapshot.phase;
    const type = p.type || 'inhale';
    elements.circleWrap.className = 'circle-wrap phase-' + type;
    let scale = 0.72;
    if (type === 'inhale' || type === 'inhale2') {
      scale = 0.72 + snapshot.progress * 0.28;
    } else if (type === 'exhale') {
      scale = 1.0 - snapshot.progress * 0.28;
    } else {
      scale = type === 'hold' ? 1.0 : 0.85;
    }
    elements.circleWrap.style.setProperty('--breath-scale', String(scale));
    setBarProgress(snapshot.progress);
  }

  function setBarProgress(progress) {
    const offset = CIRCLE_CIRCUMFERENCE * (1 - progress);
    elements.circleProgress.style.strokeDashoffset = String(offset);
  }

  function applyExerciseSnapshot(snapshot, tech) {
    if (!snapshot || !snapshot.phase) return;
    const p = snapshot.phase;
    elements.exercisePhaseLabel.textContent = p.label || p.type;
    const secLeft = Math.max(0, Math.ceil(snapshot.remainingSec));
    if (state.showCountdown) {
      elements.exerciseCountdown.textContent = String(secLeft);
      elements.exerciseCountdown.classList.remove('countdown-hidden');
    } else {
      elements.exerciseCountdown.textContent = '';
      elements.exerciseCountdown.classList.add('countdown-hidden');
    }

    if (snapshot.status === SessionEngine.SESSION_STATUS.TAP_HOLD) {
      elements.exerciseTapHold.classList.remove('hidden');
      elements.circleProgress.style.strokeDashoffset = '0';
    } else {
      elements.exerciseTapHold.classList.add('hidden');
    }

    if (snapshot.totalRounds != null) {
      elements.exerciseRoundInfo.textContent = I18n.t('exercise.roundOf', {
        current: snapshot.round + 1,
        total: snapshot.totalRounds
      });
    } else {
      elements.exerciseRoundInfo.textContent = '';
    }

    if (elements.exerciseSessionLeft) {
      if (snapshot.remainingMs != null) {
        elements.exerciseSessionLeft.textContent = I18n.t('exercise.left', {
          time: formatMinutesSeconds(snapshot.remainingMs)
        });
      } else if (snapshot.totalRounds != null) {
        elements.exerciseSessionLeft.textContent = I18n.t('exercise.roundOf', {
          current: snapshot.round + 1,
          total: snapshot.totalRounds
        });
      }
    }

    const nextHint = getNextPhaseLabel(tech, snapshot);
    if (elements.exerciseNextPhase) {
      elements.exerciseNextPhase.textContent = nextHint;
      elements.exerciseNextPhase.setAttribute('aria-hidden', nextHint ? 'false' : 'true');
    }

    setBreathVisual(snapshot);

    if (snapshot.phaseChanged) {
      const sig = snapshot.phaseSignature || '';
      if (sig !== lastAnnouncedPhase) {
        lastAnnouncedPhase = sig;
        const label = p.label || p.type;
        announceToScreenReader(
          I18n.t('exercise.seconds', { label: label, count: secLeft })
        );
      }
    }
  }

  function renderCompletionStats(stats) {
    if (!elements.completionStats || !stats) return;
    elements.completionStats.innerHTML = '';
    const rows = [
      [I18n.t('completion.elapsed'), formatMinutesSeconds(stats.elapsedMs)],
      [I18n.t('completion.technique'), stats.techniqueName]
    ];
    if (stats.roundsCompleted != null) rows.push([I18n.t('completion.rounds'), String(stats.roundsCompleted)]);
    if (stats.cyclesCompleted != null) rows.push([I18n.t('completion.cycles'), String(stats.cyclesCompleted)]);
    rows.forEach(function (row) {
      const dt = document.createElement('dt');
      dt.textContent = row[0];
      const dd = document.createElement('dd');
      dd.textContent = row[1];
      elements.completionStats.appendChild(dt);
      elements.completionStats.appendChild(dd);
    });
  }

  function createExerciseSession(tech) {
    const engine = SessionEngine.createSessionEngine({
      technique: tech,
      durationMinutes: state.durationMinutes,
      durationRounds: state.durationRounds
    });

    let cueIntervalId = null;
    let wakeLockSentinel = null;
    let lastRound = -1;

    function clearCueInterval() {
      if (cueIntervalId != null) {
        clearInterval(cueIntervalId);
        cueIntervalId = null;
      }
    }

    async function acquireWakeLock() {
      if (!('wakeLock' in navigator)) return;
      try {
        if (wakeLockSentinel) return;
        wakeLockSentinel = await navigator.wakeLock.request('screen');
        wakeLockSentinel.addEventListener('release', function () {
          wakeLockSentinel = null;
        });
      } catch (_unused) {}
    }

    function releaseWakeLock() {
      if (!wakeLockSentinel) return;
      wakeLockSentinel.release().catch(function () {});
      wakeLockSentinel = null;
    }

    function setPausedMessage(autoPause) {
      if (!elements.exercisePausedMessage) return;
      elements.exercisePausedMessage.textContent = autoPause
        ? I18n.t('exercise.pausedBackground')
        : I18n.t('exercise.paused');
    }

    function endSession(completed) {
      clearCueInterval();
      releaseWakeLock();
      activeExerciseSession = null;
      exerciseEndCallback = null;
      startInProgress = false;
      const elapsedMs = Date.now() - sessionStartMs;
      engine.cleanup();
      audioCues.suspend();
      if (completed) {
        playCompletionCue();
        sessionStats = {
          elapsedMs: elapsedMs,
          techniqueName: tech.name,
          roundsCompleted: tech.durationMode === 'rounds' ? state.durationRounds : null,
          cyclesCompleted: tech.durationMode === 'time' ? engine.estimateCycles() : null
        };
        pendingHistoryEntry = {
          techId: tech.id,
          techniqueName: tech.name,
          durationMinutes: state.durationMinutes,
          durationRounds: state.durationRounds,
          elapsedMs: elapsedMs,
          completed: true
        };
        elements.completionMessage.textContent = I18n.t('completion.sessionComplete');
        renderCompletionStats(sessionStats);
        if (elements.completionNote) elements.completionNote.value = '';
        announceToScreenReader(I18n.t('completion.sessionComplete'));
        navigateTo('screen-completion');
      } else {
        navigateTo('screen-list');
      }
    }

    function tickSession() {
      const snapshot = engine.tick(Date.now());
      if (snapshot.stopped) return;
      if (snapshot.completed) {
        endSession(true);
        return;
      }
      if (!snapshot.paused) {
        if (snapshot.round !== lastRound) {
          lastRound = snapshot.round;
        }
        applyExerciseSnapshot(snapshot, tech);
        playSessionCue(snapshot);
      }
    }

    function bindClick(el, handler) {
      if (!el) return;
      el.onclick = handler;
    }

    function pauseSession(autoPause) {
      if (pauseToggleLock) return;
      const status = engine.getStatus();
      if (
        status !== SessionEngine.SESSION_STATUS.RUNNING &&
        status !== SessionEngine.SESSION_STATUS.TAP_HOLD
      ) {
        return;
      }
      pauseToggleLock = true;
      engine.pause(Date.now());
      setPausedMessage(autoPause);
      elements.exercisePaused.classList.remove('hidden');
      elements.exercisePaused.setAttribute('aria-hidden', 'false');
      releaseWakeLock();
      announceToScreenReader(
        autoPause ? I18n.t('exercise.pausedBackgroundSr') : I18n.t('exercise.pausedSr')
      );
      window.setTimeout(function () {
        pauseToggleLock = false;
      }, 400);
    }

    function resumeSession() {
      if (pauseToggleLock) return;
      pauseToggleLock = true;
      engine.resume(Date.now());
      elements.exercisePaused.classList.add('hidden');
      elements.exercisePaused.setAttribute('aria-hidden', 'true');
      unlockAudioFromUserGesture();
      acquireWakeLock();
      announceToScreenReader(I18n.t('exercise.resumedSr'));
      window.setTimeout(function () {
        pauseToggleLock = false;
      }, 400);
    }

    function start() {
      elements.exerciseTapHold.classList.add('hidden');
      elements.exercisePaused.classList.add('hidden');
      applyAudioSettings();
      const snapshot = engine.start(Date.now());
      applyExerciseSnapshot(snapshot, tech);
      playSessionCue(snapshot);

      bindClick(elements.exerciseNeedBreathe, function () {
        const result = engine.tapContinue(Date.now());
        if (!result) return;
        applyExerciseSnapshot(result, tech);
        playSessionCue(result);
      });

      bindClick(elements.exercisePause, function () {
        if (elements.exercisePaused.classList.contains('hidden')) pauseSession(false);
        else resumeSession();
      });

      bindClick(elements.exerciseResume, function () {
        resumeSession();
      });

      bindClick(elements.exerciseEndSession, function () {
        requestAbandonSession(function () {
          engine.stop();
          endSession(false);
        });
      });

      exerciseEndCallback = function () {
        engine.stop();
        clearCueInterval();
        releaseWakeLock();
        engine.cleanup();
        audioCues.suspend();
      };

      cueIntervalId = setInterval(tickSession, CUE_TICK_MS);
      acquireWakeLock();
    }

    return {
      start: start,
      pauseIfRunning: function () {
        if (!elements.exercisePaused.classList.contains('hidden')) return;
        pauseSession(true);
      },
      cleanup: function () {
        engine.stop();
        clearCueInterval();
        releaseWakeLock();
        bindClick(elements.exerciseNeedBreathe, null);
        bindClick(elements.exercisePause, null);
        bindClick(elements.exerciseResume, null);
        bindClick(elements.exerciseEndSession, null);
        exerciseEndCallback = null;
        engine.cleanup();
        audioCues.suspend();
      }
    };
  }

  function startSession() {
    if (startInProgress) return;
    const tech = state.currentTechnique;
    if (!tech) return;
    if (tech.durationMode === 'time' && !state.durationMinutes) return;
    if (tech.durationMode === 'rounds' && !state.durationRounds) return;
    if (SAFETY.isHighIntensity(tech) && !SAFETY.hasAcknowledged()) {
      openSafetyModal('acknowledge', tech);
      return;
    }
    unlockAudioFromUserGesture();
    beginSession();
  }

  function beginSession() {
    if (startInProgress) return;
    startInProgress = true;
    const tech = localizeTechnique(state.currentTechnique);
    if (!tech) {
      startInProgress = false;
      return;
    }
    if (getReadyIntervalId != null) {
      clearInterval(getReadyIntervalId);
      getReadyIntervalId = null;
    }
    saveState();
    sessionStartMs = Date.now();
    lastAnnouncedPhase = '';
    navigateTo('screen-exercise');
    if (elements.exerciseTechniqueName) elements.exerciseTechniqueName.textContent = tech.name;
    if (elements.exerciseSessionLeft) elements.exerciseSessionLeft.textContent = '';
    if (elements.exerciseRoundInfo) elements.exerciseRoundInfo.textContent = '';
    if (elements.exercisePhaseLabel) elements.exercisePhaseLabel.textContent = '';
    if (elements.exerciseCountdown) elements.exerciseCountdown.textContent = '';

    const firstPhase = tech.phases && tech.phases[0];
    const firstPhaseLabel = firstPhase ? firstPhase.label || firstPhase.type : I18n.t('exercise.inhale');
    if (elements.exerciseGetReadyHint) {
      elements.exerciseGetReadyHint.textContent = I18n.t('exercise.startingWith', {
        phase: firstPhaseLabel
      });
    }
    if (elements.exerciseGetReadyCountdown) {
      elements.exerciseGetReadyCountdown.textContent = String(GET_READY_SECONDS);
    }

    window.requestAnimationFrame(function () {
      if (elements.exerciseGetReady) {
        elements.exerciseGetReady.classList.remove('hidden');
        elements.exerciseGetReady.setAttribute('aria-hidden', 'false');
      }
      var countdown = GET_READY_SECONDS;
      getReadyIntervalId = window.setInterval(function () {
        countdown--;
        if (elements.exerciseGetReadyCountdown) {
          elements.exerciseGetReadyCountdown.textContent = countdown > 0 ? String(countdown) : '';
        }
        if (countdown <= 0) {
          clearInterval(getReadyIntervalId);
          getReadyIntervalId = null;
          if (elements.exerciseGetReady) {
            elements.exerciseGetReady.classList.add('hidden');
            elements.exerciseGetReady.setAttribute('aria-hidden', 'true');
          }
          runExercise(tech);
        }
      }, 1000);
    });

    elements.exerciseGetReadySkip.onclick = function () {
      if (getReadyIntervalId != null) {
        clearInterval(getReadyIntervalId);
        getReadyIntervalId = null;
      }
      if (elements.exerciseGetReady) {
        elements.exerciseGetReady.classList.add('hidden');
        elements.exerciseGetReady.setAttribute('aria-hidden', 'true');
      }
      runExercise(tech);
    };
  }

  function runExercise(tech) {
    if (elements.exerciseGetReady && !elements.exerciseGetReady.classList.contains('hidden')) {
      startInProgress = false;
      return;
    }
    if (activeExerciseSession) {
      activeExerciseSession.cleanup();
      activeExerciseSession = null;
    }
    audioCues.setEnabled(state.soundEnabled);
    activeExerciseSession = createExerciseSession(tech);
    activeExerciseSession.start();
    startInProgress = false;
    announceToScreenReader(
      I18n.t('exercise.sessionStarted', {
        phase: tech.phases[0].label || I18n.t('exercise.inhale')
      })
    );
  }

  function handleBeforeBack(fromScreen, toScreen) {
    if (fromScreen === 'exercise' && activeExerciseSession) {
      if (sessionIsMeaningful()) {
        openAbandonDialog(function () {
          cleanupExercise();
          AppNavigation.go(toScreen, {}, true);
          showScreen('screen-' + toScreen);
        });
        return false;
      }
      cleanupExercise();
      return true;
    }
    if (fromScreen === 'duration') return true;
    if (fromScreen === 'detail') return true;
    if (fromScreen === 'completion') return true;
    if (fromScreen === 'history') return true;
    if (fromScreen === 'settings') return true;
    return true;
  }

  AppNavigation.init({
    onScreenChange: function (screenId) {
      showScreen('screen-' + screenId, { skipFocus: false });
    },
    onBeforeBack: handleBeforeBack
  });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      if (activeExerciseSession && activeExerciseSession.pauseIfRunning) {
        activeExerciseSession.pauseIfRunning();
      }
      return;
    }
    unlockAudioFromUserGesture();
  });

  elements.detailBack.addEventListener('click', function () {
    AppNavigation.back();
  });
  elements.detailContinue.addEventListener('click', openDurationSetup);
  elements.durationBack.addEventListener('click', function () {
    AppNavigation.back();
  });
  elements.durationStart.addEventListener('click', startSession);
  if (elements.completionSave) {
    elements.completionSave.addEventListener('click', function () {
      const note = elements.completionNote ? elements.completionNote.value : '';
      saveCompletedSession(note);
      navigateTo('screen-list', true);
    });
  }
  elements.completionAgain.addEventListener('click', function () {
    saveCompletedSession(elements.completionNote ? elements.completionNote.value : '');
    navigateTo('screen-duration');
  });
  elements.completionList.addEventListener('click', function () {
    saveCompletedSession(elements.completionNote ? elements.completionNote.value : '');
    navigateTo('screen-list', true);
  });
  if (elements.continueLastBtn) {
    elements.continueLastBtn.addEventListener('click', continueWithLastSettings);
  }
  if (elements.listHistoryBtn) {
    elements.listHistoryBtn.addEventListener('click', openHistoryScreen);
  }
  if (elements.listSettingsBtn) {
    elements.listSettingsBtn.addEventListener('click', openSettingsScreen);
  }
  if (elements.historyBack) {
    elements.historyBack.addEventListener('click', function () {
      AppNavigation.back();
    });
  }
  if (elements.settingsBack) {
    elements.settingsBack.addEventListener('click', function () {
      AppNavigation.back();
    });
  }
  if (elements.historyExport) {
    elements.historyExport.addEventListener('click', function () {
      const data = AppStorage.exportHistory();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'breathwork-history.json';
      link.click();
      URL.revokeObjectURL(url);
    });
  }
  if (elements.historyClear) {
    elements.historyClear.addEventListener('click', function () {
      if (window.confirm(I18n.t('history.confirmDelete'))) {
        AppStorage.clearHistory();
        renderHistoryScreen();
      }
    });
  }
  if (elements.settingsClearData) {
    elements.settingsClearData.addEventListener('click', function () {
      if (window.confirm(I18n.t('settings.confirmClear'))) {
        AppStorage.clearAllUserData();
        loadState();
        renderFilterChips();
        renderTechniqueList();
        renderSettingsDiagnostics();
      }
    });
  }
  if (elements.settingsShowOnboarding) {
    elements.settingsShowOnboarding.addEventListener('click', openOnboarding);
  }
  if (elements.onboardingDismiss) {
    elements.onboardingDismiss.addEventListener('click', closeOnboarding);
  }
  if (elements.detailFavorite) {
    elements.detailFavorite.addEventListener('click', function () {
      if (!state.currentTechnique) return;
      AppStorage.toggleFavorite(state.currentTechnique.id);
      updateFavoriteButton(state.currentTechnique);
      renderTechniqueList();
    });
  }

  if (elements.safetyInfoLink) {
    elements.safetyInfoLink.addEventListener('click', function () {
      openSafetyModal('view', null);
    });
  }
  if (elements.durationSafetyLink) {
    elements.durationSafetyLink.addEventListener('click', function () {
      openSafetyModal('view', state.currentTechnique);
    });
  }
  if (elements.safetyAckCheckbox && elements.safetyModalContinue) {
    elements.safetyAckCheckbox.addEventListener('change', function () {
      elements.safetyModalContinue.disabled = !elements.safetyAckCheckbox.checked;
    });
  }
  if (elements.safetyModalClose) {
    elements.safetyModalClose.addEventListener('click', closeSafetyModal);
  }
  if (elements.safetyModalContinue) {
    elements.safetyModalContinue.addEventListener('click', function () {
      if (!elements.safetyAckCheckbox || !elements.safetyAckCheckbox.checked) return;
      SAFETY.setAcknowledged();
      const shouldStart = pendingStartAfterAck;
      closeSafetyModal();
      if (shouldStart) beginSession();
    });
  }
  if (elements.safetyModal) {
    elements.safetyModal.addEventListener('click', function (e) {
      if (e.target === elements.safetyModal && !pendingStartAfterAck) closeSafetyModal();
    });
  }
  if (elements.exerciseStop) {
    elements.exerciseStop.addEventListener('click', function () {
      exitExerciseScreen(true);
    });
  }
  if (elements.abandonKeepGoing) {
    elements.abandonKeepGoing.addEventListener('click', closeAbandonDialog);
  }
  if (elements.abandonConfirm) {
    elements.abandonConfirm.addEventListener('click', function () {
      const handler = abandonConfirmHandler;
      closeAbandonDialog();
      if (handler) handler();
    });
  }

  const initStarted = Date.now();
  const loader = document.getElementById('app-loader');
  const loaderTimer = window.setTimeout(function () {
    if (loader) loader.classList.add('visible');
  }, LOADER_DELAY_MS);

  loadState();
  applyDocumentI18n();
  applyAudioSettings();
  renderFilterChips();
  renderTechniqueList();
  showScreen('screen-list', { skipFocus: true });
  maybeShowOnboarding();

  window.clearTimeout(loaderTimer);
  if (Date.now() - initStarted >= LOADER_DELAY_MS) hideLoader();
  else hideLoader();
})();
