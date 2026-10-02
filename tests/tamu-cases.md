# Kasus uji `?tamu=`

Dijalankan otomatis oleh `tests/run-tests.js` (lihat bagian bawah). Kolom "Diharapkan" adalah teks yang tampil di baris nama tamu.

| # | Query | Diharapkan |
|---|---|---|
| 1 | *(tanpa query)* | `Bapak/Ibu/Saudara/i` dan baris atas menjadi `Kepada Yth.` |
| 2 | `?tamu=` | sama dengan #1 |
| 3 | `?tamu=%20%20%20` | sama dengan #1 |
| 4 | `?tamu=Anto` | `Anto` |
| 5 | `?tamu=Bapak+Anto` | `Bapak Anto` |
| 6 | `?tamu=Bapak%20Anto` | `Bapak Anto` |
| 7 | `?tamu=%20%20Bu%20%20Siti%20%20` | `Bu Siti` |
| 8 | `?tamu=Keluarga%20Besar%20Bpk.%20H.%20Sutrisno%2C%20S.H.` | `Keluarga Besar Bpk. H. Sutrisno, S.H.` |
| 9 | `?tamu=Dr.%20Ir.%20R.%20Ay.%20Sri%20Lestari%2C%20M.Sc.` | `Dr. Ir. R. Ay. Sri Lestari, M.Sc.` |
| 10 | `?tamu=Jos%C3%A9%20%26%20Mar%C3%ADa` | `José & María` |
| 11 | `?tamu=%F0%9F%8C%B8%20Rina%20%F0%9F%8C%B8` | `🌸 Rina 🌸` |
| 12 | `?tamu=<script>alert(1)</script>` | `<script>alert(1)</script>` tampil sebagai teks, tidak dieksekusi |
| 13 | `?tamu=%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E` | `<img src=x onerror=alert(1)>` sebagai teks |
| 14 | `?tamu=` + 80 huruf `A` | 60 huruf `A` |
| 15 | `?tamu=` + 70 emoji 🌸 | 60 emoji (dipotong per karakter, bukan per byte) |
| 16 | `?tamu=Anto&tamu=Budi` | `Anto` (nilai pertama) |
| 17 | `?TAMU=Anto` | sama dengan #1 (parameter peka huruf besar/kecil) |
| 18 | `?tamu=%E0%A4%A` (encoding rusak) | tidak error; halaman tetap tampil |
| 19 | `?tamu=Anto%0ABudi` | `Anto Budi` (baris baru dirapikan) |
| 20 | `?tamu=Anto#3` | `Anto`, langsung membuka halaman 3 |
