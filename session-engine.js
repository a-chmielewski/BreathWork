/**
 * Pure session state machine for breathwork exercises.
 * No DOM, audio, or real-time dependencies — drive with injected timestamps.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.SessionEngine = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  var SESSION_STATUS = {
    READY: 'ready',
    RUNNING: 'running',
    TAP_HOLD: 'tapHold',
    PAUSED: 'paused',
    COMPLETED: 'completed',
    STOPPED: 'stopped'
  };

  function buildPhaseList(technique) {
    if (technique.tapToContinueHold && technique.phases) {
      var breathPhases = [];
      var breathCount = technique.breathsPerRound || 30;
      for (var i = 0; i < breathCount; i++) {
        technique.phases.forEach(function (p) {
          breathPhases.push(Object.assign({}, p));
        });
      }
      breathPhases.push({
        type: 'hold',
        durationSeconds: 0,
        label: technique.holdAfterExhaleLabel,
        tapHold: true
      });
      breathPhases.push({
        type: 'inhale',
        durationSeconds: 1,
        label: technique.inhaleHoldLabel
      });
      breathPhases.push({
        type: 'hold',
        durationSeconds: technique.inhaleHoldSeconds || 15,
        label: 'Hold'
      });
      return breathPhases;
    }
    return technique.phases.map(function (p) {
      return Object.assign({}, p);
    });
  }

  function phaseSignature(info) {
    if (!info || !info.phase) return '';
    return (
      info.round +
      '-' +
      info.phaseIndex +
      '-' +
      info.phase.type +
      (info.phase.tapHold ? '-tap' : '')
    );
  }

  function getPrevPhaseType(info, phaseList, totalPhasesPerCycle) {
    var idx = info.phaseIndex;
    var round = info.round;
    if (idx > 0) return phaseList[idx - 1].type;
    if (round > 0) return phaseList[totalPhasesPerCycle - 1].type;
    return 'exhale';
  }

  function computeProgress(info, phaseList, totalPhasesPerCycle) {
    var p = info.phase;
    var elapsed = info.elapsedInPhaseMs;
    var duration = info.phaseDurationMs;
    if (p.type === 'inhale' || p.type === 'inhale2') {
      var seg = p.sighSegment != null ? p.sighSegment : 1;
      var prog = (elapsed / duration) * seg + (p.type === 'inhale2' ? 0.5 : 0);
      return Math.min(1, prog);
    }
    if (p.type === 'exhale') {
      return Math.max(0, 1 - elapsed / duration);
    }
    var prevType = getPrevPhaseType(info, phaseList, totalPhasesPerCycle);
    return prevType === 'inhale' || prevType === 'inhale2' ? 1 : 0;
  }

  function createSessionEngine(options) {
    var technique = options.technique;
    var durationMinutes = options.durationMinutes;
    var durationRounds = options.durationRounds;

    var isTimeBased = technique.durationMode === 'time';
    var useTapHold = !!technique.tapToContinueHold;
    var durationMs = isTimeBased ? durationMinutes * 60 * 1000 : null;
    var totalRounds = !isTimeBased ? durationRounds : null;
    var phaseList = buildPhaseList(technique);
    var totalPhasesPerCycle = phaseList.length;
    var cycleDurationMs = phaseList.reduce(function (sum, p) {
      return sum + (p.durationSeconds || 0) * 1000;
    }, 0);
    var effectiveDurationMs =
      isTimeBased && cycleDurationMs > 0
        ? Math.ceil(durationMs / cycleDurationMs) * cycleDurationMs
        : durationMs;

    var status = SESSION_STATUS.READY;
    var startTimeMs = 0;
    var pausedElapsedMs = 0;
    var pausedAtMs = null;
    var phaseIndex = 0;
    var phaseStartElapsedMs = 0;
    var lastPhaseSignature = '';

    function getElapsedMs(nowMs) {
      if (status === SESSION_STATUS.READY) return 0;
      return nowMs - startTimeMs - pausedElapsedMs;
    }

    function getCurrentPhaseFromElapsed(sessionElapsedMs) {
      if (isTimeBased) {
        if (sessionElapsedMs >= effectiveDurationMs) return null;
        var cycleIndex = Math.floor(sessionElapsedMs / cycleDurationMs);
        var elapsedInCycle = sessionElapsedMs - cycleIndex * cycleDurationMs;
        var acc = 0;
        for (var i = 0; i < phaseList.length; i++) {
          var d = (phaseList[i].durationSeconds || 0) * 1000;
          if (elapsedInCycle < acc + d) {
            return {
              phase: phaseList[i],
              phaseIndex: i,
              round: cycleIndex,
              totalRounds: null,
              elapsedInPhaseMs: elapsedInCycle - acc,
              phaseDurationMs: d
            };
          }
          acc += d;
        }
        return {
          phase: phaseList[0],
          phaseIndex: 0,
          round: cycleIndex + 1,
          totalRounds: null,
          elapsedInPhaseMs: 0,
          phaseDurationMs: (phaseList[0].durationSeconds || 0) * 1000
        };
      }

      var fullListLength = totalPhasesPerCycle * totalRounds;
      var acc2 = 0;
      for (var j = 0; j < fullListLength; j++) {
        var p = phaseList[j % totalPhasesPerCycle];
        var d2 = (p.durationSeconds || 0) * 1000;
        if (sessionElapsedMs < acc2 + d2) {
          return {
            phase: p,
            phaseIndex: j % totalPhasesPerCycle,
            round: Math.floor(j / totalPhasesPerCycle),
            totalRounds: totalRounds,
            elapsedInPhaseMs: sessionElapsedMs - acc2,
            phaseDurationMs: d2
          };
        }
        acc2 += d2;
      }
      return null;
    }

    function getCurrentPhaseTap(nowMs) {
      var roundLength = phaseList.length;
      var round = Math.floor(phaseIndex / roundLength);
      if (round >= totalRounds) return null;
      var idx = phaseIndex % roundLength;
      var phase = phaseList[idx];
      var phaseDurationMs = (phase.durationSeconds || 0) * 1000;
      var sessionElapsed = getElapsedMs(nowMs);
      var elapsedInPhaseMs = phase.tapHold ? 0 : Math.min(phaseDurationMs, sessionElapsed - phaseStartElapsedMs);
      return {
        phase: phase,
        phaseIndex: idx,
        round: round,
        totalRounds: totalRounds,
        elapsedInPhaseMs: elapsedInPhaseMs,
        phaseDurationMs: phaseDurationMs
      };
    }

    function buildSnapshot(info, nowMs, phaseChanged) {
      var elapsed = getElapsedMs(nowMs);
      return {
        status: status,
        phase: info.phase,
        phaseIndex: info.phaseIndex,
        round: info.round,
        totalRounds: info.totalRounds,
        elapsedInPhaseMs: info.elapsedInPhaseMs,
        phaseDurationMs: info.phaseDurationMs,
        sessionElapsedMs: elapsed,
        remainingMs: isTimeBased ? Math.max(0, effectiveDurationMs - elapsed) : null,
        remainingSec: (info.phaseDurationMs - info.elapsedInPhaseMs) / 1000,
        progress: computeProgress(info, phaseList, totalPhasesPerCycle),
        phaseChanged: phaseChanged,
        phaseSignature: phaseSignature(info),
        completed: false,
        paused: false,
        stopped: false
      };
    }

    function resolveRunningSnapshot(nowMs) {
      var elapsed = getElapsedMs(nowMs);
      var info;

      if (useTapHold) {
        info = getCurrentPhaseTap(nowMs);
        if (!info) {
          status = SESSION_STATUS.COMPLETED;
          return {
            status: status,
            completed: true,
            phaseChanged: false,
            paused: false,
            stopped: false
          };
        }

        if (info.phase.tapHold) {
          status = SESSION_STATUS.TAP_HOLD;
        } else {
          status = SESSION_STATUS.RUNNING;
          var phaseElapsed = elapsed - phaseStartElapsedMs;
          if (phaseElapsed >= info.phaseDurationMs) {
            phaseIndex++;
            phaseStartElapsedMs = elapsed;
            info = getCurrentPhaseTap(nowMs);
            if (!info) {
              status = SESSION_STATUS.COMPLETED;
              return {
                status: status,
                completed: true,
                phaseChanged: false,
                paused: false,
                stopped: false
              };
            }
            if (info.phase.tapHold) status = SESSION_STATUS.TAP_HOLD;
          }
        }
      } else {
        info = getCurrentPhaseFromElapsed(elapsed);
        if (!info) {
          status = SESSION_STATUS.COMPLETED;
          return {
            status: status,
            completed: true,
            phaseChanged: false,
            paused: false,
            stopped: false
          };
        }
        status = SESSION_STATUS.RUNNING;
      }

      var sig = phaseSignature(info);
      var changed = sig !== lastPhaseSignature;
      if (changed) lastPhaseSignature = sig;
      return buildSnapshot(info, nowMs, changed);
    }

    return {
      SESSION_STATUS: SESSION_STATUS,
      getStatus: function () {
        return status;
      },
      getPhaseList: function () {
        return phaseList.slice();
      },
      getCycleDurationMs: function () {
        return cycleDurationMs;
      },
      getEffectiveDurationMs: function () {
        return effectiveDurationMs;
      },
      estimateCycles: function () {
        if (!isTimeBased || cycleDurationMs <= 0) return null;
        return Math.ceil(durationMs / cycleDurationMs);
      },
      estimateDurationMs: function () {
        if (isTimeBased) return effectiveDurationMs;
        if (useTapHold) return null;
        return totalRounds * cycleDurationMs;
      },
      start: function (nowMs) {
        status = SESSION_STATUS.RUNNING;
        startTimeMs = nowMs;
        pausedElapsedMs = 0;
        pausedAtMs = null;
        phaseIndex = 0;
        phaseStartElapsedMs = 0;
        lastPhaseSignature = '';
        return resolveRunningSnapshot(nowMs);
      },
      tick: function (nowMs) {
        if (status === SESSION_STATUS.STOPPED) {
          return { status: status, stopped: true, completed: false, phaseChanged: false, paused: false };
        }
        if (status === SESSION_STATUS.COMPLETED) {
          return { status: status, stopped: false, completed: true, phaseChanged: false, paused: false };
        }
        if (status === SESSION_STATUS.PAUSED) {
          return { status: status, paused: true, completed: false, stopped: false, phaseChanged: false };
        }
        return resolveRunningSnapshot(nowMs);
      },
      pause: function (nowMs) {
        if (status !== SESSION_STATUS.RUNNING && status !== SESSION_STATUS.TAP_HOLD) return;
        pausedAtMs = nowMs;
        status = SESSION_STATUS.PAUSED;
      },
      resume: function (nowMs) {
        if (status !== SESSION_STATUS.PAUSED || pausedAtMs == null) return;
        pausedElapsedMs += nowMs - pausedAtMs;
        pausedAtMs = null;
        status = SESSION_STATUS.RUNNING;
      },
      stop: function () {
        status = SESSION_STATUS.STOPPED;
      },
      tapContinue: function (nowMs) {
        if (!useTapHold || status !== SESSION_STATUS.TAP_HOLD) return null;
        phaseIndex++;
        phaseStartElapsedMs = getElapsedMs(nowMs);
        status = SESSION_STATUS.RUNNING;
        return resolveRunningSnapshot(nowMs);
      },
      cleanup: function () {
        status = SESSION_STATUS.STOPPED;
        startTimeMs = 0;
        pausedElapsedMs = 0;
        pausedAtMs = null;
        phaseIndex = 0;
        phaseStartElapsedMs = 0;
        lastPhaseSignature = '';
      }
    };
  }

  return {
    SESSION_STATUS: SESSION_STATUS,
    buildPhaseList: buildPhaseList,
    createSessionEngine: createSessionEngine
  };
});
