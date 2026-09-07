# Audio assets

## Unwind ambient

- Runtime file: `assets/audio/unwind-ambient.m4a`
- Duration: 7:30
- Format: AAC-LC, 44.1 kHz stereo, approximately 72 kbit/s
- Size: 4,124,424 bytes (approximately 4.12 MB)
- Source: original procedural soundscape generated for this app on 2026-09-07
- Ingredients: three low sine tones (110 Hz, 165 Hz, and 220 Hz) with slow amplitude modulation and filtered pink noise
- Third-party samples: none
- Processing: low-pass filtering, five-second fade-in, seven-second fade-out, and AAC encoding with FFmpeg
- Intended use: optional low-level ambience during the natural-breath rest stage
- Runtime headroom: 30 seconds beyond the seven-minute rest stage

The file is intentionally quiet and should still be evaluated at low, medium, and high device volume on the physical iPhone 16 Pro Max. Replace it before release if the sustained tones feel fatiguing, tonal beating is distracting, or the hardware speaker makes the low frequencies disappear.
