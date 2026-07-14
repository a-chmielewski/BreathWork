/**
 * Lightweight in-app logging for diagnostics (no network).
 */
(function (root) {
  var MAX_ENTRIES = 40;
  var entries = [];
  var lastError = null;

  function push(level, area, message, detail) {
    var entry = {
      time: new Date().toISOString(),
      level: level,
      area: area,
      message: message,
      detail: detail || null
    };
    entries.unshift(entry);
    if (entries.length > MAX_ENTRIES) entries.length = MAX_ENTRIES;
    if (level === 'error') lastError = entry;
    if (typeof console !== 'undefined' && console[level]) {
      console[level]('[' + area + ']', message, detail || '');
    }
  }

  root.AppLog = {
    info: function (area, message, detail) {
      push('info', area, message, detail);
    },
    warn: function (area, message, detail) {
      push('warn', area, message, detail);
    },
    error: function (area, message, detail) {
      push('error', area, message, detail);
    },
    getEntries: function () {
      return entries.slice();
    },
    getLastError: function () {
      return lastError;
    },
    clear: function () {
      entries = [];
      lastError = null;
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);
