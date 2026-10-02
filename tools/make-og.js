/* Render tools/og.html menjadi assets/img/og-image.jpg (1200x630).
 * Butuh: server lokal di port 8765, Chrome, playwright-core (lihat tests/run-tests.js).
 *   NODE_PATH=~/.cache/undangan-test/node_modules node tools/make-og.js
 */
const { chromium } = require("playwright-core");
const path = require("path");

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME || "/usr/bin/google-chrome" });
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  await page.goto("http://localhost:8765/tools/og.html");
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: path.join(__dirname, "..", "assets", "img", "og-image.jpg"),
    type: "jpeg",
    quality: 82,
  });
  await browser.close();
  console.log("assets/img/og-image.jpg");
})();
