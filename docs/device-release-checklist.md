# iPhone 16 Pro Max release checklist

Use this checklist on the **physical iPhone 16 Pro Max** before each release. Record the iOS version tested.

Automated WebKit emulation (Playwright) covers layout and basic flows but cannot replace device-only behavior.

## Environment

- [ ] iOS version recorded: ___________
- [ ] Tested in **Safari** (browser tab)
- [ ] Tested as **Home Screen PWA** (Add to Home Screen, launch from icon)

## Install and offline

- [ ] App loads over HTTPS on first visit
- [ ] Add to Home Screen shows correct name and icon
- [ ] Second launch works with network disabled (offline shell)
- [ ] Service worker update does not trap the user in a broken state

## Safety (BW-003)

- [ ] Global safety notice visible on technique list
- [ ] Safety information modal readable with VoiceOver
- [ ] First Wim Hof or Bhastrika session requires acknowledgement
- [ ] Emergency **Stop** button visible throughout an active session

## Core session flows

- [ ] Box Breathing: get-ready, phases advance, pause/resume, completion
- [ ] 4-7-8: 5 / 10 / 15 minute presets run without cutting off mid-phase unexpectedly
- [ ] Physiological Sigh: second inhale phase is distinguishable
- [ ] Wim Hof: rapid breaths, tap-to-end hold, recovery hold
- [ ] Bhastrika: rapid breaths and hold sequence feel correct
- [ ] Sound toggle respected; cues play after one user tap when enabled
- [ ] Rapid double-tap on Start does not create duplicate sessions

## Interruptions (preview for BW-009)

- [ ] Lock screen during session — note whether timer/cues recover or need pause
- [ ] Switch apps and return — session state is understandable
- [ ] Incoming call / audio interruption — app recovers or fails gracefully

## Guided ambient audio

- [ ] Guided overview distinguishes app-shell offline readiness from ambient-audio readiness
- [ ] Ambient enabled and cue sound disabled — only the rest soundscape plays
- [ ] Cue sound enabled and ambient disabled — phase cues play and rest remains silent
- [ ] Ambient and cue volume controls affect only their own channels
- [ ] Rest now starts one ambient player with a soft fade and no duplicate playback
- [ ] Pause fades/stops ambient; explicit Resume restarts it without losing session position
- [ ] Return, immediate Stop, and completion silence ambient predictably
- [ ] Airplane-mode launch plays cached ambient when marked ready, otherwise explains silent fallback
- [ ] Hardware silent switch, low/medium/high device volume, speaker, and Bluetooth behavior recorded
- [ ] Locking and app switching pause both session and ambient; no locked-screen playback is promised

## Accessibility spot checks

- [ ] VoiceOver can complete a short session without countdown spam
- [ ] Primary controls have adequate touch targets (44×44 pt)
- [ ] Emergency Stop reachable without scrolling in portrait
- [ ] Guided Stop, Rest now, and Pause remain above the Home indicator and reachable with one hand
- [ ] Guided controls remain reachable in landscape and with larger Dynamic Type
- [ ] Dim view hides visual timing while stage prompts, phase labels, and VoiceOver guidance remain available
- [ ] Session options disclosure, switches, and sliders have clear VoiceOver names and states
- [ ] Guided completion is already present in History before reflection is saved or skipped
- [ ] Optional reflection remains on-device and is readable in History after relaunch

## Sign-off

- Tester: ___________
- Date: ___________
- Result: Pass / Fail
- Notes: ___________
