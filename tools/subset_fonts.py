"""Subset font v2 agar ringan.

Sumber (Google Fonts, SIL OFL) diunduh dulu ke folder sementara:
  Bodoni Moda (latin, tegak & miring, variabel wght+opsz)
  Noto Sans Javanese (hanya aksara yang dipakai di sampul & penutup)

Jalankan: python3 tools/subset_fonts.py <folder-sumber>
  <folder-sumber> berisi bodoni-moda.woff2, bodoni-moda-italic.woff2, jv-full.woff2
"""
import sys
from pathlib import Path

from fontTools import subset

OUT = Path(__file__).resolve().parent.parent / "assets" / "fonts"

# huruf latin dasar + tanda baca yang dipakai
LATIN = "U+0020-007E,U+00A0,U+00B7,U+00C0-00FF,U+2013,U+2014,U+2018,U+2019,U+201C,U+201D,U+2026"
# ꧋ꦕꦲꦪ ꦭꦤ꧀ ꦲꦩ꧀ꦩꦩ꧀꧉  (Cahaya lan Hammam)
AKSARA = "꧋ꦕꦲꦪ ꦭꦤ꧀ ꦲꦩ꧀ꦩꦩ꧀꧉"


def run(src, dst, *, unicodes=None, text=None):
    args = [str(src), f"--output-file={dst}", "--flavor=woff2", "--layout-features=*", "--no-hinting"]
    if unicodes:
        args.append(f"--unicodes={unicodes}")
    if text:
        args.append(f"--text={text}")
    subset.main(args)
    print(f"{dst.name}: {dst.stat().st_size // 1024} KB")


def main():
    src = Path(sys.argv[1])
    run(src / "bodoni-moda.woff2", OUT / "bodoni-moda.woff2", unicodes=LATIN)
    run(src / "bodoni-moda-italic.woff2", OUT / "bodoni-moda-italic.woff2", unicodes=LATIN)
    run(src / "jv-full.woff2", OUT / "aksara-jawa.woff2", text=AKSARA)


if __name__ == "__main__":
    main()
