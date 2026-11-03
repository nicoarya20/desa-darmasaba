## Menu Kependudukan

- **Target:** https://desa-darmasaba-stg.wibudev.com/ (versi STG `0.1.202`)
- **Tanggal:** 2 November 2026
- **Scope:** menu **Kependudukan** saja (acuan `MIND/PLAN/plan-qc-1-Nov.md` bagian 1–3)
- **Tool:** `playwright-cli -s=qc-kependudukan` (Chromium headless) + GET read-only ke API publik. Mode baca saja: tidak ada form yang di-submit, tidak ada data yang diubah, tidak login.
- **Ukuran layar:** 375x812 (HP), 768x1024 (tablet), 1440x900 (desktop)

### Halaman yang dites

| No | Halaman | URL |
|---|---|---|
| 1 | Index Kependudukan | `/darmasaba/kependudukan` |
| 2 | Dashboard Kependudukan | `/darmasaba/kependudukan/dashboard` |
| 3 | Data Per Banjar | `/darmasaba/kependudukan/data-per-banjar` |
| 4 | Dinamika Penduduk | `/darmasaba/kependudukan/dinamika-penduduk` |
| 5 | Distribusi Agama | `/darmasaba/kependudukan/distribusi-agama` |
| 6 | Distribusi Umur | `/darmasaba/kependudukan/distribusi-umur` |
| 7 | URL tidak ada (uji 404) | `/darmasaba/kependudukan/halaman-tidak-ada-qc` |
| 8 | Sub-path tidak valid (uji 404) | `/darmasaba/kependudukan/dashboard/xyz-invalid` |
| 9 | Beranda (pembanding angka) | `/darmasaba` |

Catatan: menu Kependudukan **tidak punya halaman detail** (`[id]`), jadi uji ID detail tidak valid diganti dengan sub-path tidak valid (No. 8).

API yang dicek langsung: `/api/kependudukan/dashboard/summary`, `/api/kependudukan/databanjar/find-many`, `/api/kependudukan/distribusiagama/find-many`, `/api/kependudukan/distribusiumur/find-many`, `/api/kesehatan/kelahiran/findMany`, `/api/kesehatan/kematian/findMany`.

### Ringkasan

| Keparahan | Jumlah |
|---|---|
| Kritis | 0 |
| Tinggi | 5 |
| Sedang | 4 |
| Rendah | 8 |
| **Total** | **17** |

**Angka antarhalaman (inti masalah):**

| Sumber | Penduduk | KK | Miskin | Kelahiran | Kematian | Banjar |
|---|---|---|---|---|---|---|
| Dashboard (API summary, tahun 2026) | 4.200 | 1.176 | 240 | 1 | 2 | — (tidak ditampilkan) |
| Data per Banjar (UI) | 3.505 | 983 | 197 | — | — | 10 baris |
| Data per Banjar (API, `limit=100`) | 4.200 | 1.176 | 240 | — | — | 12 |
| Dinamika Penduduk (UI) | — | — | — | **5** | **5** | — |
| Distribusi Agama (UI, total) | **6.541** | — | — | — | — | — |
| Distribusi Umur (API, hanya tahun 2026) | 4.305 | — | — | — | — | — |
| Beranda `/darmasaba` | tidak ada statistik penduduk | | | | | |

**Yang lolos:**
- Tidak ada scroll horizontal di 375/768/1440 pada semua halaman; tabel Data per Banjar muat di tablet (`scrollWidth = clientWidth = 670`).
- Tidak ada teks `undefined` / `null` / `NaN` / `[object Object]` / `Invalid Date` / lorem ipsum (cek case-sensitive).
- Tidak ada console error di 5 halaman Kependudukan (hanya warning Recharts, lihat No. 11); tidak ada request 4xx/5xx.
- Semua API 200, waktu respons 240–450 ms; load halaman 1,2–2,8 detik.
- URL tidak ada mengembalikan **HTTP 404** asli (bukan soft-404 seperti di menu Lingkungan).
- Format ribuan Indonesia (`4.200`, `1.176`) benar di Dashboard dan Data per Banjar.
- Tidak ada gambar rusak / gambar tanpa alt di konten Kependudukan.
- Menu hamburger HP → Kependudukan → 5 submenu → "Distribusi Umur" bernavigasi benar; link aktif navbar desktop bergaris bawah 2px & tebal 600.
- Tombol kembali (panah) berfungsi (`router.back()`).

