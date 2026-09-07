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
  var GUIDED_SESSIONS = [
    {
      id: 'unwind-with-sound',
      titleKey: 'guided.unwind.title',
      descriptionKey: 'guided.unwind.description',
      durationLabelKey: 'guided.unwind.duration',
      intensity: 'gentle',
      ambientAvailable: true,
      ambientAssetPath: 'assets/audio/unwind-ambient.m4a',
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
