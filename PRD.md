# PRD — Undangan Pernikahan Digital Cahaya & Hammam

| | |
|---|---|
| **Status** | v0.10 — musik latar versi lite, kartu rekening bercorak |
| **Tanggal** | 2 Oktober 2026 |
| **Pemilik** | Muhammad Hammam Islami |
| **Hari H** | Minggu, 29 November 2026 |
| **URL** | `https://hammamcahaya.github.io/` (akun GitHub [hammamcahaya](https://github.com/hammamcahaya), repo `hammamcahaya.github.io`) |
| **Sumber** | [referensi/MoM.md](referensi/MoM.md), [referensi/gambar/](referensi/gambar/), [konten/naskah-modal.md](konten/naskah-modal.md) |

**Perubahan dari v0.1**
- Musik latar dihapus dan dipindah ke Non-Goals.
- Naskah modal sudah ada di [konten/naskah-modal.md](konten/naskah-modal.md).
- Ditambahkan rekomendasi UI/UX (§2.5).
- Deploy dan pengiriman undangan dilakukan sendiri oleh pemilik, sehingga roadmap tidak lagi memakai tanggal.

---

## 1. Executive Summary

**Problem Statement**
Undangan pernikahan Cahaya & Hammam perlu dikirim ke banyak tamu lewat chat (WhatsApp). Undangan cetak mahal dan tidak bisa dipersonalisasi per tamu, dan tidak bisa memuat denah interaktif atau cerita tentang lokasi dan adat acara.

**Proposed Solution**
Situs statis (HTML/CSS/JS murni) di GitHub Pages yang tampil seperti buku 4 halaman dan dibuka dengan geser ke kiri. Gayanya batik-gunungan krem dan cokelat-emas sesuai referensi, dan nama tamu tercetak otomatis dari URL (`?tamu=Anto`).

**Success Criteria (KPI)**

| # | Metrik | Target |
|---|---|---|
| K1 | Skor Lighthouse mobile (Performance / Accessibility / Best Practices) | ≥ 90 / ≥ 95 / ≥ 95 |
| K2 | Bobot muat awal | ≤ 2,5 MB; LCP ≤ 2,5 detik pada profil "Fast 4G" |
| K3 | Nama tamu tampil benar dari `?tamu=` | 100% dari 20 kasus uji (US-2) |
| K4 | Akurasi data inti (nama, gelar, orang tua, hari/tanggal, jam, alamat) | 0 kesalahan, diverifikasi kedua mempelai sebelum rilis |
| K5 | Kompatibilitas | Lolos uji manual di Chrome Android, Safari iOS, Chrome dan Firefox desktop (2 versi terakhir), pada 6 viewport acuan di §2.5.1 |

---

## 2. User Experience & Functionality

### 2.1 User Personas

| Persona | Deskripsi | Kebutuhan utama |
|---|---|---|
| **Tamu Umum** | Keluarga, teman, dan kolega yang menerima link via WhatsApp. Mayoritas membuka di HP, dan sebagian berusia lanjut serta kurang familiar dengan gesture swipe. | Cepat terbuka, teks mudah dibaca, jelas kapan dan di mana acaranya, mudah membuka Google Maps. |
| **Mempelai (Admin)** | Hammam & Cahaya, yang membuat dan mengirim link sendiri ke setiap tamu. | Membuat link per tamu tanpa mengubah kode, dan mengubah teks di satu tempat. |

### 2.2 User Flow

```
Tamu klik link WA (https://hammamcahaya.github.io/?tamu=Bapak+Anto)
        │
        ▼
[Hal 1 · Sampul] The Wedding · Cahaya & Hammam · 29 Nov 2026 · Kepada Yth. Bapak Anto
        │  tombol "Buka Undangan ›"  /  geser kiri
        ▼
[Hal 2 · Undangan] Ayat Ar-Rum:21 → mempelai & orang tua → Akad & Resepsi → lokasi
        │  geser kiri  /  tombol ›
        ▼
[Hal 3 · Denah] Peta ilustrasi + tombol "Buka Google Maps" + QR
        │  geser kiri  /  tombol ›
        ▼
[Hal 4 · Penutup] Kami yang berbahagia + 2 kartu bab
        ├── "Mengenal sekitar ndalem Tjokrosukarnan" → modal
        └── "Pernikahan Jawa?"               → modal
```

### 2.3 User Stories & Acceptance Criteria

**US-1 — Navigasi gulir ke bawah** *(diubah di v0.7, sebelumnya balik halaman ke kiri)*
*As a tamu, I want to menggulir undangan ke bawah so that saya bisa membacanya seperti halaman web biasa tanpa harus belajar gesture baru.*
- [ ] Ada tepat 4 halaman yang disusun vertikal. Setiap halaman setinggi minimal satu layar, dan halaman yang isinya lebih panjang ikut memanjang.
- [ ] Gulir memakai scroll-snap `proximity`: halaman berhenti rapi di awal halaman, tanpa mengunci gulir di halaman panjang.
- [ ] Tombol "Buka Undangan" di sampul menggulir ke halaman 2.
- [ ] Penanda 4 titik vertikal di tepi kanan menunjukkan halaman aktif, dan bisa diklik untuk lompat (target sentuh 32×32 px).
- [ ] Halaman aktif ditulis di hash URL (`#2`) tanpa menambah riwayat, sehingga tombol Back keluar dari undangan dan tidak mundur per halaman. Link dengan `#3` langsung membuka halaman 3.
- [ ] Di desktop, halaman tampil sebagai lembaran potret di atas latar sogan, dengan jarak antarlembar.
- [ ] Jika `prefers-reduced-motion: reduce`, gulir otomatis berlangsung instan.

**US-2 — Nama tamu personal**
*As a mempelai, I want to mengirim link berisi `?tamu=Nama` so that setiap tamu merasa diundang secara pribadi.*
- [ ] Nilai di-decode (`URLSearchParams`, `+` → spasi), di-trim, spasi ganda dirapikan, dan dibatasi 60 karakter.
- [ ] Nama disisipkan hanya dengan `textContent`. Uji: `?tamu=<script>alert(1)</script>` tampil sebagai teks literal.
- [ ] Tanpa parameter atau dengan nilai kosong, baris nama menampilkan "Bapak/Ibu/Saudara/i" tanpa merusak layout.
- [ ] Nama panjang (60 karakter) turun ke baris kedua, dan karakter non-ASCII atau emoji tidak overflow pada lebar 320 px.
- [ ] Nama tamu ikut dimasukkan ke `<title>`.
- [ ] 20 kasus uji dicatat di `tests/tamu-cases.md`, semuanya lolos (K3).

**US-3 — Halaman 1: Sampul** *(seperti `1.jpeg`)*
- [ ] Berisi "The Wedding" (script), "Cahaya & Hammam" (script besar), "29 NOVEMBER 2026", "Kepada Yth. Bapak / Ibu / Saudara / i :", nama tamu di atas garis, dan "Mohon Maaf Apabila Ada Kesalahan Penulisan Nama / Gelar".
- [ ] Gunungan wayang di kiri dan kanan, berupa **SVG buatan sendiri** (lihat §2.5.2 dan §4.2), dengan adaptasi potret.
- [ ] Tombol utama **"Buka Undangan ›"** membalik ke halaman 2. Tombol ini membantu tamu yang tidak tahu bahwa halaman bisa digeser.
- [ ] Saat pertama kali dimuat, sudut kanan halaman "mengintip" terangkat sekitar 8° selama 1 detik, sebagai petunjuk bahwa halaman bisa dibalik. Petunjuk ini hanya muncul sekali.

**US-4 — Halaman 2: Undangan inti** *(seperti `2.jpeg`, ayat dari `4.jpeg`)*
- [ ] Urutan isi:
  1. "Bismillahirrahmanirrahiim / Assalamu'alaikum Warahmatullahi Wabarakatuh"
  2. Ayat QS Ar-Rum 30:21: *"Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang. Sesungguhnya pada yang demikian itu benar-benar terdapat tanda-tanda (kebesaran Allah) bagi kaum yang berfikir."*
  3. **Cahaya Dwi Dzullia, S.Pd., M.Pd.**, *Putri dari Bapak Muryadi & Ibu Rusnani*
  4. "dengan"
  5. **Muhammad Hammam Islami, S.Kom.**, *Putra dari Bapak Muh Syafei (Alm) & Ibu Sri Suwarni, AMK*
  6. **Akad Nikah**, Minggu, 29 November 2026, 06:00 WIB – Selesai
  7. **Resepsi**, Minggu, 29 November 2026, 09:00 WIB – Selesai
  8. **ndalem Tjokrosukarnan**, Jl. Dr. Rajiman No.248, Sriwedari, Kec. Laweyan, Kota Surakarta, Jawa Tengah 57141
  9. "Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa dan restu kepada kedua mempelai. Wassalamu'alaikum Warahmatullahi Wabarakatuh"
- [ ] Jika konten melebihi tinggi layar, halaman boleh di-scroll vertikal (lihat §2.5.4).
- [ ] Akad dan Resepsi tampil dua kolom pada lebar ≥ 400 px, dan tersusun vertikal di bawahnya.

**US-5 — Halaman 3: Denah lokasi** *(seperti `3.jpeg`)*
- [ ] Judul "Denah Lokasi" (script) dan teks alamat lengkap.
- [ ] Denah dibuat ulang sebagai **SVG inline**. Isinya: Jl. Slamet Riyadi (Purwosari ↔ Gladag), Novotel, Sami Luwes, Tumurun Museum, Pasar Kembang, pin LOKASI ndalem Tjokrosukarnan, dan panah Utara "U".
- [ ] Tombol utama **"Buka Google Maps"** membuka `https://maps.app.goo.gl/uGNZ8pQ9KB5hsvbt7` di tab baru (`rel="noopener"`).
- [ ] QR code berupa SVG statis berisi link yang sama, dengan label "SCAN ME". Harus terbaca kamera iOS dan Android dari layar laptop. Penempatannya mengikuti §2.5.5.

**US-6 — Halaman 4: Penutup & bab cerita** *(seperti `5.jpeg`)*
- [ ] Bingkai amplop, "Kami yang berbahagia :", Bapak Muryadi / Ibu Rusnani (kiri), Bapak Muh Syafei (Alm) / Ibu Sri Suwarni, AMK (kanan), dan "Cahaya & Hammam" (script).
- [ ] Dua kartu bab: **"Mengenal sekitar ndalem Tjokrosukarnan"** dan **"Pernikahan Jawa?"**, masing-masing dengan teks kecil "Baca selengkapnya ›".
- [ ] Modal memakai `<dialog>` dengan `showModal()`. Modal bisa ditutup dengan tombol ×, tap backdrop, Esc, atau tombol Back browser di HP. Fokus kembali ke tombol pemicu setelah modal ditutup.
- [ ] Swipe halaman nonaktif selama modal terbuka, dan scroll di dalam modal tidak ikut menggulir halaman di belakangnya (`overscroll-behavior: contain`).
- [ ] Isi modal diambil dari [konten/naskah-modal.md](konten/naskah-modal.md). Modal 1 berisi sejarah kawasan sekitar gedung (Jl. Dr. Radjiman, Pasar Kembang, Taman Sriwedari, Radya Pustaka, Tumurun, Sami Luwes, Laweyan), dan Modal 2 berisi rangkaian pernikahan adat Jawa.

**US-7 — Preview saat dibagikan**
*As a mempelai, I want to link terlihat menarik saat dikirim di WhatsApp so that tamu terdorong untuk membuka.*
- [ ] Tag Open Graph: `og:title` "The Wedding of Cahaya & Hammam", `og:description` "Minggu, 29 November 2026 · ndalem Tjokrosukarnan, Solo", dan `og:image` 1200×630 JPEG ≤ 300 KB dengan URL absolut (`https://hammamcahaya.github.io/assets/img/og-image.jpg`). `og:url` diisi `https://hammamcahaya.github.io/`.
- [ ] Preview tampil benar di WhatsApp Android dan iOS.

**US-8 — Nomor rekening untuk hadiah** *(ditambahkan di v0.9)*
*As a tamu, I want to menyalin nomor rekening mempelai dengan sekali tekan so that saya bisa mengirim hadiah tanpa salah ketik.*
- [ ] Di dasar halaman 4 ada tautan kecil yang tidak menonjol: "Tidak untuk dibuka".
- [ ] Tautan membuka modal berisi teks jenaka pembuka dan dua kartu rekening: BCA 3920618714 a.n. Muhammad Hammam Islami, dan BCA 0154126119 a.n. Cahaya Dwi Dzullia.
- [ ] Kartu bergaya kartu bank batik (latar sogan bermotif ceplok, gunungan samar di sisi kanan, bingkai emas tipis).
- [ ] Di samping nomor ada ikon salin (target sentuh 44×44 px) yang menyalin nomor tanpa spasi ke clipboard, berganti tanda centang, dan menampilkan "Nomor rekening tersalin" selama 2 detik. Jika clipboard tidak tersedia, muncul petunjuk untuk menyalin manual; nomor juga bisa dipilih sekali ketuk.
- [ ] Nomor rekening diverifikasi mempelai sebelum rilis (K4).

**US-9 — Musik latar versi lite** *(ditambahkan di v0.10)*
*As a tamu, I want to mendengar lagu "Yen Ing Tawang Ana Lintang" saat membuka undangan so that suasananya terasa Jawa dan hangat, tanpa membuat undangan lambat dibuka.*
- [ ] File lite: 2 menit 28 detik pertama lagu (dimulai setelah jeda hening 2,4 detik), fade-in 1,5 detik dan fade-out 4 detik, AAC 48 kbps mono, `faststart`; 906 KB (asli 6 MB).
- [ ] `preload="none"`: lagu tidak diunduh sama sekali sampai tamu menekan "Buka Undangan" atau tombol musik, sehingga bobot muat awal (K2) tidak berubah.
- [ ] Lagu diputar berulang (loop). Tombol bulat 44 px di pojok kiri bawah untuk putar/jeda, dengan `aria-pressed` dan label "Putar musik"/"Jeda musik".
- [ ] Lagu dijeda saat tab/aplikasi disembunyikan dan dilanjutkan saat kembali jika sebelumnya sedang diputar.
- [ ] Tidak ditemukan versi bebas royalti (komposisi Andjar Any masih dilindungi hak cipta); dipakai rekaman milik pemilik untuk undangan pribadi non-komersial.

### 2.4 Non-Goals

- ❌ RSVP, buku tamu, ucapan, dan doa, karena membutuhkan backend.
- ❌ QRIS. *(Nomor rekening ditambahkan di v0.9, lihat US-8.)*
- ❌ Countdown dan "Simpan ke Kalender".
- ❌ Galeri foto atau video.
- ❌ Panel admin dan generator link.
- ❌ Multi-bahasa dan dark mode. Palet krem adalah identitas desain.
- ❌ Framework JS dan build step.
- ❌ Analytics dan pelacakan tamu.

### 2.5 Rekomendasi UI/UX

Prinsip: **satu desain buku potret yang sama untuk HP dan desktop.** Di desktop, buku hanya "diletakkan di atas meja". Pendekatan ini lebih konsisten dan jauh lebih mudah dirawat daripada membuat layout lanskap terpisah.

#### 2.5.1 Ukuran & layout per perangkat

| Perangkat | Viewport acuan | Layout |
|---|---|---|
| HP kecil | 320×568, 360×640 | Halaman penuh layar (`100dvh`), tanpa bingkai luar |
| HP umum | 390×844, 412×915 | Halaman penuh layar, memperhitungkan safe-area (notch atau home bar) |
| Tablet / desktop | 768×1024, 1440×900 | Buku di tengah, `height: min(92dvh, 860px)`, `aspect-ratio: 9/16` (maks. lebar sekitar 480 px), dengan bayangan lembut dan punggung buku di tepi kiri. Latar luar memakai motif batik yang diredupkan. |
| HP lanskap | 844×390 | Buku tetap potret dan menyesuaikan tinggi, dengan scroll di dalam halaman bila perlu. Tidak memakai overlay "putar HP" karena mengganggu. |

- Ukuran teks memakai `clamp()` berbasis tinggi dan lebar, misalnya `font-size: clamp(14px, 1.9dvh, 17px)` untuk isi, supaya konten menyesuaikan dengan layar alih-alih terpotong.
- Gunakan `dvh`, bukan `vh`, agar address bar browser HP tidak memotong konten.

#### 2.5.2 Adaptasi gunungan ke potret

Referensinya lanskap, sedangkan di potret ruang samping sempit. Rekomendasinya:
- Gunungan ditempatkan di tepi kiri dan kanan dengan lebar 22–28% halaman, digeser ke luar sehingga hanya sekitar 60% badan gunungan yang tampak, dan diletakkan di belakang konten.
- Kolom konten di tengah memakai lebar 72–80%, dengan gradasi krem tipis di belakang teks agar motif tidak mengganggu keterbacaan.
- Gunungan hanya tampil penuh di Halaman 1 (sampul). Di Halaman 2 dan 3 gunungan tampil sebagian, seperti di `2.jpeg` dan `3.jpeg`. Di Halaman 4 tidak ada gunungan, hanya bingkai amplop seperti `5.jpeg`.

#### 2.5.3 Navigasi untuk semua kalangan

- **Swipe saja tidak cukup.** Tamu lanjut usia sering tidak tahu bahwa halaman bisa digeser. Karena itu tombol ‹ › selalu tampil di bagian bawah halaman bersama titik indikator, dengan target sentuh ≥ 44×44 px.
- Halaman 1 punya tombol eksplisit "Buka Undangan ›" dan animasi sudut halaman yang mengintip (US-3).
- Di desktop, tombol panah besar diletakkan di luar buku (kiri dan kanan), dan kursor `grab` muncul saat hover di halaman.
- Abaikan swipe yang dimulai ≤ 24 px dari tepi kiri layar, supaya tidak bentrok dengan gesture "back" di iOS.

#### 2.5.4 Halaman 2 yang padat

Isi Halaman 2 (salam, ayat, dua mempelai, jadwal, alamat, dan penutup) tidak muat di HP 360×640 tanpa teks menjadi terlalu kecil. Rekomendasinya: **jangan perkecil teks; izinkan scroll vertikal di dalam halaman.**
- Isi halaman memakai `overflow-y: auto` dan `overscroll-behavior: contain`.
- Jika konten masih tersisa di bawah, tampilkan gradasi pudar di dasar halaman dan ikon panah ⌄ kecil. Keduanya hilang setelah tamu menggulir sampai bawah.
- Di layar yang cukup tinggi (≥ 800 px), semua isi muat tanpa scroll.
- Hierarki visual: nama mempelai dan blok **tanggal, jam, dan tempat** paling menonjol. Ayat dan salam ditulis lebih kecil dan miring.

#### 2.5.5 Halaman 3: aksi lebih penting dari QR

- **HP:** tombol "Buka Google Maps" adalah aksi utama (lebar penuh, warna emas). QR diperkecil sekitar 96 px, karena tamu tidak bisa memindai layarnya sendiri.
- **Desktop:** QR tampil besar (≥ 160 px) di samping denah, karena tamu yang membuka di laptop bisa memindainya dengan HP.
- Tambahkan tombol sekunder kecil "Salin alamat" dengan umpan balik teks "Tersalin ✓" selama 2 detik.

#### 2.5.6 Modal yang nyaman dibaca

- **HP:** bottom sheet setinggi 90% layar yang muncul dari bawah, dengan handle di atas, judul sticky, dan tombol × berukuran 44 px.
- **Desktop:** dialog di tengah layar dengan lebar maks. 640 px (sekitar 65 karakter per baris) dan tinggi maks. 80dvh.
- Teks isi berukuran 16–17 px dengan line-height 1.7, dan subjudul memakai font sans tebal (bukan script).

#### 2.5.7 Tipografi & warna (hasil cek kontras)

| Peran | Warna | Kontras di atas krem `#F7F1E6` | Aturan |
|---|---|---|---|
| Ornamen dan judul script besar | `#9A6A2A` | 4.18 : 1 | Hanya untuk teks ≥ 24 px atau elemen dekoratif |
| Teks emas kecil (label, tanggal) | `#7E5420` | 5.88 : 1 | Lolos AA untuk teks normal |
| Teks isi | `#2B2118` | 14.0 : 1 | Default |

- Font script **hanya untuk dekorasi**, yaitu "The Wedding", "Cahaya & Hammam", "Denah Lokasi", dan nama mempelai.
- Informasi penting (hari, tanggal, jam, alamat) **selalu memakai font sans** dengan ketebalan ≥ 500, karena script sulit dibaca di layar kecil dan oleh tamu lanjut usia.
- Ukuran minimal teks isi di HP adalah 14 px, dan nama mempelai ≥ 28 px.

---

## 3. AI System Requirements

Tidak berlaku. Produk ini tidak memiliki komponen AI.

---

## 4. Technical Specifications

### 4.1 Architecture Overview

Situs statis tanpa build step. Pemilik melakukan push sendiri ke GitHub Pages.

```
/
├── index.html            # 4 <section class="page"> + 2 <dialog>
├── css/style.css         # token, layout, animasi flip, breakpoint
├── js/main.js            # CONFIG data inti, navigasi, ?tamu=, modal
├── assets/
│   ├── img/gunungan.svg            # satu file, sisi kanan = scaleX(-1)
│   ├── img/batik-tile.webp
│   ├── img/denah.svg, qr-maps.svg, og-image.jpg
│   └── fonts/*.woff2
├── konten/naskah-modal.md   # sumber teks (disalin ke index.html)
└── referensi/               # tidak dirujuk oleh index.html
```

**Alur runtime**
1. CSS kritis untuk Halaman 1 di-inline di `<head>`. Font memakai `preload` dan `font-display: swap`.
2. `main.js` (defer) membaca `?tamu=` lalu mengisi `#guest-name` dan `<title>`.
3. Navigasi: Pointer Events (swipe dan drag) bersama keyboard dan tombol. Indeks halaman (`currentPage` 0–3) disinkronkan dengan `location.hash`. Animasi memakai CSS `transform: rotateY()` dan `transform-origin: left`, dan hanya `transform` serta `opacity` yang dianimasikan.
4. Kartu bab membuka modal dengan `dialog.showModal()` dan `history.pushState`, sehingga tombol Back menutup modal.

**Pustaka pihak ketiga:** tidak ada. Jika efek flip CSS kurang meyakinkan saat prototipe, cadangannya adalah StPageFlip (`page-flip`, sekitar 30 KB) via CDN.

### 4.2 Design Tokens

| Token | Nilai | Pemakaian |
|---|---|---|
| `--bg` | `#F7F1E6` | latar krem |
| `--motif` | `#EADFC8` | motif batik |
| `--gold` | `#9A6A2A` | ornamen dan judul besar |
| `--gold-text` | `#7E5420` | teks emas kecil |
| `--text` | `#2B2118` | teks isi |
| `--line` | `#BFB4A3` | bingkai amplop |
| Font script | Allura | judul dekoratif dan nama mempelai beserta gelarnya |
| Font sans | Poppins (400/500/600) | isi dan informasi |

Nilai warna masih perkiraan dan perlu difinalisasi dengan color-picker dari gambar referensi. Font di-self-host dalam format `woff2` dengan subset Latin.

**Spesifikasi SVG gunungan**
- Sumber: `referensi/gambar/kayon.png` (583×1057, hitam di atas transparan) yang disediakan pemilik.
- Proses: kanal alpha diperbesar 3x dan di-threshold ([tools/prep_kayon.py](tools/prep_kayon.py)), dilacak dengan potrace, lalu dioptimasi dengan SVGO ([tools/trace_kayon.js](tools/trace_kayon.js)). Warna diganti emas `--gold`, dan bagian dalam diisi krem polos agar motif latar tidak tembus.
- Ukuran: 67 KB (30 KB gzip). Satu file dipakai untuk kiri, kanan, ikon kartu, favicon, dan gambar OG.
- Motif latar: tile SVG kecil berpola ceplok atau mandala krem `--motif` di atas `--bg`, diulang lewat `background-image`.

### 4.3 Integration Points

| Integrasi | Detail |
|---|---|
| **GitHub Pages** | Akun `hammamcahaya`, repo **`hammamcahaya.github.io`** (user site), sehingga situs tayang di root `https://hammamcahaya.github.io/`. Contoh link tamu: `https://hammamcahaya.github.io/?tamu=Bapak+Anto`. Push dan konfigurasi dilakukan pemilik (Settings → Pages → Deploy from branch `main` / root). Path aset ditulis relatif (`./assets/...`). |
| **Google Maps** | Hanya link keluar, tanpa API key. |
| **QR Code** | Dibuat sekali (mis. `qrencode -t SVG`), lalu disimpan sebagai file. |
| **Backend / DB / Auth** | Tidak ada. |

### 4.4 Security & Privacy

- **XSS:** `?tamu=` hanya dimasukkan dengan `textContent`. Tidak ada `innerHTML`, `eval`, atau `document.write`. CSP: `default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'`.
- **Data pribadi:** nama tamu hanya ada di URL. Tidak ada cookie, analytics, atau skrip pihak ketiga.
- **Repo publik:** pastikan daftar tamu dan nomor HP **tidak** ikut di-commit.
- **Hak cipta aset:** gunungan adalah vektorisasi `kayon.png` dari pemilik (lihat R1). Motif latar dan denah dibuat sendiri. Screenshot template di `referensi/gambar/` tidak dipakai dan dikecualikan dari repo lewat `.gitignore`.

---

## 5. Risks & Roadmap

### 5.1 Phased Rollout

Jadwal rilis dan pengiriman undangan ditentukan sendiri oleh pemilik. Fase di bawah adalah urutan kerja, bukan tenggat.

| Fase | Lingkup | Exit criteria |
|---|---|---|
| **M0 · Prototipe** | Prototipe HTML 4 halaman: layout, efek balik, tombol, nama tamu, dengan placeholder grafis | Dicoba mempelai di HP sendiri |
| **M1 · Desain** | SVG gunungan dan motif batik, design tokens, denah SVG, QR | Disetujui kedua mempelai |
| **MVP** | US-1 s/d US-6 dan rekomendasi §2.5 | K2, K3, K5 lolos; diuji di ≥ 3 HP nyata, termasuk 1 iPhone |
| **v1.0 · Rilis** | US-7 (OG), naskah modal final, proofreading | K1–K5 lolos |
| **v1.1 (opsional)** | Musik latar dan perbaikan dari feedback tamu awal | — |

### 5.2 Technical & Project Risks

| ID | Risiko | Dampak | Mitigasi |
|---|---|---|---|
| R1 | Lisensi `kayon.png` belum diketahui | Klaim hak cipta pada repo publik | Pastikan sumber gambar mengizinkan pemakaian. Cadangan: vektorisasi gambar gunungan lain yang lisensinya jelas dengan skrip yang sama. |
| R2 | SVG hasil trace cukup besar (67 KB) | Muat sedikit lebih lama | 30 KB setelah gzip oleh GitHub Pages. Total halaman tetap jauh di bawah budget K2. |
| R3 | Konflik gesture: swipe vs scroll vertikal vs back-gesture iOS vs scroll modal | Salah balik halaman | Kunci arah gesture, abaikan zona tepi 24 px, nonaktifkan swipe saat modal terbuka (§2.5.3, §2.5.4). |
| R4 | Performa animasi 3D di Android kelas bawah | Jank atau flicker | Hanya animasikan `transform` dan `opacity`. Fallback slide 2D. |
| R5 | Bobot aset (motif, gunungan, font) | Lambat di jaringan lemah | WebP, tile motif ≤ 100 KB, subset font, budget K2. |
| R6 | Fakta sejarah kawasan keliru | Informasi salah di undangan | Setiap fakta di Modal 1 punya sumber (lihat bagian bawah naskah-modal.md). Mempelai mengoreksi sebelum rilis. |
| R7 | Cache preview WhatsApp | Preview lama tertahan | Finalisasi OG sebelum link pertama dikirim, dan tambahkan `?v=` pada og:image. |
| R8 | Kesalahan data inti | Tamu salah datang | Data inti disimpan di satu objek `CONFIG`, dengan checklist K4. |

### 5.3 Catatan implementasi (v0.9)

- **Navigasi** diubah dari balik halaman ke gulir vertikal (US-1).
- **Gelar** ditulis sejajar dan dengan font yang sama dengan nama (Allura), tidak terpisah dari baris nama.
- **Font script** sempat dicoba Brittany Signature, lalu dikembalikan ke Allura (SIL OFL).
- **Gunungan:** halaman 1 memakai gunungan kiri-kanan di tengah tinggi halaman; halaman 2 dan 4 satu gunungan samar (opacity 13%) di tengah seperti tanda air; halaman 3 gunungan kiri-kanan di bagian bawah.
- **Motif latar** sempat dicoba pola mandala bunga dari referensi, lalu dikembalikan ke motif ceplok bunga buatan sendiri ([tools/gen_motif.py](tools/gen_motif.py)).
- **Foto artikel**: 7 foto di modal 1 dan 3 foto di modal 2 (siraman, panggih, sungkeman), semuanya dari Wikimedia Commons berlisensi bebas (CC BY, CC BY-SA, CC0, domain publik). Kredit dan tautan lisensi ditampilkan di bawah setiap foto. Foto dipotong 3:2 dan dikompres WebP (total 456 KB, dimuat hanya saat modal dibuka). Tidak ada foto berlisensi bebas untuk Tumurun (diganti lukisan Raden Saleh koleksi Tumurun), tarub, midodareni, dan ijab.
- **Data inti** ditulis langsung di `index.html`, tidak di objek `CONFIG`.
- **Hasil uji:** 49 uji otomatis lolos ([tests/run-tests.js](tests/run-tests.js)). Lighthouse mobile 100/100/100/100, total 171 KB, LCP 1,6 detik.
- **Belum diuji:** perangkat fisik (iPhone/Android) dan preview WhatsApp asli.

### 5.4 Open Questions

Tidak ada.
