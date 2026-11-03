# QC Report — Menu Lingkungan (STG)

- **Target:** https://desa-darmasaba-stg.wibudev.com/ (versi STG `0.1.202`)
- **Tanggal:** 2 November 2026
- **Scope:** menu **Lingkungan** saja (sesuai `MIND/PLAN/plan-qc-1-Nov.md`)
- **Tool:** `playwright-cli` (Chromium headless), mode baca saja: tidak ada form yang di-submit dan tidak ada data yang diubah
- **Ukuran layar:** 375x812 (HP), 768x1024 (tablet), 1440x900 (desktop)

### Halaman yang dites (Langkah 0)

| # | Halaman | URL |
|---|---|---|
| 1 | Index Lingkungan | `/darmasaba/lingkungan` |
| 2 | Pengelolaan Sampah (Bank Sampah) | `/darmasaba/lingkungan/pengelolaan-sampah-bank-sampah` |
| 3 | Program Penghijauan (+ detail) | `/darmasaba/lingkungan/program-penghijauan`, `/program-penghijauan/[id]` |
| 4 | Data Lingkungan Desa | `/darmasaba/lingkungan/data-lingkungan-desa` |
| 5 | Gotong Royong (semua, kategori, detail) | `/gotong-royong/semua`, `/gotong-royong/[kategori]`, `/gotong-royong/[kategori]/[id]` |
| 6 | Edukasi Lingkungan | `/darmasaba/lingkungan/edukasi-lingkungan` |
| 7 | Konservasi Adat Bali | `/darmasaba/lingkungan/konservasi-adat-bali` |
| 8 | URL tidak ada (uji 404) | `/darmasaba/lingkungan/halaman-tidak-ada-qc` |

---

## 1. Ringkasan

| Keparahan | Jumlah |
|---|---|
| Kritis | 0 |
| Tinggi | 3 |
| Sedang | 7 |
| Rendah | 12 |
| **Total** | **22** |

**Yang lolos:**
- Tidak ada scroll horizontal di 3 ukuran layar pada semua halaman.
- Tidak ada teks `undefined` / `null` / `NaN` / `[object Object]` / lorem ipsum.
- Tidak ada console error selain 404 gambar placeholder.
- Respons API ~250 ms.
- HTTP diarahkan ke HTTPS (301).
- Tidak ada pola token/API key di HTML.
- Menu hamburger HP → Lingkungan → submenu → navigasi berjalan benar.
- Paginasi Gotong Royong dan Bank Sampah sesuai data API.

---

## 2. Tabel Temuan

