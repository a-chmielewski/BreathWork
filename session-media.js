/**
 * Prerecorded ambient playback with a dedicated Web Audio gain channel.
 * Keeps media optional and fails to silence without affecting session timing.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.SessionMedia = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  function clamp(value, fallback) {
    var parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.max(0, Math.min(1, parsed));
  }

  function createSessionMediaPlayer(options) {
    options = options || {};
    var AudioContextCtor = options.AudioContext || null;
    var createAudio =
      options.createAudio ||
      function () {
        return new Audio();
      };
    var scheduleTimeout = options.setTimeout || setTimeout;
    var cancelTimeout = options.clearTimeout || clearTimeout;
    var onStatusChange = options.onStatusChange || function () {};
    var source = options.source || '';
    var enabled = options.enabled !== false;
    var volume = clamp(options.volume, 0.45);

    var mediaElement = null;
    var audioContext = null;
    var mediaSourceNode = null;
    var gainNode = null;
    var pendingPauseId = null;
    var state = enabled ? 'idle' : 'disabled';
    var lastError = null;
    var ambientStarted = false;
    var contextsCreated = 0;

    function notify() {
      onStatusChange({ state: state, error: lastError });
    }

    function clearPendingPause() {
      if (pendingPauseId == null) return;
      cancelTimeout(pendingPauseId);
      pendingPauseId = null;
    }

    function setGain(target, durationMs) {
      if (!gainNode || !audioContext) {
        if (mediaElement) mediaElement.volume = target;
        return;
      }
      var gain = gainNode.gain;
      var now = audioContext.currentTime || 0;
      var currentValue = Number.isFinite(gain.value) ? gain.value : 0;
      if (gain.cancelScheduledValues) gain.cancelScheduledValues(now);
      if (gain.setValueAtTime) gain.setValueAtTime(currentValue, now);
      if (durationMs > 0 && gain.linearRampToValueAtTime) {
        gain.linearRampToValueAtTime(target, now + durationMs / 1000);
      } else if (gain.setValueAtTime) {
        gain.setValueAtTime(target, now);
      } else {
        gain.value = target;
      }
    }

    function markUnavailable(message) {
      clearPendingPause();
      lastError = message || 'Ambient sound is unavailable.';
      state = 'unavailable';
      if (gainNode) setGain(0, 0);
      if (mediaElement) {
        try {
          mediaElement.pause();
        } catch (_) {}
      }
      notify();
      return false;
    }

    function ensureMediaElement() {
      if (mediaElement) return mediaElement;
      mediaElement = createAudio();
      mediaElement.preload = 'auto';
      mediaElement.loop = false;
      mediaElement.src = source;
      mediaElement.addEventListener('error', function () {
        markUnavailable('Ambient sound could not be loaded.');
      });
      mediaElement.addEventListener('ended', function () {
        if (ambientStarted && state !== 'unavailable') {
          clearPendingPause();
          ambientStarted = false;
          lastError = null;
          setGain(0, 0);
          try {
            mediaElement.pause();
          } catch (_) {}
          state = 'ended';
          notify();
        }
      });
      return mediaElement;
    }

    function ensureAudioGraph() {
      if (audioContext && gainNode) return true;
      if (!AudioContextCtor) {
        ensureMediaElement().volume = 0;
        return true;
      }
      try {
        audioContext = new AudioContextCtor();
        contextsCreated++;
        mediaSourceNode = audioContext.createMediaElementSource(ensureMediaElement());
        gainNode = audioContext.createGain();
        gainNode.gain.setValueAtTime(0, audioContext.currentTime || 0);
        mediaSourceNode.connect(gainNode);
        gainNode.connect(audioContext.destination);
        return true;
      } catch (_) {
        return markUnavailable('Ambient sound could not start.');
      }
    }

    function resumeContext() {
      if (!audioContext || audioContext.state !== 'suspended' || !audioContext.resume) {
        return Promise.resolve();
      }
      try {
        return Promise.resolve(audioContext.resume());
      } catch (_) {
        return Promise.reject(new Error('Audio context resume failed.'));
      }
    }

    function playMedia() {
      try {
        var playResult = ensureMediaElement().play();
        return Promise.resolve(playResult);
      } catch (_) {
        return Promise.reject(new Error('Media play failed.'));
      }
    }

    function playWithGain(target, durationMs, resetPosition) {
      clearPendingPause();
      if (!enabled || state === 'unavailable' || !ensureAudioGraph()) {
        return Promise.resolve(false);
      }
      if (resetPosition) {
        try {
          mediaElement.currentTime = 0;
        } catch (_) {}
      }
      return resumeContext()
        .then(playMedia)
        .then(function () {
          setGain(target, durationMs);
          state = target > 0 ? 'playing' : 'primed';
          lastError = null;
          notify();
          return true;
        })
        .catch(function () {
          return markUnavailable('Ambient sound could not play. Continuing in silence.');
        });
    }

    function fadeAndPause(durationMs, resetPosition) {
      clearPendingPause();
      if (!mediaElement) {
        state = enabled ? 'idle' : 'disabled';
        notify();
        return;
      }
      setGain(0, durationMs);
      state = durationMs > 0 ? 'fading' : 'paused';
      notify();
      var finishPause = function () {
        pendingPauseId = null;
        try {
          mediaElement.pause();
          if (resetPosition) mediaElement.currentTime = 0;
        } catch (_) {}
        if (audioContext && audioContext.suspend) {
          try {
            audioContext.suspend();
          } catch (_) {}
        }
        state = enabled ? 'paused' : 'disabled';
        notify();
      };
      if (durationMs > 0) pendingPauseId = scheduleTimeout(finishPause, durationMs);
      else finishPause();
    }

    function prepareFromGesture() {
      clearPendingPause();
      ambientStarted = false;
      if (!enabled || state === 'unavailable' || !ensureAudioGraph()) {
        return Promise.resolve(false);
      }
      try {
        mediaElement.currentTime = 0;
      } catch (_) {}
      setGain(0, 0);
      var contextPromise = resumeContext();
      var mediaPromise = playMedia();
      return Promise.all([contextPromise, mediaPromise])
        .then(function () {
          mediaElement.pause();
          try {
            mediaElement.currentTime = 0;
          } catch (_) {}
          state = 'primed';
          lastError = null;
          notify();
          return true;
        })
        .catch(function () {
          return markUnavailable('Ambient sound could not play. Continuing in silence.');
        });
    }

    return {
      setEnabled: function (value) {
        enabled = !!value;
        if (!enabled) {
          fadeAndPause(0, true);
          state = 'disabled';
          notify();
        } else if (state === 'disabled' || state === 'unavailable') {
          state = 'idle';
          lastError = null;
          if (mediaElement && mediaElement.load) {
            try {
              mediaElement.load();
            } catch (_) {}
          }
          notify();
        }
      },
      isEnabled: function () {
        return enabled;
      },
      setVolume: function (value) {
        volume = clamp(value, 0.45);
        if (state === 'playing') setGain(volume, 150);
      },
      getVolume: function () {
        return volume;
      },
      prepareFromGesture: function () {
        return prepareFromGesture();
      },
      enterAmbient: function () {
        var shouldReset = !ambientStarted;
        ambientStarted = true;
        return playWithGain(volume, 2500, shouldReset);
      },
      pause: function (immediate) {
        fadeAndPause(immediate ? 0 : 400, false);
      },
      resumeAmbient: function () {
        return playWithGain(volume, 800, false);
      },
      leaveAmbient: function () {
        fadeAndPause(3000, false);
      },
      stop: function (immediate) {
        ambientStarted = false;
        fadeAndPause(immediate ? 0 : 600, true);
      },
      getState: function () {
        return state;
      },
      getLastError: function () {
        return lastError;
      },
      getContextsCreated: function () {
        return contextsCreated;
      },
      getMediaElement: function () {
        return mediaElement;
      },
      cleanup: function () {
        clearPendingPause();
        if (mediaElement) {
          try {
            mediaElement.pause();
            mediaElement.currentTime = 0;
          } catch (_) {}
        }
        if (audioContext && audioContext.close) {
          try {
            audioContext.close();
          } catch (_) {}
        }
        mediaElement = null;
        audioContext = null;
        mediaSourceNode = null;
        gainNode = null;
        ambientStarted = false;
        state = enabled ? 'idle' : 'disabled';
      }
    };
  }

  return {
    createSessionMediaPlayer: createSessionMediaPlayer
  };
});
