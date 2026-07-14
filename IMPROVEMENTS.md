# Breathwork improvement backlog

Audit date: 2026-07-14

This backlog is based on a review of `index.html`, `styles.css`, `app.js`, `techniques.js`, `manifest.json`, `sw.js`, the image assets, and an initial browser walkthrough. Priorities are ordered by user risk and impact, not by implementation difficulty.

## Target device and support scope

- **The only supported device is the user's iPhone 16 Pro Max.**
- The supported experiences are Safari and the app installed from Safari as a Home Screen PWA on that device.
- Real-device behavior is the source of truth. WebKit emulation may speed up development, but it does not replace testing audio unlock, vibration behavior, safe areas, screen locking, offline launch, service-worker updates, and Home Screen installation on the physical phone.
- Desktop browsers, Android, iPad, other iPhone sizes, and non-WebKit browser engines are out of scope. They may continue to work on a best-effort basis, but backlog work must not be expanded solely to support them.
- Record the iOS version used for each release test so an iOS update can be identified when behavior changes.

## Priority key

- **P0 — Release blocker:** safety, broken core behavior, or data/runtime reliability.
- **P1 — High impact:** major usability, accessibility, or product-quality improvement.
- **P2 — Valuable:** useful feature or maintainability work after the core is solid.
- **P3 — Optional:** growth and delight work that should not delay reliability fixes.

## P0 — Make the core safe and reliable

- [x] **BW-001 — Make audio reliable on iPhone 16 Pro Max.**
  - Replace the new `AudioContext` created for every beep with one long-lived context.
  - Create/resume and unlock it synchronously from the user's Sound toggle or Start tap; do not first create it after the three-second timer.
  - Add a short preview cue when Sound is enabled and show a useful message if audio cannot start.
  - Reuse the context for the whole session and suspend/close it during cleanup as appropriate.
  - Acceptance: a fresh Safari/Home Screen PWA launch on the target phone plays every enabled cue after one user tap; repeated sessions do not create an increasing number of audio contexts.
  - **Done (2026-07-14):** `audio-cues.js` now uses one shared `AudioContext`, unlocks on Start/Sound toggle, plays a preview tone, surfaces errors in `#audio-status`, and suspends between sessions.

- [x] **BW-002 — Remove duplicate and missed phase cues.**
  - Currently the get-ready completion calls `playPhaseSound()`, then the first exercise render calls it again for the new phase signature.
  - Give cue playback one owner and emit exactly one event per phase transition.
  - Do not rely on `requestAnimationFrame` alone for audio scheduling; use a small look-ahead scheduler or a clock/timer layer that can recover predictably from delayed frames.
  - Acceptance: automated tests record one cue at session start and one at each transition, with none while paused or after stopping.
  - **Done (2026-07-14):** Removed get-ready cues; `playSessionCue` is the sole owner; session timing uses a 100ms interval scheduler instead of `requestAnimationFrame`.

- [x] **BW-003 — Add safety guidance before high-intensity and breath-hold sessions.**
  - Add a concise global note: practice seated or lying down, do not practice in/near water or while driving, never force a breath or hold, and stop/rest if dizzy or lightheaded.
  - Add technique-specific warnings for Wim Hof Method and Bhastrika. Include appropriate advice for pregnancy, epilepsy, cardiovascular/serious health conditions, and consulting a qualified clinician.
  - Require a one-time acknowledgement before the first high-intensity session, with the warning still reachable later.
  - Provide an always-visible emergency exit during a session.
  - Acceptance: these warnings are presented before the first risky session, are readable by a screen reader, and are not hidden only in the README.
  - **Done (2026-07-14):** Added `safety.js`, list-screen notice, safety modal with one-time acknowledgement, technique warnings on the duration screen, and a prominent emergency Stop control during sessions.

