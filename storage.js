/**
 * Versioned on-device storage for preferences, favorites, and session history.
 */
(function (root) {
  var PREFS_KEY = 'breathwork_prefs_v2';
  var HISTORY_KEY = 'breathwork_history_v1';
  var PREFS_VERSION = 2;
  var MAX_HISTORY = 100;

  var LEGACY_KEYS = {
    lastTechId: 'breathwork_last_tech',
    lastMins: 'breathwork_last_mins',
    lastRounds: 'breathwork_last_rounds',
    sound: 'breathwork_sound',
    haptics: 'breathwork_haptics',
    volume: 'breathwork_volume',
    showCountdown: 'breathwork_show_countdown'
  };

  var DEFAULT_PREFS = {
    version: PREFS_VERSION,
    lastTechId: null,
    lastMins: null,
    lastRounds: null,
    sound: false,
    haptics: false,
    volume: 70,
    showCountdown: true,
    theme: 'system',
    locale: null,
    onboardingDismissed: false,
    favorites: []
  };

  function safeParse(json, fallback) {
    try {
      return JSON.parse(json);
    } catch (err) {
      if (root.AppLog) root.AppLog.warn('storage', 'Invalid JSON in localStorage', err.message);
      return fallback;
    }
  }

  function readRaw(key) {
    try {
      return localStorage.getItem(key);
    } catch (err) {
      if (root.AppLog) root.AppLog.error('storage', 'Read failed for ' + key, err.message);
      return null;
    }
  }

  function writeRaw(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (err) {
      if (root.AppLog) root.AppLog.error('storage', 'Write failed for ' + key, err.message);
      return false;
    }
  }

  function removeRaw(key) {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      if (root.AppLog) root.AppLog.error('storage', 'Remove failed for ' + key, err.message);
    }
  }

  function normalizePrefs(raw) {
    var prefs = Object.assign({}, DEFAULT_PREFS, raw || {});
    prefs.version = PREFS_VERSION;
    prefs.volume = Math.max(0, Math.min(100, parseInt(prefs.volume, 10) || 70));
    prefs.sound = !!prefs.sound;
    prefs.haptics = !!prefs.haptics;
    prefs.showCountdown = prefs.showCountdown !== false;
    prefs.onboardingDismissed = !!prefs.onboardingDismissed;
    if (!Array.isArray(prefs.favorites)) prefs.favorites = [];
    prefs.favorites = prefs.favorites.filter(function (id) {
      return typeof id === 'string' && id.length > 0;
    });
    var allowedThemes = ['system', 'dark', 'warm', 'high-contrast'];
    if (allowedThemes.indexOf(prefs.theme) === -1) prefs.theme = 'system';
    var allowedLocales = ['en', 'pl', null];
    if (allowedLocales.indexOf(prefs.locale) === -1) prefs.locale = null;
    return prefs;
  }

  function migrateLegacyPrefs() {
    var existing = readRaw(PREFS_KEY);
    if (existing) return normalizePrefs(safeParse(existing, {}));

    var migrated = Object.assign({}, DEFAULT_PREFS);
    var lastTech = readRaw(LEGACY_KEYS.lastTechId);
    if (lastTech) migrated.lastTechId = lastTech;
    var mins = readRaw(LEGACY_KEYS.lastMins);
    if (mins != null) migrated.lastMins = parseInt(mins, 10) || null;
    var rounds = readRaw(LEGACY_KEYS.lastRounds);
    if (rounds != null) migrated.lastRounds = parseInt(rounds, 10) || null;
    migrated.sound = readRaw(LEGACY_KEYS.sound) === '1';
    migrated.haptics = readRaw(LEGACY_KEYS.haptics) === '1';
    var vol = readRaw(LEGACY_KEYS.volume);
    if (vol != null) migrated.volume = parseInt(vol, 10) || 70;
    migrated.showCountdown = readRaw(LEGACY_KEYS.showCountdown) !== '0';

    savePrefs(migrated);
    Object.keys(LEGACY_KEYS).forEach(function (key) {
      removeRaw(LEGACY_KEYS[key]);
    });
    if (root.AppLog) root.AppLog.info('storage', 'Migrated legacy preferences to v2');
    return migrated;
  }

  function getPrefs() {
    var raw = readRaw(PREFS_KEY);
    if (!raw) return migrateLegacyPrefs();
    var parsed = safeParse(raw, null);
    if (!parsed || typeof parsed !== 'object') return normalizePrefs(DEFAULT_PREFS);
    if (!parsed.version || parsed.version < PREFS_VERSION) {
      return migrateLegacyPrefs();
    }
    return normalizePrefs(parsed);
  }

  function savePrefs(prefs) {
    return writeRaw(PREFS_KEY, JSON.stringify(normalizePrefs(prefs)));
  }

  function getHistory() {
    var raw = readRaw(HISTORY_KEY);
    if (!raw) return [];
    var list = safeParse(raw, []);
    if (!Array.isArray(list)) return [];
    return list.filter(function (entry) {
      return entry && entry.completed === true;
    });
  }

  function saveHistory(list) {
    return writeRaw(HISTORY_KEY, JSON.stringify(list.slice(0, MAX_HISTORY)));
  }

  function addHistoryEntry(entry) {
    var list = getHistory();
    var record = Object.assign(
      {
        id: 'h_' + Date.now(),
        completed: true,
        timestamp: new Date().toISOString()
      },
      entry
    );
    list.unshift(record);
    saveHistory(list);
    return record;
  }

  function clearHistory() {
    removeRaw(HISTORY_KEY);
  }

  function exportHistory() {
    return JSON.stringify(getHistory(), null, 2);
  }

  function toggleFavorite(techId) {
    var prefs = getPrefs();
    var idx = prefs.favorites.indexOf(techId);
    if (idx === -1) prefs.favorites.push(techId);
    else prefs.favorites.splice(idx, 1);
    savePrefs(prefs);
    return idx === -1;
  }

  function isFavorite(techId) {
    return getPrefs().favorites.indexOf(techId) !== -1;
  }

  function getConsistencySummary(history) {
    if (!history || history.length === 0) return null;
    var now = Date.now();
    var weekAgo = now - 7 * 24 * 60 * 60 * 1000;
    var thisWeek = history.filter(function (entry) {
      return new Date(entry.timestamp).getTime() >= weekAgo;
    }).length;
    if (root.I18n) {
      if (thisWeek === 0) return root.I18n.t('history.recentSaved');
      return root.I18n.plural('history.sessionsThisWeek', thisWeek);
    }
    if (thisWeek === 0) return 'Your recent sessions are saved here when you finish a practice.';
    if (thisWeek === 1) return '1 completed session this week.';
    return thisWeek + ' completed sessions this week.';
  }

  function clearAllUserData() {
    clearHistory();
    removeRaw(PREFS_KEY);
    Object.keys(LEGACY_KEYS).forEach(function (key) {
      removeRaw(LEGACY_KEYS[key]);
    });
    if (root.AppLog) root.AppLog.info('storage', 'Cleared user preferences and history');
    return migrateLegacyPrefs();
  }

  function listStoredKeys() {
    if (root.I18n) return root.I18n.getStoredKeys();
    return [
      { key: PREFS_KEY, description: 'App preferences, favorites, and last session settings' },
      { key: HISTORY_KEY, description: 'Completed session history (technique, duration, notes)' },
      { key: 'breathwork_safety_ack_v1', description: 'Safety acknowledgement flag' },
      { key: 'breathwork_install_hint_dismissed', description: 'Install hint dismissed flag' },
      { key: 'breathwork_offline_ready', description: 'Offline readiness cache flag' }
    ];
  }

  root.AppStorage = {
    PREFS_VERSION: PREFS_VERSION,
    getPrefs: getPrefs,
    savePrefs: savePrefs,
    getHistory: getHistory,
    addHistoryEntry: addHistoryEntry,
    clearHistory: clearHistory,
    exportHistory: exportHistory,
    toggleFavorite: toggleFavorite,
    isFavorite: isFavorite,
    getConsistencySummary: getConsistencySummary,
    clearAllUserData: clearAllUserData,
    listStoredKeys: listStoredKeys,
    LEGACY_KEYS: LEGACY_KEYS,
    PREFS_KEY: PREFS_KEY,
    HISTORY_KEY: HISTORY_KEY
  };
})(typeof window !== 'undefined' ? window : globalThis);

if (typeof module !== 'undefined' && module.exports) {
  var g = globalThis;
  if (!g.AppLog) {
    g.AppLog = { info: function () {}, warn: function () {}, error: function () {} };
  }
  module.exports = g.AppStorage;
}
