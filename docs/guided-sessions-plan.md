# Guided Sessions Plan

## Implementation record

- Branch: `codex/guided-sessions`
- Starting commit: `c7eb6d6b47f1ee2cc6af1b4982ba264cb47cadfb`
- Existing uncommitted work at start (preserved): `docs/event-breathwork-research.md`, `docs/event-session-ux-proposal.md`, and `docs/guided-sessions-plan_1b8f170f.plan.md`
- Repository instruction check: no `cursor_project_rules` directory or `implementation-plan.md` exists in this repository.

## Product flow

- Home leads with a **Guided sessions** section containing one **Unwind with sound** card (~15 minutes); the existing **Techniques** list, filters, favorites, and repeat flow remain unchanged below it.
- Opening the card shows a concise stage overview, posture/safety wording, total duration, and Start. The sequence is **Arrive** (~2:00) → **Breathe** (existing Coherent Breathing, 5.5s inhale/5.5s exhale, finishing its current breath at ~5:08) → **Listen and rest** (~7:00, natural breathing) → **Return** (~1:00) → completion/history.
- During the session, stage name, prompt, progress, Pause/Resume, immediate Stop, and **Rest now** remain available. Rest now jumps directly to natural breathing without confirmation; Stop ends immediately and creates no completion record.
- Completion is saved automatically. Milestone 3 adds a quiet optional note/reflection; skipping reflection never blocks saving.
- Backgrounding/locking pauses the session and audio. Locked-screen playback is not promised.

## Architecture

- [`guided-sessions.js`](../guided-sessions.js): stable guided-session metadata and ordered stages; [`techniques.js`](../techniques.js) remains authoritative for Coherent Breathing and all existing protocols.
- [`guided-session-engine.js`](../guided-session-engine.js): pure stage orchestrator with injected timestamps, delegating the paced stage to [`session-engine.js`](../session-engine.js).
- [`app.js`](../app.js), [`index.html`](../index.html), and [`styles.css`](../styles.css): guided selection, overview, stage rendering, lifecycle, accessible controls, and completion/history integration.
- [`storage.js`](../storage.js): compatible guided preferences/history fields while retaining old technique data.
- [`locales/en.js`](../locales/en.js) and [`locales/pl.js`](../locales/pl.js): guided UI and stage text.
- Milestone 2 adds `session-media.js` while leaving synthesized phase cues in [`audio-cues.js`](../audio-cues.js), then separates shell-ready and ambient-ready cache reporting in [`sw.js`](../sw.js) and [`pwa.js`](../pwa.js).

## Milestone 1 — Complete text-first guided flow

Status: **Done (2026-09-07).**

Implemented the complete text-first 2/5/7/1 guided flow with a pure stage engine, localized overview/session UI, immediate Stop, Rest now, Pause/Resume, automatic history, and backward-compatible preferences. Existing techniques continue to use their original engine and definitions; Coherent Breathing is delegated unchanged and completes at its full-breath boundary.

Added unit and WebKit coverage for stage timing/controls, mixed storage data, idempotent completion, English/Polish UI, offline guided assets, and existing journeys. A 440×956 WebKit walkthrough found and fixed update-banner overlap with active-session controls; Stop, Pause, and Rest now then remained visible with 44px-or-larger targets and no horizontal overflow.

Acceptance criteria:

- Guided and Techniques sections coexist; existing technique journeys and persisted preferences/history remain valid.
- The overview displays the 2/5/7/1 structure, gentle intensity, no holds, natural-breath rest, and current audio availability.
- Four stages transition once and in order; coherent breathing reuses the existing engine and ends on a full-breath boundary.
- Pause freezes clocks; Resume does not duplicate timers/cues. Rest now immediately enters rest from Arrive or Breathe. Stop is immediate and saves no completion.
- Completing Return creates exactly one guided history record automatically with active elapsed time excluding pauses; old/new history records render and export safely.
- Stage changes, controls, focus, reduced motion, English/Polish text, and offline text/cue flow preserve existing accessibility/PWA behavior.

