# QC Report: Menu Pendidikan (STG)

- **Target:** https://desa-darmasaba-stg.wibudev.com/ (versi STG `0.1.202`)
- **Tanggal:** 2 November 2026
- **Scope:** menu **Pendidikan** saja (sesuai `MIND/PLAN/plan-qc-1-Nov.md`)
- **Tool:** `playwright-cli -s=qc-pendidikan` (Chromium headless) + `curl` ke API publik. Mode baca saja: tidak ada form yang di-submit dan tidak ada data yang diubah.
- **Ukuran layar:** 375x812 (HP), 768x1024 (tablet), 1440x900 (desktop)

## Menu Pendidikan

### Halaman yang dites

| No | Halaman | URL |
|---|---|---|
| 1 | Index Pendidikan | `/darmasaba/pendidikan` |
| 2 | Info Sekolah: Semua + detail Lembaga/Siswa/Pengajar | `/pendidikan/info-sekolah/semua`, `/semua/lembaga`, `/semua/siswa`, `/semua/pengajar` |
| 3 | Info Sekolah per jenjang (+ detail) | `/info-sekolah/sd`, `/SD`, `/paud`, `/smk`, `/sd/siswa`, `/sd/pengajar` |
| 4 | Info Sekolah, jenjang tidak valid | `/info-sekolah/jenjang-tidak-ada`, `/jenjang-tidak-ada/lembaga` |
| 5 | Beasiswa Desa (+ form pendaftaran, validasi saja) | `/darmasaba/pendidikan/beasiswa-desa` |
| 6 | Beasiswa: Pelajari Lebih Lanjut | `/pendidikan/beasiswa-desa/pelajari-lebih-lanjut` |
| 7 | Program Pendidikan Anak | `/darmasaba/pendidikan/program-pendidikan-anak` |
| 8 | Bimbingan Belajar Desa | `/darmasaba/pendidikan/bimbingan-belajar-desa` |
| 9 | Pendidikan Non Formal | `/darmasaba/pendidikan/pendidikan-non-formal` |
| 10 | Perpustakaan Digital: semua, kategori, detail, form peminjaman (validasi saja) | `/perpustakaan-digital/semua`, `/perpustakaan-digital/drama`, `/perpustakaan-digital/Drama/[id]` |
| 11 | Perpustakaan, kategori/ID tidak valid | `/perpustakaan-digital/kategori-tidak-ada-qc`, `/perpustakaan-digital/drama/id-tidak-ada-qc` |
| 12 | Data Pendidikan | `/darmasaba/pendidikan/data-pendidikan` |
| 13 | URL tidak ada (uji 404) | `/darmasaba/pendidikan/halaman-tidak-ada-qc` |

API yang dicek langsung: `/api/pendidikan/infosekolahpaud/{lembagapendidikan,siswa,pengajar,jenjangpendidikan}/find-many`, `/api/pendidikan/datapendidikan/findMany`, `/api/pendidikan/perpustakaandigital/{dataperpustakaan/findMany,kategoribuku/findManyAll}`, `/api/pendidikan/beasiswa/{keunggulanprogram/findMany,ringkasan/stats}`, serta endpoint `find-by-id?id=edit` untuk Program Anak, Bimbel, dan Non Formal.

---

### Ringkasan

| Keparahan | Jumlah |
|---|---|
| Kritis | 0 |
| Tinggi | 2 |
| Sedang | 8 |
| Rendah | 13 |
| **Total** | **23** |

**Yang lolos:**
- Tidak ada scroll horizontal di 375 / 768 / 1440 pada ke-10 halaman utama.
- Tidak ada teks `undefined` / `null` / `NaN` / `[object Object]` / `Invalid Date` / lorem ipsum (dicek case-sensitive).
- Tidak ada console error/warning maupun `pageerror`. Gambar yang rusak hanya `/empty-books.svg` (No. 10).
- Semua respons API 200, ~240–480 ms dari browser (curl tanpa cache ~0,4–1,4 s). Halaman selesai dimuat dalam ~1–2,4 s.
- Angka Info Sekolah (19 lembaga / 189 siswa / 189 pengajar; SD: 7 / 70 / 70) **sesuai** dengan `total` API. Masalahnya ada pada isi datanya (lihat No. 1).
- Angka Data Pendidikan di grafik sesuai dengan API (masalah duplikasi kategori ada di No. 2).
- Perpustakaan: filter kategori (Drama → 2 buku), pencarian ("laskar" → Laskar Pelangi, "zzzqqq" → pesan kosong), dan paginasi (10 halaman × 3 = 28 buku sesuai `total` API) berjalan benar. Halaman 10 berisi 1 buku.
- Form Beasiswa: tombol **Kirim** disabled saat form kosong maupun saat isinya tidak valid. Pesan validasi jelas (nama min 3, NIS min 4 digit, NIK 16 digit, No HP min 10 digit). Huruf di NIK otomatis dibuang (`12ab34` → `1234`).
- Form Peminjaman Buku: tombol **Pinjam Buku** disabled saat kosong maupun saat isinya tidak valid. Ada pesan validasi alamat dan nomor telepon serta penghitung karakter.
- Menu hamburger HP → Pendidikan → 7 submenu tampil → "Perpustakaan Digital" membuka URL yang benar.
- Navigasi keyboard (Tab) berjalan berurutan (navbar → tombol kembali → tab jenjang → Segarkan Data) dengan focus ring terlihat.
- Konten Program Pendidikan Anak, Bimbingan Belajar, dan Non Formal sesuai isi API.

