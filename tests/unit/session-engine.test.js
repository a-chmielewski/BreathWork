const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

const { TECHNIQUES } = require('../../techniques.js');
const SessionEngine = require('../../session-engine.js');
const AudioCues = require('../../audio-cues.js');

function tech(id) {
  return TECHNIQUES.find(function (t) {
    return t.id === id;
  });
}

function collectPhaseChanges(engine, startMs, advances) {
  var changes = [];
  var snapshot = engine.start(startMs);
  if (snapshot.phaseChanged) changes.push(snapshot.phaseSignature);
  for (var i = 0; i < advances.length; i++) {
    snapshot = engine.tick(advances[i]);
    if (snapshot.phaseChanged) changes.push(snapshot.phaseSignature);
    if (snapshot.completed || snapshot.stopped) break;
  }
  return changes;
}

describe('session-engine time-based cycles', function () {
  it('advances box breathing phases on schedule', function () {
    var engine = SessionEngine.createSessionEngine({
      technique: tech('box'),
      durationMinutes: 5
    });
    var t0 = 100000;
    var s0 = engine.start(t0);
    assert.equal(s0.phase.type, 'inhale');
    assert.equal(s0.status, SessionEngine.SESSION_STATUS.RUNNING);

    var s1 = engine.tick(t0 + 4000);
    assert.equal(s1.phase.type, 'hold');
    assert.equal(s1.phaseIndex, 1);

    var s2 = engine.tick(t0 + 8000);
    assert.equal(s2.phase.type, 'exhale');
  });

  it('completes when duration elapses at cycle boundary', function () {
    var engine = SessionEngine.createSessionEngine({
      technique: tech('4-7-8'),
      durationMinutes: 5
    });
    var t0 = 0;
    engine.start(t0);
    var beforeEnd = engine.tick(t0 + 5 * 60 * 1000 - 1);
    assert.equal(beforeEnd.completed, false);
    var end = engine.tick(t0 + engine.getEffectiveDurationMs());
    assert.equal(end.completed, true);
    assert.equal(end.status, SessionEngine.SESSION_STATUS.COMPLETED);
  });

  it('recovers after a multi-second delayed tick', function () {
    var engine = SessionEngine.createSessionEngine({
      technique: tech('box'),
      durationMinutes: 5
    });
    var t0 = 5000;
    engine.start(t0);
    var late = engine.tick(t0 + 9000);
    assert.equal(late.phase.type, 'exhale');
    assert.equal(late.phaseIndex, 2);
  });
});

describe('session-engine round-based cycles', function () {
  it('completes physiological sigh after configured rounds', function () {
    var engine = SessionEngine.createSessionEngine({
      technique: tech('physiological-sigh'),
      durationRounds: 1
    });
    var cycleMs = engine.getCycleDurationMs();
    engine.start(0);
    var done = engine.tick(cycleMs);
    assert.equal(done.completed, true);
  });

  it('reports round progress for multi-round sessions', function () {
    var engine = SessionEngine.createSessionEngine({
      technique: tech('physiological-sigh'),
      durationRounds: 3
    });
    var t0 = 1000;
    var snapshot = engine.start(t0);
    assert.equal(snapshot.round, 0);
    assert.equal(snapshot.totalRounds, 3);
  });
});

describe('session-engine tap-to-continue holds', function () {
  it('enters tapHold and advances on tapContinue', function () {
    var engine = SessionEngine.createSessionEngine({
      technique: tech('wim-hof'),
      durationRounds: 1
    });
    var t0 = 0;
    engine.start(t0);
    var snapshot;
    var t = t0;
    while (t < 120000) {
      t += 1500;
      snapshot = engine.tick(t);
      if (snapshot.status === SessionEngine.SESSION_STATUS.TAP_HOLD) break;
      if (snapshot.completed) break;
    }
    assert.equal(snapshot.status, SessionEngine.SESSION_STATUS.TAP_HOLD);
    assert.equal(snapshot.phase.tapHold, true);

    var next = engine.tapContinue(t + 100);
    assert.equal(next.status, SessionEngine.SESSION_STATUS.RUNNING);
    assert.notEqual(next.phase.tapHold, true);
  });
});

describe('session-engine pause, resume, stop', function () {
  it('does not advance elapsed time while paused', function () {
    var engine = SessionEngine.createSessionEngine({
      technique: tech('box'),
      durationMinutes: 5
    });
    var t0 = 0;
    engine.start(t0);
    engine.pause(t0 + 2000);
    var pausedSnap = engine.tick(t0 + 5000);
    assert.equal(pausedSnap.paused, true);
    assert.equal(pausedSnap.phaseChanged, false);

    engine.resume(t0 + 5000);
    var resumed = engine.tick(t0 + 6000);
    assert.equal(resumed.phase.type, 'inhale');
    assert.equal(resumed.elapsedInPhaseMs, 3000);
  });

  it('emits no phase changes while paused', function () {
    var engine = SessionEngine.createSessionEngine({
      technique: tech('box'),
      durationMinutes: 5
    });
    var changes = collectPhaseChanges(engine, 0, [1000, 2000, 3000]);
    engine.pause(3000);
    var paused = engine.tick(8000);
    assert.equal(paused.phaseChanged, false);
    assert.ok(changes.length >= 1);
  });

  it('stop ends the session without completion', function () {
    var engine = SessionEngine.createSessionEngine({
      technique: tech('box'),
      durationMinutes: 5
    });
    engine.start(0);
    engine.stop();
    var snap = engine.tick(10000);
    assert.equal(snap.stopped, true);
    assert.equal(snap.completed, false);
  });
});

