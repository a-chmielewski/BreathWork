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

const KUNDALINI_FOUNDATIONS_REVIEW = {
  lastReviewed: '2026-09-07',
  reviewSource:
    'Terminology, traditional context, and safety boundaries are documented in docs/kundalini-foundations-research.md. Qualified instructor and clinical sign-off remain pending.',
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
    name: 'Alternate Nostril Breathing (Nadi Shodhana)',
    shortDescription: 'Mental clarity, emotional balance, midday reset',
    goals: ['focus', 'calm'],
    intensity: 'gentle',
    contentReview: { ...KUNDALINI_FOUNDATIONS_REVIEW },
    durationMode: 'time',
    durationLimits: { min: 3, max: 15, presets: [5, 10, 15] },
    nostrilPhases: true,
    collectionId: 'kundalini-foundations',
    defaultVariationId: 'with-holds',
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
    ],
    variations: [
      {
        id: 'with-holds',
        label: 'With gentle holds'
      },
      {
        id: 'no-holds',
        label: 'No holds',
        metadata: { includesHolds: false, beginnerFriendly: true },
        instructions: {
          steps: [
            'Use your right thumb to gently close your right nostril.',
            'Inhale through the left nostril, then switch and exhale through the right.',
            'Inhale through the right nostril, then switch and exhale through the left.',
            'Continue smoothly without pausing. This completes one round.',
            'Use the on-screen side cues, or follow them without using your hand if your nose or hand is uncomfortable.'
          ],
          phaseSequence: 'Left inhale → Right exhale → Right inhale → Left exhale',
          notes:
            'No breath holds. Never force air through a blocked nostril; use the hands-free visualization or return to natural breathing.'
        },
        phases: [
          { type: 'inhale', durationSeconds: 4, label: 'Left – Inhale', nostril: 'left' },
          { type: 'exhale', durationSeconds: 4, label: 'Right – Exhale', nostril: 'right' },
          { type: 'inhale', durationSeconds: 4, label: 'Right – Inhale', nostril: 'right' },
          { type: 'exhale', durationSeconds: 4, label: 'Left – Exhale', nostril: 'left' }
        ]
      }
    ],
    traditionalContext: {
      sourceName: 'Kripalu — Pranayama for Self-Soothing',
      sourceUrl:
        'https://kripalu.org/living-kripalu/pranayama-self-soothing-3-yogic-breathing-practices-cultivate-peace',
      body:
        'Yoga traditions describe nadis as subtle channels and nadi shodhana as a channel-clearing practice. This is an attributed traditional framework, not anatomy or a medical claim.'
    }
  },
  {
    id: 'equal-breathing',
    name: 'Equal Breathing (Sama Vritti)',
    shortDescription: 'A comfortable equal inhale and exhale with no holds',
    goals: ['calm', 'focus'],
    intensity: 'gentle',
    contentReview: { ...KUNDALINI_FOUNDATIONS_REVIEW },
    collectionId: 'kundalini-foundations',
    durationMode: 'time',
    durationLimits: { min: 3, max: 15, presets: [3, 5, 10] },
    defaultVariationId: 'four-count',
    metadata: {
      beginnerFriendly: true,
      pace: 'slow',
      includesHolds: false,
      typicalSession: '3–10 min',
      nasalControl: false
    },
    instructions: {
      posture: 'Sit or lie down with your jaw, shoulders, and belly relaxed.',
      steps: [
        'Inhale gently for the selected count.',
        'Exhale for the same count, without holding after either phase.',
        'Keep both transitions smooth and the breath volume comfortable.',
        'Shorten the count or return to natural breathing whenever you need.'
      ],
      phaseSequence: 'Equal inhale → Equal exhale · No holds',
      sensations: 'A simple, even rhythm with no pause to maintain.',
      notes:
        'Equal Breathing describes a 1:1 ratio. It remains distinct from rate-defined Coherent Breathing.'
    },
    phases: [
      { type: 'inhale', durationSeconds: 4, label: 'Inhale' },
      { type: 'exhale', durationSeconds: 4, label: 'Exhale' }
    ],
    variations: [
      { id: 'four-count', label: '4 in / 4 out' },
      {
        id: 'three-count',
        label: '3 in / 3 out',
        phases: [
          { type: 'inhale', durationSeconds: 3, label: 'Inhale' },
          { type: 'exhale', durationSeconds: 3, label: 'Exhale' }
        ]
      }
    ],
    traditionalContext: {
      sourceName: 'Kripalu — Pranayama for Self-Soothing',
      sourceUrl:
        'https://kripalu.org/living-kripalu/pranayama-self-soothing-3-yogic-breathing-practices-cultivate-peace',
      body:
        'Sama vritti is used inconsistently across modern yoga teaching. Here it means equal, comfortable inhale and exhale with no holds; this definition is stated rather than assumed.'
    }
  },
  {
    id: 'dirga',
    name: 'Dirga (Three-Part Breath)',
    shortDescription: 'One smooth breath with gentle belly, rib, and upper-chest awareness',
    goals: ['calm', 'focus'],
    intensity: 'gentle',
    contentReview: { ...KUNDALINI_FOUNDATIONS_REVIEW },
    collectionId: 'kundalini-foundations',
    durationMode: 'time',
    durationLimits: { min: 3, max: 15, presets: [3, 5, 10] },
    metadata: {
      beginnerFriendly: true,
      pace: 'slow',
      includesHolds: false,
      typicalSession: '3–10 min',
      nasalControl: false
    },
    instructions: {
      posture: 'Sit or lie down with room for your belly and lower ribs to move comfortably.',
      steps: [
        'Begin one gentle inhale and notice the belly soften outward.',
        'Continue the same inhale as the lower ribs widen.',
        'Let the upper chest receive the end of that same smooth breath without lifting the shoulders.',
        'Exhale in one easy wave. Do not add a second sip of air.',
        'Omit the upper-chest emphasis or return to natural breathing if the breath feels strained.'
      ],
      phaseSequence: 'One smooth inhale: belly → ribs → upper chest · One easy exhale',
      sensations: 'A continuous wave of movement awareness rather than three separate breaths.',
      notes:
        'Air remains in the lungs; the belly cue describes movement. This is not a forceful three-part inhale or a physiological sigh.'
    },
    phases: [
      {
        type: 'inhale',
        durationSeconds: 4.5,
        label: 'Inhale smoothly',
        guidanceSegments: [
          { id: 'belly', at: 0, label: 'Notice the belly soften outward' },
          { id: 'ribs', at: 0.333, label: 'Let the lower ribs widen' },
          { id: 'upper-chest', at: 0.666, label: 'Let the upper chest receive the breath' }
        ]
      },
      {
        type: 'exhale',
        durationSeconds: 4.5,
        label: 'Exhale smoothly',
        guidanceSegments: [{ id: 'easy-wave', at: 0, label: 'Release in one easy wave' }]
      }
    ],
    traditionalContext: {
      sourceName: 'Kripalu — How to Do Three-Part Breath',
      sourceUrl:
        'https://kripalu.org/living-kripalu/how-do-three-part-breath-dirgha-pranayama',
      body:
        'Modern yoga teaching describes a sequential awareness of belly movement, ribs, and upper chest blended into one wave-like breath. This is traditional context, not a claim that air enters the belly.'
    }
  },
  {
    id: 'ujjayi',
    name: 'Ujjayi Breath',
    shortDescription: 'A soft nasal breath with a quiet, steady throat sound',
    goals: ['calm', 'focus'],
    intensity: 'gentle',
    contentReview: { ...KUNDALINI_FOUNDATIONS_REVIEW },
    collectionId: 'kundalini-foundations',
    durationMode: 'time',
    durationLimits: { min: 3, max: 15, presets: [3, 5, 10] },
    demoRequired: true,
    demoAssetPath: null,
    metadata: {
      beginnerFriendly: true,
      pace: 'slow',
      includesHolds: false,
      typicalSession: '3–10 min',
      nasalControl: true
    },
    instructions: {
      posture: 'Sit comfortably with your jaw, throat, neck, and shoulders relaxed.',
      steps: [
        'With your mouth open, exhale softly as if fogging a mirror without forcing.',
        'Keep that very light throat narrowing, close your mouth, and breathe through your nose.',
        'Let the inhale and exhale make a quiet, even sound that is mainly audible to you.',
        'Keep the breath smooth with no holds and no need to make it deep or loud.',
        'Release the throat shaping and breathe naturally if you feel pain, strain, air hunger, or dizziness.'
      ],
      phaseSequence: 'Quiet nasal inhale → Quiet nasal exhale · No holds',
      sensations: 'A gentle, continuous breath sound without throat pressure.',
      notes:
        'The demonstration recording is not installed yet. Written and visual guidance remains available; do not imitate a harsh or theatrical sound.'
    },
    phases: [
      { type: 'inhale', durationSeconds: 4, label: 'Quiet sounding inhale' },
      { type: 'exhale', durationSeconds: 4, label: 'Quiet sounding exhale' }
    ],
    traditionalContext: {
      sourceName: 'Yoga International — Ujjayi Pranayama: Victory Breath',
      sourceUrl:
        'https://yogainternational.com/article/view/ujjayi-pranayama-victory-breath/',
      body:
        'The app uses a modern introductory, two-nostril form without retention. Historical Ujjayi descriptions may include retention and a different exhalation pattern.'
    }
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

function cloneTechniqueData(value) {
  if (Array.isArray(value)) {
    return value.map(function (item) {
      return cloneTechniqueData(item);
    });
  }
  if (value && typeof value === 'object') {
    return Object.keys(value).reduce(function (clone, key) {
      clone[key] = cloneTechniqueData(value[key]);
      return clone;
    }, {});
  }
  return value;
}

function resolveTechniqueVariation(technique, variationId) {
  if (!technique) return null;
  var variations = Array.isArray(technique.variations) ? technique.variations : [];
  var selected =
    variations.find(function (variation) {
      return variation.id === variationId;
    }) ||
    variations.find(function (variation) {
      return variation.id === technique.defaultVariationId;
    }) ||
    null;
  var resolved = cloneTechniqueData(technique);
  if (!selected) return resolved;

  var selectedData = cloneTechniqueData(selected);
  resolved.selectedVariationId = selectedData.id;
  resolved.selectedVariationLabel = selectedData.label;
  if (selectedData.metadata) {
    resolved.metadata = Object.assign({}, resolved.metadata, selectedData.metadata);
  }
  if (selectedData.instructions) {
    resolved.instructions = Object.assign({}, resolved.instructions, selectedData.instructions);
  }
  if (selectedData.phases) {
    resolved.phases = selectedData.phases;
  }
  return resolved;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    TECHNIQUES,
    CONTENT_REVIEW_DEFAULT,
    KUNDALINI_FOUNDATIONS_REVIEW,
    resolveTechniqueVariation
  };
}
