# Penilaian Mandiri — Lomba Website Desa Nasional 2027

Instrumen penilaian mandiri website Desa Darmasaba berdasarkan
`docs/PETUNJUK TEKNIS LOMBA DESA NASIONAL 2027.pdf` (Kemendesa PDT, 5 Okt 2026).
Dipakai untuk mengukur ulang skor setiap kali project selesai diperbaiki.

- **Baseline pertama:** 6 Nov 2026, versi `0.1.213`, branch `feature/gap-konten-point-2-6`
- **Metode baseline:** review kode lokal (statis), tanpa membuka browser dan tanpa mengubah kode/STG

---

## 1. Cara Pakai (penilaian ulang)

Berikan prompt ini ke AI assistant:

> Baca `docs/penilaian-lomba-website-desa-2027.md` dan juknis PDF-nya. Nilai ulang
> project ini per aspek memakai rubrik di bagian 4, cek ulang setiap temuan di
> bagian 6 (masih ada / sudah beres), lalu tambahkan satu baris di bagian 8
> (Riwayat Penilaian). Jangan ubah kode.

Langkah manual yang tidak bisa dicek dari kode (isi sendiri saat menilai ulang):

1. Ukur kecepatan di PageSpeed Insights (mobile + desktop) untuk beranda dan 2 halaman detail.
2. Buka website di HP: cek menu, teks tidak terlalu kecil, tidak ada scroll horizontal.
3. Cek alamat website di production: domain `desa.id`, HTTPS valid.
4. Cek konten nyata (bukan data contoh): tanggal berita terbaru, agenda tahun berjalan, APBDes 2026.

---

## 2. Syarat Administratif (GUGUR jika tidak terpenuhi)

Bukan bagian skor. Jika salah satu gagal, website tidak lolos seleksi sistem.

| Syarat (Juknis D) | Cara cek | Baseline 6 Nov 2026 |
|---|---|---|
| a. Domain resmi `desa.id` | `grep -rn "desa.id" .env.example docs/DEPLOYMENT.md src` + cek production | ❌ Hanya `desa-darmasaba-stg.wibudev.com` |
| b. SK Tim Pengelola Website (disahkan Kepala Desa) | Dokumen desa | ❓ Urusan desa |
| c. SK/ST Penunjukan Admin Portal Lomba | Dokumen desa | ❓ Urusan desa |
| d. Informasi dapat dipertanggungjawabkan | Konten nyata + sumber data | ❌ Masih data contoh |
| e. Tidak memakai data fiktif / menyesatkan | `docs/permintaan-data-desa.md` + cek isi halaman | ❌ Semua isi masih dummy |

Saran: menu yang tidak dinilai juknis (Kesehatan, Pendidikan, Lingkungan, Keamanan)
sebaiknya disembunyikan dulu jika datanya belum asli, supaya tidak dianggap data fiktif.

---

## 3. Timeline Lomba

