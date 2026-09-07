const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const { TECHNIQUES, resolveTechniqueVariation } = require('../../techniques.js');
const GuidedSessions = require('../../guided-sessions.js');
const GuidedSessionEngine = require('../../guided-session-engine.js');
const SessionEngine = require('../../session-engine.js');

function createEngine(sessionDefinition) {
  return GuidedSessionEngine.createGuidedSessionEngine({
    sessionDefinition: sessionDefinition || GuidedSessions.getById('unwind-with-sound'),
    techniques: TECHNIQUES,
    sessionEngine: SessionEngine,
    resolveTechniqueVariation: resolveTechniqueVariation
  });
}

function shortSession() {
  return {
    id: 'short-guided',
    stages: [
      { id: 'arrive', type: 'timer', durationMs: 1000 },
      { id: 'breathe', type: 'technique', techniqueId: 'coherent', durationMinutes: 0.1 },
      { id: 'rest', type: 'timer', durationMs: 1000, naturalBreathing: true },
      { id: 'return', type: 'timer', durationMs: 1000 }
    ]
  };
}

describe('guided-session-engine stage flow', function () {
  it('runs timer stages in order and completes once', function () {
    const engine = createEngine(shortSession());
    let snapshot = engine.start(0);
    assert.equal(snapshot.stage.id, 'arrive');
    assert.equal(snapshot.stageChanged, true);
    assert.equal(engine.tick(500).stageChanged, false);

    snapshot = engine.tick(1000);
    assert.equal(snapshot.stage.id, 'breathe');
    assert.equal(snapshot.stageChanged, true);
    assert.equal(snapshot.techniqueSnapshot.phase.type, 'inhale');

    snapshot = engine.tick(12000);
    assert.equal(snapshot.stage.id, 'rest');
    assert.equal(snapshot.stageChanged, true);

    snapshot = engine.tick(13000);
    assert.equal(snapshot.stage.id, 'return');

    snapshot = engine.tick(14000);
    assert.equal(snapshot.completed, true);
    assert.equal(snapshot.sessionElapsedMs, 14000);
    assert.equal(engine.tick(15000).completed, true);
  });

  it('finishes coherent breathing at a full breath boundary', function () {
    const engine = createEngine();
    engine.start(0);
    const nominalBoundary = 2 * 60 * 1000 + 5 * 60 * 1000;
    const beforeFullCycle = engine.tick(nominalBoundary);
    assert.equal(beforeFullCycle.stage.id, 'breathe');

    const fullCycleBoundary = 2 * 60 * 1000 + 28 * 11 * 1000;
    const atFullCycle = engine.tick(fullCycleBoundary);
    assert.equal(atFullCycle.stage.id, 'rest');
  });

    it('uses only the reviewed 5.5s pace without mutating library techniques', function () {
      const guidedDefinition = GuidedSessions.getById('unwind-with-sound');
      const originalTechniques = JSON.stringify(TECHNIQUES);
      assert.deepEqual(
        guidedDefinition.paceOptions.map(function (pace) {
          return [pace.id, pace.inhaleSeconds, pace.exhaleSeconds];
        }),
        [['comfortable', 5.5, 5.5]]
      );

      const engine = createEngine(guidedDefinition);
      engine.start(0);
      const snapshot = engine.tick(2 * 60 * 1000);
      assert.equal(snapshot.stage.id, 'breathe');
      assert.equal(snapshot.techniqueSnapshot.phase.durationSeconds, 5.5);
      snapshot.techniqueSnapshot.phase.durationSeconds = 4;
      assert.equal(JSON.stringify(TECHNIQUES), originalTechniques);
    });

  it('recovers predictably after a delayed tick', function () {
    const engine = createEngine(shortSession());
    engine.start(0);
    const snapshot = engine.tick(12500);
    assert.equal(snapshot.stage.id, 'rest');
    assert.equal(snapshot.stageElapsedMs, 500);
  });
});

describe('guided-session-engine controls', function () {
  it('freezes active time while paused and resumes once', function () {
    const engine = createEngine(shortSession());
    engine.start(100);
    assert.equal(engine.pause(600), true);
    assert.equal(engine.pause(700), false);
    assert.equal(engine.tick(5600).sessionElapsedMs, 500);
    assert.equal(engine.resume(5600), true);
    assert.equal(engine.resume(5700), false);
    assert.equal(engine.tick(6099).stage.id, 'arrive');
    assert.equal(engine.tick(6100).stage.id, 'breathe');
  });

  it('skips from arrive or breathe directly to natural-breath rest', function () {
    const fromArrive = createEngine(shortSession());
    fromArrive.start(0);
    let snapshot = fromArrive.skipToRest(400);
    assert.equal(snapshot.stage.id, 'rest');
    assert.equal(snapshot.restEntryReason, 'skipped');
    assert.equal(fromArrive.skipToRest(500), null);

    const fromBreathe = createEngine(shortSession());
    fromBreathe.start(0);
    fromBreathe.tick(1500);
    snapshot = fromBreathe.skipToRest(1800);
    assert.equal(snapshot.stage.id, 'rest');
    assert.equal(snapshot.stageElapsedMs, 0);
    snapshot = fromBreathe.tick(3900);
    assert.equal(snapshot.completed, true);
    assert.deepEqual(snapshot.skippedStageIds, ['breathe']);
    assert.deepEqual(snapshot.completedStageIds, ['arrive', 'rest', 'return']);
  });

  it('stops immediately without completing and ignores duplicate stop', function () {
    const engine = createEngine(shortSession());
    engine.start(0);
    assert.equal(engine.stop(), true);
    assert.equal(engine.stop(), false);
    const snapshot = engine.tick(10000);
    assert.equal(snapshot.stopped, true);
    assert.equal(snapshot.completed, false);
  });
});