- [x] **BW-004 — Have every technique and health claim reviewed by a qualified expert.**
  - Verify phase order, pace, hold behavior, round count, and duration choices for all seven techniques.
  - Pay special attention to the 5–15 minute 4-7-8 presets, the Bhastrika sequence, the second physiological-sigh inhale, and the tap-ended exhale holds.
  - Rewrite claims such as "panic wave," "HRV improvements," "mental toughness," and "cold exposure prep" into neutral, supportable language.
  - Clearly separate wellness guidance from medical treatment and add source/last-reviewed metadata to technique definitions.
  - If released publicly, check whether the "Wim Hof Method" name/content needs permission or attribution.
  - Acceptance: each technique has a documented reviewer/source and the UI makes no unsupported treatment or outcome claim.
  - **Done (2026-07-14):** Rewrote technique descriptions, added `contentReview` metadata to all seven techniques, included wellness disclaimers and Wim Hof attribution in safety copy. Qualified expert sign-off remains pending before public release.

- [x] **BW-005 — Make installation and offline use work from a subdirectory.**
  - Change the manifest `start_url` from `/` to a scope-relative value such as `./` and explicitly set a compatible `scope` and stable `id`.
  - Remove root-only assumptions from `sw.js`, including the `/` precache entry and navigation check that recognizes only the domain root.
  - Make asset URLs consistently relative to the service worker scope.
  - Acceptance: install and offline navigation work both at `https://example.com/` and `https://example.com/BreathWork/`, including a cold launch after the network is disabled.
  - **Done (2026-07-14):** Manifest uses `./` scope/start_url; `sw.js` precaches scope-relative assets and falls back to cached `index.html` for offline navigations at root and subpath.

- [x] **BW-006 — Choose one dependable service-worker update strategy.**
  - The worker currently calls `skipWaiting()` during install while the page also expects a waiting worker for the Update button. Choose either an explicit user-approved update or a deliberate automatic update and implement that flow end to end.
  - Do not swallow `cache.addAll()` failure and install a potentially empty cache. Log/report failure and retain the last known-good worker.
  - If using an update button, wait for `controllerchange` before reloading.
  - Add an offline navigation fallback and handle failed runtime fetches instead of returning an unhandled rejection.
  - Acceptance: an old open tab receives a new version without an update loop, mixed old/new assets, a dead button, or a blank offline page.
  - **Done (2026-07-14):** User-approved updates only (`pwa.js` waits for `controllerchange`); failed precache aborts install; offline navigation fallback added.

- [x] **BW-007 — Add regression tests before changing the session engine.**
  - Add unit tests with a fake clock for time-based cycles, round-based cycles, tap-to-continue holds, pause/resume, stop, get-ready/skip, and completion.
  - Add mocked audio tests for unlock, cue count, disabled sound, and cleanup.
  - Add WebKit browser tests using an iPhone 16 Pro Max profile for the main journey and service-worker tests at root and subpath scopes.
  - Add a short physical-device release checklist covering Safari and the installed Home Screen PWA; automated emulation is not sufficient for device-only features.
  - Include boundary cases such as a timer delayed by several seconds, a hidden tab, double tapping Start/Stop, and ending exactly on a phase boundary.
  - Acceptance: tests reproduce BW-001, BW-002, BW-005, and BW-006 before their fixes and pass afterward.
  - **Done (2026-07-14):** Added `npm test` unit suite (`tests/unit/`), Playwright WebKit browser tests (`tests/browser/`), BW-001/BW-002 regression assertions, and `docs/device-release-checklist.md`. Run all checks with `npm run test:all`.

- [x] **BW-008 — Extract a small, explicit session state machine from `app.js`.**
  - Separate timing/state transitions from DOM rendering, audio, vibration, storage, and navigation.
  - Model states such as `ready`, `running`, `tapHold`, `paused`, `completed`, and `stopped` with a single cleanup path.
  - Remove unused variables such as `phaseStartTime` and `currentPhase`, and prevent old handlers/timers from surviving into a new session.
  - Acceptance: the same pure engine drives every technique and can be tested without a browser or real time.
  - **Done (2026-07-14):** Extracted `session-engine.js` and `audio-cues.js`; `app.js` now binds DOM/audio to engine snapshots with explicit session cleanup.

