/**
 * Phase-change audio and haptic cues.
 * One long-lived AudioContext, distinct synthesized tones per phase type.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.AudioCues = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  var CUE_PROFILES = {
    inhale: { frequency: 360, duration: 0.12, peakGain: 0.09 },
    inhale2: { frequency: 430, duration: 0.1, peakGain: 0.085 },
    exhale: { frequency: 280, duration: 0.14, peakGain: 0.08 },
    hold: { frequency: 300, duration: 0.08, peakGain: 0.06 },
    completion: { frequency: 520, duration: 0.22, peakGain: 0.1 },
    error: { frequency: 180, duration: 0.1, peakGain: 0.07 },
    preview: { frequency: 360, duration: 0.1, peakGain: 0.08 }
  };

  function normalizePhaseType(phaseType) {
    if (!phaseType) return 'inhale';
    if (phaseType === 'inhale2') return 'inhale2';
    if (CUE_PROFILES[phaseType]) return phaseType;
    return 'inhale';
  }

  function createAudioCuePlayer(options) {
    var soundEnabled = options && options.enabled !== false;
    var hapticsEnabled = options && options.hapticsEnabled === true;
    var volume = options && options.volume != null ? options.volume : 0.7;
    var AudioContextCtor = (options && options.AudioContext) || null;
    var vibrate = options && options.vibrate ? options.vibrate : null;

    var sharedContext = null;
    var contextsCreated = 0;
    var cueCount = 0;
    var unlocked = false;
    var lastError = null;

    function resolveAudioContext() {
      if (!AudioContextCtor) return null;
      if (!sharedContext) {
        sharedContext = new AudioContextCtor();
        contextsCreated++;
      }
      return sharedContext;
    }

    function playTone(profile) {
      var ctx = resolveAudioContext();
      if (!ctx) return false;
      try {
        var now = ctx.currentTime;
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        var peak = profile.peakGain * Math.max(0, Math.min(1, volume));
        osc.type = 'sine';
        osc.frequency.setValueAtTime(profile.frequency, now);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), now + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + profile.duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + profile.duration + 0.02);
        return true;
      } catch (_err) {
        lastError = 'Sound could not play. Check mute switch and Silent mode.';
        return false;
      }
    }

    return {
      setEnabled: function (value) {
        soundEnabled = !!value;
      },
      isEnabled: function () {
        return soundEnabled;
      },
      setHapticsEnabled: function (value) {
        hapticsEnabled = !!value;
      },
      isHapticsEnabled: function () {
        return hapticsEnabled;
      },
      setVolume: function (value) {
        var parsed = Number(value);
        volume = Number.isFinite(parsed) ? Math.max(0, Math.min(1, parsed)) : 0.7;
      },
      getVolume: function () {
        return volume;
      },
      unlock: function () {
        try {
          var ctx = resolveAudioContext();
          if (!ctx) {
            lastError = 'Audio is not supported in this browser.';
            unlocked = false;
            return false;
          }
          unlocked = true;
          lastError = null;
          if (ctx.state === 'suspended' && ctx.resume) {
            ctx.resume();
          }
          return true;
        } catch (_) {
          lastError = 'Sound could not start. Check mute switch and Silent mode.';
          unlocked = false;
          return false;
        }
      },
      isUnlocked: function () {
        return unlocked;
      },
      getLastError: function () {
        return lastError;
      },
      playPreview: function () {
        if (!soundEnabled) return false;
        if (!unlocked && !this.unlock()) return false;
        cueCount++;
        return playTone(CUE_PROFILES.preview);
      },
      playPhaseCue: function (phaseType) {
        if (!soundEnabled) return;
        cueCount++;
        if (!AudioContextCtor) return;
        if (!unlocked && !this.unlock()) return;

        var profile = CUE_PROFILES[normalizePhaseType(phaseType)] || CUE_PROFILES.inhale;
        playTone(profile);

        if (hapticsEnabled && vibrate) {
          try {
            vibrate(40);
          } catch (_) {}
        }
      },
      getCueCount: function () {
        return cueCount;
      },
      getContextsCreated: function () {
        return contextsCreated;
      },
      getSharedContext: function () {
        return sharedContext;
      },
      suspend: function () {
        if (sharedContext && sharedContext.state === 'running' && sharedContext.suspend) {
          try {
            sharedContext.suspend();
          } catch (_) {}
        }
      },
      cleanup: function () {
        if (sharedContext) {
          try {
            if (sharedContext.close) {
              sharedContext.close();
            }
          } catch (_) {}
        }
        sharedContext = null;
        unlocked = false;
      },
      resetCounts: function () {
        cueCount = 0;
        contextsCreated = sharedContext ? 1 : 0;
      }
    };
  }

  return {
    CUE_PROFILES: CUE_PROFILES,
    createAudioCuePlayer: createAudioCuePlayer
  };
});
