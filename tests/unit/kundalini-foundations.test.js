const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  TECHNIQUES,
  resolveTechniqueVariation
} = require('../../techniques.js');
const SessionEngine = require('../../session-engine.js');

function getTechnique(techniqueId) {
  return TECHNIQUES.find(function (technique) {
    return technique.id === techniqueId;
  });
}

describe('Kundalini Foundations technique variations', function () {
  it('keeps held Alternate Nostril as the compatibility default', function () {
    const baseTechnique = getTechnique('alternate-nostril');
    const resolved = resolveTechniqueVariation(baseTechnique);

    assert.equal(resolved.selectedVariationId, 'with-holds');
    assert.deepEqual(
      resolved.phases.map(function (phase) {
        return phase.type;
      }),
      ['inhale', 'hold', 'exhale', 'inhale', 'hold', 'exhale']
    );
  });

  it('resolves a cloned no-hold Nadi Shodhana round without mutating the base', function () {
    const baseTechnique = getTechnique('alternate-nostril');
    const original = JSON.stringify(baseTechnique);
    const resolved = resolveTechniqueVariation(baseTechnique, 'no-holds');

    assert.deepEqual(
      resolved.phases.map(function (phase) {
        return [phase.type, phase.nostril];
      }),
      [
        ['inhale', 'left'],
        ['exhale', 'right'],
        ['inhale', 'right'],
        ['exhale', 'left']
      ]
    );
    resolved.phases[0].durationSeconds = 99;
    assert.equal(JSON.stringify(baseTechnique), original);
  });

  it('deep-clones all mutable technique and variation data', function () {
    const baseTechnique = getTechnique('equal-breathing');
    const original = JSON.stringify(baseTechnique);
    const resolved = resolveTechniqueVariation(baseTechnique, 'four-count');

    resolved.goals.push('sleep');
    resolved.durationLimits.presets[0] = 99;
    resolved.instructions.steps[0] = 'Changed';
    resolved.traditionalContext.body = 'Changed';
    resolved.variations[0].label = 'Changed';
    assert.equal(JSON.stringify(baseTechnique), original);
  });

  it('keeps Equal Breathing distinct from Coherent Breathing', function () {
    const equal = resolveTechniqueVariation(getTechnique('equal-breathing'), 'four-count');
    const shorter = resolveTechniqueVariation(getTechnique('equal-breathing'), 'three-count');
    const coherent = getTechnique('coherent');

    assert.deepEqual(
      equal.phases.map(function (phase) {
        return phase.durationSeconds;
      }),
      [4, 4]
    );
    assert.deepEqual(
      shorter.phases.map(function (phase) {
        return phase.durationSeconds;
      }),
      [3, 3]
    );
    assert.deepEqual(
      coherent.phases.map(function (phase) {
        return phase.durationSeconds;
      }),
      [5.5, 5.5]
    );
  });
});

describe('Dirga guidance segments', function () {
  it('advances body-awareness guidance without restarting the inhale', function () {
    const technique = resolveTechniqueVariation(getTechnique('dirga'));
    const engine = SessionEngine.createSessionEngine({
      technique: technique,
      durationMinutes: 1
    });

    let snapshot = engine.start(0);
    assert.equal(snapshot.phase.type, 'inhale');
    assert.equal(snapshot.guidanceSegment.id, 'belly');
    assert.equal(snapshot.phaseChanged, true);
    assert.equal(snapshot.guidanceChanged, true);

    snapshot = engine.tick(1600);
    assert.equal(snapshot.phase.type, 'inhale');
    assert.equal(snapshot.phaseChanged, false);
    assert.equal(snapshot.guidanceSegment.id, 'ribs');
    assert.equal(snapshot.guidanceChanged, true);

    snapshot = engine.tick(1700);
    assert.equal(snapshot.phaseChanged, false);
    assert.equal(snapshot.guidanceSegment.id, 'ribs');
    assert.equal(snapshot.guidanceChanged, false);

    snapshot = engine.tick(3100);
    assert.equal(snapshot.phase.type, 'inhale');
    assert.equal(snapshot.guidanceSegment.id, 'upper-chest');
    assert.equal(snapshot.phaseChanged, false);

    snapshot = engine.tick(4500);
    assert.equal(snapshot.phase.type, 'exhale');
    assert.equal(snapshot.guidanceSegment.id, 'easy-wave');
    assert.equal(snapshot.phaseChanged, true);
  });
});

describe('Ujjayi release gate', function () {
  it('provides no-hold practice while reporting the missing human demo', function () {
    const ujjayi = getTechnique('ujjayi');
    assert.equal(ujjayi.demoRequired, true);
    assert.equal(ujjayi.demoAssetPath, null);
    assert.equal(
      ujjayi.phases.some(function (phase) {
        return phase.type === 'hold';
      }),
      false
    );
  });
});