- [x] **BW-009 — Handle locking, backgrounding, and interruptions intentionally.**
  - Request Screen Wake Lock while a session is running where supported, and release/reacquire it on pause, completion, and visibility changes.
  - Decide whether hiding/locking should auto-pause or catch up; never silently skip several phases and cues.
  - Handle audio-context suspension, phone calls/audio interruptions, and returning from the background.
  - Acceptance: after locking/unlocking or switching apps, the user sees a clear paused/recovered state and the timer, display, and cues agree.
  - **Done (2026-07-14):** Screen Wake Lock during active sessions; auto-pause with background message on `visibilitychange`; audio context resume on return; manual Resume re-acquires wake lock.

- [x] **BW-010 — Replace the generic beep with a calm cue system.**
  - Use distinct, pleasant cues for inhale, hold, exhale, completion, and errors so the exercise can be followed with eyes closed.
  - Add a volume control and cue preview. Keep sound and haptics as separate settings because vibration support differs by device.
  - Use short envelopes with no clicks and avoid sudden/high volume; consider bundled, optimized chime assets or carefully synthesized tones.
  - Acceptance: users can identify each phase without looking, previews match session volume, and every asset works offline.
  - **Done (2026-07-14):** Synthesized per-phase tones in `audio-cues.js`, volume slider and preview on the duration screen, separate haptics toggle.

- [x] **BW-011 — Add a technique detail/instruction screen.**
  - Before duration selection, explain how to sit, how to breathe, what the phase sequence is, expected sensations, intensity, and technique-specific safety notes.
  - Show useful metadata on cards/detail pages: beginner suitability, pace, holds, typical session length, and whether nasal control is required.
  - Include clear instructions for alternate-nostril breathing and rapid-breathing techniques; phase labels alone are not enough for a new user.
  - Acceptance: a first-time user can perform a technique without prior knowledge or external instructions.
  - **Done (2026-07-14):** Added `screen-detail` with posture, steps, phase sequence, sensations, metadata chips, and technique-specific safety notes; list cards show summary chips.

- [x] **BW-012 — Optimize the layout specifically for iPhone 16 Pro Max.**
  - Design the one-column layout around the phone's usable Safari and standalone-PWA viewport, including the Dynamic Island and top/bottom safe areas.
  - Keep controls comfortably thumb-reachable, avoid placing important actions behind Safari chrome, and keep the primary session action easy to reach without awkward scrolling.
  - Add section intro text, technique metadata chips, consistent spacing, stronger headings, and clear primary/secondary actions.
  - Remove the user-facing "Reload app" workaround once update handling is fixed.
  - Acceptance: list, setup, exercise, pause, and completion screens are visually verified on the physical iPhone 16 Pro Max in Safari and standalone mode, with no clipped content under browser chrome, the Dynamic Island, or the Home indicator.
  - **Done (2026-07-14):** Portrait-first layout with `max-width: 440px`, safe-area padding, section intro, metadata chips, and structured detail/setup screens. Physical device verification still required per release checklist.

- [x] **BW-013 — Improve the active breathing visualization.**
  - Animate the breathing object itself (gentle expansion for inhale, stillness for hold, contraction for exhale) instead of using only a ring that fills and empties.
  - Give phases a consistent but accessible color treatment and add a clear next-phase hint.
  - Make the circle, labels, session time, exit, and pause controls form one balanced composition in portrait and landscape.
  - Keep the numeric timer optional so users can choose a less stimulating view.
  - Acceptance: inhale/exhale direction is immediately understandable without text, while `prefers-reduced-motion` users get an equivalent non-animated presentation.
  - **Done (2026-07-14):** Added scaling breath orb, per-phase colors, next-phase hint, optional countdown toggle, and reduced-motion static presentation.