Verification:

- `npm run check`: passed — ESLint, 36 unit tests, and 17 Playwright WebKit tests.
- Fake-clock engine tests passed for stage order, coherent boundary, delayed ticks, Pause/Resume, Rest now, Stop, skip outcomes, and duplicate guards.
- Storage tests passed for compatible preferences, mixed technique/guided history, completion idempotence, and corrupt/old data.
- WebKit tests passed for overview, accessible controls, immediate Stop, accelerated completion/history, Polish copy, focus, root/subpath offline assets, and existing journeys.
- Browser inspection used the supported 440×956 viewport. Active-session controls fit without scrolling after suppressing the waiting-update banner on the session screen; no horizontal overflow was present.
- No physical-device audio, lock-screen, Safari/Home Screen PWA, or VoiceOver validation was performed.

Remaining after Milestone 1:

- Ambient audio is intentionally shown as unavailable because no asset/player exists yet.
- Qualified review of the guided English/Polish wording remains pending and is not represented as complete.
- The existing four-file offline-readiness check remains for Milestone 2, when shell and optional media readiness will be separated.

## Milestone 2 — Ambient audio experience

Status: Done (2026-09-07).

Added one original 7:30 AAC soundscape with independent ambient enable/volume preferences, a single-player lifecycle with soft fades and silent fallback, and no narration or browser speech synthesis.
Separated required shell caching from optional media caching, report both from current cache responses, and pause session plus media on backgrounding until explicit Resume.

Acceptance criteria:

- Ambient sound is optional and independently controlled from phase cues; spoken narration and browser speech synthesis are not included.
- Ambient fades predictably and never duplicates players.
- Missing, blocked, interrupted, undecodable, or uncached media falls back to text/cues/silence with localized status.
- The app separately reports shell and ambient offline readiness from real cache entries.
- Hiding/locking pauses session and media; returning requires explicit Resume. Background playback is not advertised.

Tests include mocked media lifecycle/failure coverage, service-worker media-cache success/failure at root and subpath, and automated background-pause checks where possible. Physical-device audio remains a separate release check.

Completed work:

- [`session-media.js`](../session-media.js) primes one media element from the Start gesture, uses a dedicated Web Audio gain when available, falls back to element volume, and handles rest entry, Pause/Resume, Return, Stop, completion, load errors, and rejected playback without affecting session timing.
- [`assets/audio/unwind-ambient.m4a`](../assets/audio/unwind-ambient.m4a) is an original 7:30 AAC-LC render (4,124,424 bytes, approximately 73 kbit/s overall). Source and processing are recorded in [`audio-assets.md`](./audio-assets.md); no third-party samples or attribution are involved.
- The guided overview now has localized ambient enable and volume controls stored separately from phase-cue settings. The in-session view only shows a localized media warning when playback actually fails.
- [`offline-assets.js`](../offline-assets.js), [`sw.js`](../sw.js), and [`pwa.js`](../pwa.js) use distinct versioned shell and optional-media caches. Shell installation survives optional-media failure, and readiness requires present, successful cache responses rather than a four-file proxy.
- Hiding the page pauses the guided engine and ambient media immediately. Returning does not resume either until the user presses Resume; background and locked-screen playback are not advertised.
- Phone-size inspection found the iOS install hint could cover the guided Start button after scrolling. The hint is now limited to the list screen.

Verification:

- `npm run check`: passed — ESLint, 44 unit tests, and 20 Playwright WebKit tests.
- Media unit tests passed for one-context reuse, independent gain, element-volume fallback, fades, Pause/Resume, Stop idempotence, disabled mode, rejected play, and media load failure.
- Browser tests passed for independent preference persistence, background pause with explicit Resume, real shell/media cache entries, AAC MIME type, missing-media silent fallback, and root/subpath service-worker scopes.
- The current file was measured as AAC-LC, 44.1 kHz stereo, 7:30, approximately 73 kbit/s overall, mean level -36.1 dB and peak -27.7 dB.
- Browser inspection at 440×956 found no horizontal overflow. The overview controls have 44px range height, and active Stop/Pause controls remain 44px high and visible.
- A local ad-hoc WebKit observation reached HTML media playback, but this is not an automated decoding assertion. The Windows test build exposes no native Web Audio API, so the separate-gain route is covered by mocks and still requires physical Safari validation.

