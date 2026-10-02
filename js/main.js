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

  /* ---------------- Salin alamat ---------------- */

  const copyBtn = document.getElementById("copy-address");
  const copyStatus = document.getElementById("copy-status");
  let copyTimer = 0;

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

  copyBtn.addEventListener("click", async () => {
    const text = copyBtn.dataset.address;
    let ok = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        ok = true;
      } else {
        ok = fallbackCopy(text);
      }
    } catch (_) {
      ok = fallbackCopy(text);
    }
    copyStatus.textContent = ok ? "Alamat tersalin" : "Alamat tidak bisa disalin. Tekan lama pada teks alamat untuk menyalin.";
    window.clearTimeout(copyTimer);
    copyTimer = window.setTimeout(() => { copyStatus.textContent = ""; }, ok ? 2000 : 5000);
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
