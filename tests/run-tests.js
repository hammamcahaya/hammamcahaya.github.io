/* Uji otomatis undangan: nama tamu, navigasi, modal, dan overflow.
 *
 * Kebutuhan: Node 18+, Google Chrome, dan paket playwright-core
 * (dipasang di luar repo, mis. `npm i --prefix ~/.cache/undangan-test playwright-core`).
 *
 * Jalankan dari root proyek:
 *   python3 -m http.server 8765 &
 *   NODE_PATH=~/.cache/undangan-test/node_modules node tests/run-tests.js
 */
const { chromium } = require("playwright-core");

const BASE = process.env.BASE_URL || "http://localhost:8765/";
const CHROME = process.env.CHROME || "/usr/bin/google-chrome";

const A80 = "A".repeat(80);
const FLOWERS70 = "🌸".repeat(70);

const guestCases = [
  ["", null],
  ["?tamu=", null],
  ["?tamu=%20%20%20", null],
  ["?tamu=Anto", "Anto"],
  ["?tamu=Bapak+Anto", "Bapak Anto"],
  ["?tamu=Bapak%20Anto", "Bapak Anto"],
  ["?tamu=%20%20Bu%20%20Siti%20%20", "Bu Siti"],
  ["?tamu=Keluarga%20Besar%20Bpk.%20H.%20Sutrisno%2C%20S.H.", "Keluarga Besar Bpk. H. Sutrisno, S.H."],
  ["?tamu=Dr.%20Ir.%20R.%20Ay.%20Sri%20Lestari%2C%20M.Sc.", "Dr. Ir. R. Ay. Sri Lestari, M.Sc."],
  ["?tamu=Jos%C3%A9%20%26%20Mar%C3%ADa", "José & María"],
  ["?tamu=%F0%9F%8C%B8%20Rina%20%F0%9F%8C%B8", "🌸 Rina 🌸"],
  ["?tamu=<script>alert(1)</script>", "<script>alert(1)</script>"],
  ["?tamu=%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E", "<img src=x onerror=alert(1)>"],
  [`?tamu=${A80}`, "A".repeat(60)],
  [`?tamu=${encodeURIComponent(FLOWERS70)}`, "🌸".repeat(60)],
  ["?tamu=Anto&tamu=Budi", "Anto"],
  ["?TAMU=Anto", null],
  ["?tamu=%E0%A4%A", "__any__"],
  ["?tamu=Anto%0ABudi", "Anto Budi"],
  ["?tamu=Anto#3", "Anto"],
];

let failed = 0;
function check(name, ok, detail = "") {
  if (ok) console.log(`  ok   ${name}`);
  else { failed++; console.log(`  FAIL ${name} ${detail}`); }
}

