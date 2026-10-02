/* Undangan Cahaya & Hammam — navigasi buku, nama tamu, modal. Tanpa library. */
(() => {
  "use strict";

  const book = document.getElementById("book");
  const pages = Array.from(book.querySelectorAll(".page"));
  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");
  const dots = Array.from(document.querySelectorAll("#dots button"));
  const last = pages.length - 1;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const FLIP_MS = 720;

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

  /* ---------------- Status halaman ---------------- */

  function render() {
    pages.forEach((page, i) => {
      const flipped = i < current;
      page.classList.toggle("is-flipped", flipped);
      // halaman yang sudah dibalik ditumpuk berurutan di bawah; yang belum, makin depan makin atas
      page.style.zIndex = flipped ? String(i + 1) : String(pages.length * 2 - i);
      page.inert = i !== current;
    });
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === last;
    dots.forEach((d, i) => d.setAttribute("aria-current", i === current ? "true" : "false"));
    requestAnimationFrame(updateScrollHints);
  }

  function markTurning(page) {
    if (!page || reduceMotion.matches) return;
    page.classList.add("is-turning");
    window.clearTimeout(page._turnTimer);
    page._turnTimer = window.setTimeout(() => page.classList.remove("is-turning"), FLIP_MS + 60);
  }

  function urlFor(index) {
    return `${window.location.pathname}${window.location.search}#${index + 1}`;
  }

  function go(index, { push = true } = {}) {
    index = Math.max(0, Math.min(last, index));
    if (index === current) return;
    stopPeek();
    // halaman yang bergerak: maju → halaman sekarang terbalik; mundur → halaman sebelumnya kembali
    const step = index > current ? 1 : -1;
    for (let i = current; i !== index; i += step) {
      markTurning(step > 0 ? pages[i] : pages[i - 1]);
    }
    current = index;
    render();
    if (push) history.pushState({ page: current }, "", urlFor(current));
  }

  /* ---------------- Tombol & keyboard ---------------- */

  prevBtn.addEventListener("click", () => go(current - 1));
  nextBtn.addEventListener("click", () => go(current + 1));
  document.querySelectorAll("[data-go]").forEach((el) => {
    el.addEventListener("click", () => go(Number(el.dataset.go)));
  });

  document.addEventListener("keydown", (e) => {
    if (document.querySelector("dialog[open]")) return;
    if (e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); go(current + 1); }
    if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); go(current - 1); }
  });

  /* ---------------- Geser / seret halaman ---------------- */

  const EDGE_ZONE = 24;    // abaikan geser dari tepi kiri (gesture "back" iOS)
  const LOCK_PX = 10;      // jarak sebelum arah gesture dikunci
  const COMMIT_PX = 50;    // minimal geser untuk membalik halaman

  let drag = null;
  let suppressClick = false;

  book.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || document.querySelector("dialog[open]")) return;
    if (e.pointerType === "touch" && e.clientX < EDGE_ZONE) return;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, dx: 0, mode: null, page: null, width: book.clientWidth };
  });

  book.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;

    if (!drag.mode) {
      if (Math.abs(dx) < LOCK_PX && Math.abs(dy) < LOCK_PX) return;
      if (Math.abs(dy) >= Math.abs(dx)) { drag = null; return; } // gesture vertikal: biarkan scroll
      startDrag(dx < 0 ? "next" : "prev");
      try { book.setPointerCapture(e.pointerId); } catch (_) { /* pointer sudah dilepas */ }
    }
    drag.dx = dx;
    applyDrag();
  });

  function startDrag(dir) {
    stopPeek();
    if (dir === "next" && current < last) {
      drag.mode = "next";
      drag.page = pages[current];
    } else if (dir === "prev" && current > 0) {
      drag.mode = "prev";
      drag.page = pages[current - 1];
    } else {
      drag.mode = "bounce";
      drag.page = pages[current];
    }
    drag.page.classList.add("is-dragging", "is-turning");
    drag.page.inert = false;
  }

  function applyDrag() {
    const { page, mode, width } = drag;
    const p = drag.dx / width;
    if (reduceMotion.matches && mode !== "bounce") return;
    if (mode === "next") {
      page.style.transform = `rotateY(${Math.max(-180, Math.min(0, p * 180))}deg)`;
    } else if (mode === "prev") {
      page.style.transform = `rotateY(${-180 + Math.max(0, Math.min(180, p * 180))}deg)`;
    } else {
      // tepi buku: pantulan kecil
      page.style.transform = `translateX(${Math.max(-24, Math.min(24, drag.dx * 0.12))}px)`;
    }
  }

  function endDrag(e, cancelled) {
    if (!drag || (e && e.pointerId !== drag.id)) return;
    const d = drag;
    drag = null;
    if (!d.mode) return;

    suppressClick = true;
    window.setTimeout(() => { suppressClick = false; }, 0);

    const page = d.page;
    page.classList.remove("is-dragging");
    // paksa reflow agar transisi berjalan dari sudut seret saat ini
    void page.offsetWidth;
    page.style.transform = "";

    const commit = !cancelled && Math.abs(d.dx) >= Math.min(COMMIT_PX, d.width * 0.2);
    if (commit && d.mode === "next") go(current + 1);
    else if (commit && d.mode === "prev") go(current - 1);
    else {
      markTurning(page);
      render();
    }
  }

  book.addEventListener("pointerup", (e) => endDrag(e, false));
  book.addEventListener("pointercancel", (e) => endDrag(e, true));
  book.addEventListener("lostpointercapture", (e) => endDrag(e, false));

  // seret yang berakhir di atas tombol tidak boleh dianggap klik
  book.addEventListener("click", (e) => {
    if (suppressClick) { e.stopPropagation(); e.preventDefault(); }
  }, true);

  book.addEventListener("dragstart", (e) => e.preventDefault());

  /* ---------------- Petunjuk scroll ---------------- */

  function updateScrollHints() {
    pages.forEach((page) => {
      const sc = page.querySelector(".page__scroll");
      if (!sc) return;
      const more = sc.scrollHeight - sc.clientHeight - sc.scrollTop > 12;
      page.classList.toggle("has-more", more);
    });
  }
  pages.forEach((page) => {
    const sc = page.querySelector(".page__scroll");
    if (sc) sc.addEventListener("scroll", updateScrollHints, { passive: true });
  });
  window.addEventListener("resize", updateScrollHints);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(updateScrollHints);

  /* ---------------- Intip sudut sampul (sekali) ---------------- */

  let peekTimer = 0;
  function stopPeek() {
    window.clearTimeout(peekTimer);
    pages[0].classList.remove("is-peek");
  }
  pages[0].addEventListener("animationend", () => pages[0].classList.remove("is-peek"));

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
    history.pushState({ page: current, modal: id }, "", urlFor(current));
  }

  function closeModal(dialog) {
    if (!dialog.open) return;
    dialog.close();
    if (lastTrigger) lastTrigger.focus();
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

  /* ---------------- Riwayat (tombol Back) ---------------- */

  function pageFromHash() {
    const m = /^#([1-9])$/.exec(window.location.hash);
    return m ? Math.min(last, Number(m[1]) - 1) : 0;
  }

  window.addEventListener("popstate", () => {
    const open = document.querySelector("dialog[open]");
    if (open) closeModal(open);
    go(pageFromHash(), { push: false });
  });

  /* ---------------- Mulai ---------------- */

  current = pageFromHash();
  history.replaceState({ page: current }, "", urlFor(current));
  render();

  if (current === 0 && !reduceMotion.matches) {
    peekTimer = window.setTimeout(() => pages[0].classList.add("is-peek"), 1100);
  }
})();
