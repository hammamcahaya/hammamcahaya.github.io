"""Siapkan kayon.png untuk potrace: ambil kanal alpha, perbesar 3x, lalu threshold.

Hasil: referensi/gambar/kayon-bw.png (hitam = ornamen, putih = latar).
Jalankan: python3 tools/prep_kayon.py
"""
from pathlib import Path
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "referensi" / "gambar" / "kayon.png"
OUT = ROOT / "referensi" / "gambar" / "kayon-bw.png"
SCALE = 3

im = Image.open(SRC).convert("RGBA")
# ornamen hitam di atas transparan: pakai alpha × kegelapan agar tepi antialias ikut terhitung
r, g, b, a = im.split()
lum = Image.merge("RGB", (r, g, b)).convert("L")
ink = Image.eval(lum, lambda v: 255 - v)
mask = Image.composite(ink, Image.new("L", im.size, 0), a)

big = mask.resize((im.width * SCALE, im.height * SCALE), Image.LANCZOS)
big = big.filter(ImageFilter.GaussianBlur(0.8))
bw = big.point(lambda v: 0 if v >= 128 else 255, mode="L")
pad = 12
canvas = Image.new("L", (bw.width + 2 * pad, bw.height + 2 * pad), 255)
canvas.paste(bw, (pad, pad))
canvas.save(OUT)
print(OUT, canvas.size)