Remaining after Milestone 2:

- Listen to the full provisional soundscape on the physical iPhone speaker and headphones; replace it before release if the sustained tones or low-frequency response are uncomfortable.
- Physical iPhone checks remain required for Web Audio gain, hardware volume, silent switch, Bluetooth, interruptions, Home Screen/offline launch, lock behavior, and VoiceOver.
- Qualified review of the guided English/Polish wording remains pending and is not represented as complete.

## Milestone 3 — UX refinement

Status: Done (2026-09-07).

Kept the stage plan and ambient controls visible while moving dim view, the fixed comfortable pace, phase cues, vibration, and cue volume into an expandable options section.
Added a persistent dim view, a safe-area bottom control bar, and an optional on-device reflection that updates the already-saved guided completion.

Acceptance criteria:

- Setup keeps stages and ambient choice visible while secondary controls are expandable.
- Guided coherent breathing defaults to existing 5.5s/5.5s and offers only reviewed guided-only alternatives; it never mutates library or intensive protocols.
- Dim view can hide numeric timing without removing nonvisual/text guidance.
- Pause, immediate Stop, and Rest now use a safe-area-aware bottom bar with 44px minimum targets.
- Return/completion provides optional local-only reflection without blocking automatic completion saving.

Tests include preference persistence, pace isolation, dim view, 440×956 reachability, reflection skip/save, existing-technique regressions, and the physical-device checklist.

Completed work:

- The overview keeps stages and ambient choice in the main flow. Secondary settings use a collapsed native disclosure with localized controls for dim view, phase cues, vibration, and cue volume.
- The only guided pace is the existing reviewed comfortable 5.5-second inhale / 5.5-second exhale. Guided-session engines clone technique phase data before applying guided pace metadata, so the techniques library and intensive protocols cannot be mutated by a guided run.
- Persistent dim view hides the visual stage timer, phase countdown, and next-phase timing while leaving the stage title, prompt, phase label, breath animation, and screen-reader announcements available. It does not affect regular technique sessions.
- Guided Stop, Rest now, and Pause are grouped in a 44px-minimum bottom bar with safe-area padding. Stop remains immediate, while the paused overlay continues to require explicit Resume.
- Guided history is written before the completion screen appears. The optional reflection can then update that existing completion locally; Back to list skips it without losing or duplicating the session.
- English and Polish labels cover the disclosure, fixed pace, dim view, bottom controls, and local reflection. The physical-device checklist now includes safe-area, Dynamic Type, VoiceOver, and reflection checks.

Verification:

- `npm run check`: passed — ESLint, 48 unit tests, and 25 Playwright WebKit tests.
- Unit tests passed for the single 5.5s/5.5s pace, cloned phase isolation, unchanged library techniques, dim preference normalization, guided reflection save/clear, and rejection of reflection updates to technique history.
- Browser tests passed for collapsed secondary options, persisted dim view, shared ARIA-state reset, hidden guided-only content during later technique countdowns, paused-control inertness, automatic history before reflection, reflection skip/save, and all prior guided/technique/offline journeys.
- At 440×956 and 956×440, Stop, Rest now, and Pause measured approximately 46px high and remained fully inside the viewport. The landscape breathing circle is height-bounded and clears the fixed control bar.
- Visual inspection covered the collapsed setup, dim session, completion/reflection, and landscape Breathe screens. The overview remains vertically scrollable because all four stages and ambient controls stay visible before the Start action.
- No physical-device safe-area, Dynamic Type, VoiceOver, audio, interruption, Home Screen PWA, or lock-screen validation was performed.

Remaining after Milestone 3:

