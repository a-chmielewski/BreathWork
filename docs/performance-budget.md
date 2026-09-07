# Performance budgets (iPhone 16 Pro Max target)

These budgets guide releases for the Breathwork PWA shell on the supported device.

## Asset budgets

| Asset group | Budget | Current measurement |
|-------------|--------|---------------------|
| App shell JS | ≤ 300 KB raw / ≤ 80 KB gzip | 284,454 bytes raw / 67,166 bytes gzip across 18 files |
| App shell CSS | ≤ 32 KB raw / ≤ 8 KB gzip | 30,417 bytes raw / 5,583 bytes gzip |
| Icons (PNG + SVG) | ≤ 15 KB raw | Generated via `scripts/generate-icons.py` |
| Optional ambient audio | ≤ 4.5 MB | 4,124,424-byte, 7:30 AAC file cached separately from the required app shell |

## Startup

The raw JavaScript ceiling was raised from 250 KB to 300 KB after adding the bilingual Kundalini Foundations instruction and guidance content. The compressed transfer ceiling remains unchanged.

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
| Audio contexts | At most one cue context and one ambient-media context per session |

## Verification

```bash
npm run check
```

Repeat offline launch on device: list screen should appear immediately with no unnecessary loader flash.
