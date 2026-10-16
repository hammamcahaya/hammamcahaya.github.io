/* Render gambar untuk satu versi undangan:
 *   tools/og-<versi>.html  → assets/img/og-image-<versi>.jpg  (preview WhatsApp, 1200x630)
 *   /<versi>/ (sampul)     → assets/img/versi/<versi>.jpg      (gambar mini di halaman pilih versi)
 * Butuh: server lokal di port 8765, Chrome, playwright-core (lihat tests/run-tests.js).
 *   NODE_PATH=~/.cache/undangan-test/node_modules node tools/make-og.js v2
 */
const { chromium } = require("playwright-core");
const fs = require("fs");
const path = require("path");

const version = process.argv[2];
if (!/^v\d+$/.test(version || "")) {
  console.error("Pakai: node tools/make-og.js <versi>, mis. v2");
  process.exit(1);
}
const IMG = path.join(__dirname, "..", "assets", "img");

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome" });

  const og = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await og.goto(`http://localhost:8765/tools/og-${version}.html`);
  await og.evaluate(() => document.fonts.ready);
  await og.screenshot({ path: path.join(IMG, `og-image-${version}.jpg`), type: "jpeg", quality: 82 });
  console.log(`assets/img/og-image-${version}.jpg`);

  // sampul dalam ukuran HP, setelah animasi pembuka selesai
  const thumb = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
  await thumb.goto(`http://localhost:8765/${version}/?tamu=Bapak+Anto`);
  await thumb.evaluate(() => document.fonts.ready);
  await thumb.waitForTimeout(500);
  fs.mkdirSync(path.join(IMG, "versi"), { recursive: true });
  await thumb.screenshot({ path: path.join(IMG, "versi", `${version}.jpg`), type: "jpeg", quality: 78 });
  console.log(`assets/img/versi/${version}.jpg`);

  await browser.close();
})();