| Tahap | Tanggal | Kegiatan |
|---|---|---|
| 1 | 2–13 Nov 2026 | Pendaftaran + pemeriksaan administrasi (https://haridesa.kemendesa.go.id/lombawebsite) |
| 2 | 23–27 Nov 2026 | Penilaian tingkat kabupaten/kota |
| 3 | 27 Nov 2026 | Penetapan terbaik kabupaten/kota |
| 4 | 30 Nov–4 Des 2026 | Penilaian tingkat provinsi |
| 5 | 4 Des 2026 | Penetapan peringkat 1 provinsi |
| 6 | 7–11 Des 2026 | Penilaian + wawancara nasional |
| 7 | 14–23 Des 2026 | Verifikasi lapangan 3 provinsi pemenang |
| 8 | 15 Jan 2027 | Penghargaan, Puncak Hari Desa (Mojokerto) |

Narahubung: `lomba.webdesa@kemendesa.go.id`

---

## 4. Rubrik Penilaian

**Rumus juknis:** setiap aspek diberi skor 0–100 berdasarkan bukti yang bisa diperiksa.
Nilai akhir = Σ (skor aspek × bobot).

| Skor akhir | Kategori |
|---|---|
| 81–100 | Sangat Baik |
| 61–80 | Baik |
| 41–60 | Cukup |
| 0–40 | Kurang |

**Panduan skor per indikator (agar konsisten antar penilaian):**

- `0` — tidak ada
- `50` — ada sebagian, atau fiturnya ada tapi isinya data contoh / basi
- `100` — lengkap, data asli, dan bisa diperiksa juri

Skor aspek = rata-rata indikator, lalu boleh disesuaikan ±10 dengan alasan tertulis.
Selalu catat dua angka: **Fitur** (anggap data asli) dan **Saat ini** (kondisi konten nyata).

### Aspek 1 — Kualitas dan Kelengkapan Informasi Desa (15%)

| Indikator | Di project | Cara cek |
|---|---|---|
| Sejarah, peta lokasi, batas wilayah, visi misi | `desa/profil` (`ui/profileDesa.tsx`, `ui/wilayahDesa.tsx`) | Buka `/darmasaba/desa/profil` |
| Struktur organisasi (nama + jabatan aparatur) | `desa/profil/struktur-perangkat-desa` (sumber: struktur PPID) | Kaur/Kasi/BPD sudah tampil? |
| Data & statistik SID: BUMDes, **Indeks Desa**, Monev Dana Desa | `kependudukan/*`, `ekonomi/*`, `desa/monev-pembangunan` | `grep -rnE "Indeks Desa\|IDM" src prisma/data` |
| Potensi / produk unggulan | `desa/potensi`, `ekonomi/umkm`, `ekonomi/sektor-unggulan-desa` | |
| Informasi kegiatan pembangunan | `desa/kegiatan-desa` (kategori Pembangunan), `desa/monev-pembangunan` | |
| Daftar layanan publik | `desa/layanan` | |
| Berita & agenda | `desa/berita`, `desa/event-budaya`, `desa/pengumuman` | |

### Aspek 2 — Keterbukaan, Transparansi Publik, Jaga Desa (15%)

| Indikator | Di project | Cara cek |
|---|---|---|
| APBDes + realisasi **Tahun 2026** | `(tambahan)/apbdes`, landing `main-page/apbdes` | Realisasi bukan 0%, tahun 2026 |
| Dokumen perencanaan RPJM Desa, RKP Desa 2026 | Dokumen Perencanaan (branch point 2-6) | Sudah di stg? PDF asli? |
| Program/kegiatan pembangunan 2026 | `desa/kegiatan-desa`, `desa/monev-pembangunan` | |
| Laporan kinerja + transparansi Dana Desa | — | Ada laporan kinerja / realisasi Dana Desa? |
| Kanal PPID | `ppid/*` (profil, struktur, DIP, dasar hukum, permohonan, keberatan, IKM) | DIP bukan data uji |

### Aspek 3 — Pelayanan Publik Digital (15%)

| Indikator | Di project | Cara cek |
|---|---|---|
| Persyaratan, SOP, waktu & biaya | `desa/layanan/[id]` (waktu/biaya baru, seed = perkiraan) | Cocokkan dengan SP Kepbek 53/2022 |
| Formulir permohonan online | `inovasi/layanan-online-desa/administrasi-online`, ajukan permohonan surat | |
| Kanal pengaduan + **tindak lanjut** | `inovasi/layanan-online-desa/pengaduan-masyarakat`, `keamanan/laporan-publik` | Model punya field status? |
| Kontak desa (telepon, alamat, email) | Footer / landing | `grep -nE "Jl\.\|0361\|@" src/app/darmasaba/_com/Footer.tsx` |
| Status / tindak lanjut layanan | — | Ada nomor tiket + halaman cek status? |
| Integrasi layanan (ikon instansi lain) | Footer `tautanPenting` | Link keluar ke Dukcapil, OSS, SP4N-LAPOR!, Pemkab Badung, Kemendesa? |

### Aspek 4 — Aktualitas dan Pengelolaan Konten (10%)

| Indikator | Di project | Cara cek |
|---|---|---|
| Frekuensi pembaruan konsisten | Konten (operasional) | Tanggal berita terbaru ≤ 1–2 minggu |
| Berita aktual, relevan, kredibel | `desa/berita` | Ada penulis/sumber? |
| Agenda tahunan | `desa/event-budaya` (Agenda & Kalender Desa) | Tahun berjalan |
| Foto/video sesuai isi berita | `desa/berita`, `desa/galery/*` | |
| Kalender kegiatan yang akan datang | Agenda & Kalender Desa (filter kategori) | Ada agenda ke depan |
| Penulisan mudah dibaca | Konten | |

### Aspek 5 — User Experience dan Kemudahan Akses (10%)

| Indikator | Di project | Cara cek |
|---|---|---|
| Navigasi/menu proporsional | `_com/NavbarFlyout.tsx` | |
| Struktur Header–Body–Footer | `darmasaba/layout.tsx`, `_com/Footer.tsx` | |
| Pencarian berfungsi | `_com/globalSearch.tsx`, `_com/NavBarSearch.tsx` | Coba cari judul berita |
| Kecepatan (tools juri) | — | PageSpeed Insights, catat skor |
| Responsif di ponsel | Mantine responsive + footer accordion | Cek di HP |
| Tautan aktif (tidak 404) | Footer + menu | Cek semua `link:` di `Footer.tsx` cocok dengan route |
| Ukuran teks & kontras | `docs/DESIGN.md` | Footer banyak `fz="xs"` |

Daftar route publik: `find src/app/darmasaba -name page.tsx`

### Aspek 6 — Inovasi dan Kreativitas Digital (10%)

| Indikator | Di project | Cara cek |
|---|---|---|
| Visualisasi data grafis | `kependudukan/dashboard`, grafik ekonomi/kesehatan | `grep -rlE "BarChart\|PieChart\|LineChart\|@mantine/charts" src/app/darmasaba \| wc -l` |
| Visualisasi spasial wilayah | `desa/profil/ui/wilayahDesa.tsx` (iframe Google Maps) | Ada peta batas / peta potensi? |
| Multimedia foto, video, suara | `desa/galery/*`, `musik/musik-desa` | |
| Integrasi platform lain (e-commerce, lapak desa) | `ekonomi/umkm/_lib/linkTokoOnline.ts`, pesan via WA | |
| Solusi khas desa: **fitur chat** | — | `grep -rniE "chat\|wa.me" src/app/darmasaba/_com` |

### Aspek 7 — Partisipasi dan Pemberdayaan Masyarakat (10%)

| Indikator | Di project | Cara cek |
|---|---|---|
| Promosi UMKM/BUMDes/ekonomi kreatif | `ekonomi/umkm`, BUMDes | |
| Promosi wisata/budaya | `desa/potensi`, `desa/event-budaya`, `lingkungan/konservasi-adat-bali` | |
| Hasil kegiatan pertanian/peternakan | `ekonomi/sektor-unggulan-desa` (satuan/periode) | Ada data hasil panen/produksi per periode? |
| Kegiatan komunitas/pemuda/perempuan | `desa/kegiatan-desa` (kategori Kepemudaan, PKK) | |
| Ruang partisipasi warga (musyawarah) | `inovasi/ajukan-ide-inovatif` (info musyawarah), berita acara musdes | |

### Aspek 8 — Aksesibilitas, Keamanan dan Kepatuhan (15%)

Dewan juri nasional melibatkan **BSSN**, jadi aspek ini akan diperiksa teknis.

| Indikator | Di project | Cara cek |
|---|---|---|
| HTTPS | Infra (Cloudflare) | Cek domain production |
| Bersih dari iklan/judi/spam | — | Cek halaman + `grep -rniE "slot\|gacor\|togel" src prisma/data` |
| Tim redaksi/pengelola + alamat fisik kantor | Footer / halaman tentang | `grep -rniE "redaksi\|pengelola website" src` |
| Tidak memajang NIK, HP pribadi, dokumen sensitif | API publik + halaman posyandu/kesehatan/migrasi/siswa | Lihat temuan T1, T2 |
| Software terbarui tanpa celah | `package.json` | `bun audit`, versi Next/Prisma/Better Auth |
| Akun admin & kesiapan (MFA, backup) | `src/lib/auth.ts` (Google OAuth only) | Ada plugin `twoFactor`? Ada prosedur backup DB + MinIO? |
| (tambahan) Header keamanan | `next.config.ts`, `src/proxy.ts` | `grep -nE "Strict-Transport\|Content-Security\|X-Frame" next.config.ts src/proxy.ts` |

---

## 5. Hasil Baseline — 6 Nov 2026 (v0.1.213)

| # | Aspek | Bobot | Fitur | Saat ini |
|---|---|---|---|---|
| 1 | Kualitas & Kelengkapan Informasi | 15% | 85 | 50 |
| 2 | Keterbukaan & Transparansi | 15% | 85 | 45 |
| 3 | Pelayanan Publik Digital | 15% | 55 | 45 |
| 4 | Aktualitas Konten | 10% | 85 | 35 |
| 5 | User Experience | 10% | 75 | 70 |
| 6 | Inovasi Digital | 10% | 70 | 65 |
| 7 | Partisipasi Masyarakat | 10% | 80 | 55 |
| 8 | Keamanan & Kepatuhan | 15% | 40 | 35 |
| | **Nilai akhir** | | **± 71 (Baik)** | **± 49 (Cukup)** |

Target setelah perbaikan prioritas (bagian 7): **± 85–88 (Sangat Baik)**.

Catatan: baseline dinilai secara holistik (sebelum panduan skor 0/50/100 ditulis).
Penilaian berikutnya sebaiknya memakai panduan skor indikator di bagian 4.

---

## 6. Daftar Temuan (cek ulang setiap penilaian)

Status: ❌ belum | 🟡 sebagian | ✅ beres

| ID | Aspek | Temuan | Lokasi | Status 6 Nov |
|---|---|---|---|---|
| T1 | 8 | **API GET publik membocorkan data pribadi.** Semua GET terbuka kecuali `/api/user`, `/api/role`, `/api/fileStorage`, `/api/imgs`. `GET /api/inovasi/layananonlinedesa/pengaduanmasyarakat/find-many` mengembalikan NIK, email, nomor HP pelapor. Model lain berisi NIK/HP dengan pola sama: `PermohonanInformasiPublik`, `AjukanPermohonan`, `BeasiswaPendaftar`, `IbuHamil`, `Balita` | `src/app/api/[[...slugs]]/route.ts:97-112`, `_lib/inovasi/layanan-online-desa/pengaduan-masyarakat/findMany.ts` | ❌ (temuan kode, belum diuji ke server) |
| T2 | 8 | Halaman publik menampilkan data per orang (nama balita/ibu hamil, kelahiran/kematian, migrasi, siswa/pengajar) | Lihat `docs/permintaan-data-desa.md` bagian 13 | ❌ menunggu keputusan desa |
| T3 | 8, 3 | Tidak ada tim redaksi/pengelola website, alamat fisik, telepon, email kantor desa | `src/app/darmasaba/_com/Footer.tsx` | ❌ |
| T4 | 8 | Tidak ada header keamanan (HSTS, CSP, X-Frame-Options, nosniff) | `next.config.ts:9` (hanya Cache-Control) | ❌ |
| T5 | 8 | MFA admin tidak dipaksa aplikasi (bergantung akun Google); tidak ada bukti prosedur backup | `src/lib/auth.ts:25` | ❌ |
| T6 | 3 | Pengaduan masyarakat & permohonan tidak punya status/tindak lanjut (hanya `LaporanPublik` punya `StatusLaporan` + penanganan) | `prisma/schema.prisma` model `PengaduanMasyarakat`, `AdministrasiOnline`, `AjukanPermohonan`, `PermohonanInformasiPublik` | ❌ |
| T7 | 3 | Tidak ada ikon/tautan integrasi instansi lain; "Portal Badung" malah mengarah ke berita internal | `Footer.tsx:51` | ❌ |
| T8 | 5 | Link footer "Informasi Publik" dan "Transparansi" ke route yang tidak ada (404): `/darmasaba/ppid/daftar-informasi-publik-desa-darmasaba` (route benar: `/darmasaba/ppid/daftar-informasi-publik`) | `Footer.tsx:45`, `Footer.tsx:60` | ❌ |
| T9 | 5 | Copyright masih "© 2025" | `Footer.tsx:236` | ❌ |
| T10 | 6 | Tidak ada fitur chat (footer hanya gambar `chatbot-removebg-preview.png`) | `Footer.tsx:161` | ❌ |
| T11 | 1 | Indeks Desa (IDM) belum ada | — | ❌ |
| T12 | 2 | Laporan kinerja + transparansi Dana Desa belum eksplisit | — | ❌ |
| T13 | 6 | Peta hanya embed Google Maps, belum ada peta batas wilayah / sebaran potensi | `desa/profil/ui/wilayahDesa.tsx:81` | 🟡 |
| T14 | 1 | Struktur perangkat baru memuat Kades, Sekdes, Kadus (Kaur/Kasi/BPD belum) | Data struktur PPID | 🟡 data |
| T15 | 1–7 | Seluruh konten masih data contoh; berita STG terakhir 14 Apr 2026, event 2025, realisasi APBDes 0%, DIP berisi data uji | `docs/permintaan-data-desa.md` | ❌ data |
| T16 | 2–7 | Hasil gap konten point 2–6 (RPJM/RKP, waktu & biaya, agenda, link toko, musyawarah) belum di stg | Branch `feature/gap-konten-point-2-6` | 🟡 |
| T17 | 5 | Kecepatan belum diukur | — | ❓ |
| T18 | Admin | Domain `desa.id` belum ada | `.env.example:20` | ❌ |
| T19 | 8 | **API mutasi tidak cek role admin.** Login Google terbuka → user baru role 5 USER; `requireAuth()` meloloskan role 5, jadi user biasa bisa POST/PUT/DELETE endpoint admin, termasuk update user dengan `roleId` (potensi naik jadi SUPER ADMIN). Ditemukan 6 Nov saat menyusun plan | `src/app/api/[[...slugs]]/route.ts:110-118`, `src/lib/api-auth.ts:51`, `_lib/user/updt.ts`, `src/lib/auth-policy.ts:15` | ❌ (temuan kode, belum dieksploitasi) |
| T20 | 8 | Pencarian global mencari permohonan informasi publik berdasarkan NIK, ikut mengembalikan siswa/pengajar/responden | `_lib/search/findMany.ts:231`, `:1700` | ❌ |
| T21 | 8 | Rute auth lama (OTP/register/login manual) masih ada padahal auth = Better Auth Google-only | `src/app/api/auth/*` | ❓ perlu audit |

Yang sudah baik saat baseline: navigasi + pencarian global, struktur header/body/footer,
responsif, multimedia lengkap (termasuk audio musik desa), grafik data, PPID lengkap,
link toko online + pesan WA, tidak ada iklan/spam, Next 16.4.5 terbaru, whitelist
form publik exact-match (`src/lib/auth-policy.ts`).

---

## 7. Prioritas Perbaikan (urut dampak)

Rencana eksekusi rinci: `MIND/PLAN/6-Nov/lomba-website-2027/00-plan.md`.

1. **Administratif:** domain `desa.id`, SK Tim Pengelola, ganti data contoh dengan data asli (T15, T18); sembunyikan menu yang belum punya data asli.
2. **Akses kontrol API + kebocoran data pribadi** (T19, T1, T2, T20) — bobot 15% + juri BSSN + risiko UU PDP.
3. **Footer:** kontak + alamat kantor + tim redaksi + ikon instansi + perbaiki link 404 + tahun (T3, T7, T8, T9).
4. **Status tindak lanjut** pengaduan & permohonan dengan nomor tiket + cek status (T6).
5. **Indeks Desa + transparansi Dana Desa** (T11, T12).
6. Fitur chat (minimal tombol WA mengambang), header keamanan, MFA admin, dokumentasi backup (T10, T4, T5).
7. Ukur dan perbaiki kecepatan (T17).

---

## 8. Riwayat Penilaian

Tambahkan satu baris setiap penilaian ulang.

| Tanggal | Versi | Fitur | Saat ini | Kategori (saat ini) | Temuan beres | Catatan |
|---|---|---|---|---|---|---|
| 2026-11-06 | 0.1.213 | 71 | 49 | Cukup | — | Baseline, review kode statis; kecepatan, tampilan browser, domain production belum dicek |
