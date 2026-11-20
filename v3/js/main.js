/* Undangan Cahaya & Hammam — nama tamu, penanda halaman, gerak, salin alamat. (v3) Tanpa library. */
(() => {
  "use strict";

  const pages = Array.from(document.querySelectorAll(".page"));
  const dots = Array.from(document.querySelectorAll("#dots a"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let current = 0;

  /* ---------------- Nama tamu dari ?tamu= ---------------- */

  const MAX_NAME = 60;

  function readGuestName() {
    const raw = new URLSearchParams(window.location.search).get("tamu") || "";
    const clean = raw.replace(/\s+/g, " ").replace(/[\u0000-\u001F\u007F]/g, "").trim();
    return Array.from(clean).slice(0, MAX_NAME).join("").trim();
  }

  const guestName = readGuestName();
  if (guestName) {
    document.getElementById("guest-name").textContent = guestName;
    document.title = `Untuk ${guestName} | The Wedding of Cahaya & Hammam`;
  } else {
    document.querySelector(".guest__to").textContent = "Kepada Yth.";
  }

  /* ---------------- Navigasi gulir ---------------- */

  function urlFor(index) {
    return `${window.location.pathname}${window.location.search}#${index + 1}`;
  }

  function scrollToPage(index, smooth = true) {
    const page = pages[Math.max(0, Math.min(pages.length - 1, index))];
    page.scrollIntoView({ behavior: smooth && !reduceMotion.matches ? "smooth" : "instant", block: "start" });
  }

  function setCurrent(index) {
    if (index === current) return;
    current = index;
    dots.forEach((d, i) => d.setAttribute("aria-current", i === current ? "true" : "false"));
    // ganti hash tanpa menambah riwayat: tombol Back tetap keluar dari undangan, bukan mundur per halaman
    history.replaceState(history.state, "", urlFor(current));
  }

  // halaman aktif = halaman yang menutupi garis tengah layar
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setCurrent(pages.indexOf(entry.target));
    });
  }, { rootMargin: "-50% 0px -50% 0px" });
  pages.forEach((p) => observer.observe(p));

  document.querySelectorAll("[data-go]").forEach((el) => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      scrollToPage(Number(el.dataset.go));
    });
  });

  /* ---------------- Gerak ---------------- */

  // "Buka Undangan": monogram berdenyut sebentar sebelum halaman bergulir
  const cover = document.querySelector(".page--cover");
  cover.querySelector(".btn--primary").addEventListener("click", () => {
    cover.classList.remove("is-opening");
    void cover.offsetWidth; // mulai ulang animasi bila tombol ditekan lagi
    cover.classList.add("is-opening");
  });

  // elemen [data-reveal] muncul bertahap saat masuk layar; CSS yang menyembunyikannya
  // yang masuk bersamaan diberi jeda berurutan
  const revealer = new IntersectionObserver((entries) => {
    entries.filter((e) => e.isIntersecting).forEach((entry, i) => {
      entry.target.style.setProperty("--d", `${Math.min(i, 5) * 0.09}s`);
      entry.target.classList.add("is-in");
      revealer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll("[data-reveal]").forEach((el) => revealer.observe(el));

  /* ---------------- Salin alamat ---------------- */

  function fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (_) { ok = false; }
    ta.remove();
    return ok;
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_) { /* jatuh ke cara lama */ }
    return fallbackCopy(text);
  }

  function showStatus(el, message, ms) {
    el.textContent = message;
    window.clearTimeout(el._timer);
    el._timer = window.setTimeout(() => { el.textContent = ""; }, ms);
  }

  const copyBtn = document.getElementById("copy-address");
  const copyStatus = document.getElementById("copy-status");
  copyBtn.addEventListener("click", async () => {
    const ok = await copyText(copyBtn.dataset.address);
    showStatus(copyStatus, ok ? "Alamat tersalin" : "Alamat tidak bisa disalin. Tekan lama pada teks alamat untuk menyalin.", ok ? 2000 : 5000);
  });


  /* ---------------- Musik latar ---------------- */

  const bgm = document.getElementById("bgm");
  const musicBtn = document.getElementById("music-toggle");
  let resumeOnReturn = false;

  function syncMusicButton() {
    const playing = !bgm.paused;
    musicBtn.setAttribute("aria-pressed", playing ? "true" : "false");
    musicBtn.setAttribute("aria-label", playing ? "Jeda musik" : "Putar musik");
  }

  // browser hanya mengizinkan audio diputar setelah ada sentuhan/klik dari tamu
  function playMusic() {
    const p = bgm.play();
    if (p && p.catch) p.catch(() => syncMusicButton());
  }

  bgm.addEventListener("play", syncMusicButton);
  bgm.addEventListener("pause", syncMusicButton);

  musicBtn.addEventListener("click", () => {
    if (bgm.paused) playMusic();
    else bgm.pause();
  });

  document.querySelectorAll("[data-music-start]").forEach((el) => {
    el.addEventListener("click", () => { if (bgm.paused) playMusic(); });
  });

  // jeda saat tamu pindah aplikasi/tab, lanjutkan saat kembali
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      resumeOnReturn = !bgm.paused;
      bgm.pause();
    } else if (resumeOnReturn) {
      playMusic();
    }
  });

  /* ---------------- Hitung mundur ke akad nikah ---------------- */

  const AKAD = Date.parse("2026-11-29T06:00:00+07:00");
  const cd = ["d", "h", "m", "s"].map((k) => document.getElementById(`cd-${k}`));
  const pad = (n) => String(n).padStart(2, "0");

  function tick() {
    const left = Math.max(0, Math.floor((AKAD - Date.now()) / 1000));
    const parts = [Math.floor(left / 86400), Math.floor(left / 3600) % 24, Math.floor(left / 60) % 60, left % 60];
    cd.forEach((el, i) => { el.textContent = pad(parts[i]); });
    return left > 0;
  }
  if (tick()) {
    const timer = window.setInterval(() => { if (!tick()) window.clearInterval(timer); }, 1000);
  }

  /* ---------------- Mulai ---------------- */

  function pageFromHash() {
    const m = /^#([1-9])$/.exec(window.location.hash);
    return m ? Number(m[1]) - 1 : -1;
  }

  // hash diubah manual (mis. link #3 dibuka saat halaman sudah terbuka)
  window.addEventListener("hashchange", () => {
    const index = pageFromHash();
    if (index >= 0) scrollToPage(index);
  });

  const start = pageFromHash();
  if (start >= 0) {
    current = -1;
    scrollToPage(start, false);
    // tinggi halaman berubah saat font selesai dimuat: tepatkan ulang selama tamu belum menggulir sendiri
    let touched = false;
    ["wheel", "touchstart", "keydown"].forEach((t) => window.addEventListener(t, () => { touched = true; }, { once: true, passive: true }));
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => { if (!touched) scrollToPage(start, false); });
    }
  } else {
    dots[0].setAttribute("aria-current", "true");
  }
})();