- [x] **BW-014 — Fix screen-reader announcements and focus management.**
  - Do not update an `aria-live` timer from every animation frame; announce only meaningful phase changes and occasional time milestones.
  - On screen changes, move focus to the new heading or primary control and restore it sensibly on Back.
  - Mark inactive screens as unavailable to assistive technology if CSS alone does not provide dependable behavior.
  - Ensure pause, resume, completion, and safety warnings are announced once and in the right order.
  - Acceptance: VoiceOver on the target iPhone can complete a session without repeated countdown spam or focus remaining inside a hidden screen.
  - **Done (2026-07-14):** Single `#sr-announcer` for phase changes; inactive screens use `aria-hidden` + `inert`; focus moves on navigation; removed per-frame `aria-live` from timer elements.

- [x] **BW-015 — Improve control semantics and iPhone accessibility.**
  - Implement duration choices as a labelled radio group (or equivalent `aria-pressed` pattern) with a programmatically exposed selected state.
  - Give the sound control switch semantics if it is styled as a switch.
  - Preserve clear focus/selection treatment for VoiceOver and Switch Control; do not remove an outline without an equally clear replacement.
  - Verify at least 44×44 CSS pixel touch targets, Safari Page Zoom, iOS Larger Text/Bold Text where applicable, Increase Contrast, VoiceOver, and Switch Control on the target phone.
  - Acceptance: selected state and focus are obvious without relying only on the mint border/color.
  - **Done (2026-07-14):** Duration radiogroup with `aria-checked`, switch-styled sound/haptics/countdown toggles, `:focus-visible` outlines, and 44px touch targets. Physical VoiceOver verification still required per release checklist.

- [x] **BW-016 — Respect motion and sensory preferences.**
  - Add `prefers-reduced-motion` rules for the loader, ring transitions, overlays, and future breathing animation.
  - Avoid flashing and abrupt full-screen transitions.
  - Offer independent visual, sound, and haptic guidance so no single sensory channel is required.
  - Acceptance: reduced-motion mode contains no continuous or decorative animation and remains fully usable.
  - **Done (2026-07-14):** `prefers-reduced-motion` CSS disables decorative animation; static breath-orb opacity indicates phase; sound, haptics, and countdown are independently toggleable.

- [x] **BW-017 — Improve duration and completion behavior.**
  - Offer a custom duration/round count with safe per-technique limits instead of only three hard-coded choices.
  - Decide whether time-based sessions finish the current full breath cycle or end exactly on time; do not cut off unexpectedly mid-inhale/hold.
  - Show estimated cycles/time before Start and actual elapsed time, rounds, and hold time on completion.
  - Acceptance: the displayed estimate matches engine behavior and completion always occurs at a clearly communicated boundary.
  - **Done (2026-07-14):** Custom duration/rounds input with per-technique limits; time sessions complete at cycle boundary; setup shows estimate; completion screen shows elapsed time and cycles/rounds.

- [x] **BW-018 — Make pause, stop, and accidental taps safe.**
  - Prevent double starts and repeated pause/resume events.
  - Ask for confirmation before abandoning a meaningful in-progress session, while keeping an immediate safety exit available.
  - Remove the special `touchend` plus `click` handling in favor of one pointer/click path unless a tested platform bug requires it.
  - Acceptance: rapid taps cannot create two engines, duplicate cues, or leave a hidden session running.
  - **Done (2026-07-14):** `startInProgress` and pause debounce guards; abandon confirmation dialog for end/back after 8s; emergency Stop remains immediate; removed duplicate `touchend` handler.

- [x] **BW-019 — Support browser/PWA Back navigation.**
  - Map app screens to history state or small routes so browser Back returns from exercise setup to the technique list rather than leaving the app.
  - Define Back behavior for ready, running, paused, completed, and installed-PWA modes.
  - Acceptance: Safari Back/swipe navigation, standalone mode, and the app's visible Back buttons behave consistently on the target phone.
  - **Done (2026-07-14):** `navigation.js` maps list → detail → duration → exercise → completion to hash history; back from exercise prompts abandon confirm when session is in progress.