- Run the full [`device-release-checklist.md`](./device-release-checklist.md) on the supported physical iPhone 16 Pro Max.
- Complete qualified review of the English/Polish guided wording and decide whether the provisional ambient render passes listening review.
- The unapproved 4s/4s pace remains absent. Add no alternative pace until content review approves one.

## Post-review corrective pass

Status: Done (2026-09-07).

Fixed guided-only UI and ARIA state cleanup, landscape control reachability, paused-control focus isolation, cue-audio gesture unlocking, guided pace-label merging, immediate Stop silence, and the ambient prime/end lifecycle.
Extended the ambient render to provide 30 seconds of rest-stage headroom and added service-worker 206 responses for cached byte ranges while preventing partial-response cache writes.

Verification:

- `npm run check`: passed — ESLint, 48 unit tests, and 25 Playwright WebKit tests.
- Regression tests cover paused priming, benign media end, immediate zero gain, guided cue unlock, portrait-to-technique ARIA reset, landscape control/circle bounds, paused-bar inertness, and cached media Range responses.
- `ffprobe` measured the asset at 450.0 seconds, 4,124,424 bytes, AAC-LC, 44.1 kHz stereo, and approximately 73 kbit/s overall.
- Shell budget measurements are recorded in [`performance-budget.md`](./performance-budget.md) as raw and gzip values rather than comparing raw sizes with compressed-only limits.
- Physical iPhone audio, interruption, lock, safe-area, and VoiceOver validation remains pending.

## Content and audio dependencies

- Guided prompts must remain modest and choice-based. The sequence is editorial, not medical treatment or an Amy Argyle class reproduction. Qualified review remains pending.
- Milestone 2 created an original, low-dynamic-range 7:30 AAC soundscape and recorded its source and processing in [`audio-assets.md`](./audio-assets.md).
- The 4.12 MB file is within the 4.5 MB optional-media budget. Physical-iPhone listening and playback validation remain required.

## Remaining product decisions

- Whether the provisional original long render passes physical-device listening review or should be replaced.
- Final reviewed English/Polish prompt wording.
- Whether 4s/4s is approved; this release exposes only the existing 5.5s/5.5s guided pace plus unpaced natural rest.
- Ambient now fades out on entry to Return.
- Locked-screen playback remains deferred unless physical-device testing demonstrates reliability.

## Direct blockers and boundaries

- The former four-file readiness proxy is resolved; shell and ambient cache responses are now checked separately.
- Qualified expert sign-off remains pending despite stale BW-004 status in [`IMPROVEMENTS.md`](../IMPROVEMENTS.md).
- Physical iPhone audio, interruption, lock, safe-area, and VoiceOver checks remain release dependencies.
- App icon work, deep links, reminders, stale unrelated backlog statuses, history-name relocalization for old technique entries, and unrelated theme behavior remain out of scope.

## Collection: Kundalini Foundations

This collection extends the prior boundary that deferred additional techniques. It preserves the completed `unwind-with-sound` session and all existing technique IDs, settings, history, and localization. Terminology, sequence design, and safety boundaries follow [`kundalini-foundations-research.md`](./kundalini-foundations-research.md).

Shared architecture:

- Keep [`techniques.js`](../techniques.js) authoritative. Optional `variations` resolve to cloned technique data before entering the existing session engine.
- Persist selected variations per technique. Missing data keeps the current held Alternate Nostril pattern, preserving existing behavior.
- Dirga uses one inhale and one exhale with timed body-awareness guidance segments; it must not reuse the physiological-sigh second inhale.
- Traditional context is optional, attributed, localized, and explicitly separated from medical claims.
- Visible guidance remains complete. Screen-reader announcements and optional prerecorded guidance must fail safely to text without browser speech synthesis.

### KF-M1 — Foundation techniques, Learn, and Practice

Status: **Done for private use (2026-09-07); public release remains gated.**

