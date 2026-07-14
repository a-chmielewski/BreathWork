# Performance budgets (iPhone 16 Pro Max target)

These budgets guide releases for the Breathwork PWA shell on the supported device.

## Asset budgets

| Asset group | Budget (compressed) | Notes |
|-------------|---------------------|-------|
| App shell JS | ≤ 80 KB total | `app.js`, modules, engine, audio |
| App shell CSS | ≤ 25 KB | `styles.css` |
| Icons (PNG + SVG) | ≤ 15 KB | Generated via `scripts/generate-icons.py` |
| Audio | 0 KB transfer | Synthesized at runtime — no audio files |

## Startup

| Metric | Budget |
|--------|--------|
| Loader visibility | Only if init exceeds **280 ms** |
| First paint | List screen visible without blocking on network after offline cache warm |
| External runtime deps | **None** (system fonts only) |

## Session runtime

| Metric | Budget |
|--------|--------|
| Cue scheduler interval | 100 ms (not per-frame) |
| Breathing animation | CSS transform on one orb; disabled under `prefers-reduced-motion` |
| Audio contexts | One shared context per session |

## Verification

```bash
npm run check
```

Repeat offline launch on device: list screen should appear immediately with no unnecessary loader flash.
