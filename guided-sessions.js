/**
 * Guided session definitions.
 * Timings are editorial product choices, not medical protocols.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = api;
  } else {
    root.GuidedSessions = api;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  var BRIEF_TECHNIQUE_INSTRUCTION_MS = 6 * 1000;
  var DIRGA_AWARENESS_MS = 30 * 1000;
  var GUIDED_SESSIONS = [
    {
      id: 'unwind-with-sound',
      titleKey: 'guided.unwind.title',
      descriptionKey: 'guided.unwind.description',
      durationLabelKey: 'guided.unwind.duration',
      intensity: 'gentle',
      collectionId: 'breath-and-sound',
      reflectionEnabled: true,
      restStageId: 'rest',
      ambientAvailable: true,
      ambientAssetPath: 'assets/audio/unwind-ambient.m4a',
      ambientStageIds: ['rest'],
      skipToRestVisibleBeforeStageIds: ['arrive', 'breathe'],
      metaLabelKeys: ['guided.noHolds', 'guided.unpacedRest', 'guided.cueAvailability'],
      defaultPaceId: 'comfortable',
      paceOptions: [
        {
          id: 'comfortable',
          labelKey: 'guided.paceComfortable',
          inhaleSeconds: 5.5,
          exhaleSeconds: 5.5
        }
      ],
      stages: [
        {
          id: 'arrive',
          type: 'timer',
          durationMs: 2 * 60 * 1000,
          titleKey: 'guided.stages.arrive.title',
          promptKey: 'guided.stages.arrive.prompt'
        },
        {
          id: 'breathe',
          type: 'technique',
          techniqueId: 'coherent',
          paceId: 'comfortable',
          durationMinutes: 5,
          titleKey: 'guided.stages.breathe.title',
          promptKey: 'guided.stages.breathe.prompt'
        },
        {
          id: 'rest',
          type: 'timer',
          durationMs: 7 * 60 * 1000,
          titleKey: 'guided.stages.rest.title',
          promptKey: 'guided.stages.rest.prompt',
          naturalBreathing: true
        },
        {
          id: 'return',
          type: 'timer',
          durationMs: 60 * 1000,
          titleKey: 'guided.stages.return.title',
          promptKey: 'guided.stages.return.prompt'
        }
      ]
    },
    {
      id: 'kundalini-foundations-intro',
      titleKey: 'guided.kundaliniIntro.title',
      descriptionKey: 'guided.kundaliniIntro.description',
      durationLabelKey: 'guided.kundaliniIntro.duration',
      intensity: 'gentle',
      collectionId: 'kundalini-foundations',
      reflectionEnabled: false,
      restStageId: 'kf-rest',
      ambientAvailable: false,
      ambientAssetPath: null,
      ambientStageIds: [],
      skipToRestVisibleBeforeStageIds: ['kf-arrive', 'kf-dirga', 'kf-equal', 'kf-nadi'],
      metaLabelKeys: [
        'guided.kundaliniIntro.editorialSequence',
        'guided.kundaliniIntro.noHoldSequence',
        'guided.unpacedRest'
      ],
      stages: [
        {
          id: 'kf-arrive',
          type: 'timer',
          durationMs: 90 * 1000,
          titleKey: 'guided.kundaliniIntro.stages.arrive.title',
          durationLabelKey: 'guided.kundaliniIntro.stages.arrive.duration',
          promptKey: 'guided.kundaliniIntro.stages.arrive.prompt'
        },
        {
          id: 'kf-dirga',
          type: 'technique',
          techniqueId: 'dirga',
          instructionDurationMs: DIRGA_AWARENESS_MS,
          instructionPromptKey: 'guided.kundaliniIntro.stages.dirga.instructionPrompt',
          durationMinutes: 1.5,
          titleKey: 'guided.kundaliniIntro.stages.dirga.title',
          durationLabelKey: 'guided.kundaliniIntro.stages.dirga.duration',
          promptKey: 'guided.kundaliniIntro.stages.dirga.prompt'
        },
        {
          id: 'kf-equal',
          type: 'technique',
          techniqueId: 'equal-breathing',
          variationId: 'four-count',
          instructionDurationMs: BRIEF_TECHNIQUE_INSTRUCTION_MS,
          instructionPromptKey: 'guided.kundaliniIntro.stages.equal.instructionPrompt',
          durationMinutes: 2,
          titleKey: 'guided.kundaliniIntro.stages.equal.title',
          durationLabelKey: 'guided.kundaliniIntro.stages.equal.duration',
          promptKey: 'guided.kundaliniIntro.stages.equal.prompt'
        },
        {
          id: 'kf-nadi',
          type: 'technique',
          techniqueId: 'alternate-nostril',
          variationId: 'no-holds',
          instructionDurationMs: BRIEF_TECHNIQUE_INSTRUCTION_MS,
          instructionPromptKey: 'guided.kundaliniIntro.stages.nadi.instructionPrompt',
          durationMinutes: 2,
          titleKey: 'guided.kundaliniIntro.stages.nadi.title',
          durationLabelKey: 'guided.kundaliniIntro.stages.nadi.duration',
          promptKey: 'guided.kundaliniIntro.stages.nadi.prompt'
        },
        {
          id: 'kf-rest',
          type: 'timer',
          durationMs: 2 * 60 * 1000,
          titleKey: 'guided.kundaliniIntro.stages.rest.title',
          durationLabelKey: 'guided.kundaliniIntro.stages.rest.duration',
          promptKey: 'guided.kundaliniIntro.stages.rest.prompt',
          naturalBreathing: true
        }
      ]
    }
  ];

  function getById(sessionId) {
    return (
      GUIDED_SESSIONS.find(function (session) {
        return session.id === sessionId;
      }) || null
    );
  }

  return {
    GUIDED_SESSIONS: GUIDED_SESSIONS,
    getById: getById
  };
});