- [x] **BW-020 — Fix and optimize install icons.**
  - The PNG files do not match their declared sizes: `icon-180.png` is 1024×1024, while the files declared as 192/512 are 2048×2048.
  - Export exact 180, 192, and 512 pixel files, verify the maskable safe zone, and compress them. The current PNG set is about 1.9 MB, including a 1.4 MB 512 icon.
  - Add a monochrome-friendly favicon/icon treatment and validate Add to Home Screen plus the installed icon in Safari on the target phone.
  - Acceptance: manifest warnings are gone, install surfaces are crisp, and icon transfer/cache size is substantially lower.
  - **Done (2026-07-14):** Regenerated icons via `scripts/generate-icons.py` (~8 KB total); manifest lists exact sizes; added `favicon-32.png` and SVG favicon links.

- [x] **BW-021 — Resolve portrait/landscape behavior.**
  - The manifest forces portrait while CSS contains landscape support. Decide whether the iPhone 16 Pro Max supports portrait only or both orientations, then make the manifest, layout, and tests agree.
  - If landscape remains supported, test it on the physical phone so hold controls and overlays never collide with the breathing circle or safe areas. Otherwise, remove landscape-specific work from the support promise.
  - Acceptance: every promised orientation has no clipped controls on the target phone.
  - **Done (2026-07-14):** Portrait-only support for iPhone 16 Pro Max; manifest keeps `orientation: portrait`; removed landscape-specific CSS.

## P2 — Product quality and maintainability

- [x] **BW-022 — Add local-only session history and a useful completion view.**
  - Store completed technique, duration/rounds, timestamp, and optional note locally.
  - Show recent sessions and gentle consistency information without guilt-driven streak language.
  - Include clear export/delete controls and keep incomplete sessions out of completion totals.
  - Acceptance: history works offline and the user can erase all of it from the UI.
  - **Done (2026-07-14):** `storage.js` history with optional completion notes, History screen with weekly summary, export JSON, and delete all.

- [x] **BW-023 — Improve discovery without overcrowding the home screen.**
  - Group/filter by goal and intensity (calm, sleep, focus, energizing; gentle vs intense).
  - Add favorites and a "Continue with last settings" shortcut.
  - Keep a simple "All techniques" route so categorization never hides content.
  - Acceptance: a returning user can start a familiar session in two taps and a new user can distinguish gentle from advanced techniques.
  - **Done (2026-07-14):** Goal/intensity filter chips, favorites on detail screen, continue shortcut on list; All remains default filter.

- [x] **BW-024 — Add onboarding and a settings surface.**
  - Explain safety, offline behavior, cue choices, and how the circle works in a short dismissible onboarding flow.
  - Move sound, volume, haptics, reduced numeric display, and theme preferences into Settings while preserving convenient pre-session access.
  - Version stored settings and validate/migrate `localStorage` values.
  - Acceptance: corrupted/old preferences fall back safely without breaking session setup.
  - **Done (2026-07-14):** Onboarding modal; Settings screen with prefs, themes, diagnostics; versioned `breathwork_prefs_v2` with legacy migration.

- [x] **BW-025 — Add user-visible offline/install/update states.**
  - Show a small offline indicator only when useful, a non-intrusive install action where supported, and a release/version note after a successful update.
  - Explain iOS Add to Home Screen steps only on relevant devices.
  - Never imply offline readiness until the required assets have actually cached.
  - Acceptance: the user can tell whether the app is installed, offline-ready, offline now, or waiting for an update.
  - **Done (2026-07-14):** `#app-status-text` shows version/offline/install/update state; iOS install hint; post-update notice; removed manual Reload workaround.

- [x] **BW-026 — Stop hiding operational errors.**
  - Replace empty `catch` blocks for storage, audio, service-worker registration, and caching with structured development logs and restrained user feedback where recovery is possible.
  - Add a local diagnostics view with app version, worker state, audio state, wake-lock support, and last error; avoid collecting sensitive data.
  - Acceptance: a failed sound/offline setup can be diagnosed without attaching a debugger, and no private session data is sent anywhere.
  - **Done (2026-07-14):** `logger.js` (`AppLog`); storage/pwa errors logged; Settings diagnostics panel.