Added the four localized Learn/Practice experiences, immutable variation resolution and persistence, complete-breath Dirga guidance segments, attributed traditional context, accessible controls, and history/Continue compatibility.
Ujjayi includes the researched tutorial and timed practice with an explicit missing-demo fallback; a verified human recording, usage release, and qualified EN/PL content review remain public-release dependencies.

- Extend Alternate Nostril Breathing with the Nadi Shodhana name and a selectable no-hold variation: inhale left, exhale right, inhale right, exhale left. The existing held sequence remains the compatibility default.
- Add Equal Breathing (Sama Vritti) as a distinct no-hold practice with comfortable equal 3s/3s and 4s/4s choices. Coherent Breathing remains unchanged.
- Add Dirga / Three-Part Breath as one smooth inhale and exhale with sequential belly-movement, lower-rib, and upper-chest awareness. Use one continuous breath animation and restrained sub-prompts.
- Add a modern introductory, no-hold Ujjayi Learn tutorial and timed Practice. Teach a gentle, private-audible sound and release to natural breathing for strain, pain, air hunger, or dizziness.
- Present explicit Learn and Practice actions, English/Polish localization, comfortable pacing, accessible controls, and optional attributed traditional context.

Acceptance criteria:

- Existing users retain held Alternate Nostril unless they deliberately select No holds; variations persist without mutating base technique definitions.
- Equal Breathing is visibly distinct from Box and Coherent Breathing and never introduces a hold.
- Dirga emits one inhale and one exhale cue per breath while awareness prompts advance without restarting the animation.
- Ujjayi provides complete text/visual instruction and honestly reports whether a real human sound demonstration is available; synthetic noise is not presented as a demonstration.
- New experiences preserve favorites, filters, Continue, immediate Stop, history, reduced motion, keyboard access, and VoiceOver semantics.
- Copy makes no promises about awakening, detoxification, trauma release, upward energy movement, or guaranteed outcomes.

Dependencies:

- Review of EN/PL instructions, Sanskrit pronunciation/transliteration, pacing, and stop guidance.
- A short original or compatibly licensed human Ujjayi demonstration with rights documentation, transcript/captions, and visual fallback.
- Optional localized spoken cue recordings. Each media group needs truthful offline readiness and silent/text fallback.

Tests:

- Unit coverage for variation cloning, no-hold phase order, preference migration/defaults, guidance-segment boundaries, and duplicate cue prevention.
- Browser coverage for collection navigation, Learn/Practice, variation persistence including Continue, Equal-versus-Coherent identity, continuous Dirga animation, Ujjayi fallback, EN/PL copy, focus, and existing-technique regressions.
- Media/service-worker coverage for optional asset groups plus physical iPhone playback, VoiceOver, larger text, interruption, and offline launch checks.

### KF-M2 — Introductory guided sequence

Status: **Done for private use (2026-09-07); content review remains pending.**

Added the stable `kundalini-foundations-intro` guided-session ID with Arrive, Dirga, Equal Breathing, no-hold Nadi Shodhana, and natural-breath rest; it is silent by default and isolated from Breath & Sound ambience.
Generalized the guided renderer and engine for multiple technique IDs, selected variations, guidance segments, configured rest stages, complete breath/nostril boundaries, localized history, Pause/Resume, Rest now, and immediate Stop. Each technique stage now begins with a six-second instruction lead-in that is preserved across pause/resume.

Add a new stable guided-session ID `kundalini-foundations-intro`; never rename or reuse `unwind-with-sound`.

Proposed sequence:

- Arrive — 1:30: supported posture, optional gaze, natural breath.
- Dirga — 2:00: movement awareness followed by one smooth belly → ribs → upper-chest inhale wave and easy exhale.
- Equal Breathing — 2:00: a reviewed fixed equal pace, no holds.
- Alternate Nostril / Nadi Shodhana, no holds — about 2:00, ending on a complete left/right round.
- Natural-breath rest — 2:00: no pacing target or predicted sensation.
- Configured total: 10:02 including three brief instruction transitions; presented as approximately 10 minutes.