### Tabel Temuan

| No | Halaman/URL | Kategori | Ukuran layar/browser | Deskripsi | Langkah reproduksi | Hasil yang diharapkan | Keparahan | Bukti |
|---|---|---|---|---|---|---|---|---|
| 1 | `/kependudukan/data-per-banjar` | Kebenaran data | Semua / Chromium | Tabel hanya menampilkan **10 dari 12 banjar** (Banjar Dinas Telanga 340/95/22 dan Banjar Dinas Umahanyar 355/98/21 hilang), sehingga baris **Total = 3.505 penduduk / 983 KK / 197 miskin**, padahal Dashboard dan API = **4.200 / 1.176 / 240**. Tidak ada paginasi di UI, jadi 2 banjar tidak bisa dilihat sama sekali. API: `databanjar/find-many?page=1&limit=10` → `total: 12, totalPages: 2`. Dugaan akar: `page.tsx:14` memanggil `state.findMany.load()` tanpa argumen → default `limit = 10` (`_state/kependudukan/data-banjar.ts:62`), lalu total dihitung di client dari halaman 1 saja. | Buka halaman → bandingkan baris Total dengan Dashboard | 12 banjar tampil, Total = 4.200 / 1.176 / 240 (atau total diambil dari API agregat) | **Tinggi** | `qc-screenshots/kependudukan-data-per-banjar-desktop.png`, `qc-screenshots/kependudukan-dashboard-hp.png` |
| 2 | `/kependudukan/dinamika-penduduk` vs `/kependudukan/dashboard` | Kebenaran data / Konsistensi | Semua | Dinamika menampilkan **Kelahiran 5, Kematian 5, Pertumbuhan Alami 0**; Dashboard (kartu "Dinamika Penduduk" & "Kelahiran Tahun Ini") menampilkan **Kelahiran 1, Kematian 2** (tahun 2026). Dinamika menghitung `data.length` dari list kesehatan halaman 1 (`kelahiran/findMany?page=1&limit=10`) yang berisi data **semua tahun** (4 dari 5 kelahiran & 3 dari 5 kematian tahun 2025), sedangkan Pindah Masuk/Keluar diambil dari summary tahun ini → periode campur. Angka juga akan mentok di 10 bila data > 10. Dugaan akar: `dinamika-penduduk/page.tsx:23-31`. | Buka Dashboard, catat Kelahiran/Kematian → buka Dinamika Penduduk | Angka sama di kedua halaman (pakai `summary.dinamika` tahun berjalan), periode/tahun disebutkan | **Tinggi** | `qc-screenshots/kependudukan-dinamika-hp.png`, `qc-screenshots/kependudukan-dashboard-desktop.png` |
| 3 | `/kependudukan/distribusi-agama` | Kebenaran data | Semua | Total agama **6.541** jauh di atas total penduduk 4.200. Penyebab: list tidak difilter tahun sehingga data 2020 (LAINNYA 10) dan 2021 (LAINNYA 290) tercampur dengan 2026 → **"LAINNYA" muncul 3 kali**. Bahkan data 2026 saja berjumlah 6.241. Nilai "LAINNYA" tahun 2026 = **2.026** (sama persis dengan angka tahun) → dugaan salah input tahun ke kolom jumlah. Dugaan akar: `distribusi-agama/page.tsx:15` `load()` tanpa filter `tahun` (`_state/kependudukan/distribusi-agama.ts:57`); summary API sudah memfilter `tahun: currentYear`. | Buka halaman → lihat daftar dan Total | Satu baris per agama untuk tahun berjalan; total = total penduduk (4.200) atau selisihnya dijelaskan | **Tinggi** | `qc-screenshots/kependudukan-agama-desktop.png` |
| 4 | `/kependudukan/distribusi-umur` | Kebenaran data | Semua | Grafik mencampur tahun: `0-5` (25, tahun 2025) dan `65+` (230, tahun 2021) ikut tampil bersama data 2026 → **dua batang "65+"**, dan rentang **tumpang tindih** (`0-5`, `6-12` di dalam `0-14`). Jumlah data 2026 saja = 4.305, tidak sama dengan total penduduk 4.200. Urutan sumbu X: 0-5, 0-14, 6-12, … (urut angka awal). Dugaan akar: `distribusi-umur/page.tsx:15` `load()` tanpa filter tahun + data seed/admin yang rentangnya tidak seragam. | Buka halaman → lihat label sumbu X | Satu set kelompok umur tanpa tumpang tindih, satu tahun, jumlah = total penduduk | **Tinggi** | `qc-screenshots/kependudukan-umur-desktop.png`, `qc-screenshots/kependudukan-umur-hp.png` |
| 5 | `/kependudukan/dinamika-penduduk` (API `/api/kesehatan/kelahiran/findMany`, `/api/kesehatan/kematian/findMany`) | Keamanan / Privasi | — | Halaman hanya menampilkan angka, tetapi untuk menghitungnya browser mengunduh list lengkap tanpa login yang berisi **nama bayi/almarhum, alamat lengkap ("Jl. Kalibaru no.10, …"), jenis kelamin, dan penyebab kematian** (mis. "Sakit Jantung"). Ini data pribadi + data kesehatan yang terbuka untuk publik lewat DevTools/API. | Buka DevTools → Network di halaman Dinamika, atau `GET /api/kesehatan/kematian/findMany?page=1&limit=10` tanpa sesi | Halaman publik memakai endpoint agregat (jumlah saja, mis. `summary.dinamika`); endpoint detail dilindungi auth atau tidak mengembalikan PII | **Tinggi** | — (respons API, lihat langkah reproduksi) |
| 6 | `/darmasaba/kependudukan`, `/darmasaba/kependudukan/<apa-saja>` | State 404 / Navigasi | Semua | Status HTTP sudah 404 (benar), tetapi halamannya default Next.js tanpa gaya: teks Inggris **"Not Found / This is the not found page"**, tanpa navbar, footer, logo, atau link kembali. Pengguna yang mengetik URL index menu (`/darmasaba/kependudukan`) terjebak. Dugaan akar: `src/app/not-found.tsx:5` (global). | Buka `/darmasaba/kependudukan` | Halaman 404 berbahasa Indonesia, bermerek desa, dengan navbar/tombol ke beranda; atau index menu redirect ke Dashboard Kependudukan | **Sedang** | `qc-screenshots/kependudukan-index-404.png` |
| 7 | `/kependudukan/distribusi-agama` | Teks / Format | Semua | Label agama tampil sebagai nilai enum mentah huruf kapital: **"KRISTEN_PROTESTAN"**, "KRISTEN_KATOLIK", "HINDU", "KONGHUCU". Persentase memakai titik desimal format Inggris ("58.9%", "0.0%") — format Indonesia memakai koma ("58,9%"); "0.0%" untuk Konghucu terkesan nol. Dugaan akar: `distribusi-agama/page.tsx:135` (`{item.agama}`) dan `:141` (`toFixed(1)`). | Buka halaman → lihat legenda | "Kristen Protestan", "Kristen Katolik", "Hindu"; "58,9%", "<0,1%" | **Sedang** | `qc-screenshots/kependudukan-agama-desktop.png` |
| 8 | `/kependudukan/dinamika-penduduk`, `/kependudukan/dashboard` | Aksesibilitas (kontras) | Semua | Teks putih di kartu berwarna gagal WCAG AA: hijau `#6EDF9C` ≈ **1,7:1**, oranye `#FF9F43` ≈ **2,0:1**, merah `#EE5050` ≈ 3,6:1, biru `#5082EE` ≈ 3,6:1 (label `fz="sm"` butuh ≥ 4,5:1). Label "Kelahiran"/"Pindah Keluar" sulit dibaca. Dugaan akar: `dinamika-penduduk/page.tsx:125-155`, `dashboard/page.tsx:163-186`. | Buka halaman → lihat kartu Kelahiran/Pindah Keluar | Kontras ≥ 4,5:1 (teks gelap di latar terang atau latar lebih gelap) | **Sedang** | `qc-screenshots/kependudukan-dinamika-hp.png` |
| 9 | API Kelahiran & Kematian | Integritas data | — | Semua record yang dicek punya `deletedAt` terisi (sama dengan `createdAt`) tetapi `isActive: true` — pola yang sama dengan temuan No. 10 di laporan Lingkungan. Bila query lain memfilter `deletedAt: null`, data ini akan "hilang" dan angka antarhalaman makin tidak konsisten. | `GET /api/kesehatan/kelahiran/findMany?page=1&limit=10` → lihat `deletedAt` | `deletedAt: null` untuk data aktif (perbaiki seed/backfill) | **Sedang** | — |
| 10 | `/kependudukan/distribusi-umur` | UI / Aksesibilitas | Semua (paling terasa HP 375) | Grafik batang tidak punya label nilai maupun tabel — jumlah per kelompok hanya terlihat lewat tooltip hover (tidak bisa di HP/keyboard; `recharts-label` = 0). Label sumbu X diputar -45° dan kecil di 375px. | Buka di 375px → coba baca jumlah kelompok "25-54" | Nilai tampil di atas batang atau ada tabel ringkas + total | Rendah | `qc-screenshots/kependudukan-umur-hp.png` |
| 11 | `/kependudukan/distribusi-agama`, `/distribusi-umur` | UI / Console | Desktop 1440 / Chromium | Pie chart menempel di kiri dengan ruang kosong lebar di tengah kartu; tiga irisan "LAINNYA" memakai abu-abu yang sama sehingga tidak bisa dibedakan. Console warning Recharts: "The width(-1) and height(-1) of chart should be greater than 0" di kedua halaman. | Buka di 1440px, lihat console | Pie di tengah kolomnya, warna unik per kategori, tidak ada warning | Rendah | `qc-screenshots/kependudukan-agama-desktop.png` |
| 12 | `/darmasaba` (beranda) vs Kependudukan | Konsistensi / Konten | Semua | Beranda tidak menampilkan statistik jumlah penduduk / KK / banjar sama sekali (dicek seluruh teks halaman setelah scroll; tidak ada request API kependudukan), padahal `.claude/DESIGN.md` §16 menyebut "Statistik cepat: jumlah penduduk, KK, banjar". Dashboard Kependudukan juga tidak menampilkan jumlah banjar. Konsistensi angka beranda ↔ menu tidak bisa diverifikasi. | Buka `/darmasaba`, cari "penduduk" | Statistik cepat tampil dan sama dengan Dashboard (4.200 / 1.176 / 12 banjar), atau dokumen desain diperbarui | Rendah | — |
| 13 | `/kependudukan/dashboard` | Konten / UI | Semua | Tidak ada keterangan tahun data ("tahun ini" = 2026 tidak tertulis; halaman lain juga tanpa tahun). Kartu "Kelahiran Tahun Ini" duplikat dengan kartu "Kelahiran" di bagian Dinamika; ikonnya keranjang belanja (`IconBasket`). API summary sudah mengirim `agama`, `umur`, `banjar` tetapi tidak dipakai. Angka di kartu Dinamika tidak di-`toLocaleString`. | Buka Dashboard | Label "Data tahun 2026", ikon relevan (mis. bayi), tanpa kartu duplikat | Rendah | `qc-screenshots/kependudukan-dashboard-desktop.png` |
| 14 | `/kependudukan/data-per-banjar` | Teks / Konsistensi | Semua | Judul tidak konsisten: menu "Data **Per** Banjar", judul halaman "Data **per** Banjar", judul empty state "Data **Per** Banjar" (`data-per-banjar/page.tsx`). Tabel juga mencampur **Banjar Adat** (Kangin/Kauh/Tengah) dan **Banjar Dinas** dalam satu total — perlu konfirmasi apakah penduduk adat & dinas tidak terhitung ganda. | Bandingkan menu dan judul halaman | Penulisan seragam; pemisahan/konfirmasi jenis banjar | Rendah | `qc-screenshots/kependudukan-data-per-banjar-desktop.png` |
| 15 | Semua halaman Kependudukan | SEO | Semua | Judul tab selalu "Desa Darmasaba" dan meta description sama ("Website resmi Desa Darmasaba, …") di semua halaman. | Lihat `<title>` & meta | Judul spesifik, mis. "Distribusi Agama – Desa Darmasaba" | Rendah | — |
| 16 | Semua halaman Kependudukan | Aksesibilitas | Semua | 7 tombol/link tanpa nama aksesibel per halaman: tombol kembali (ActionIcon panah, `desa/layanan/_com/BackButto.tsx:11` tanpa `aria-label`), ikon search navbar, burger (HP), ikon sosial footer. Urutan Tab: tab stop pertama dan 3 tab stop setelah "Musik" tidak bernama. | Navigasi dengan Tab dari awal halaman | Semua kontrol ikon punya `aria-label` | Rendah | — |
| 17 | `/kependudukan/*` (state data kosong) | Konten | Semua | Teks empty state menyebut "untuk **tahun ini** belum diperbarui", padahal halaman Data per Banjar/Agama/Umur memuat data tanpa filter tahun (No. 1, 3, 4) — pesan bisa menyesatkan bila data tahun lalu ada / data tahun ini kosong. (Dari kode, tidak muncul di STG karena data ada.) | Baca `*/page.tsx` bagian `data.length === 0` | Pesan & query memakai tahun yang sama | Rendah | — |

