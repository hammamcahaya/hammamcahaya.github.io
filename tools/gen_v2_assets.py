"""Aset grafis tema v2 (Keraton Malam).

Menghasilkan:
  assets/img/gunungan-prada.svg — gunungan tanpa latar krem, isian gradien emas prada
  assets/img/truntum-prada.svg  — tile motif truntum emas samar, untuk latar gelap
  assets/img/truntum-kertas.svg — tile motif truntum cokelat samar, untuk latar kertas
Jalankan: python3 tools/gen_v2_assets.py
"""
import math
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
IMG = ROOT / "assets" / "img"
S = 56  # ukuran tile truntum


def f(v):
    return f"{v:.2f}".rstrip("0").rstrip(".")


def gunungan_prada():
    src = (IMG / "gunungan.svg").read_text()
    viewbox = re.search(r'viewBox="([^"]+)"', src).group(1)
    gold = re.search(r'<path fill="#9A6A2A" fill-rule="evenodd" d="([^"]+)"', src).group(1)
    svg = (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{viewbox}">'
        '<defs><linearGradient id="p" x1="0" y1="0" x2=".35" y2="1">'
        '<stop offset="0" stop-color="#E9CF96"/><stop offset=".38" stop-color="#C39A55"/>'
        '<stop offset=".62" stop-color="#E2C486"/><stop offset="1" stop-color="#9C7438"/>'
        '</linearGradient></defs>'
        f'<path fill="url(#p)" fill-rule="evenodd" d="{gold}"/></svg>'
    )
    (IMG / "gunungan-prada.svg").write_text(svg)


def truntum(cx, cy, s=1.0):
    """Satu kuntum truntum: inti, delapan kelopak titik, dan cincin titik kecil."""
    out = [f'<circle cx="{f(cx)}" cy="{f(cy)}" r="{f(1.7 * s)}"/>']
    for k in range(8):
        a = math.radians(k * 45)
        x, y = cx + math.cos(a) * 5 * s, cy + math.sin(a) * 5 * s
        out.append(
            f'<ellipse cx="{f(x)}" cy="{f(y)}" rx="{f(2 * s)}" ry="{f(1.05 * s)}" '
            f'transform="rotate({k * 45} {f(x)} {f(y)})"/>'
        )
    for k in range(8):
        a = math.radians(k * 45 + 22.5)
        out.append(f'<circle cx="{f(cx + math.cos(a) * 9 * s)}" cy="{f(cy + math.sin(a) * 9 * s)}" r="{f(.75 * s)}"/>')
    return out


def tile(fill, opacity):
    shapes = []
    # kuntum besar di pojok (terpotong rapi oleh tile sebelahnya) dan di tengah
    for cx, cy in [(0, 0), (S, 0), (0, S), (S, S), (S / 2, S / 2)]:
        shapes += truntum(cx, cy)
    # titik bintang kecil di antara kuntum
    for cx, cy in [(S / 2, 0), (0, S / 2), (S, S / 2), (S / 2, S)]:
        shapes.append(f'<circle cx="{f(cx)}" cy="{f(cy)}" r=".9"/>')
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{S}" height="{S}" viewBox="0 0 {S} {S}">'
        f'<g fill="{fill}" fill-opacity="{opacity}">{"".join(shapes)}</g></svg>'
    )


def main():
    gunungan_prada()
    (IMG / "truntum-prada.svg").write_text(tile("#C9A15B", ".16"))
    (IMG / "truntum-kertas.svg").write_text(tile("#8A6430", ".13"))
    for n in ["gunungan-prada.svg", "truntum-prada.svg", "truntum-kertas.svg"]:
        print(n, (IMG / n).stat().st_size, "bytes")


if __name__ == "__main__":
    main()