| No | Halaman/URL | Kategori | Layar/Browser | Deskripsi | Langkah reproduksi | Hasil yang diharapkan | Keparahan | Bukti |
|---|---|---|---|---|---|---|---|---|
| 1 | `/lingkungan/data-lingkungan-desa` | Fungsional / Data | Semua / Chromium | Klik halaman **2** di paginasi → daftar kosong dan paginasi berubah jadi hanya "1". Padahal API (`limit=6`) punya total 7 data, dan halaman 2 berisi "Pelaksanaan Kebersihan Lingkungan Desa". Dugaan penyebab: `onChange={(newPage) => load(newPage)}` tidak meneruskan limit 6 dan search (`data-lingkungan-desa/page.tsx:148`), sehingga dipakai limit default. | Buka halaman → klik "2" | Muncul 1 data di halaman 2, paginasi tetap 2 halaman | **Tinggi** | `qc-screenshots/lingkungan-data-lingkungan-page2-kosong.png` |
| 2 | `/lingkungan/gotong-royong/semua` | Fungsional / Data | Semua / Chromium | Pencarian "turnamen" menampilkan "Belum Ada Data", padahal "Turnamen Olahraga Antar Banjar" tampil di daftar. API `kegiatandesa/find-many?search=a` hanya mengembalikan 3 data, dan ketiganya **tidak ada** di daftar tanpa filter (total 10). Daftar dengan filter dan tanpa filter memakai himpunan data yang berbeda. Tab kategori "Coba 1" juga hilang setelah mencari. | Ketik "turnamen" di kotak pencarian | Kartu "Turnamen Olahraga Antar Banjar" muncul | **Tinggi** | — (teks via `requests`) |
| 3 | `/lingkungan/pengelolaan-sampah-bank-sampah` | Fungsional / Data | Semua / Chromium | Pencarian "mandiri" tidak menemukan "Bank Sampah Darmasaba Mandiri" yang tampil di daftar. API `search=a` mengembalikan "gang yamuna vi", "Gang Yamuna", dan "TPS 3R Pudak Mesari", tanpa "Bank Sampah Darmasaba Mandiri". Polanya sama dengan No. 2 (lihat No. 10). | Ketik "mandiri" di "Cari Bank Sampah Terdekat" | Kartu Bank Sampah Darmasaba Mandiri muncul | **Tinggi** | — |
| 4 | Gotong Royong, Bank Sampah, Data Lingkungan | Konten / Data | Semua | Data dummy/tes tampil di halaman publik: <br>• Gotong Royong: "Cobaa", "Hsusnsnjssj", "Suhansjzsjjs", "Kegiatan"/"Cobaaa", kategori "Coba 1" <br>• Bank Sampah: "sampah (tes)", "Pilih sampah sesai jenisnya (Tes )", alamat "Darmsaba" (typo) <br>• Data Lingkungan: "TEST QA DATA LINGKUNGAN" "± 100" "Deskripsi test" | Buka halaman terkait | Hanya data asli yang tampil, atau data tes dinonaktifkan | **Sedang** | `lingkungan-gotong-royong-desktop.png`, `lingkungan-gotong-royong-detail-dummy.png`, `lingkungan-bank-sampah-hp.png`, `lingkungan-data-lingkungan-hp.png` |
| 5 | `/darmasaba/lingkungan` | UI / Navigasi | Semua | Halaman index hanya berisi teks polos "lingkungan" (`lingkungan/page.tsx`). | Buka URL langsung | Landing ringkas dengan 6 submenu, atau redirect ke submenu pertama | **Sedang** | `lingkungan-index-desktop.png` |
| 6 | `/darmasaba/lingkungan/<apa-saja>` | State 404 | Semua | URL yang tidak ada mengembalikan **HTTP 200** dan menampilkan slug sebagai teks, misalnya "halaman-tidak-ada-qc" (`[sub]/page.tsx`). Ini soft-404: buruk untuk SEO dan membingungkan pengguna. | Buka `/darmasaba/lingkungan/halaman-tidak-ada-qc` | Halaman 404 dengan status 404 | **Sedang** | `lingkungan-404-soft.png` |
| 7 | `/lingkungan/program-penghijauan/<id-invalid>` | State khusus | Semua | Tertahan selamanya di "Sedang memuat detail program...", padahal API sudah membalas `success:false, "Program penghijauan tidak ditemukan"`. | Buka `/program-penghijauan/id-tidak-ada` | Pesan "Program tidak ditemukan" dan tombol kembali | **Sedang** | `lingkungan-penghijauan-id-invalid.png` |
| 8 | `/lingkungan/gotong-royong/<kategori>/<id-invalid>` | State khusus / API | Semua | Halaman kosong total (hanya navbar). API `GET /api/lingkungan/kegiatandesa/<id>` membalas **HTTP 500** dengan teks polos "Kegiatan desa tidak ditemukan". Seharusnya 404 dengan format JSON yang sama seperti endpoint lain. | Buka `/gotong-royong/semua/id-tidak-ada` | Pesan "tidak ditemukan"; API 404 JSON | **Sedang** | `lingkungan-gotong-royong-id-invalid.png` |
| 9 | `/lingkungan/gotong-royong/semua` | UI / Gambar | Semua | `/images/placeholder-small.jpg` → **404**, dicoba ulang 3x (`?_retry=1..3`). Kartu "Turnamen Olahraga Antar Banjar" tampil sebagai gambar rusak dengan teks alt saja. | Buka halaman → lihat kartu ke-3 di "Gotong royong Terbaru" | Placeholder tampil atau gambar default | **Sedang** | `lingkungan-gotong-royong-desktop.png` |
| 10 | API Lingkungan (semua modul) | Data integrity | — | Semua record yang dicek punya `deletedAt` terisi (sama dengan `createdAt`) tetapi `isActive: true`. Ini terjadi di datalingkungandesa, programpenghijauan, kegiatandesa, pengelolaansampah, dan keteranganbankterdekat. Dugaan kuat: ini akar No. 2 & 3, karena list memfilter `isActive` sedangkan pencarian (versi STG) ikut memfilter `deletedAt`. Perlu dicek seed/backfill. | `GET /api/lingkungan/datalingkungandesa/find-many?page=1&limit=6` → lihat `deletedAt` | `deletedAt: null` untuk data aktif | **Sedang** | — |
| 11 | `/lingkungan/gotong-royong/*` | UI / Data | Semua | Item "Utama" (Cobaa) muncul lagi sebagai item pertama di "Gotong royong Terbaru". Di halaman kategori (mis. Olahraga), item yang sama muncul di "Utama" dan di "Daftar Gotong Royong". | Buka halaman semua / kategori Olahraga | Item utama tidak diulang di daftar | Rendah | `lingkungan-gotong-royong-desktop.png` |
| 12 | `/lingkungan/gotong-royong/semua` | Format | Semua | Format tanggal tidak konsisten: "31 Agustus 2026" (utama) vs "31 Agu 2026" (kartu). | Lihat kartu utama vs terbaru | Satu format, mis. "31 Agustus 2026" | Rendah | idem |
| 13 | Gotong Royong | Teks / Konsistensi | Semua | Kapitalisasi campur: "Portal Gotong royong", "Gotong royong Utama/Terbaru" vs "Gotong Royong Utama" (halaman kategori) dan "Gotong Royong" (menu). Segmen URL kategori juga tidak konsisten: `/Sosial/` (dari tombol detail) vs `/olahraga` (dari tab). | Bandingkan judul & URL | "Gotong Royong" konsisten; slug URL lowercase | Rendah | — |
| 14 | Semua halaman Lingkungan | SEO | Semua | Judul tab selalu "Desa Darmasaba" dan meta description sama untuk semua halaman. | Lihat `<title>` & meta | Judul/deskripsi spesifik per halaman, mis. "Program Penghijauan – Desa Darmasaba" | Rendah | — |
| 15 | Program Penghijauan, Data Lingkungan | State kosong | Semua | Pencarian tanpa hasil hanya menyisakan paginasi "1" tanpa pesan. Gotong Royong sudah punya empty state "Belum Ada Data". | Cari "zzzqqq" | Pesan "Data tidak ditemukan" | Rendah | — |
| 16 | Semua halaman | Aksesibilitas | Semua | Tombol ikon tanpa label: burger menu (HP), tombol kembali (panah), ikon search navbar (tab stop bernama kosong). Kartu Program Penghijauan bisa diklik tapi tidak bisa di-fokus dengan Tab, jadi detail tidak terjangkau keyboard. Input pencarian tidak punya focus ring yang terlihat. | Navigasi pakai Tab | Semua kontrol punya `aria-label`, kartu fokusable, focus ring terlihat | Rendah | — |
| 17 | `/lingkungan/edukasi-lingkungan` | UI / Teks | Tablet 768 | Teks rata kanan-kiri (justify) di kartu "Tujuan Edukasi" membuat jarak antarkata lebar, dan tidak konsisten dengan kartu lain yang rata kiri. Typo "kreatifitas" → "kreativitas". | Buka di 768px | Rata kiri, ejaan KBBI | Rendah | `lingkungan-edukasi-tablet.png` |
| 18 | `/lingkungan/program-penghijauan` | UI / Layout | Desktop 1440 | Judul "Manfaat Program" menjorok dan tidak sejajar dengan kartu. Dengan 3 data di grid 4 kolom, sisi kanan kosong. | Buka di 1440px | Heading sejajar grid; grid menyesuaikan | Rendah | `lingkungan-penghijauan-desktop.png` |
| 19 | `/lingkungan/gotong-royong/semua` | Performa | Desktop / Chromium | Load (networkidle) **~5,4 detik**; halaman lain ~1,5–2,5 detik. Sebagian waktu terpakai retry 3x gambar placeholder yang 404 (No. 9). Semua halaman juga memanggil `/api/desa/musik/find-many?limit=50` (player musik global). | Buka halaman, ukur waktu | < 3 detik | Rendah | — |
| 20 | `/lingkungan/pengelolaan-sampah-bank-sampah` | UI | HP 375 | Placeholder input terpotong: "Cari Bank Sampah Terdek…". | Buka di 375px | Placeholder lebih pendek, mis. "Cari bank sampah" | Rendah | `lingkungan-bank-sampah-hp.png` |
| 21 | `/lingkungan/data-lingkungan-desa` | Konten | Semua | Semua kartu menampilkan "± 1 paket kegiatan" dan data tes "± 100" tanpa satuan. Angka tidak informatif dan perlu dicek ke sumber data asli. | Lihat kartu | Nilai & satuan sesuai data acuan | Rendah | `lingkungan-data-lingkungan-hp.png` |
| 22 | Footer (global) | Teks | Semua | "© 2025 Desa Darmasaba", padahal sekarang 2026. Komponen global, di luar scope menu Lingkungan. | Lihat footer | Tahun dinamis | Rendah | `lingkungan-penghijauan-desktop.png` |

