# Undangan Cahaya & Hammam

Undangan pernikahan digital 4 halaman yang digulir ke bawah. HTML, CSS, dan JavaScript murni, tanpa build step.
Tayang di **https://hammamcahaya.github.io/**.

## Versi desain

Selama desain belum ditetapkan, ada beberapa versi dengan isi yang sama dan tampilan berbeda:

| Versi | Folder | Tema |
|---|---|---|
| v1 | [v1/](v1/) | Kertas Gunungan: krem, ceplok, huruf tulisan tangan |
| v2 | [v2/](v2/) | Keraton Malam: sogan gelap, emas prada, truntum, aksara Jawa |

[index.html](index.html) di root sementara berisi halaman **pilih versi**. `?tamu=` diteruskan ke versi yang dibuka,
mis. `http://localhost:8765/?tamu=Anto`. Satu versi juga bisa dibuka langsung: `/v2/?tamu=Anto`.

Tiap versi berisi `index.html`, `css/style.css`, dan `js/main.js` sendiri. Gambar, font, dan musik dipakai bersama di `assets/`.
Semua path ditulis absolut (`/assets/...`, `/v2/css/...`) agar `index.html` sebuah versi tetap berfungsi bila dipindah ke root.

**Menambah versi baru (mis. v3)**
1. Salin folder versi terdekat: `cp -r v2 v3`, lalu ganti `/v2/` menjadi `/v3/` di `v3/index.html` dan `og-image-v2` menjadi `og-image-v3`.
2. Salin `tools/og-v2.html` menjadi `tools/og-v3.html`, sesuaikan isinya.
3. Tambahkan satu `<li class="versi">` di [index.html](index.html).
4. Buat gambar preview dan gambar mini: `node tools/make-og.js v3`, lalu uji: `node tests/run-tests.js v3`.

**Menetapkan versi final (mis. v2)**
1. `cp v2/index.html index.html` (menimpa halaman pilih versi). CSS dan JS tetap dimuat dari `/v2/`.
2. Ubah `og:image` bila perlu, lalu uji: `ROOT_URL=http://localhost:8765/ BASE_URL=http://localhost:8765/ node tests/run-tests.js v2`
   (uji "pilih versi" akan gagal karena halamannya sudah tidak ada, dan itu memang diharapkan).
3. Folder versi lain, `js/pilih-versi.js`, dan `assets/img/versi/` boleh dihapus. Jangan hapus folder versi yang dipilih.

Sebelum versi final ditetapkan, kirim link tamu ke versi tertentu (`/v2/?tamu=...`), bukan ke root.

## Membuat link untuk tamu

Tambahkan `?tamu=` diikuti nama tamu. Spasi boleh ditulis `+` atau `%20`.

```
https://hammamcahaya.github.io/?tamu=Bapak+Anto
https://hammamcahaya.github.io/?tamu=Keluarga+Besar+Bpk.+H.+Sutrisno
```

Tanpa `?tamu=`, undangan menampilkan "Bapak/Ibu/Saudara/i". Nama dipotong pada 60 karakter.

## Mengubah isi

Semua teks ada di `index.html` tiap versi (`v1/`, `v2/`), dan sumber naskah modal ada di [konten/naskah-modal.md](konten/naskah-modal.md).
Selama masih ada beberapa versi, perubahan isi harus dilakukan di tiap versi.
Setelah mengubah teks, buka situs di HP untuk memastikan tata letaknya masih rapi.

| Yang diubah | Di mana |
|---|---|
| Nama, orang tua, tanggal, jam, alamat | `vN/index.html` halaman 1, 2, dan 4 |
| Denah | SVG inline di `vN/index.html` halaman 3 |
| Warna & ukuran huruf | token `:root` di `vN/css/style.css` (v2: halaman malam & kertas) |
| Gunungan | Vektorisasi dari `referensi/gambar/kayon.png`: jalankan `python3 tools/prep_kayon.py`, lalu `tools/trace_kayon.js` (lihat di bawah) |
| Gunungan prada & motif truntum (v2) | [tools/gen_v2_assets.py](tools/gen_v2_assets.py), lalu jalankan `python3 tools/gen_v2_assets.py` |
| Font Bodoni Moda & aksara Jawa (v2) | [tools/subset_fonts.py](tools/subset_fonts.py); aksara di sampul/penutup hanya memuat huruf yang dipakai, jadi ubah `AKSARA` bila teksnya diganti |
| Musik latar | `assets/audio/yen-ing-tawang-lite.m4a` (lihat perintah ffmpeg di bawah) |
| Gambar preview WhatsApp & gambar mini | `tools/og-vN.html`, lalu jalankan `tools/make-og.js vN` (lihat di bawah) |

Jika gambar preview diubah setelah link pernah dikirim, tambahkan `?v=2` (atau naikkan angkanya) pada `og:image` di `index.html` agar WhatsApp mengambil gambar baru.

## Membuat ulang musik versi lite

Dari lagu asli di `referensi/music/` (tidak ikut repo), potong 0:02.4–2:31, mono AAC 48 kbps:

```bash
ffmpeg -ss 2.4 -to 151 -i "referensi/music/yen ing tawang ono Lintang.mp3" -map 0:a -vn -map_metadata -1 \
  -ac 1 -af "afade=t=in:d=1.5,afade=t=out:st=144.6:d=4" -c:a aac -b:a 48k -movflags +faststart \
  assets/audio/yen-ing-tawang-lite.m4a
```

## Menjalankan di komputer

```bash
python3 -m http.server 8765
# buka http://localhost:8765/?tamu=Anto (pilih versi) atau http://localhost:8765/v2/?tamu=Anto
```

## Uji otomatis

Butuh Node 18+, Google Chrome, dan `playwright-core` yang dipasang di luar repo:

```bash
npm i --prefix ~/.cache/undangan-test playwright-core
python3 -m http.server 8765 &
NODE_PATH=~/.cache/undangan-test/node_modules node tests/run-tests.js v2   # atau v1
NODE_PATH=~/.cache/undangan-test/node_modules node tools/make-og.js v2     # og-image-v2.jpg + gambar mini

# vektorisasi ulang gunungan (butuh juga: npm i --prefix ~/.cache/undangan-test potrace svgo)
python3 tools/prep_kayon.py
NODE_PATH=~/.cache/undangan-test/node_modules node tools/trace_kayon.js
```

Uji ini memeriksa (per versi) 20 kasus nama tamu ([tests/tamu-cases.md](tests/tamu-cases.md)), navigasi gulir (tombol, titik penanda, hash URL), modal, overflow di 7 ukuran layar, dan tautan di halaman pilih versi.

## Deploy

Push ke repo `hammamcahaya/hammamcahaya.github.io`, branch `main`. Aktifkan GitHub Pages lewat Settings → Pages → Deploy from branch `main`, folder `/ (root)`.

## Lisensi aset

- Bodoni Moda, Noto Sans Javanese, dan Poppins: SIL Open Font License.
- Foto artikel: Wikimedia Commons, kredit dan lisensi tercantum di bawah setiap foto di modal.
- Gunungan: hasil vektorisasi `kayon.png` yang disediakan pemilik. Pastikan lisensi gambar sumbernya mengizinkan publikasi.
- Motif truntum dan denah dibuat untuk proyek ini.
