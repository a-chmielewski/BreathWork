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

  it('adds guided preferences without changing existing technique settings', function () {
    AppStorage.savePrefs({
      version: 2,
      lastTechId: 'box',
      lastMins: 10,
      lastSessionType: 'guided',
      lastGuidedSessionId: 'unwind-with-sound'
    });
    const prefs = AppStorage.getPrefs();
    assert.equal(prefs.lastTechId, 'box');
    assert.equal(prefs.lastMins, 10);
    assert.equal(prefs.lastSessionType, 'guided');
    assert.equal(prefs.lastGuidedSessionId, 'unwind-with-sound');
    assert.equal(prefs.ambientEnabled, true);
    assert.equal(prefs.ambientVolume, 45);
  });

  it('normalizes independent ambient preferences without changing cue preferences', function () {
    AppStorage.savePrefs({
      version: 2,
      sound: false,
      volume: 70,
      ambientEnabled: true,
      ambientVolume: 0,
      guidedDimView: true
    });
    const prefs = AppStorage.getPrefs();
    assert.equal(prefs.sound, false);
    assert.equal(prefs.volume, 70);
    assert.equal(prefs.ambientEnabled, true);
    assert.equal(prefs.ambientVolume, 0);
    assert.equal(prefs.guidedDimView, true);
  });

  it('persists valid per-technique variations and ignores invalid entries', function () {
    AppStorage.savePrefs({
      version: 2,
      techniqueVariations: {
        'alternate-nostril': 'no-holds',
        'equal-breathing': 'three-count',
        invalid: 42
      }
    });

    assert.deepEqual(AppStorage.getPrefs().techniqueVariations, {
      'alternate-nostril': 'no-holds',
      'equal-breathing': 'three-count'
    });
  });

  it('migrates missing variation preferences to an empty compatibility map', function () {
    localStorage.setItem(
      'breathwork_prefs_v2',
      JSON.stringify({ version: 2, lastTechId: 'alternate-nostril' })
    );

    assert.deepEqual(AppStorage.getPrefs().techniqueVariations, {});
  });

  it('persists the hands-free nostril preference as a boolean', function () {
    AppStorage.savePrefs({ version: 2, handsFreeNostril: true });
    assert.equal(AppStorage.getPrefs().handsFreeNostril, true);

    AppStorage.savePrefs({ version: 2, handsFreeNostril: 'true' });
    assert.equal(AppStorage.getPrefs().handsFreeNostril, false);
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

  it('stores old technique and new guided history records together', function () {
    AppStorage.addHistoryEntry({
      techId: 'box',
      techniqueName: 'Box Breathing',
      completed: true
    });
    AppStorage.addHistoryEntry({
      sessionType: 'guided',
      guidedSessionId: 'unwind-with-sound',
      titleKey: 'guided.unwind.title',
      completionId: 'guided_1',
      elapsedMs: 908000,
      completed: true
    });
    const history = AppStorage.getHistory();
    assert.equal(history.length, 2);
    assert.equal(history[0].sessionType, 'guided');
    assert.equal(history[1].techId, 'box');
  });

  it('does not duplicate a guided completion record', function () {
    const entry = {
      sessionType: 'guided',
      guidedSessionId: 'unwind-with-sound',
      completionId: 'guided_1',
      completed: true
    };
    const first = AppStorage.addHistoryEntry(entry);
    const duplicate = AppStorage.addHistoryEntry(entry);
    assert.equal(first.id, duplicate.id);
    assert.equal(AppStorage.getHistory().length, 1);
  });

  it('saves and clears a local reflection on an existing guided completion', function () {
    AppStorage.addHistoryEntry({
      sessionType: 'guided',
      guidedSessionId: 'unwind-with-sound',
      completionId: 'guided_reflection',
      completed: true
    });
    assert.equal(
      AppStorage.saveGuidedReflection('guided_reflection', '  Rested and present.  '),
      true
    );
    assert.equal(AppStorage.getHistory()[0].reflection, 'Rested and present.');
    assert.equal(AppStorage.saveGuidedReflection('guided_reflection', ''), true);
    assert.equal(AppStorage.getHistory()[0].reflection, undefined);
  });

  it('does not attach guided reflections to unrelated history records', function () {
    AppStorage.addHistoryEntry({
      techId: 'box',
      completionId: 'technique_1',
      completed: true
    });
    assert.equal(AppStorage.saveGuidedReflection('technique_1', 'Text'), false);
    assert.equal(AppStorage.getHistory()[0].reflection, undefined);
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
