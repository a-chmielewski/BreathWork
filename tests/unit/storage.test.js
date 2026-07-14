const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

const storage = new Map();

globalThis.localStorage = {
  getItem(key) {
    return storage.has(key) ? storage.get(key) : null;
  },
  setItem(key, value) {
    storage.set(key, String(value));
  },
  removeItem(key) {
    storage.delete(key);
  },
  clear() {
    storage.clear();
  }
};

globalThis.AppLog = {
  info: function () {},
  warn: function () {},
  error: function () {}
};

const AppStorage = require('../../storage.js');

describe('AppStorage preferences', function () {
  beforeEach(function () {
    storage.clear();
  });

  it('migrates legacy preference keys', function () {
    localStorage.setItem('breathwork_last_tech', 'box');
    localStorage.setItem('breathwork_last_mins', '10');
    localStorage.setItem('breathwork_sound', '1');
    localStorage.setItem('breathwork_volume', '55');

    const prefs = AppStorage.getPrefs();
    assert.equal(prefs.lastTechId, 'box');
    assert.equal(prefs.lastMins, 10);
    assert.equal(prefs.sound, true);
    assert.equal(prefs.volume, 55);
    assert.equal(localStorage.getItem('breathwork_prefs_v2') != null, true);
    assert.equal(localStorage.getItem('breathwork_last_tech'), null);
  });

  it('falls back safely on corrupted prefs JSON', function () {
    localStorage.setItem('breathwork_prefs_v2', '{not json');
    const prefs = AppStorage.getPrefs();
    assert.equal(prefs.version, AppStorage.PREFS_VERSION);
    assert.equal(prefs.showCountdown, true);
  });
});

describe('AppStorage history', function () {
  beforeEach(function () {
    storage.clear();
  });

  it('stores only completed sessions', function () {
    AppStorage.addHistoryEntry({
      techId: 'box',
      techniqueName: 'Box Breathing',
      durationMinutes: 5,
      elapsedMs: 300000,
      completed: true
    });
    const history = AppStorage.getHistory();
    assert.equal(history.length, 1);
    assert.equal(history[0].techniqueName, 'Box Breathing');
  });

  it('exports history as JSON', function () {
    AppStorage.addHistoryEntry({
      techId: 'box',
      techniqueName: 'Box Breathing',
      completed: true
    });
    const exported = AppStorage.exportHistory();
    const parsed = JSON.parse(exported);
    assert.equal(parsed.length, 1);
  });

  it('reports gentle weekly consistency summary', function () {
    AppStorage.addHistoryEntry({
      techId: 'box',
      techniqueName: 'Box Breathing',
      completed: true,
      timestamp: new Date().toISOString()
    });
    const summary = AppStorage.getConsistencySummary(AppStorage.getHistory());
    assert.match(summary, /1 completed session this week/);
  });
});

describe('AppStorage favorites', function () {
  beforeEach(function () {
    storage.clear();
  });

  it('toggles favorites', function () {
    assert.equal(AppStorage.isFavorite('box'), false);
    assert.equal(AppStorage.toggleFavorite('box'), true);
    assert.equal(AppStorage.isFavorite('box'), true);
    assert.equal(AppStorage.toggleFavorite('box'), false);
  });
});
