/**
 * Breathwork technique definitions.
 * Phases: { type: 'inhale'|'exhale'|'hold'|'inhale2', durationSeconds, label?, nostril? }
 * inhale2 = second inhale (physiological sigh).
 */

const TECHNIQUES = [
  {
    id: 'box',
    name: 'Box Breathing',
    shortDescription: 'Acute stress, pre-meeting nerves, staying calm under pressure, resetting between tasks',
    durationMode: 'time',
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
    shortDescription: 'Falling asleep, anxiety at night, overthinking',
    durationMode: 'time',
    phases: [
      { type: 'inhale', durationSeconds: 4, label: 'Inhale' },
      { type: 'hold', durationSeconds: 7, label: 'Hold' },
      { type: 'exhale', durationSeconds: 8, label: 'Exhale' }
    ]
  },
  {
    id: 'physiological-sigh',
    name: 'Physiological Sigh',
    shortDescription: 'Immediate stress spike, panic wave, emotional overload',
    durationMode: 'rounds',
    roundsOptions: [3, 5, 8],
    phases: [
      { type: 'inhale', durationSeconds: 2, label: 'Inhale', sighSegment: 0.5 },
      { type: 'inhale2', durationSeconds: 2, label: 'Inhale again', sighSegment: 0.5 },
      { type: 'exhale', durationSeconds: 6, label: 'Exhale slowly' }
    ]
  },
  {
    id: 'wim-hof',
    name: 'Wim Hof Method',
    shortDescription: 'Energy boost, mental toughness, cold exposure prep, breaking lethargy',
    durationMode: 'rounds',
    roundsOptions: [3, 4, 5],
    tapToContinueHold: true,
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
    shortDescription: 'Daily nervous system regulation, burnout, long-term stress, HRV improvements',
    durationMode: 'time',
    phases: [
      { type: 'inhale', durationSeconds: 5.5, label: 'Inhale' },
      { type: 'exhale', durationSeconds: 5.5, label: 'Exhale' }
    ]
  },
  {
    id: 'alternate-nostril',
    name: 'Alternate Nostril Breathing',
    shortDescription: 'Mental clarity, emotional balance, midday reset',
    durationMode: 'time',
    nostrilPhases: true,
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
    shortDescription: 'Low energy, sluggish morning, before workout',
    durationMode: 'rounds',
    roundsOptions: [3, 4, 5],
    tapToContinueHold: true,
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