---

### Tabel Temuan

| No | Halaman/URL | Kategori | Ukuran layar/browser | Deskripsi | Langkah reproduksi | Hasil yang diharapkan | Keparahan | Bukti |
|---|---|---|---|---|---|---|---|---|
| 1 | `/pendidikan/info-sekolah/semua/pengajar` (dan `/[jenjang]/pengajar`) | Kebenaran data | Semua / Chromium | Daftar **Tenaga Pengajar sama persis dengan daftar Siswa**: 189 nama yang sama, urutan sama, lembaga sama (mis. "I Gede Arjuna Pranata – SD No. 2 Darmasaba" muncul sebagai siswa dan pengajar). ID pengajar adalah salinan ID siswa dengan prefix diganti (`cmkoy1mvk…` → `dnkoy1mvk…`). Akibatnya angka "189 Tenaga Pengajar" di halaman Info Sekolah tidak valid. Dugaan: seed pengajar dibuat dengan menyalin data siswa (`prisma/_seeder_list/` pendidikan). | Buka `/info-sekolah/semua/siswa` dan `/info-sekolah/semua/pengajar` lalu bandingkan; atau `GET /api/pendidikan/infosekolahpaud/pengajar/find-many?page=1&limit=500` vs `.../siswa/...` | Data pengajar asli (nama guru), terpisah dari siswa | **Tinggi** | `qc-screenshots/pendidikan-info-sekolah-pengajar.png`, `qc-screenshots/pendidikan-info-sekolah-siswa.png` |
| 2 | `/pendidikan/data-pendidikan` | Kebenaran data / UI grafik | Semua / Chromium | Grafik menampilkan **dua batang "SD"** (874 dan 90). Data API `datapendidikan/findMany` memang punya dua record `name: "SD"`. Pengguna tidak bisa tahu mana yang benar, atau apakah keduanya seharusnya dijumlahkan. Selain itu, "SMA 862" lebih besar dari "SMP 50", yang tidak masuk akal secara piramida pendidikan. Angka perlu diverifikasi ke sumber resmi. | Buka halaman → lihat sumbu X grafik | Satu kategori per jenjang dengan angka yang benar | **Tinggi** | `qc-screenshots/pendidikan-data-pendidikan-desktop.png` |
| 3 | `/pendidikan/beasiswa-desa` (seksi Keunggulan Program) | Fungsional / Paginasi | Semua / Chromium | Klik halaman **2** di paginasi Keunggulan Program kadang menampilkan daftar **kosong**, dan paginasi berubah jadi hanya "1" (terjadi pada run pertama; run kedua menampilkan 2 item dengan benar). Penyebab: race condition. `onChange` memanggil `load(newPage, 10)` (`beasiswa-desa/page.tsx:237`), sedangkan efek `[page]` memanggil `load(page, 3, "")` (`page.tsx:128-131`). Dua request berjalan bersamaan, dan bila respons `page=2&limit=10` (data kosong, total 5) tiba terakhir, list jadi kosong. Klik juga melakukan `scrollTo top` sehingga pengguna terlempar ke atas halaman. | Buka halaman → scroll ke "Keunggulan Program" → klik "2" (ulangi beberapa kali) | Selalu muncul 2 item ("Bimbingan Belajar Gratis", "Program Beasiswa Berprestasi") tanpa lompat ke atas | **Sedang** | `qc-screenshots/pendidikan-beasiswa-keunggulan-page2.png` (kondisi benar; kondisi kosong terekam lewat teks halaman: "Keunggulan Program \| 1 \| Timeline Pendaftaran") |
| 4 | `/pendidikan/perpustakaan-digital/<kategori>/<id-invalid>` | State khusus | Semua / Chromium | Halaman tertahan selamanya di spinner. Kode hanya memeriksa `if (!data) return <Loader/>` tanpa membedakan status loading dan "tidak ditemukan" (`perpustakaan-digital/[kategoriBuku]/[id]/page.tsx:36-42`). HTTP 200. | Buka `/darmasaba/pendidikan/perpustakaan-digital/drama/id-tidak-ada-qc` | Pesan "Buku tidak ditemukan" + tombol kembali (idealnya status 404) | **Sedang** | `qc-screenshots/pendidikan-perpus-id-invalid.png` |
| 5 | `/darmasaba/pendidikan/<apa-saja>` | State 404 / SEO | Semua / Chromium | URL yang tidak ada mengembalikan **HTTP 200** dan hanya menampilkan slug sebagai `<h1>` ("halaman-tidak-ada-qc"). Ini soft-404 dari `pendidikan/[sub]/page.tsx`, pola yang sama dengan menu Lingkungan. | Buka `/darmasaba/pendidikan/halaman-tidak-ada-qc` | Halaman 404 dengan status 404 | **Sedang** | `qc-screenshots/pendidikan-404-soft.png` |
| 6 | `/darmasaba/pendidikan` | UI / Navigasi | Semua / Chromium | Halaman index hanya berisi teks polos "pendidikan". Halaman ini kemungkinan juga dirender oleh `[sub]` atau `pendidikan/page.tsx` placeholder. | Buka URL langsung | Landing ringkas berisi 7 submenu, atau redirect ke submenu pertama | **Sedang** | `qc-screenshots/pendidikan-index-desktop.png` |
| 7 | `/pendidikan/beasiswa-desa`, `/beasiswa-desa/pelajari-lebih-lanjut` | Konten / Data | Semua / Chromium | Informasi pendaftaran **kedaluwarsa dan saling bertentangan**: (a) Timeline di-hardcode Maret–Mei **2025** (`beasiswa-desa/page.tsx:150-156`), sehingga per Nov 2026 semua langkah tampil "selesai" sementara tombol "Daftar Sekarang" tetap aktif; (b) "Pelajari Lebih Lanjut" menyebut "Periode Beasiswa Tahun 2025", pendaftaran **1 Januari – 31 Mei 2025**, sementara di bagian Proses Seleksi tertulis "1 Februari – 31 Mei 2025" dan di Timeline "1 Maret 2025"; (c) stats API mengembalikan `tahunAjaran: "2025/2026"`. | Buka kedua halaman → bandingkan tanggal | Satu periode yang konsisten dan terkini (diambil dari data/CMS, bukan hardcode) | **Sedang** | `qc-screenshots/pendidikan-beasiswa-desktop.png` |
| 8 | `/pendidikan/beasiswa-desa` (statistik) | Kebenaran data | Semua / Chromium | Kartu "**90%** Peluang Kelulusan" di-hardcode (`beasiswa-desa/page.tsx:139`). API `beasiswa/ringkasan/stats` hanya mengembalikan `jumlahPenerima` (45) dan `danaTersalurkan`. Angka ini tidak punya sumber data. | Buka halaman → bandingkan dengan `GET /api/pendidikan/beasiswa/ringkasan/stats` | Semua angka statistik berasal dari data yang bisa dikelola admin | **Sedang** | `qc-screenshots/pendidikan-beasiswa-keunggulan-page2.png` |
| 9 | `/pendidikan/perpustakaan-digital/semua`, `/[kategori]` (state kosong) | UI / Gambar | Semua / Chromium | `/empty-books.svg` → **404** dan dicoba ulang 3x (`?_retry=1..2`). File tidak ada di `public/`. Ilustrasi state kosong rusak (dirujuk di `perpustakaan-digital/semua/content.tsx:143`, `[kategoriBuku]/content.tsx:124`). | Cari "zzzqqq" di perpustakaan, atau buka `/perpustakaan-digital/kategori-tidak-ada-qc` | Ilustrasi kosong tampil, tanpa request 404 | **Sedang** | `qc-screenshots/pendidikan-perpus-kategori-invalid.png` |
| 10 | API Pendidikan (semua modul) | Data integrity | — | Semua record yang dicek punya `deletedAt` terisi (sama dengan `createdAt`) tetapi `isActive: true`. Ini terjadi di lembagapendidikan, siswa, pengajar, datapendidikan, kategoribuku, dan find-by-id Program Anak/Bimbel/Non Formal. Polanya sama dengan temuan Lingkungan No. 10; dugaan berasal dari seed/backfill. Berisiko bila ada query yang memfilter `deletedAt: null`. | `GET /api/pendidikan/datapendidikan/findMany?page=1&limit=10` → lihat field `deletedAt` | `deletedAt: null` untuk data aktif | **Sedang** | — (respons API) |
| 11 | `/pendidikan/pendidikan-non-formal` | Konten | Semua / Chromium | Judul "**Tempat Kegiatan**" muncul dua kali. Seksi kedua berisi daftar jenis program (Keaksaraan Fungsional, Paket A/B/C, dst.), tapi `judul` record `jenisprogramyangdiselenggarakan` di DB bernilai "Tempat Kegiatan". | Buka halaman → scroll ke seksi kedua | Judul "Jenis Program yang Diselenggarakan" | Rendah | `qc-screenshots/pendidikan-non-formal-desktop.png` |
| 12 | `/pendidikan/beasiswa-desa` (Keunggulan Program) | Konten | Semua / Chromium | 3 dari 5 "Keunggulan Program" beasiswa bukan program beasiswa: "Pelestarian Seni dan Budaya Bali", "Program Bahasa Asing", "Kursus Keterampilan Digital". Isinya lebih cocok untuk Pendidikan Non Formal. | Buka halaman → seksi Keunggulan Program | Isi relevan dengan program beasiswa | Rendah | `qc-screenshots/pendidikan-beasiswa-desktop.png` |
| 13 | `/pendidikan/beasiswa-desa` (statistik) | Format angka | Semua / Chromium | Dana tersalurkan tampil "**1.2M**": titik desimal gaya Inggris, tanpa "Rp", dan "M" ambigu (million vs miliar). Berasal dari `formatDana` (`beasiswa-desa/page.tsx:14-20`), nilai API 1.200.000.000. | Buka halaman → kartu "Dana Tersalurkan" | Format Indonesia, mis. "Rp1,2 miliar" | Rendah | `qc-screenshots/pendidikan-beasiswa-keunggulan-page2.png` |
| 14 | `/pendidikan/info-sekolah/<jenjang>` | UI / Teks | Semua / Chromium | Teks "Menampilkan **147** hasil." di jenjang SD merupakan jumlah lembaga + siswa + pengajar (7+70+70), angka yang tidak bermakna (`info-sekolah/[jenjangPendidikan]/content.tsx:119`). Teks ini juga tidak muncul di tab "Semua", sehingga tidak konsisten. | Buka `/info-sekolah/sd` | Hapus teks tersebut atau tampilkan jumlah yang bermakna | Rendah | `qc-screenshots/pendidikan-info-sekolah-sd-desktop.png` |
| 15 | `/pendidikan/info-sekolah/<jenjang-tidak-valid>` | State khusus | Semua / Chromium | Jenjang yang tidak ada (mis. `jenjang-tidak-ada`) tetap HTTP 200 dan menampilkan kartu "0 / 0 / 0" seolah valid, tanpa pesan "tidak ditemukan" dan tanpa tab aktif. | Buka `/darmasaba/pendidikan/info-sekolah/jenjang-tidak-ada` | Pesan "Jenjang tidak ditemukan" atau 404 | Rendah | — (teks halaman) |
| 16 | `/pendidikan/info-sekolah/*` | Konten / Data | Semua / Chromium | Deskripsi menyebut "(TK, SD, SMP, SMA)", padahal tab juga berisi PAUD, SMK, dan Perguruan Tinggi. Ketiga tab tambahan itu tidak punya data (semua 0). | Buka halaman → klik tab PAUD/SMK/Perguruan Tinggi | Deskripsi sesuai tab; tab tanpa data disembunyikan atau diisi | Rendah | `qc-screenshots/pendidikan-info-sekolah-hp.png` |
| 17 | `/pendidikan/perpustakaan-digital/*` | UI / Teks | Semua / Chromium | Saat hasil kosong tertulis "Halaman 1 dari **0**" (`[kategoriBuku]/content.tsx:104`). Selain itu, hanya **3 buku per halaman** (limit=3), sehingga 28 buku tersebar di 10 halaman dan menyulitkan penjelajahan. | Cari "zzzqqq" atau buka kategori tidak valid | "Halaman 1 dari 1" atau sembunyikan; 9–12 buku per halaman | Rendah | `qc-screenshots/pendidikan-perpus-kategori-invalid.png`, `qc-screenshots/pendidikan-perpus-hp.png` |
| 18 | `/pendidikan/perpustakaan-digital/semua` | Kebenaran data | Semua | Buku **"Seni Berpikir Kritis"** (Non Fiksi) tercatat dua kali (duplikat di `dataperpustakaan`, total 28). | `GET /api/pendidikan/perpustakaandigital/dataperpustakaan/findMany?page=1&limit=100` | Tidak ada judul duplikat | Rendah | — (respons API) |
| 19 | `/pendidikan/perpustakaan-digital/*` | Navigasi / URL | Semua / Chromium | Casing URL kategori tidak konsisten: halaman kategori memakai `/perpustakaan-digital/drama`, sedangkan "Lihat Detail" mengarah ke `/perpustakaan-digital/Drama/<id>` (huruf besar, dari `encodeURIComponent(kategori.name)` di `[kategoriBuku]/content.tsx:207`). Kategori bernama spasi menghasilkan `%20` di URL. | Buka kategori Drama → klik "Lihat Detail" → lihat URL | Slug konsisten huruf kecil (`drama`, `anak-dan-remaja`) | Rendah | `qc-screenshots/pendidikan-perpus-detail-desktop.png` |
| 20 | Form Peminjaman Buku (modal di detail buku) | Validasi / Teks | Desktop / Chromium | Pesan No Telp saling bertentangan: helper tertulis "Tanpa angka 0 di depan — sudah diwakili +62", tetapi pesan error tertulis "Nomor harus 10–13 digit (**termasuk 0 depan**)". | Detail buku → "Pinjam Buku Ini" → isi No Telp "12" → Tab | Pesan konsisten, mis. "Nomor harus 9–12 digit setelah +62" | Rendah | `qc-screenshots/pendidikan-perpus-modal-pinjam-validasi.png` |
| 21 | Form Beasiswa (modal "Daftar Sekarang") | Validasi | Desktop / Chromium | Field "Penghasilan Orang Tua / Wali" berupa teks bebas (`type=text`, tanpa `inputMode`). Nilai "a" diterima tanpa error, padahal NIK dan No HP disanitasi menjadi angka. Data penghasilan jadi tidak terstruktur. | Daftar Sekarang → isi Penghasilan "a" → Tab | Input angka/rupiah atau pilihan rentang penghasilan | Rendah | `qc-screenshots/pendidikan-beasiswa-form-validasi.png` |
| 22 | Semua halaman Pendidikan | Aksesibilitas | Semua / Chromium | 6–10 tombol/link tanpa label per halaman: tombol logo, ikon search, dan tombol kembali (ikon panah) tanpa `aria-label`; tombol Burger di HP juga tanpa `aria-label`. Terdeteksi lewat Tab: 3 fokus pertama berlabel kosong. | Tab dari awal halaman `/info-sekolah/semua`; inspeksi `.mantine-Burger-root` di 375px | Semua tombol ikon punya `aria-label` | Rendah | — (hasil skrip) |
| 23 | Semua halaman Pendidikan | SEO | Semua | Title semua halaman sama, "Desa Darmasaba", dan meta description juga sama (generik). Footer juga masih "© 2025" (global). | Lihat tab browser / `<title>` di tiap halaman | Title spesifik, mis. "Beasiswa Desa – Pendidikan – Desa Darmasaba" | Rendah | — |