describe('Kundalini Foundations guided sequence', function () {
  it('uses the reviewed stage order and excludes Ujjayi and Breath of Fire', function () {
    const definition = GuidedSessions.getById('kundalini-foundations-intro');
    assert.deepEqual(
      definition.stages.map(function (stage) {
        return stage.id;
      }),
      ['kf-arrive', 'kf-dirga', 'kf-equal', 'kf-nadi', 'kf-rest']
    );
    assert.equal(
      definition.stages.some(function (stage) {
        return stage.techniqueId === 'ujjayi' || stage.techniqueId === 'breath-of-fire';
      }),
      false
    );
    assert.equal(definition.ambientAvailable, false);
    assert.equal(definition.reflectionEnabled, false);
    assert.equal(definition.stages[1].instructionDurationMs, 30000);
    assert.equal(definition.stages[1].durationMinutes, 1.5);
  });

  it('uses Dirga guidance and completes Nadi Shodhana on a full no-hold round', function () {
    const engine = createEngine(GuidedSessions.getById('kundalini-foundations-intro'));
    engine.start(0);

    let snapshot = engine.tick(90000);
    assert.equal(snapshot.stage.id, 'kf-dirga');
    assert.equal(snapshot.preparingTechnique, true);
    assert.equal(snapshot.techniqueSnapshot, null);

    snapshot = engine.tick(120000);
    assert.equal(snapshot.techniqueStarted, true);
    assert.equal(snapshot.techniqueSnapshot.guidanceSegment.id, 'belly');

    snapshot = engine.tick(121600);
    assert.equal(snapshot.stage.id, 'kf-dirga');
    assert.equal(snapshot.techniqueSnapshot.phase.type, 'inhale');
    assert.equal(snapshot.techniqueSnapshot.guidanceSegment.id, 'ribs');
    assert.equal(snapshot.techniqueSnapshot.phaseChanged, false);

    snapshot = engine.tick(336000);
    assert.equal(snapshot.stage.id, 'kf-nadi');
    assert.equal(snapshot.preparingTechnique, true);

    snapshot = engine.tick(342000);
    assert.deepEqual(
      snapshot.techniqueSnapshot.phase.type,
      'inhale'
    );

    snapshot = engine.tick(469999);
    assert.equal(snapshot.stage.id, 'kf-nadi');
    assert.equal(snapshot.techniqueSnapshot.phase.type, 'exhale');

    snapshot = engine.tick(470000);
    assert.equal(snapshot.stage.id, 'kf-rest');
  });

  it('freezes active clocks and lets Rest now enter the configured rest stage', function () {
    const engine = createEngine(GuidedSessions.getById('kundalini-foundations-intro'));
    engine.start(1000);
    engine.tick(92000);
    assert.equal(engine.pause(93000), true);
    assert.equal(engine.tick(193000).sessionElapsedMs, 92000);
    assert.equal(engine.resume(193000), true);

    const restSnapshot = engine.skipToRest(194000);
    assert.equal(restSnapshot.stage.id, 'kf-rest');
    assert.equal(restSnapshot.restEntryReason, 'skipped');
    assert.deepEqual(restSnapshot.skippedStageIds, [
      'kf-dirga',
      'kf-equal',
      'kf-nadi'
    ]);
  });

  it('completes once after the natural-breath rest', function () {
    const engine = createEngine(GuidedSessions.getById('kundalini-foundations-intro'));
    engine.start(0);
    const snapshot = engine.tick(590000);
    assert.equal(snapshot.completed, true);
    assert.equal(snapshot.sessionElapsedMs, 590000);
    assert.equal(engine.tick(620000).completed, true);
  });

  it('preserves a technique instruction lead-in across pause and resume', function () {
    const engine = createEngine(GuidedSessions.getById('kundalini-foundations-intro'));
    engine.start(0);
    let snapshot = engine.tick(92000);
    assert.equal(snapshot.preparingTechnique, true);
    assert.equal(snapshot.stageElapsedMs, 2000);

    assert.equal(engine.pause(93000), true);
    assert.equal(engine.tick(193000).stageElapsedMs, 3000);
    assert.equal(engine.resume(193000), true);
    snapshot = engine.tick(220000);
    assert.equal(snapshot.preparingTechnique, false);
    assert.equal(snapshot.techniqueStarted, true);
    assert.equal(snapshot.techniqueSnapshot.phase.type, 'inhale');
    assert.equal(snapshot.techniqueSnapshot.remainingSec, 4.5);
  });

  it('uses a technique default variation when a stage omits variationId', function () {
    const variationTechnique = {
      id: 'variation-fixture',
      durationMode: 'time',
      defaultVariationId: 'default-short',
      phases: [
        { type: 'inhale', durationSeconds: 8 },
        { type: 'exhale', durationSeconds: 8 }
      ],
      variations: [
        {
          id: 'default-short',
          label: 'Default short',
          phases: [
            { type: 'inhale', durationSeconds: 3 },
            { type: 'exhale', durationSeconds: 3 }
          ]
        }
      ]
    };
    const engine = GuidedSessionEngine.createGuidedSessionEngine({
      sessionDefinition: {
        id: 'variation-guided',
        stages: [
          {
            id: 'practice',
            type: 'technique',
            techniqueId: 'variation-fixture',
            durationMinutes: 0.1
          }
        ]
      },
      techniques: [variationTechnique],
      sessionEngine: SessionEngine,
      resolveTechniqueVariation: resolveTechniqueVariation
    });

    const snapshot = engine.start(0);
    assert.equal(snapshot.techniqueSnapshot.phase.durationSeconds, 3);
  });
});