// halaman aktif = titik penanda yang bertanda aria-current
const currentPage = async (page) => {
  await page.waitForTimeout(250);
  return page.evaluate(() => [...document.querySelectorAll("#dots a")].findIndex((d) => d.getAttribute("aria-current") === "true"));
};
// halaman yang benar-benar terlihat di tengah layar
const visiblePage = (page) => page.evaluate(() => {
  const y = window.innerHeight / 2;
  return [...document.querySelectorAll(".page")].findIndex((p) => {
    const r = p.getBoundingClientRect();
    return r.top <= y && r.bottom >= y;
  });
});

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });

  /* ---------- 1. Nama tamu ---------- */
  console.log("Nama tamu (?tamu=)");
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    let dialogs = 0;
    const errors = [];
    page.on("dialog", (d) => { dialogs++; d.dismiss(); });
    page.on("pageerror", (e) => errors.push(String(e)));
    for (const [i, [q, expected]] of guestCases.entries()) {
      await page.goto(BASE + q);
      const name = await page.textContent("#guest-name");
      const to = await page.textContent(".guest__to");
      const label = `#${i + 1} ${q.slice(0, 40) || "(tanpa query)"}`;
      if (expected === null) check(label, name === "Bapak/Ibu/Saudara/i" && to === "Kepada Yth.", `→ "${name}" / "${to}"`);
      else if (expected === "__any__") check(label, name.length > 0, `→ "${name}"`);
      else check(label, name === expected, `→ "${name}"`);
    }
    check("tidak ada alert() yang tereksekusi", dialogs === 0, `(${dialogs})`);
    check("tidak ada error JavaScript", errors.length === 0, errors.join(" | "));
    await page.goto("about:blank");
    await page.goto(BASE + "?tamu=Anto#3");
    // posisi dirapikan ulang setelah font selesai dimuat (tinggi halaman berubah)
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);
    check("#20 hash #3 membuka halaman 3", (await currentPage(page)) === 2 && (await visiblePage(page)) === 2);
    await ctx.close();
  }

  /* ---------- 2. Navigasi gulir ---------- */
  console.log("Navigasi gulir");
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto(BASE + "?tamu=Anto");
    check("mulai di halaman 1", (await currentPage(page)) === 0 && (await visiblePage(page)) === 0);

    await page.click(".page--cover .btn--primary");
    check("'Buka Undangan' menggulir ke halaman 2", (await visiblePage(page)) === 1 && (await currentPage(page)) === 1);
    check("URL berisi #2 dan ?tamu tetap ada", page.url().endsWith("?tamu=Anto#2"), page.url());

    await page.click("#dots a[data-go='2']");
    check("titik penanda ke halaman 3", (await visiblePage(page)) === 2 && (await currentPage(page)) === 2);

    await page.mouse.move(195, 400);
    await page.mouse.wheel(0, 2400);
    await page.waitForTimeout(400);
    check("gulir ke bawah sampai halaman 4", (await currentPage(page)) === 3, `(${await currentPage(page)})`);

    await page.evaluate(() => window.scrollTo(0, 0));
    check("gulir ke atas kembali ke halaman 1", (await currentPage(page)) === 0);

    const histLen = await page.evaluate(() => history.length);
    await page.click("#dots a[data-go='3']");
    check("pindah halaman tidak menambah riwayat", (await page.evaluate(() => history.length)) === histLen);

    await page.goto(BASE + "?tamu=Anto#3");
    check("link #3 langsung membuka halaman 3", (await visiblePage(page)) === 2 && (await currentPage(page)) === 2);

    const hScroll = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    check("tidak ada gulir horizontal", !hScroll);
    await ctx.close();
  }

  /* ---------- 3. Modal ---------- */
  console.log("Modal bab");
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto(BASE + "#4");
    const isOpen = (id) => page.evaluate((i) => document.getElementById(i).open, id);

    await page.click("[data-modal='bab-sekitar']");
    check("kartu 1 membuka modal", await isOpen("bab-sekitar"));
    const imgs = await page.evaluate(() => [...document.querySelectorAll("#bab-sekitar .sheet__fig img")].length);
    check("modal 1 memuat 7 foto", imgs === 7, `(${imgs})`);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(150);
    check("Esc menutup modal", !(await isOpen("bab-sekitar")));
    const focused = await page.evaluate(() => document.activeElement && document.activeElement.dataset.modal);
    check("fokus kembali ke tombol pemicu", focused === "bab-sekitar", `(${focused})`);
    check("tetap di halaman 4", (await visiblePage(page)) === 3);

    await page.click("[data-modal='bab-jawa']");
    check("kartu 2 membuka modal", await isOpen("bab-jawa"));
    await page.goBack();
    await page.waitForTimeout(150);
    check("tombol Back menutup modal", !(await isOpen("bab-jawa")));
    check("Back tidak keluar dari halaman 4", (await visiblePage(page)) === 3);

    await page.click("[data-modal='bab-jawa']");
    await page.click("#bab-jawa [data-close]");
    await page.waitForTimeout(150);
    check("tombol × menutup modal", !(await isOpen("bab-jawa")));

    await page.click("[data-modal='bab-jawa']");
    await page.mouse.click(195, 20); // area backdrop di atas sheet
    await page.waitForTimeout(150);
    check("tap backdrop menutup modal", !(await isOpen("bab-jawa")));
    await ctx.close();
  }

  /* ---------- 4. Overflow di layar kecil ---------- */
  console.log("Overflow horizontal");
  for (const [w, h] of [[320, 568], [360, 640], [390, 844], [412, 915], [844, 390], [768, 1024], [1440, 900]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto(`${BASE}?tamu=${encodeURIComponent("Keluarga Besar Bapak H. Sutrisno Wiryodiningrat, S.H., M.H.")}`);
    await page.evaluate(() => document.fonts.ready);
    const bad = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll(".page").forEach((pg, n) => {
        const pr = pg.getBoundingClientRect();
        pg.querySelectorAll(".page__body *:not(svg *)").forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.width === 0) return;
          if (r.left < pr.left - 1 || r.right > pr.right + 1) out.push(`hal ${n + 1}: ${el.className || el.tagName}`);
        });
      });
      return out;
    });
    check(`${w}x${h}: tidak ada elemen keluar halaman`, bad.length === 0, bad.slice(0, 4).join(", "));
    await ctx.close();
  }

  await browser.close();
  console.log(failed ? `\n${failed} uji GAGAL` : "\nSemua uji lolos");
  process.exit(failed ? 1 : 0);
})();
