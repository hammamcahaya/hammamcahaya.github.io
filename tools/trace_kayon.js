/* Vektorisasi referensi/gambar/kayon.png menjadi assets/img/gunungan.svg.
 *
 * Langkah:
 *   1. python3 tools/prep_kayon.py   → kanal alpha PNG diperbesar 3x lalu di-threshold (hitam/putih)
 *   2. node tools/trace_kayon.js     → potrace + svgo, diwarnai emas
 * Butuh paket potrace dan svgo (dipasang di luar repo, lihat README).
 */
const fs = require("fs");
const path = require("path");
const potrace = require("potrace");
const { optimize } = require("svgo");

const ROOT = path.join(__dirname, "..");
const SRC = process.env.KAYON_BW || path.join(ROOT, "referensi", "gambar", "kayon-bw.png");
const OUT = path.join(ROOT, "assets", "img", "gunungan.svg");
const GOLD = "#9A6A2A";
const PAPER = "#F7F1E6";

potrace.trace(SRC, {
  threshold: 128,
  turdSize: Number(process.env.TURD || 20),          // buang bintik kecil (px² pada skala 3x)
  alphaMax: 1.0,       // kehalusan sudut
  optCurve: true,
  optTolerance: Number(process.env.OPT_TOL || 0.8),  // makin besar makin ringkas, makin kurang presisi
  color: GOLD,
  background: "transparent",
}, (err, svg) => {
  if (err) throw err;
  const { data } = optimize(svg, {
    multipass: true,
    floatPrecision: 0,  // koordinat skala 3x: pembulatan ke 1 unit tidak terlihat
    plugins: [
      { name: "preset-default" },
      "removeDimensions",
    ],
  });
  // Isi bagian dalam gunungan dengan krem polos (seperti referensi) agar motif latar tidak tembus.
  // Subpath pertama dari potrace adalah kontur terluar (dipindai dari atas, ujung gunungan).
  const d = /<path[^>]* d="([^"]+)"/.exec(data)[1];
  const outer = d.slice(0, d.search(/[zZ]/) + 1);
  const out = data.replace("<path", `<path fill="${PAPER}" d="${outer}"/><path`);
  fs.writeFileSync(OUT, out);
  console.log(`${path.relative(ROOT, OUT)}: ${(out.length / 1024).toFixed(1)} KB`);
});
