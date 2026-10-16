/* Halaman pilih versi: nama tamu dari ?tamu= atau kolom isian diteruskan ke tiap versi. */
(() => {
  "use strict";

  const input = document.getElementById("tamu");
  const links = Array.from(document.querySelectorAll("[data-versi]"));

  function update() {
    const name = input.value.trim();
    const query = name ? `?tamu=${encodeURIComponent(name).replace(/%20/g, "+")}` : "";
    links.forEach((a) => { a.href = `/${a.dataset.versi}/${query}`; });
  }

  input.value = new URLSearchParams(window.location.search).get("tamu") || "";
  input.addEventListener("input", update);
  update();
})();
