# Undangan Cahaya & Hammam

Undangan pernikahan digital berbentuk buku 4 halaman. HTML, CSS, dan JavaScript murni, tanpa build step.
Tayang di **https://hammamcahaya.github.io/**.

## Membuat link untuk tamu

Tambahkan `?tamu=` diikuti nama tamu. Spasi boleh ditulis `+` atau `%20`.

```
https://hammamcahaya.github.io/?tamu=Bapak+Anto
https://hammamcahaya.github.io/?tamu=Keluarga+Besar+Bpk.+H.+Sutrisno
```

Tanpa `?tamu=`, undangan menampilkan "Bapak/Ibu/Saudara/i". Nama dipotong pada 60 karakter.

## Mengubah isi

Semua teks ada di [index.html](index.html), dan sumber naskah modal ada di [konten/naskah-modal.md](konten/naskah-modal.md).
Setelah mengubah teks, buka situs di HP untuk memastikan tata letaknya masih rapi.

| Yang diubah | Di mana |
|---|---|
| Nama, orang tua, tanggal, jam, alamat | `index.html` halaman 1, 2, dan 4 |
| Denah | SVG inline di `index.html` halaman 3 |
| Warna & ukuran huruf | token `:root` di [css/style.css](css/style.css) |
| Gunungan | Vektorisasi dari `referensi/gambar/kayon.png`: jalankan `python3 tools/prep_kayon.py`, lalu `tools/trace_kayon.js` (lihat di bawah) |
| Motif latar | [tools/gen_motif.py](tools/gen_motif.py), lalu jalankan `python3 tools/gen_motif.py` |
| Gambar preview WhatsApp | [tools/og.html](tools/og.html), lalu jalankan `tools/make-og.js` (lihat di bawah) |

Jika gambar preview diubah setelah link pernah dikirim, naikkan angka `?v=` pada `og:image` di `index.html` agar WhatsApp mengambil gambar baru.

## Menjalankan di komputer

```bash
python3 -m http.server 8765
# buka http://localhost:8765/?tamu=Anto
```

## Uji otomatis

Butuh Node 18+, Google Chrome, dan `playwright-core` yang dipasang di luar repo:

```bash
npm i --prefix ~/.cache/undangan-test playwright-core
python3 -m http.server 8765 &
NODE_PATH=~/.cache/undangan-test/node_modules node tests/run-tests.js
NODE_PATH=~/.cache/undangan-test/node_modules node tools/make-og.js   # buat ulang og-image.jpg

# vektorisasi ulang gunungan (butuh juga: npm i --prefix ~/.cache/undangan-test potrace svgo)
python3 tools/prep_kayon.py
NODE_PATH=~/.cache/undangan-test/node_modules node tools/trace_kayon.js
```

Uji ini memeriksa 20 kasus nama tamu ([tests/tamu-cases.md](tests/tamu-cases.md)), navigasi (tombol, keyboard, seret, tombol Back), modal, dan overflow di 7 ukuran layar.

## Deploy

Push ke repo `hammamcahaya/hammamcahaya.github.io`, branch `main`. Aktifkan GitHub Pages lewat Settings → Pages → Deploy from branch `main`, folder `/ (root)`.

## Lisensi aset

- Font Allura dan Poppins: SIL Open Font License.
- Gunungan: hasil vektorisasi `kayon.png` yang disediakan pemilik. Pastikan lisensi gambar sumbernya mengizinkan publikasi.
- Motif dan denah dibuat untuk proyek ini.
