/**
 * Breathwork technique definitions.
 * Phases: { type: 'inhale'|'exhale'|'hold'|'inhale2', durationSeconds, label?, nostril? }
 *
 * contentReview metadata documents sources used during initial review.
 * Qualified expert sign-off is still pending before public release.
 */

const CONTENT_REVIEW_DEFAULT = {
  lastReviewed: '2026-07-14',
  reviewSource:
    'Phase timing aligned with common practice patterns; safety wording informed by Wim Hof Method FAQ, CUH NHS breathing guidance, and IMPROVEMENTS.md references. Pending qualified expert sign-off.',
  wellnessNote: 'Wellness practice only — not medical treatment.'
};

const TECHNIQUES = [
  {
    id: 'box',
    name: 'Box Breathing',
    shortDescription: 'Acute stress, pre-meeting calm, resetting between tasks',
    goals: ['calm', 'focus'],
    intensity: 'gentle',
    contentReview: { ...CONTENT_REVIEW_DEFAULT },
    durationMode: 'time',
    durationLimits: { min: 3, max: 20, presets: [5, 10, 15] },
    metadata: {
      beginnerFriendly: true,
      pace: 'slow',
      includesHolds: true,
      typicalSession: '5–15 min',
      nasalControl: false
    },
    instructions: {
      posture: 'Sit upright with back supported, shoulders relaxed, and feet flat on the floor.',
      steps: [
        'Breathe in slowly through your nose for four counts.',
        'Hold the breath gently for four counts — do not strain.',
        'Exhale smoothly through your nose or mouth for four counts.',
        'Hold with lungs empty for four counts, then repeat.'
      ],
      phaseSequence: 'Inhale 4s → Hold 4s → Exhale 4s → Hold empty 4s',
      sensations: 'A steady, grounding rhythm that can help settle a racing mind.',
      notes: 'Keep each phase comfortable. Shorten counts if four seconds feels too long.'
    },
    phases: [
      { type: 'inhale', durationSeconds: 4, label: 'Inhale' },
      { type: 'hold', durationSeconds: 4, label: 'Hold' },
      { type: 'exhale', durationSeconds: 4, label: 'Exhale' },
      { type: 'hold', durationSeconds: 4, label: 'Hold' }
    ]
  },
  {
    id: '4-7-8',
    name: '4-7-8 Breathing',
    shortDescription: 'Falling asleep, nighttime calm, quieting an active mind',
    goals: ['sleep', 'calm'],
    intensity: 'gentle',
    contentReview: { ...CONTENT_REVIEW_DEFAULT },
    durationMode: 'time',
    durationLimits: { min: 3, max: 15, presets: [5, 10, 15] },
    metadata: {
      beginnerFriendly: true,
      pace: 'slow',
      includesHolds: true,
      typicalSession: '5–15 min',
      nasalControl: false
    },
    instructions: {
      posture: 'Sit or lie down comfortably. Place the tip of your tongue behind your upper front teeth if that feels natural.',
      steps: [
        'Exhale completely through your mouth with a soft whoosh.',
        'Close your mouth and inhale quietly through your nose for four counts.',
        'Hold the breath for seven counts without tensing your body.',
        'Exhale fully through your mouth for eight counts, then repeat the cycle.'
      ],
      phaseSequence: 'Inhale 4s → Hold 7s → Exhale 8s',
      sensations: 'A slowing pace that many people find helpful before sleep.',
      notes: 'The exhale is longer than the inhale. Never force the hold.'
    },
    phases: [
      { type: 'inhale', durationSeconds: 4, label: 'Inhale' },
      { type: 'hold', durationSeconds: 7, label: 'Hold' },
      { type: 'exhale', durationSeconds: 8, label: 'Exhale' }
    ]
  },
  {
    id: 'physiological-sigh',
    name: 'Physiological Sigh',
    shortDescription: 'Sudden stress, emotional overwhelm, quick nervous-system reset',
    goals: ['calm', 'focus'],
    intensity: 'moderate',
    contentReview: {
      ...CONTENT_REVIEW_DEFAULT,
      reviewSource:
        'Two-part inhale followed by extended exhale per common physiological-sigh descriptions (e.g. Stanford stress-reset research summaries). Pending qualified expert sign-off.'
    },
    durationMode: 'rounds',
    roundsOptions: [3, 5, 8],
    roundsLimits: { min: 1, max: 10, presets: [3, 5, 8] },
    metadata: {
      beginnerFriendly: true,
      pace: 'moderate',
      includesHolds: false,
      typicalSession: '1–3 min (3–8 rounds)',
      nasalControl: false
    },
    instructions: {
      posture: 'Sit or stand comfortably. Relax your jaw and shoulders.',
      steps: [
        'Take a full inhale through your nose until your lungs feel mostly full.',
        'Without exhaling, take a second, shorter sip of air through your nose to fully expand the lungs.',
        'Exhale slowly and completely through your mouth until empty.',
        'Pause briefly, then repeat for the chosen number of rounds.'
      ],
      phaseSequence: 'Inhale → Second inhale → Long exhale',
      sensations: 'A quick reset — often one to three rounds is enough.',
      notes: 'The second inhale is short and gentle, not a forceful gulp of air.'
    },
    phases: [
      { type: 'inhale', durationSeconds: 2, label: 'Inhale', sighSegment: 0.5 },
      { type: 'inhale2', durationSeconds: 2, label: 'Inhale again', sighSegment: 0.5 },
      { type: 'exhale', durationSeconds: 6, label: 'Exhale slowly' }
    ]
  },
  {
    id: 'wim-hof',
    name: 'Wim Hof Method',
    shortDescription: 'Invigorating breathwork, alertness, energizing when sluggish',
    goals: ['energizing'],
    intensity: 'intense',
    contentReview: {
      lastReviewed: '2026-07-14',
      reviewSource:
        'Round structure (30 breaths, exhale hold, recovery inhale hold) aligned with common Wim Hof practice descriptions and official FAQ safety notes. Name used descriptively; not affiliated with Wim Hof Method. Pending qualified expert sign-off.',
      wellnessNote: 'Wellness practice only — not medical treatment.'
    },
    durationMode: 'rounds',
    roundsOptions: [3, 4, 5],
    roundsLimits: { min: 1, max: 5, presets: [3, 4, 5] },
    tapToContinueHold: true,
    metadata: {
      beginnerFriendly: false,
      pace: 'rapid',
      includesHolds: true,
      typicalSession: '10–20 min (3–5 rounds)',
      nasalControl: false
    },
    instructions: {
      posture: 'Sit or lie down in a safe place — never in water, a shower, or while driving.',
      steps: [
        'Take 30 deep breaths: full inhale, relaxed exhale — follow the rapid rhythm in the app.',
        'After the 30th exhale, let your lungs stay empty and hold until you need to breathe.',
        'Tap "I need to breathe" when ready, then take a deep recovery inhale and hold for about 15 seconds.',
        'Exhale and rest briefly before the next round.'
      ],
      phaseSequence: '30 breaths → Exhale hold (tap when ready) → Recovery inhale + hold',
      sensations: 'Tingling, lightheadedness, or warmth are common. Stop if you feel unwell.',
      notes: 'Practice seated or lying down only. Read all safety information before starting.'
    },
    phases: [
      { type: 'inhale', durationSeconds: 1.5, label: 'Inhale' },
      { type: 'exhale', durationSeconds: 1.5, label: 'Release' }
    ],
    breathsPerRound: 30,
    holdAfterExhaleLabel: 'Hold (exhale)',
    inhaleHoldSeconds: 15,
    inhaleHoldLabel: 'Inhale and hold'
  },
  {
    id: 'coherent',
    name: 'Coherent Breathing',
    shortDescription: 'Daily calm, steady rhythm, ongoing stress relief',
    goals: ['calm'],
    intensity: 'gentle',
    contentReview: { ...CONTENT_REVIEW_DEFAULT },
    durationMode: 'time',
    durationLimits: { min: 5, max: 20, presets: [5, 10, 15] },
    metadata: {
      beginnerFriendly: true,
      pace: 'slow',
      includesHolds: false,
      typicalSession: '10–20 min',
      nasalControl: false
    },
    instructions: {
      posture: 'Sit comfortably with an easy, upright posture.',
      steps: [
        'Breathe in through your nose for about five and a half seconds.',
        'Breathe out through your nose for about five and a half seconds.',
        'Keep the rhythm smooth with no pause between inhale and exhale.',
        'Let your belly and chest move naturally — do not force volume.'
      ],
      phaseSequence: 'Inhale 5.5s → Exhale 5.5s',
      sensations: 'A smooth, even wave of breath that supports daily calm.',
      notes: 'Aim for comfort over precision — the app timing is a gentle guide.'
    },
    phases: [
      { type: 'inhale', durationSeconds: 5.5, label: 'Inhale' },
      { type: 'exhale', durationSeconds: 5.5, label: 'Exhale' }
    ]
  },
  {
    id: 'alternate-nostril',
    name: 'Alternate Nostril Breathing',
    shortDescription: 'Mental clarity, emotional balance, midday reset',
    goals: ['focus', 'calm'],
    intensity: 'gentle',
    contentReview: { ...CONTENT_REVIEW_DEFAULT },
    durationMode: 'time',
    durationLimits: { min: 3, max: 15, presets: [5, 10, 15] },
    nostrilPhases: true,
    metadata: {
      beginnerFriendly: false,
      pace: 'slow',
      includesHolds: true,
      typicalSession: '5–10 min',
      nasalControl: true
    },
    instructions: {
      posture: 'Sit tall with your left hand resting on your knee. Bring your right hand to your nose.',
      steps: [
        'Use your right thumb to gently close your right nostril.',
        'Inhale slowly through the left nostril.',
        'Close both nostrils briefly with thumb and ring finger, then release the right nostril and exhale through the right.',
        'Inhale through the right nostril, close both, then exhale through the left. This completes one round.',
        'The app labels each phase — follow the nostril cues on screen.'
      ],
      phaseSequence: 'Left inhale → Hold → Right exhale → Right inhale → Hold → Left exhale',
      sensations: 'Balanced, focused breathing. Nasal control is required for this technique.',
      notes: 'Use light pressure on the nostrils — never block so hard that it hurts.'
    },
    phases: [
      { type: 'inhale', durationSeconds: 4, label: 'Left – Inhale', nostril: 'left' },
      { type: 'hold', durationSeconds: 4, label: 'Hold' },
      { type: 'exhale', durationSeconds: 4, label: 'Right – Exhale', nostril: 'right' },
      { type: 'inhale', durationSeconds: 4, label: 'Right – Inhale', nostril: 'right' },
      { type: 'hold', durationSeconds: 4, label: 'Hold' },
      { type: 'exhale', durationSeconds: 4, label: 'Left – Exhale', nostril: 'left' }
    ]
  },
  {
    id: 'bhastrika',
    name: 'Bhastrika',
    shortDescription: 'Low energy, sluggish morning, before physical activity',
    goals: ['energizing'],
    intensity: 'intense',
    contentReview: {
      lastReviewed: '2026-07-14',
      reviewSource:
        'Rapid bellows-breath sequence with post-round holds per common yoga descriptions. High-intensity safety notes pending qualified expert sign-off.',
      wellnessNote: 'Wellness practice only — not medical treatment.'
    },
    durationMode: 'rounds',
    roundsOptions: [3, 4, 5],
    roundsLimits: { min: 1, max: 5, presets: [3, 4, 5] },
    tapToContinueHold: true,
    metadata: {
      beginnerFriendly: false,
      pace: 'rapid',
      includesHolds: true,
      typicalSession: '5–15 min (3–5 rounds)',
      nasalControl: true
    },
    instructions: {
      posture: 'Sit upright with a stable base. Keep your spine tall and belly free to move.',
      steps: [
        'Take rapid, forceful breaths through the nose: active inhale and active exhale — like a bellows.',
        'Complete 30 breaths per round at the app rhythm.',
        'After the last exhale, hold with lungs empty until you need air, then tap to continue.',
        'Take a recovery inhale and hold, then rest before the next round.'
      ],
      phaseSequence: '30 rapid breaths → Exhale hold (tap) → Recovery inhale + hold',
      sensations: 'Heat, tingling, or energy are common. Stop immediately if dizzy or nauseous.',
      notes: 'Not for beginners or anyone with cardiovascular, respiratory, or pregnancy concerns.'
    },
    phases: [
      { type: 'inhale', durationSeconds: 0.5, label: 'Inhale' },
      { type: 'exhale', durationSeconds: 0.5, label: 'Exhale' }
    ],
    breathsPerRound: 30,
    holdAfterExhaleLabel: 'Hold',
    inhaleHoldSeconds: 15,
    inhaleHoldLabel: 'Inhale and hold'
  }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TECHNIQUES, CONTENT_REVIEW_DEFAULT };
}