---

## 3. Yang Tidak Bisa Dites & Alasannya

| Item | Alasan |
|---|---|
| **WebKit/Safari** | Playwright WebKit (build `webkit_mac14_arm64_special-2251`) crash **Bus error: 10** saat launch di macOS 14.2 ini. Fallback Safari MCP tidak bisa dipakai karena Safari tidak sedang berjalan. Perlu dites manual di Safari, atau buka Safari lalu minta saya ulangi. Catatan: commit `457c419e fix(lingkungan): Safari compat …` sudah ada. |
| Kebenaran data vs sumber acuan | Plan belum mengisi "Sumber acuan data". Yang dicek hanya kesesuaian API ↔ UI dan konsistensi antarhalaman. |
| Dark mode | Halaman publik tidak punya dark mode (sesuai `.claude/DESIGN.md` §13). |
| Halaman butuh login | Menu Lingkungan publik tidak butuh login; admin CMS di luar scope. |
| Submit form (subscribe email footer) | Dilarang oleh plan (mode baca saja). |
| Ukuran gambar terlalu besar | Semua gambar sudah di-serve sebagai `.webp` lewat `/api/img/*`. Tidak ada gambar > 2500 px. |

## Catatan Teknis
- Branch lokal `stg` (`0.1.196`) **tertinggal** dari yang ter-deploy di STG (`0.1.202`). Rujukan file:baris di laporan ini memakai kode lokal, jadi bisa sedikit berbeda dengan STG.
- Header `Strict-Transport-Security` (HSTS) tidak dikirim. Ini info keamanan minor.
