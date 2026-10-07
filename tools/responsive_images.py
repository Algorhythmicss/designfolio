"""Generate smaller portfolio assets without changing the original artwork.

Run with Python and Pillow. Original files remain the largest srcset candidate;
the browser selects a derivative only when its actual rendered size permits it.
"""
from pathlib import Path
import json

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "responsive"
SOURCES = {
    "leetify-v6": ("assets/work-scenes/leetify-v6.webp", [960, 1440]),
    "festival-v7": ("assets/work-scenes/festival-v7.webp", [960, 1440]),
    "room-v6": ("assets/work-scenes/room-v6.webp", [960, 1440]),
    "coffee-v6": ("assets/work-scenes/coffee-v6.webp", [960, 1440]),
    "elsewhere-desktop": ("assets/shots/elsewhere-desktop.webp", [480, 800]),
    "second-nature-desktop-v14": ("assets/shots/second-nature-desktop-v14.webp", [480, 800]),
    "side-note-desktop-v14": ("assets/shots/side-note-desktop-v14.webp", [480, 800]),
    "idea-to-product": ("assets/process-v13/idea-to-product.webp", [420, 768]),
    "making-connections": ("assets/making-connections.webp", [1024]),
    "opening-world": ("assets/opening-world.webp", [1024]),
}


def generate():
    OUT.mkdir(parents=True, exist_ok=True)
    manifest = {}
    for name, (relative, widths) in SOURCES.items():
        source = ROOT / relative
        with Image.open(source) as image:
            original_width, original_height = image.size
            variants = []
            for width in widths:
                height = round(original_height * width / original_width)
                output = OUT / f"{name}-{width}.webp"
                resized = image.resize((width, height), Image.Resampling.LANCZOS)
                resized.save(output, format="WEBP", quality=88, method=6)
                variants.append({"path": str(output.relative_to(ROOT)), "width": width,
                                 "height": height, "bytes": output.stat().st_size})
            manifest[name] = {"source": relative, "sourceWidth": original_width,
                              "sourceHeight": original_height,
                              "sourceBytes": source.stat().st_size, "variants": variants}
    (OUT / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")
    print(json.dumps(manifest, indent=2))


if __name__ == "__main__":
    generate()
