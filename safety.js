/**
 * Safety guidance and acknowledgement helpers.
 * Wellness copy only — not medical advice. Pending qualified expert sign-off.
 */

const SAFETY = {
  ackStorageKey: 'breathwork_safety_ack_v1',
  highIntensityIds: ['wim-hof', 'bhastrika'],

  wellnessDisclaimer:
    'Breathwork is a wellness practice, not medical treatment. This app does not diagnose, treat, or prevent any condition. Consult a qualified clinician before starting if you have health concerns.',

  globalGuidance: [
    'Practice seated or lying down in a safe, comfortable place.',
    'Do not practice in or near water, in the shower, or while driving or operating machinery.',
    'Never force a breath or hold. Breathe and release at a pace that feels manageable.',
    'Stop and rest if you feel dizzy, lightheaded, tingling, nausea, or discomfort.'
  ],

  highIntensityExtra: [
    'High-intensity techniques use rapid breathing and breath holds. They are not suitable for everyone.',
    'Do not practice if you are pregnant, or if you have epilepsy, cardiovascular disease, high blood pressure, glaucoma, a history of panic attacks, or other serious health conditions, unless a qualified clinician has cleared you.',
    'Consult a qualified clinician before your first session if you are unsure whether these techniques are appropriate for you.'
  ],

  techniqueWarnings: {
    'wim-hof': {
      title: 'Wim Hof–style breathing',
      points: [
        'Uses rapid deep breaths followed by a breath hold after exhaling, then a recovery inhale and hold.',
        'Official Wim Hof guidance advises against practicing in water, in the shower, or while driving.',
        'This app is inspired by breathing exercises popularized by Wim Hof. It is not affiliated with or endorsed by Wim Hof Method.',
        'Stop immediately if you feel faint, tingly, or unwell. Resume normal breathing and rest.'
      ],
      attribution: 'Wim Hof Method is a registered approach; use of the name here is descriptive only.'
    },
    bhastrika: {
      title: 'Bhastrika (bellows breath)',
      points: [
        'Uses rapid, forceful inhales and exhales followed by a breath hold.',
        'Can raise alertness quickly but may also cause dizziness or lightheadedness.',
        'Not recommended during pregnancy or with epilepsy, heart or lung conditions, high blood pressure, or recent surgery unless cleared by a clinician.',
        'Stop immediately if you feel faint or unwell. Return to normal breathing and rest.'
      ]
    }
  },

  isHighIntensity(technique) {
    return technique && SAFETY.highIntensityIds.indexOf(technique.id) !== -1;
  },

  hasAcknowledged() {
    try {
      return localStorage.getItem(SAFETY.ackStorageKey) === '1';
    } catch (_) {
      return false;
    }
  },

  setAcknowledged() {
    try {
      localStorage.setItem(SAFETY.ackStorageKey, '1');
    } catch (_) {}
  },

  getTechniqueWarning(techniqueId) {
    return SAFETY.techniqueWarnings[techniqueId] || null;
  }
};
