/* Undangan Cahaya & Hammam — nama tamu, penanda halaman, salin alamat, modal. Tanpa library. */
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
    if (!document.querySelector("dialog[open]")) history.replaceState(history.state, "", urlFor(current));
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

  /* ---------------- Salin teks (alamat & nomor rekening) ---------------- */

  function fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    // di dalam <dialog> modal, elemen di luar dialog tidak bisa difokus
    (document.querySelector("dialog[open]") || document.body).appendChild(ta);
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

  document.querySelectorAll("[data-copy]").forEach((btn) => {
    const status = btn.closest(".account").querySelector(".account__status");
    btn.addEventListener("click", async () => {
      const ok = await copyText(btn.dataset.copy);
      showStatus(status, ok ? "Nomor rekening tersalin" : "Tidak bisa menyalin. Tekan lama pada nomor untuk menyalin.", ok ? 2000 : 5000);
      // ikon salin berganti tanda centang selama status tampil
      btn.classList.toggle("is-copied", ok);
      window.clearTimeout(btn._timer);
      btn._timer = window.setTimeout(() => btn.classList.remove("is-copied"), 2000);
    });
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

  /* ---------------- Modal bab ---------------- */

  let lastTrigger = null;

  function openModal(id, trigger) {
    const dialog = document.getElementById(id);
    if (!dialog || dialog.open) return;
    lastTrigger = trigger || null;
    dialog.showModal();
    dialog.querySelector(".sheet__body").scrollTop = 0;
    history.pushState({ modal: id }, "", urlFor(current));
  }

  function closeModal(dialog) {
    if (!dialog.open) return;
    dialog.close();
    if (lastTrigger) lastTrigger.focus({ preventScroll: true });
  }

  // tutup lewat tombol/Esc/backdrop → mundur di riwayat agar tombol Back tetap konsisten
  function requestClose(dialog) {
    if (history.state && history.state.modal === dialog.id) history.back();
    else closeModal(dialog);
  }

  document.querySelectorAll("[data-modal]").forEach((btn) => {
    btn.addEventListener("click", () => openModal(btn.dataset.modal, btn));
  });

  document.querySelectorAll("dialog.sheet").forEach((dialog) => {
    dialog.addEventListener("cancel", (e) => { e.preventDefault(); requestClose(dialog); });
    dialog.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", () => requestClose(dialog)));
    dialog.addEventListener("click", (e) => { if (e.target === dialog) requestClose(dialog); });
  });

  window.addEventListener("popstate", () => {
    const open = document.querySelector("dialog[open]");
    if (open) closeModal(open);
  });

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
