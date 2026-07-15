/** English locale — default messages for Breathwork. */
var I18N_EN = {
  app: {
    title: 'Breathwork',
    loading: 'Loading…'
  },
  update: {
    available: 'A new version is available!',
    reload: 'Update now',
    notice: 'Updated to v{version}.'
  },
  install: {
    hint: 'Install on iPhone: tap <strong>Share</strong> → <strong>Add to Home Screen</strong>.',
    dismiss: 'Dismiss'
  },
  list: {
    intro:
      'Choose a guided breathing technique. Each session includes timing cues you can follow with eyes closed.',
    continueLast: 'Continue with last settings',
    history: 'History',
    settings: 'Settings',
    safetyNotice:
      'Practice seated or lying down. Never force a breath or hold. Stop and rest if you feel dizzy or lightheaded.',
    safetyInfo: 'Safety information',
    filterTechniques: 'Filter techniques',
    filterGoal: 'Filter by goal',
    filterIntensity: 'Filter by intensity'
  },
  goal: {
    all: 'All',
    favorites: 'Favorites',
    calm: 'Calm',
    sleep: 'Sleep',
    focus: 'Focus',
    energizing: 'Energizing'
  },
  intensity: {
    all: 'All levels',
    gentle: 'Gentle',
    moderate: 'Moderate',
    intense: 'Intense'
  },
  theme: {
    system: 'System (dark)',
    dark: 'Dark',
    warm: 'Warm',
    highContrast: 'High contrast'
  },
  detail: {
    backAria: 'Back to techniques',
    technique: 'Technique',
    addFavorite: 'Add to favorites',
    removeFavorite: 'Remove from favorites',
    howToPractice: 'How to practice',
    phaseSequence: 'Phase sequence',
    whatToExpect: 'What to expect',
    continueSetup: 'Continue to setup',
    techniqueDetails: 'Technique details'
  },
  meta: {
    beginnerFriendly: 'Beginner friendly',
    someExperience: 'Some experience',
    pace: 'Pace: {pace}',
    includesHolds: 'Includes holds',
    noHolds: 'No holds',
    nasalControl: 'Nasal control',
    favorite: 'Favorite',
    paceSlow: 'slow',
    paceModerate: 'moderate',
    paceRapid: 'rapid'
  },
  duration: {
    setup: 'Setup',
    setupTitle: '{name} — Setup',
    backAria: 'Back to instructions',
    sessionLength: 'Session length',
    numberOfRounds: 'Number of rounds',
    custom: 'Custom',
    min: 'min',
    round: 'round',
    rounds: 'rounds',
    minOption: '{n} min',
    roundOption_one: '{n} round',
    roundOption_other: '{n} rounds',
    estimateTime:
      'About {cycles} full breath cycles over ~{minutes} min (finishes at end of a cycle).',
    estimateRounds: '{rounds} rounds — about {minutes}+ min (hold times vary).',
    estimateRoundsVary: '{rounds} rounds — hold times vary by pace.',
    soundCues: 'Sound cues on phase change',
    vibration: 'Vibration on phase change',
    showCountdown: 'Show numeric countdown',
    cueVolume: 'Cue volume',
    viewSafety: 'View full safety information',
    start: 'Start'
  },
  exercise: {
    stop: 'Stop',
    stopAria: 'Emergency stop — end session immediately',
    pauseAria: 'Pause session',
    inhale: 'Inhale',
    holdTap: 'Hold your breath. Tap when you need to breathe.',
    needToBreathe: 'I need to breathe',
    getReady: 'Get ready',
    skip: 'Skip',
    paused: 'Paused',
    pausedBackground: 'Paused — returned from background',
    resume: 'Resume',
    endSession: 'End session',
    roundOf: 'Round {current} of {total}',
    left: '{time} left',
    next: 'Next: {phase}',
    nextRecoveryInhale: 'Next: Recovery inhale',
    startingWith: 'Starting with: {phase}',
    sessionStarted: 'Session started. {phase}',
    seconds: '{label}, {count} seconds',
    pausedSr: 'Paused.',
    pausedBackgroundSr: 'Paused. Returned from background.',
    resumedSr: 'Resumed.'
  },
  completion: {
    done: 'Done',
    sessionComplete: 'Session complete.',
    optionalNote: 'Optional note',
    notePlaceholder: 'How did this session feel?',
    saveFinish: 'Save & finish',
    practiceAgain: 'Practice again',
    backToList: 'Back to list',
    elapsed: 'Elapsed',
    technique: 'Technique',
    rounds: 'Rounds',
    cycles: 'Cycles'
  },
  history: {
    title: 'History',
    backAria: 'Back to techniques',
    noSessions: 'No completed sessions yet.',
    empty: 'Completed sessions appear here. Incomplete sessions are not saved.',
    exportJson: 'Export JSON',
    deleteAll: 'Delete all history',
    sessionFallback: 'Session',
    recentSaved: 'Your recent sessions are saved here when you finish a practice.',
    sessionsThisWeek_one: '1 completed session this week.',
    sessionsThisWeek_other: '{count} completed sessions this week.',
    confirmDelete: 'Delete all session history on this device?'
  },
  settings: {
    title: 'Settings',
    backAria: 'Back to techniques',
    sessionPrefs: 'Session preferences',
    language: 'Language',
    theme: 'Theme',
    diagnostics: 'Diagnostics',
    showOnboarding: 'Show onboarding again',
    privacyData: 'Privacy & data',
    privacyText:
      'All preferences and history stay on this device. Nothing is sent to a server. See <a href="docs/privacy.md" id="settings-privacy-link">privacy details</a>.',
    clearData: 'Clear preferences & history',
    soundCues: 'Sound cues',
    vibration: 'Vibration',
    countdown: 'Numeric countdown',
    cueVolume: 'Cue volume',
    confirmClear: 'Clear preferences and history on this device?',
    langEn: 'English',
    langPl: 'Polski'
  },
  diagnostics: {
    appVersion: 'App version',
    online: 'Online',
    serviceWorker: 'Service worker',
    wakeLock: 'Wake lock',
    audio: 'Audio',
    lastError: 'Last error',
    yes: 'Yes',
    no: 'No',
    supported: 'Supported',
    unavailable: 'Unavailable',
    ready: 'Ready',
    error: 'Error',
    none: 'None'
  },
  pwa: {
    installed: 'Installed',
    offlineNow: 'Offline now',
    readyOffline: 'Ready offline',
    preparingOffline: 'Preparing offline…',
    updateAvailable: 'Update available',
    offlineSetupFailed: 'Offline setup failed'
  },
  onboarding: {
    title: 'Welcome to Breathwork',
    step1: 'Practice seated or lying down. Stop if you feel unwell.',
    step2:
      'The circle expands on inhale and contracts on exhale. Sound and vibration cues are optional.',
    step3: 'Open a technique for instructions, then choose duration and start.',
    step4: 'After your first online visit, the app works offline on this device.',
    dismiss: 'Get started'
  },
  abandon: {
    title: 'End session?',
    desc: 'Your progress in this session will not be saved.',
    keepGoing: 'Keep going',
    endSession: 'End session'
  },
  safety: {
    modalTitle: 'Safety information',
    generalGuidance: 'General guidance',
    highIntensity: 'High-intensity techniques',
    ack:
      'I understand these safety guidelines and will stop if I feel unwell',
    close: 'Close',
    continueSession: 'Continue to session',
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
        attribution:
          'Wim Hof Method is a registered approach; use of the name here is descriptive only.'
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
    }
  },
  audio: {
    couldNotStart: 'Sound could not start on this device.'
  },
  continueDetail: {
    min: '{name} · {n} min',
    rounds: '{name} · {n} rounds'
  },
  storedKeys: [
    { key: 'breathwork_prefs_v2', description: 'App preferences, favorites, and last session settings' },
    { key: 'breathwork_history_v1', description: 'Completed session history (technique, duration, notes)' },
    { key: 'breathwork_safety_ack_v1', description: 'Safety acknowledgement flag' },
    { key: 'breathwork_install_hint_dismissed', description: 'Install hint dismissed flag' },
    { key: 'breathwork_offline_ready', description: 'Offline readiness cache flag' }
  ],
  techniques: {
    box: {
      name: 'Box Breathing',
      shortDescription: 'Acute stress, pre-meeting calm, resetting between tasks',
      metadata: { typicalSession: '5–15 min' },
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
        { label: 'Inhale' },
        { label: 'Hold' },
        { label: 'Exhale' },
        { label: 'Hold' }
      ]
    },
    '4-7-8': {
      name: '4-7-8 Breathing',
      shortDescription: 'Falling asleep, nighttime calm, quieting an active mind',
      metadata: { typicalSession: '5–15 min' },
      instructions: {
        posture:
          'Sit or lie down comfortably. Place the tip of your tongue behind your upper front teeth if that feels natural.',
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
      phases: [{ label: 'Inhale' }, { label: 'Hold' }, { label: 'Exhale' }]
    },
    'physiological-sigh': {
      name: 'Physiological Sigh',
      shortDescription: 'Sudden stress, emotional overwhelm, quick nervous-system reset',
      metadata: { typicalSession: '1–3 min (3–8 rounds)' },
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
        { label: 'Inhale' },
        { label: 'Inhale again' },
        { label: 'Exhale slowly' }
      ]
    },
    'wim-hof': {
      name: 'Wim Hof Method',
      shortDescription: 'Invigorating breathwork, alertness, energizing when sluggish',
      metadata: { typicalSession: '10–20 min (3–5 rounds)' },
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
      phases: [{ label: 'Inhale' }, { label: 'Release' }],
      holdAfterExhaleLabel: 'Hold (exhale)',
      inhaleHoldLabel: 'Inhale and hold'
    },
    coherent: {
      name: 'Coherent Breathing',
      shortDescription: 'Daily calm, steady rhythm, ongoing stress relief',
      metadata: { typicalSession: '10–20 min' },
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
      phases: [{ label: 'Inhale' }, { label: 'Exhale' }]
    },
    'alternate-nostril': {
      name: 'Alternate Nostril Breathing',
      shortDescription: 'Mental clarity, emotional balance, midday reset',
      metadata: { typicalSession: '5–10 min' },
      instructions: {
        posture:
          'Sit tall with your left hand resting on your knee. Bring your right hand to your nose.',
        steps: [
          'Use your right thumb to gently close your right nostril.',
          'Inhale slowly through the left nostril.',
          'Close both nostrils briefly with thumb and ring finger, then release the right nostril and exhale through the right.',
          'Inhale through the right nostril, close both, then exhale through the left. This completes one round.',
          'The app labels each phase — follow the nostril cues on screen.'
        ],
        phaseSequence:
          'Left inhale → Hold → Right exhale → Right inhale → Hold → Left exhale',
        sensations:
          'Balanced, focused breathing. Nasal control is required for this technique.',
        notes: 'Use light pressure on the nostrils — never block so hard that it hurts.'
      },
      phases: [
        { label: 'Left – Inhale' },
        { label: 'Hold' },
        { label: 'Right – Exhale' },
        { label: 'Right – Inhale' },
        { label: 'Hold' },
        { label: 'Left – Exhale' }
      ]
    },
    bhastrika: {
      name: 'Bhastrika',
      shortDescription: 'Low energy, sluggish morning, before physical activity',
      metadata: { typicalSession: '5–15 min (3–5 rounds)' },
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
        notes:
          'Not for beginners or anyone with cardiovascular, respiratory, or pregnancy concerns.'
      },
      phases: [{ label: 'Inhale' }, { label: 'Exhale' }],
      holdAfterExhaleLabel: 'Hold',
      inhaleHoldLabel: 'Inhale and hold'
    }
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { I18N_EN: I18N_EN };
}