### Tidak bisa dites & alasannya

| Item | Alasan |
|---|---|
| **WebKit/Safari** | Playwright WebKit diketahui crash (Bus error) di mesin ini; sesuai instruksi tidak dicoba ulang dan Safari MCP tidak dipakai. Perlu dites manual di Safari. |
| Kebenaran data vs sumber acuan resmi | Plan belum mengisi "Sumber acuan data". Yang dicek: kesesuaian API ↔ UI dan konsistensi antarhalaman/beranda. Angka mana yang benar (4.200 vs 6.541 dsb.) perlu konfirmasi admin desa. |
| Pencarian, filter, sorting, paginasi | Halaman Kependudukan tidak punya fitur tersebut (justru menjadi penyebab No. 1). |
| Form / validasi | Tidak ada form di menu Kependudukan (form subscribe footer global tidak di-submit karena mode baca saja). |
| Halaman detail / ID tidak valid | Tidak ada route detail `[id]` di menu ini; diganti uji sub-path tidak valid (→ 404, lolos). |
| Empty state & loading state | Data ada di STG sehingga empty state tidak bisa dimunculkan tanpa mengubah data; dinilai dari kode (No. 17). |
| Dark mode | Halaman publik tidak punya dark mode (`.claude/DESIGN.md` §13). |
| Halaman butuh login | Menu Kependudukan publik tidak butuh login; admin CMS di luar scope. |

### Catatan teknis
- Branch lokal `stg` tertinggal dari STG `0.1.202`; rujukan file:baris memakai kode lokal (bertanda "dugaan").
- Footer "© 2025" dan header HSTS sudah dilaporkan di laporan Lingkungan (komponen global), tidak dihitung ulang di sini.
- Script pengumpul data: salinan di scratchpad worker (`qc.js`, `txt.js`, `api.js`, `extra.js`).
