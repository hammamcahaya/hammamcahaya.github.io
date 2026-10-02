"""Generate tile motif latar (ceplok bunga) untuk halaman dan meja.

Menghasilkan:
  assets/img/motif.svg       — krem di atas krem, untuk halaman buku
  assets/img/motif-sogan.svg — garis tipis di atas sogan, untuk latar luar buku (desktop)
Jalankan: python3 tools/gen_motif.py
"""
import math
from pathlib import Path

S = 96  # ukuran tile
OUT = Path(__file__).resolve().parent.parent / "assets" / "img"


def f(v):
    return f"{v:.2f}".rstrip("0").rstrip(".")


def petal(cx, cy, r_in, r_out, w, ang):
    a = math.radians(ang)
    ux, uy = math.cos(a), math.sin(a)
    nx, ny = -uy, ux
    x0, y0 = cx + ux * r_in, cy + uy * r_in
    x1, y1 = cx + ux * r_out, cy + uy * r_out
    mx, my = cx + ux * (r_in + r_out) / 2, cy + uy * (r_in + r_out) / 2
    return (f"M{f(x0)} {f(y0)}Q{f(mx + nx * w)} {f(my + ny * w)} {f(x1)} {f(y1)}"
            f"Q{f(mx - nx * w)} {f(my - ny * w)} {f(x0)} {f(y0)}Z")


def flower(cx, cy, scale=1.0):
    d = []
    for k in range(8):
        d.append(petal(cx, cy, 6 * scale, 22 * scale, 6.5 * scale, k * 45))
    for k in range(8):
        d.append(petal(cx, cy, 20 * scale, 30 * scale, 3 * scale, k * 45 + 22.5))
    return d


def ring(cx, cy, r, n, rr):
    return [f"M{f(cx + r * math.cos(2 * math.pi * k / n) - rr)} {f(cy + r * math.sin(2 * math.pi * k / n))}"
            f"a{f(rr)} {f(rr)} 0 1 0 {f(2 * rr)} 0a{f(rr)} {f(rr)} 0 1 0 {f(-2 * rr)} 0Z" for k in range(n)]


def tile(fill_paths, stroke_paths, bg, fg, stroke_w):
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{S}" height="{S}" viewBox="0 0 {S} {S}">
<rect width="{S}" height="{S}" fill="{bg}"/>
<g fill="{fg}">{''.join(f'<path d="{d}"/>' for d in fill_paths)}</g>
<g fill="none" stroke="{fg}" stroke-width="{stroke_w}">{''.join(f'<path d="{d}"/>' for d in stroke_paths)}</g>
</svg>
"""


c = S / 2
fills = flower(c, c, 1.0) + ring(c, c, 3, 6, 1.1)
# bunga kecil di keempat sudut (bersambung antar-tile)
for x, y in [(0, 0), (S, 0), (0, S), (S, S)]:
    fills += flower(x, y, 0.55)
# titik di tengah tepi
for x, y in [(c, 0), (c, S), (0, c), (S, c)]:
    fills += ring(x, y, 5, 4, 1.4)
strokes = [f"M{f(c)} {f(c)}m-36 0a36 36 0 1 0 72 0a36 36 0 1 0 -72 0"]

(OUT / "motif.svg").write_text(tile(fills, strokes, "#F7F1E6", "#ECE2CF", 0.8))
(OUT / "motif-sogan.svg").write_text(tile(fills, strokes, "#4A3322", "#553B27", 0.8))
print("ok")