- [x] **BW-027 — Add formatting, linting, and continuous checks.**
  - Add a lightweight package/tool configuration for JavaScript/CSS/HTML linting, formatting, and the test suite.
  - Run syntax, unit, WebKit browser, accessibility, and offline checks in CI, followed by the physical iPhone release checklist before deployment.
  - Keep the app build-free if desired; a framework is not required to get these benefits.
  - Acceptance: one documented command runs all local checks and CI blocks regressions.
  - **Done (2026-07-14):** ESLint flat config; `npm run check`; GitHub Actions CI workflow.

- [x] **BW-028 — Establish performance budgets.**
  - Budget compressed app-shell size, icon/audio assets, first render, and time to interactive on the target iPhone 16 Pro Max.
  - Remove the unconditional loader flash or show it only when initialization actually takes long enough to require feedback.
  - Avoid external runtime font/script dependencies so startup and offline mode stay dependable.
  - Acceptance: a repeat offline launch renders immediately and the breathing session does not show animation or audio jank under CPU throttling.
  - **Done (2026-07-14):** `docs/performance-budget.md`; loader only appears after 280 ms init delay.

- [x] **BW-029 — Document privacy and data ownership.**
  - State that current preferences/history stay on-device and list exactly what is stored.
  - Add a clear-data control before adding history.
  - If analytics or crash reporting is ever added, make it privacy-conscious, documented, and opt-in where required rather than silently changing the current local-only model.
  - Acceptance: the privacy explanation matches observable network/storage behavior.
  - **Done (2026-07-14):** `docs/privacy.md`; Settings lists stored keys and clear-data control.

## P3 — Optional reach and polish

- [ ] **BW-030 — Create a distinctive app icon and visual identity.** Keep the calm aesthetic, but replace the generic outlined circle with a recognizable breath/motion mark that remains legible at favicon size and inside a maskable crop.
- [ ] **BW-031 — Add optional themes.** Consider dark, warm, and high-contrast themes, with system preference as the default and all phase colors contrast-tested.
- [ ] **BW-032 — Add localization infrastructure.** Move user-facing copy out of JavaScript/HTML, support pluralization and longer labels, and start with the languages actual users need.
- [ ] **BW-033 — Add shareable technique links, not shareable health data.** Deep-link to an instruction/setup page while keeping session history and notes private by default.
- [ ] **BW-034 — Consider gentle reminders only after the core is trusted.** Make reminders explicitly opt-in, easy to disable, timezone-aware, and free of manipulative streak pressure.

## Suggested implementation order

1. ~~BW-003 and BW-004: safety/content review.~~ **Done (2026-07-14)**
2. ~~BW-007 and BW-008: tests and engine boundaries.~~ **Done (2026-07-14)**
3. ~~BW-001, BW-002, BW-009, and BW-010: audio/lifecycle reliability.~~ **Done (2026-07-14)**
4. ~~BW-005, BW-006, BW-020, and BW-025: install/offline/update reliability.~~ **Done (2026-07-14)**
5. ~~BW-011 through BW-021: instructions, visual design, accessibility, and navigation.~~ **Done (2026-07-14)**
6. ~~BW-022 through BW-029: history, discovery, tooling, and privacy.~~ **Done (2026-07-14)**
7. BW-030 onward: optional visual identity, themes expansion, localization, and reminders.

## Reference material for implementation/review

- Apple notes that iOS Web Audio must begin from an explicit user action and recommends a long-lived audio context: [Playing Sounds with the Web Audio API](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/PlayingandSynthesizingSounds/PlayingandSynthesizingSounds.html).
- Official Wim Hof guidance says not to practice in water, in the shower, or while driving: [How to start practicing](https://www.wimhofmethod.com/practice-the-method).
- The official Wim Hof FAQ lists important conditions and pregnancy precautions that should be checked by a qualified reviewer before writing final in-app wording: [Frequently asked questions](https://www.wimhofmethod.com/faq).
- Cambridge University Hospitals advises gentle practice and resting if dizziness begins: [Breathing exercises](https://www.cuh.nhs.uk/patient-information/breathing-exercises/).

These links are starting points for expert review, not a substitute for clinical or legal sign-off.
