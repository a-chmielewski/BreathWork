# Privacy and data ownership

Breathwork stores data **only on your device**. The app does not send session history, preferences, or notes to any server.

## What is stored locally

| Key | Purpose |
|-----|---------|
| `breathwork_prefs_v2` | Last technique/settings, sound, haptics, volume, countdown toggle, theme, favorites, onboarding flag |
| `breathwork_history_v1` | Completed sessions (technique, duration/rounds, elapsed time, optional note, timestamp) |
| `breathwork_safety_ack_v1` | Whether you acknowledged high-intensity safety guidance |
| `breathwork_install_hint_dismissed` | Whether the iOS install hint was dismissed |
| `breathwork_offline_ready` | Whether required offline assets have cached |

Service worker caches (names like `breathwork-1.6.0`) hold app shell files for offline use on this device only.

## What is not stored

- No account or sign-in data
- No analytics or crash reports (current version)
- Incomplete or abandoned sessions are not added to history

## Your controls

In **Settings → Privacy & data** you can:

- Review which keys are used
- **Clear preferences & history** (removes prefs and history; safety acknowledgement may remain until you clear site data in Safari)
- Open this document

In **History** you can export JSON or delete all session history.

## Network behavior

The app is designed to work offline after the first successful load. Apart from loading the app itself and optional export/download actions you trigger, it does not communicate with external services during normal use.

If analytics or crash reporting is added in a future version, it will be documented here and made opt-in where required.
