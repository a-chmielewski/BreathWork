#!/usr/bin/env python3
"""Generate correctly sized Breathwork PNG icons from the vector design."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
BG = (10, 10, 10, 255)
STROKE = (229, 229, 229, 235)


def draw_icon(size: int, *, maskable: bool = False) -> Image.Image:
    img = Image.new('RGBA', (size, size), BG)
    draw = ImageDraw.Draw(img)
    padding = int(size * (0.18 if maskable else 0.12))
    stroke = max(2, int(size * 0.045))
    bbox = (padding, padding, size - padding, size - padding)
    draw.ellipse(bbox, outline=STROKE, width=stroke)
    return img


def save_png(path: Path, image: Image.Image) -> None:
    image.save(path, format='PNG', optimize=True)


def main() -> None:
    targets = {
        'icon-180.png': (180, False),
        'icon-192.png': (192, False),
        'icon-512.png': (512, False),
        'icon-512-maskable.png': (512, True),
        'favicon-32.png': (32, False),
    }

    for filename, (size, maskable) in targets.items():
        save_png(ROOT / filename, draw_icon(size, maskable=maskable))
        print(f'wrote {filename} ({size}x{size})')


if __name__ == '__main__':
    main()
