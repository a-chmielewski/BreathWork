# Guided breathwork sessions and UX proposal

Assessment: 2026-09-07. Based on the current source and a WebKit walkthrough at 440 × 956 (home, technique details, setup, and active session). This is a proposal; app behavior has not been changed. Physical iPhone testing remains necessary for audio and interruption behavior.

## Existing capability

`techniques.js` defines seven techniques: Box Breathing, 4-7-8, Physiological Sigh, Wim Hof Method, Coherent Breathing, Alternate Nostril Breathing, and Bhastrika. Coherent Breathing is the closest existing building block for a gentle, continuous rhythm. This does not establish that it is one of the event's three unnamed patterns.

The app already includes instructions, goal/intensity filters, favorites, repeat-with-last-settings, custom session length, optional phase countdown, phase tones, volume, history with notes, themes, localization, offline support, and safety controls. These should be retained rather than proposed as new features.

`session-engine.js` runs a single technique's repeated phases. `audio-cues.js` synthesizes short tones. There is no sequence of preparation, different techniques, natural breathing, and listening/rest; there is no recorded instructor narration or sound-bath track. See [event research](event-breathwork-research.md) for external sources and limitations.

## Recommended first addition

Add a **Guided sessions** area alongside **Techniques**. Start with one gentle session, provisionally named **Unwind with sound**, instead of a large new catalog.

Illustrative 15-minute editorial structure, subject to content review:

| Stage | Approximate duration | Experience |
| --- | --- | --- |
| Arrive | 2 min | Comfortable position, optional gentle movement, optional intention |
| Breathe | 5 min | Existing coherent rhythm with a comfortable pace and an unpaced option |
| Listen and rest | 7 min | Natural breathing with an original or licensed quiet soundscape, or silence |
| Return | 1 min | Gentle closing prompt and optional reflection |

These stage durations are product design choices, not a verified clinical protocol or a reproduction of Amy Argyle's class. Reuse the existing note/history flow for reflection. Additional curated sessions could add a gentle belly-breathing tutorial and comfortable extended-exhale breathing; optional humming is a later sensory variation. Do not identify an intensive connected-breathing protocol as the event's method without confirmation.

Model a guided session as ordered stages that can run a technique, play guidance, or allow unpaced rest. Keep the existing single-technique engine reusable. Stage transitions should respect completed breaths and allow skipping to rest. Narration, cues, and soundscape need separate volume controls, soft transitions, and clear offline availability. Offer transcripts and a silent experience.

## UX priorities

1. **Simpler entry.** Lead with a recommended gentle session, its duration, and a Start action. Keep the existing full technique library and filters available. Returning users already have a last-settings shortcut; build on it.
2. **Less setup work.** Keep duration and a compact audio choice visible; put volume, custom duration, and display preferences under an expandable options control. Preserve settings and keep Start thumb-reachable. The current setup shows all these controls even when sound is off.
3. **Adjustable breathing pace.** Current setup changes session length, not inhale/exhale timing, despite instructions telling users to shorten counts. Add comfortable pacing for suitable gentle techniques and an unpaced option. Do not blindly scale intense techniques or every hold protocol.
4. **Eyes-closed guidance.** Add optional spoken phase and stage cues. Current tones require users to learn their meaning. A dim session view can hide both the phase countdown and total time; the current countdown preference only hides the phase number.
5. **Accessible in-session actions.** Move Pause and Stop into a reachable bottom control area; currently both are in the top corners. Guided sessions should also offer an immediate return to natural breathing/rest without requiring completion or a confirmation dialog.
6. **A gentler ending.** Rest before the completion screen; foreground an optional feeling check-in and existing note instead of cycle statistics. Save session completion automatically and make reflection optional.
7. **Clear audio expectations.** The app currently auto-pauses when hidden. Explain that behavior. Verify locked-screen playback on the physical target iPhone before advertising it for sound sessions; a dim foreground mode is a separate feature.
8. **Visual consistency.** Use consistent inherited fonts for buttons/cards and simplify the metadata shown on home cards. In the emulated walkthrough, many controls rendered with serif text while body copy used sans serif; verify appearance on the target phone.

## Content quality before expanding intensive exercises

`IMPROVEMENTS.md` marks expert review BW-004 complete, but its completion note and `techniques.js` still say qualified expert sign-off is pending. Treat that as unfinished review. Confirm technique instructions, timing, claims, and any higher-intensity additions with an appropriate reviewer. The event's hands-on facilitation cannot be reproduced by app playback.

## Validation for implementation

Exercise stage transitions, skip-to-rest, pause/resume, immediate Stop, and completion persistence. Check narration/cue overlap, silence mode, downloaded audio offline, and interruption recovery. Inspect the new screens at the target phone size and verify audio, locking, VoiceOver, and thumb reach on the physical iPhone 16 Pro Max.