---

### Tidak bisa dites & alasannya

- **WebKit / Safari:** Playwright WebKit diketahui crash (Bus error) di mesin ini dan Safari MCP tidak dipakai sesuai brief, sehingga layout khusus Safari tidak diverifikasi.
- **Submit form Beasiswa & Peminjaman Buku:** sesuai aturan mode baca saja, tidak di-submit. Respons backend (pesan sukses/gagal, endpoint POST, whitelist auth publik) tidak dites.
- **Jenis Kelamin (Select) & Tanggal Lahir/Tanggal Pinjam (DatePicker):** hanya dicek secara statis (label wajib *), interaksi pemilihan tidak dites.
- **Kebenaran angka terhadap sumber resmi** (jumlah siswa/pengajar/sekolah, data pendidikan penduduk, dana beasiswa): tidak ada dokumen acuan. Yang dicek hanya konsistensi UI ↔ API dan kewajaran data. Konsistensi lintas menu (mis. Kependudukan) ditangani worker lain.
- **Dark mode:** halaman publik tidak punya dark mode (sesuai DESIGN.md §13).
- **Halaman yang butuh login / admin CMS:** di luar scope dan tidak boleh login.
- **Tablet 768px:** dicek otomatis (overflow, gambar, teks) dan lolos. Screenshot visual hanya diambil untuk 375 dan 1440.
