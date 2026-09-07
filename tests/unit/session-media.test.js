const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const SessionMedia = require('../../session-media.js');

function MockAudio() {
  this.currentTime = 0;
  this.preload = '';
  this.loop = false;
  this.src = '';
  this.volume = 1;
  this.paused = true;
  this.playCount = 0;
  this.pauseCount = 0;
  this.listeners = {};
}

MockAudio.prototype.addEventListener = function (name, handler) {
  this.listeners[name] = handler;
};
MockAudio.prototype.play = function () {
  this.paused = false;
  this.playCount++;
  return Promise.resolve();
};
MockAudio.prototype.pause = function () {
  this.paused = true;
  this.pauseCount++;
};

function MockAudioContext() {
  this.currentTime = 0;
  this.state = 'running';
  this.destination = {};
  this.gainEvents = [];
}

MockAudioContext.prototype.createMediaElementSource = function () {
  return { connect: function () {} };
};
MockAudioContext.prototype.createGain = function () {
  const events = this.gainEvents;
  return {
    gain: {
      value: 0,
      cancelScheduledValues: function () {},
      setValueAtTime: function (value, time) {
        this.value = value;
        events.push({ type: 'set', value: value, time: time });
      },
      linearRampToValueAtTime: function (value, time) {
        this.value = value;
        events.push({ type: 'ramp', value: value, time: time });
      }
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

function createPlayer(overrides) {
  const audio = new MockAudio();
  const contexts = [];
  function Context() {
    const context = new MockAudioContext();
    contexts.push(context);
    return context;
  }
  const options = Object.assign(
    {
      source: 'ambient.m4a',
      enabled: true,
      volume: 0.4,
      AudioContext: Context,
      createAudio: function () {
        return audio;
      },
      setTimeout: function (callback) {
        callback();
        return 1;
      },
      clearTimeout: function () {}
    },
    overrides || {}
  );
  return {
    player: SessionMedia.createSessionMediaPlayer(options),
    audio: audio,
    contexts: contexts
  };
}

describe('session-media lifecycle', function () {
  it('primes muted from a gesture and reuses one audio context', async function () {
    const harness = createPlayer();
    assert.equal(await harness.player.prepareFromGesture(), true);
    assert.equal(harness.player.getState(), 'primed');
    assert.equal(harness.player.getContextsCreated(), 1);
    assert.equal(harness.audio.paused, true);
    assert.equal(harness.audio.currentTime, 0);
    await harness.player.enterAmbient();
    assert.equal(harness.player.getState(), 'playing');
    assert.equal(harness.player.getContextsCreated(), 1);
    assert.equal(harness.audio.currentTime, 0);
  });

  it('uses an independent gain value and soft ramps', async function () {
    const harness = createPlayer();
    await harness.player.prepareFromGesture();
    await harness.player.enterAmbient();
    const ramps = harness.contexts[0].gainEvents.filter(function (event) {
      return event.type === 'ramp';
    });
    assert.equal(ramps.at(-1).value, 0.4);
    harness.player.setVolume(0.2);
    assert.equal(harness.player.getVolume(), 0.2);
    assert.equal(harness.contexts[0].gainEvents.at(-1).value, 0.2);
  });

  it('falls back to element volume when Web Audio is unavailable', async function () {
    const harness = createPlayer({ AudioContext: null });
    await harness.player.prepareFromGesture();
    await harness.player.enterAmbient();
    assert.equal(harness.player.getState(), 'playing');
    assert.equal(harness.audio.volume, 0.4);
    assert.equal(harness.player.getContextsCreated(), 0);
  });

  it('pauses, resumes, leaves ambience, and stops idempotently', async function () {
    const harness = createPlayer();
    await harness.player.prepareFromGesture();
    await harness.player.enterAmbient();
    harness.player.pause(false);
    assert.equal(harness.player.getState(), 'paused');
    assert.equal(harness.audio.paused, true);
    await harness.player.resumeAmbient();
    assert.equal(harness.player.getState(), 'playing');
    harness.player.leaveAmbient();
    assert.equal(harness.player.getState(), 'paused');
    harness.player.stop(true);
    harness.player.stop(true);
    assert.equal(harness.player.getState(), 'paused');
    assert.equal(harness.audio.currentTime, 0);
    assert.deepEqual(harness.contexts[0].gainEvents.at(-1), {
      type: 'set',
      value: 0,
      time: 0
    });
  });

  it('treats normal media end as silence rather than a playback failure', async function () {
    const harness = createPlayer();
    await harness.player.prepareFromGesture();
    await harness.player.enterAmbient();
    harness.audio.listeners.ended();
    assert.equal(harness.player.getState(), 'ended');
    assert.equal(harness.player.getLastError(), null);
    assert.equal(harness.audio.paused, true);
  });
});

describe('session-media silent fallback', function () {
  it('stays disabled without creating media resources', async function () {
    const harness = createPlayer({ enabled: false });
    assert.equal(await harness.player.prepareFromGesture(), false);
    assert.equal(harness.player.getState(), 'disabled');
    assert.equal(harness.player.getContextsCreated(), 0);
  });

  it('reports a rejected play and continues unavailable', async function () {
    const harness = createPlayer();
    harness.audio.play = function () {
      return Promise.reject(new Error('blocked'));
    };
    assert.equal(await harness.player.prepareFromGesture(), false);
    assert.equal(harness.player.getState(), 'unavailable');
    assert.match(harness.player.getLastError(), /Continuing in silence/);
  });

  it('handles a media load error without throwing', async function () {
    const harness = createPlayer();
    await harness.player.prepareFromGesture();
    harness.audio.listeners.error();
    assert.equal(harness.player.getState(), 'unavailable');
    assert.match(harness.player.getLastError(), /could not be loaded/);
  });
});