Acceptance criteria:

- The overview lists every stage, no-hold status, and editorial timing boundary without presenting the sequence as a kriya or treatment.
- Technique transitions finish the active breath or nostril round. Pause freezes clocks; Rest now enters natural breathing; Stop remains immediate and saves no completion.
- Completion uses its own ID/title key, coexists with Breath & Sound and technique records, and saves once with active elapsed time.
- Ujjayi and Breath of Fire are absent. The sequence is silent by default apart from optional reviewed cues and does not inherit Breath & Sound ambience.

Tests extend guided-engine, storage, and browser coverage for multiple technique IDs, selected variation, Dirga guidance, full-round boundaries, delayed ticks, Pause/Resume, Rest now, Stop, idempotent completion, mixed history, EN/PL copy, focus, and landscape reachability.

### KF-M3 — Breath of Fire definition and advanced review

Status: **Specification complete (2026-09-07); implementation remains blocked.**

Recorded the lineage-specific definition, distinction from Bhastrika, demonstration requirements, clinical/teacher review gates, pacing/rest decisions that must not be invented, and required test boundaries.
No Breath of Fire technique, session, timing protocol, or release claim was added to application code.

- Attribute the candidate method specifically to 3HO's modern “Kundalini Yoga as taught by Yogi Bhajan” lineage while noting that terminology differs across traditions.
- Keep a future Breath of Fire ID distinct from `bhastrika`. Do not inherit Bhastrika's active inhale, 30-breath rounds, exhale retention, or recovery hold.
- Record source-described mechanics for review only: rapid equal nasal rhythm, active abdominal exhale, released/passive inhale, no pause, and relaxed upper body. Do not convert broad source ranges into an app protocol.
- Require instructor-led audible/visual demonstration at normal pace and slow teaching breakdown, correction for reverse breathing, captions/transcript, qualifications, consent, and asset rights.
- Require lineage-specific beginner progression and independent clinical review before selecting rate, work interval, rest interval, progression, or resumption rules. Symptoms are stop signals, never progress.

Acceptance criteria for leaving specification status:

- A qualified teacher for the named lineage signs off on mechanics, pace, work/rest structure, tutorial, and distinction from Bhastrika.
- A qualified clinical reviewer signs off on contraindication/referral wording without implying universal safety outside a short exclusion list.
- Demonstration assets, localization, captions, offline behavior, and device tests are ready.
- Planned tests cover no inherited holds, exact reviewed timing, immediate Stop, background pause, safety acknowledgement, demo fallback, reduced motion, and abandoned-session history.

### Kundalini Foundations boundaries

- Prana, nadis, ida/pingala/sushumna, chakras, and kundalini may appear only as attributed traditional models, not anatomy or measurable medical mechanisms.
- Never promise awakening, upward energy movement, chakra activation, detoxification, trauma release, nervous-system repair, treatment, or guaranteed outcomes. Never frame intense sensations as achievement.
- Breath of Fire remains excluded from KF-M1/KF-M2 until its advanced dependencies are met.
- Physical iPhone audio, lock-screen, interruption, VoiceOver, and Home Screen validation remain release checks.
- The separately selected ocean replacement for Breath & Sound remains outside these milestones.

### Kundalini Foundations verification

- `npm run check`: passed — ESLint, 63 unit tests, and 33 Playwright WebKit tests.
- Unit coverage verifies variation cloning/default compatibility, no-hold phase order, Equal-versus-Coherent timing, Dirga guidance boundaries, source switching, guided full-round timing, pause/rest behavior, idempotent completion, and preference normalization.
- WebKit coverage verifies collection navigation, Learn/Practice actions, variation persistence, continuous Dirga inhale guidance, pre-technique instructions, Ujjayi fallback in EN/PL, silent introductory-session behavior, single-entry completion history, and all existing technique/guided/service-worker regressions.
- Physical iPhone playback, VoiceOver, larger text, safe areas, interruption, lock-screen behavior, and installed-PWA launch remain unverified.
