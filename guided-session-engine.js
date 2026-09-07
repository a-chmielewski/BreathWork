/**
 * Pure stage orchestrator for guided sessions.
 * Timer stages are handled here; technique stages delegate to SessionEngine.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.GuidedSessionEngine = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  var STATUS = {
    READY: 'ready',
    RUNNING: 'running',
    PAUSED: 'paused',
    COMPLETED: 'completed',
    STOPPED: 'stopped'
  };

  function createGuidedSessionEngine(options) {
    var sessionDefinition = options.sessionDefinition;
    var techniques = options.techniques || [];
    var sessionEngineApi = options.sessionEngine;
    var variationResolver = options.resolveTechniqueVariation;

    if (!sessionDefinition || !Array.isArray(sessionDefinition.stages) || !sessionDefinition.stages.length) {
      throw new Error('A guided session with at least one stage is required.');
    }
    if (!sessionEngineApi || !sessionEngineApi.createSessionEngine) {
      throw new Error('SessionEngine is required.');
    }
    if (typeof variationResolver !== 'function') {
      throw new Error('resolveTechniqueVariation is required.');
    }

    var status = STATUS.READY;
    var stageIndex = 0;
    var stageStartedAtActiveMs = 0;
    var startTimeMs = 0;
    var pausedAtMs = null;
    var pausedElapsedMs = 0;
    var completionElapsedMs = null;
    var techniqueEngine = null;
    var techniqueStarted = false;
    var lastEmittedStageIndex = -1;
    var restEntryReason = null;
    var completedStageIds = [];
    var skippedStageIds = [];

    function getActiveElapsedMs(nowMs) {
      if (status === STATUS.READY) return 0;
      if (status === STATUS.COMPLETED) return completionElapsedMs;
      var effectiveNowMs = status === STATUS.PAUSED && pausedAtMs != null ? pausedAtMs : nowMs;
      return Math.max(0, effectiveNowMs - startTimeMs - pausedElapsedMs);
    }

    function activeTimeToWallTime(activeElapsedMs) {
      return startTimeMs + pausedElapsedMs + activeElapsedMs;
    }

    function getTechnique(techniqueId) {
      return (
        techniques.find(function (technique) {
          return technique.id === techniqueId;
        }) || null
      );
    }

    function createTechniqueEngine(stage) {
      var sourceTechnique = getTechnique(stage.techniqueId);
      if (!sourceTechnique) {
        throw new Error('Unknown guided-session technique: ' + stage.techniqueId);
      }
      var technique = variationResolver(
        sourceTechnique,
        stage.variationId || sourceTechnique.defaultVariationId
      );
      var paceOptions = sessionDefinition.paceOptions || [];
      var pace = paceOptions.find(function (option) {
        return option.id === stage.paceId;
      });
      if (pace) {
        technique.phases.forEach(function (phase) {
          if (phase.type === 'inhale') phase.durationSeconds = pace.inhaleSeconds;
          if (phase.type === 'exhale') phase.durationSeconds = pace.exhaleSeconds;
        });
      }
      return sessionEngineApi.createSessionEngine({
        technique: technique,
        durationMinutes: stage.durationMinutes,
        durationRounds: stage.durationRounds
      });
    }

    function enterCurrentStage() {
      var stage = sessionDefinition.stages[stageIndex];
      if (techniqueEngine) techniqueEngine.cleanup();
      techniqueEngine = null;
      techniqueStarted = false;
      if (stage && stage.type === 'technique') {
        techniqueEngine = createTechniqueEngine(stage);
        if (!stage.instructionDurationMs) {
          techniqueEngine.start(activeTimeToWallTime(stageStartedAtActiveMs));
          techniqueStarted = true;
        }
      }
    }

    function getCurrentStageDurationMs() {
      var stage = sessionDefinition.stages[stageIndex];
      if (!stage) return 0;
      if (stage.type === 'technique') {
        return (
          Math.max(0, stage.instructionDurationMs || 0) +
          (techniqueEngine ? techniqueEngine.getEffectiveDurationMs() : 0)
        );
      }
      return Math.max(0, stage.durationMs || 0);
    }

    function completedSnapshot() {
      return {
        status: STATUS.COMPLETED,
        completed: true,
        stopped: false,
        paused: false,
        stageChanged: false,
        sessionElapsedMs: completionElapsedMs,
        restEntryReason: restEntryReason,
        completedStageIds: completedStageIds.slice(),
        skippedStageIds: skippedStageIds.slice()
      };
    }

    function stoppedSnapshot() {
      return {
        status: STATUS.STOPPED,
        completed: false,
        stopped: true,
        paused: false,
        stageChanged: false,
        sessionElapsedMs: 0,
        restEntryReason: restEntryReason
      };
    }

    function pausedSnapshot(nowMs) {
      var stage = sessionDefinition.stages[stageIndex];
      var elapsedMs = getActiveElapsedMs(nowMs);
      var stageDurationMs = getCurrentStageDurationMs();
      var stageElapsedMs = Math.max(0, elapsedMs - stageStartedAtActiveMs);
      return {
        status: STATUS.PAUSED,
        completed: false,
        stopped: false,
        paused: true,
        stage: stage,
        stageIndex: stageIndex,
        stageElapsedMs: Math.min(stageElapsedMs, stageDurationMs),
        stageRemainingMs: Math.max(0, stageDurationMs - stageElapsedMs),
        sessionElapsedMs: elapsedMs,
        stageChanged: false,
        stageSignature: sessionDefinition.id + '-' + stageIndex,
        preparingTechnique:
          stage.type === 'technique' &&
          stageElapsedMs < Math.max(0, stage.instructionDurationMs || 0),
        restEntryReason: restEntryReason,
        completedStageIds: completedStageIds.slice(),
        skippedStageIds: skippedStageIds.slice()
      };
    }

    function advancePastCompletedStages(nowMs) {
      var activeElapsedMs = getActiveElapsedMs(nowMs);
      while (stageIndex < sessionDefinition.stages.length) {
        var stageDurationMs = getCurrentStageDurationMs();
        if (activeElapsedMs - stageStartedAtActiveMs < stageDurationMs) break;
        completedStageIds.push(sessionDefinition.stages[stageIndex].id);
        stageStartedAtActiveMs += stageDurationMs;
        stageIndex++;
        if (stageIndex >= sessionDefinition.stages.length) {
          completionElapsedMs = stageStartedAtActiveMs;
          status = STATUS.COMPLETED;
          techniqueEngine = null;
          return;
        }
        enterCurrentStage();
      }
    }

    function runningSnapshot(nowMs) {
      advancePastCompletedStages(nowMs);
      if (status === STATUS.COMPLETED) return completedSnapshot();

      var stage = sessionDefinition.stages[stageIndex];
      var activeElapsedMs = getActiveElapsedMs(nowMs);
      var stageDurationMs = getCurrentStageDurationMs();
      var stageElapsedMs = Math.max(0, activeElapsedMs - stageStartedAtActiveMs);
      var techniqueSnapshot = null;
      var techniqueStartedThisTick = false;
      if (techniqueEngine) {
        var instructionDurationMs = Math.max(0, stage.instructionDurationMs || 0);
        if (!techniqueStarted && stageElapsedMs >= instructionDurationMs) {
          techniqueEngine.start(
            activeTimeToWallTime(stageStartedAtActiveMs + instructionDurationMs)
          );
          techniqueStarted = true;
          techniqueStartedThisTick = true;
        }
        if (techniqueStarted) techniqueSnapshot = techniqueEngine.tick(nowMs);
      }
      var stageChanged = stageIndex !== lastEmittedStageIndex;
      lastEmittedStageIndex = stageIndex;

      return {
        status: STATUS.RUNNING,
        completed: false,
        stopped: false,
        paused: false,
        stage: stage,
        stageIndex: stageIndex,
        stageElapsedMs: Math.min(stageElapsedMs, stageDurationMs),
        stageRemainingMs: Math.max(0, stageDurationMs - stageElapsedMs),
        sessionElapsedMs: activeElapsedMs,
        stageChanged: stageChanged,
        stageSignature: sessionDefinition.id + '-' + stageIndex,
        techniqueSnapshot: techniqueSnapshot,
        preparingTechnique: stage.type === 'technique' && !techniqueStarted,
        techniqueStarted: techniqueStartedThisTick,
        restEntryReason: restEntryReason,
        completedStageIds: completedStageIds.slice(),
        skippedStageIds: skippedStageIds.slice()
      };
    }

    return {
      STATUS: STATUS,
      getStatus: function () {
        return status;
      },
      getActiveElapsedMs: function (nowMs) {
        return getActiveElapsedMs(nowMs);
      },
      start: function (nowMs) {
        if (status !== STATUS.READY) return this.tick(nowMs);
        status = STATUS.RUNNING;
        startTimeMs = nowMs;
        pausedAtMs = null;
        pausedElapsedMs = 0;
        stageIndex = 0;
        stageStartedAtActiveMs = 0;
        completionElapsedMs = null;
        lastEmittedStageIndex = -1;
        restEntryReason = null;
        completedStageIds = [];
        skippedStageIds = [];
        enterCurrentStage();
        return runningSnapshot(nowMs);
      },
      tick: function (nowMs) {
        if (status === STATUS.STOPPED) return stoppedSnapshot();
        if (status === STATUS.COMPLETED) return completedSnapshot();
        if (status === STATUS.PAUSED) return pausedSnapshot(nowMs);
        if (status === STATUS.READY) {
          return {
            status: STATUS.READY,
            completed: false,
            stopped: false,
            paused: false,
            stageChanged: false,
            sessionElapsedMs: 0
          };
        }
        return runningSnapshot(nowMs);
      },
      pause: function (nowMs) {
        if (status !== STATUS.RUNNING) return false;
        pausedAtMs = nowMs;
        if (techniqueEngine && techniqueStarted) techniqueEngine.pause(nowMs);
        status = STATUS.PAUSED;
        return true;
      },
      resume: function (nowMs) {
        if (status !== STATUS.PAUSED || pausedAtMs == null) return false;
        pausedElapsedMs += nowMs - pausedAtMs;
        if (techniqueEngine && techniqueStarted) techniqueEngine.resume(nowMs);
        pausedAtMs = null;
        status = STATUS.RUNNING;
        return true;
      },
      skipToRest: function (nowMs) {
        if (status !== STATUS.RUNNING && status !== STATUS.PAUSED) return null;
        var restIndex = sessionDefinition.stages.findIndex(function (stage) {
          return (
            stage.id === sessionDefinition.restStageId ||
            (!sessionDefinition.restStageId &&
              (stage.id === 'rest' || stage.naturalBreathing === true))
          );
        });
        if (restIndex < 0 || stageIndex >= restIndex) return null;
        var activeElapsedMs = getActiveElapsedMs(nowMs);
        skippedStageIds = sessionDefinition.stages.slice(stageIndex, restIndex).map(function (stage) {
          return stage.id;
        });
        if (techniqueEngine) techniqueEngine.stop();
        stageIndex = restIndex;
        stageStartedAtActiveMs = activeElapsedMs;
        restEntryReason = 'skipped';
        enterCurrentStage();
        lastEmittedStageIndex = -1;
        return status === STATUS.PAUSED ? pausedSnapshot(nowMs) : runningSnapshot(nowMs);
      },
      stop: function () {
        if (status === STATUS.STOPPED || status === STATUS.COMPLETED) return false;
        if (techniqueEngine) techniqueEngine.stop();
        status = STATUS.STOPPED;
        return true;
      },
      cleanup: function () {
        if (techniqueEngine) techniqueEngine.cleanup();
        techniqueEngine = null;
        techniqueStarted = false;
        status = STATUS.STOPPED;
        pausedAtMs = null;
      }
    };
  }

  return {
    STATUS: STATUS,
    createGuidedSessionEngine: createGuidedSessionEngine
  };
});