describe('session-engine phase transitions', function () {
  it('emits exactly one phaseChanged event per transition', function () {
    var engine = SessionEngine.createSessionEngine({
      technique: tech('box'),
      durationMinutes: 5
    });
    var t0 = 0;
    var lastChangedSig = null;
    var snapshot = engine.start(t0);
    if (snapshot.phaseChanged) lastChangedSig = snapshot.phaseSignature;

    for (var ms = 500; ms <= 20000; ms += 500) {
      snapshot = engine.tick(t0 + ms);
      if (snapshot.completed) break;
      if (snapshot.phaseChanged) {
        assert.notEqual(snapshot.phaseSignature, lastChangedSig);
        lastChangedSig = snapshot.phaseSignature;
      }
    }
    assert.ok(lastChangedSig);
  });

  it('transitions on exact phase boundaries', function () {
    var engine = SessionEngine.createSessionEngine({
      technique: tech('box'),
      durationMinutes: 5
    });
    engine.start(0);
    var boundary = engine.tick(4000);
    assert.equal(boundary.phaseIndex, 1);
    assert.equal(boundary.phase.type, 'hold');
  });
});

describe('session-engine cleanup', function () {
  it('resets to stopped after cleanup', function () {
    var engine = SessionEngine.createSessionEngine({
      technique: tech('box'),
      durationMinutes: 5
    });
    engine.start(0);
    engine.cleanup();
    assert.equal(engine.getStatus(), SessionEngine.SESSION_STATUS.STOPPED);
  });
});

describe('audio-cues', function () {
  function MockAudioContext() {
    this.state = 'running';
    this.currentTime = 0;
    this.destination = {};
    MockAudioContext.instances.push(this);
  }
  MockAudioContext.instances = [];
  MockAudioContext.prototype.createOscillator = function () {
    return {
      type: 'sine',
      frequency: { value: 0 },
      connect: function () {},
      start: function () {},
      stop: function () {}
    };
  };
  MockAudioContext.prototype.createGain = function () {
    return {
      gain: {
        setValueAtTime: function () {},
        exponentialRampToValueAtTime: function () {}
      },
      connect: function () {}
    };
  };
  MockAudioContext.prototype.resume = function () {
    this.state = 'running';
    return Promise.resolve();
  };
  MockAudioContext.prototype.suspend = function () {
    this.state = 'suspended';
    return Promise.resolve();
  };
  MockAudioContext.prototype.close = function () {
    this.state = 'closed';
    return Promise.resolve();
  };

  beforeEach(function () {
    MockAudioContext.instances = [];
  });

  it('does not play cues when sound is disabled', function () {
    var player = AudioCues.createAudioCuePlayer({
      enabled: false,
      AudioContext: MockAudioContext
    });
    player.playPhaseCue();
    player.playPhaseCue();
    assert.equal(player.getCueCount(), 0);
    assert.equal(player.getContextsCreated(), 0);
  });

  it('plays cues when enabled', function () {
    var player = AudioCues.createAudioCuePlayer({
      enabled: true,
      AudioContext: MockAudioContext
    });
    player.unlock();
    player.playPhaseCue('inhale');
    assert.equal(player.getCueCount(), 1);
    assert.equal(player.getContextsCreated(), 1);
  });

  it('plays distinct phase cue types', function () {
    var player = AudioCues.createAudioCuePlayer({
      enabled: true,
      AudioContext: MockAudioContext
    });
    player.unlock();
    player.playPhaseCue('inhale');
    player.playPhaseCue('exhale');
    player.playPhaseCue('hold');
    player.playPhaseCue('completion');
    assert.equal(player.getCueCount(), 4);
    assert.equal(player.getContextsCreated(), 1);
  });

  it('does not vibrate when haptics are disabled', function () {
    var pulses = 0;
    var player = AudioCues.createAudioCuePlayer({
      enabled: true,
      hapticsEnabled: false,
      AudioContext: MockAudioContext,
      vibrate: function () {
        pulses++;
      }
    });
    player.unlock();
    player.playPhaseCue('inhale');
    assert.equal(pulses, 0);
  });

  it('vibrates when haptics are enabled', function () {
    var pulses = 0;
    var player = AudioCues.createAudioCuePlayer({
      enabled: true,
      hapticsEnabled: true,
      AudioContext: MockAudioContext,
      vibrate: function () {
        pulses++;
      }
    });
    player.unlock();
    player.playPhaseCue('inhale');
    assert.equal(pulses, 1);
  });

  it('unlock prepares a shared context', function () {
    var player = AudioCues.createAudioCuePlayer({
      enabled: true,
      AudioContext: MockAudioContext
    });
    assert.equal(player.unlock(), true);
    assert.equal(player.isUnlocked(), true);
    assert.ok(player.getSharedContext());
  });

  it('BW-001: reuses one audio context across cues', function () {
    var player = AudioCues.createAudioCuePlayer({
      enabled: true,
      AudioContext: MockAudioContext
    });
    player.unlock();
    player.playPhaseCue('inhale');
    player.playPhaseCue('exhale');
    player.playPhaseCue('hold');
    assert.equal(player.getContextsCreated(), 1);
  });

  it('cleanup closes the shared context', function () {
    var player = AudioCues.createAudioCuePlayer({
      enabled: true,
      AudioContext: MockAudioContext
    });
    player.unlock();
    player.cleanup();
    assert.equal(player.getSharedContext(), null);
    assert.equal(player.isUnlocked(), false);
  });
});

describe('BW-002 duplicate cue regression helper', function () {
  it('BW-002: session start emits exactly one initial cue', function () {
    var engine = SessionEngine.createSessionEngine({
      technique: tech('box'),
      durationMinutes: 5
    });
    var cues = 0;
    var snapshot = engine.start(0);
    if (snapshot.phaseChanged) cues++;
    assert.equal(cues, 1);
  });
});
