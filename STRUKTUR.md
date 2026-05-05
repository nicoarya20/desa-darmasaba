# Dokumentasi Struktur Proyek Desa Darmasaba

## 1. Ringkasan Proyek

**Desa Darmasaba** adalah aplikasi web manajemen desa digital untuk Desa Darmasaba, Kabupaten Badung, Bali. Aplikasi ini berfungsi sebagai platform layanan publik digital yang mencakup informasi pemerintahan, layanan kesehatan, keamanan, pendidikan, ekonomi, lingkungan, dan inovasi desa.

### Tech Stack

| Kategori             | Teknologi                                  |
| -------------------- | ------------------------------------------ |
| **Framework**        | Next.js 15 (App Router)                    |
| **Language**         | TypeScript (strict mode)                   |
| **Runtime**          | Bun                                        |
| **Backend API**      | Elysia.js (high-performance HTTP server)   |
| **Database**         | PostgreSQL                                 |
| **ORM**              | Prisma 6.3.1                               |
| **UI Framework**     | Mantine UI v7-v8                           |
| **State Management** | Jotai + Valtio + SWR                       |
| **Authentication**   | iron-session + JWT (@elysiajs/jwt)         |
| **File Storage**     | Seafile (self-hosted)                      |
| **Text Editor**      | Tiptap (Rich text editor)                  |
| **Charts**           | Recharts + Chart.js                        |
| **Maps**             | Leaflet + react-leaflet                    |
| **Testing**          | Vitest (unit) + Playwright (E2E)           |
| **Styling**          | Mantine + PostCSS + Framer Motion          |
| **Deployment**       | Docker + GHCR + Portainer + GitHub Actions |
| **Version**          | 0.1.11                                     |

---

## 2. Struktur Direktori

```
desa-darmasaba/
├── .github/workflows/          # GitHub Actions CI/CD
│   ├── docker-publish.yml     # Auto build & push saat tag v*
│   ├── publish.yml            # Manual build & push ke GHCR
│   ├── re-pull.yml            # Manual re-pull di Portainer
│   └── script/                # Shell scripts untuk deploy
├── prisma/
│   ├── schema.prisma          # Database schema (2413 baris, 100+ model)
│   └── seed.ts                # Database seeder (400+ baris)
│       └── _seeder_list/      # Seed data per modul
├── public/                     # Static assets
│   └── assets/
│       └── images/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── _com/              # Global components (SplashScreen, WebVitals)
│   │   ├── admin/             # ADMIN DASHBOARD
│   │   │   ├── (dashboard)/   # Route group dashboard
│   │   │   │   ├── desa/      #   - Berita, Gallery, Layanan, dll
│   │   │   │   ├── ppid/      #   - Informasi publik, struktur, dasar hukum
│   │   │   │   ├── kesehatan/ #   - Fasilitas, posyandu, puskesmas, wabah
│   │   │   │   ├── ekonomi/   #   - APBDes, pasar desa, BUMDes, dll
│   │   │   │   ├── kependudukan/ # - Banjar, agama, umur, migrasi
│   │   │   │   ├── pendidikan/ # - Sekolah, beasiswa, perpustakaan
│   │   │   │   ├── keamanan/  #   - Keamanan lingkungan, polsek, dll
│   │   │   │   ├── lingkungan/ # - Sampah, penghijauan, gotong royong
│   │   │   │   ├── inovasi/   #   - Desa digital, kolaborasi, dll
│   │   │   │   ├── landing-page/ # - Profil, prestasi, anti-korupsi
│   │   │   │   ├── musik/     #   - Musik desa
│   │   │   │   ├── user&role/ #   - Manajemen user & role
│   │   │   │   └── _com/      #   - Shared admin components
│   │   │   ├── auth/          # Login OTP untuk admin
│   │   │   ├── csv/           # Demo CSV upload
│   │   │   └── layout.tsx     # Admin shell (AppShell Mantine)
│   │   ├── api/                # ELYSIA.JS API SERVER
│   │   │   ├── [[...slugs]]/  # Catch-all route -> Elysia handler
│   │   │   │   ├── route.ts   #   - Main Elysia server export
│   │   │   │   └── _lib/      #   - Domain route modules
│   │   │   │       ├── desa.ts
│   │   │   │       ├── ppid.ts
│   │   │   │       ├── kesehatan.ts
│   │   │   │       ├── ekonomi.ts
│   │   │   │       ├── keamanan.ts
│   │   │   │       ├── inovasi.ts
│   │   │   │       ├── lingkungan.ts
│   │   │   │       ├── pendidikan.ts
│   │   │   │       ├── kependudukan.ts
│   │   │   │       ├── landing_page.ts
│   │   │   │       ├── user/  #   - User & Role management
│   │   │   │       ├── fileStorage/
│   │   │   │       ├── search/
│   │   │   │       ├── auth/
│   │   │   │       ├── upl-img.ts, upl-img-single.ts
│   │   │   │       ├── upl-csv.ts, upl-csv-single.ts
│   │   │   │       └── img.ts, img-del.ts, imgs.ts
│   │   │   ├── auth/          # Auth endpoints (login, logout, me)
│   │   │   └── ...            # Other API routes
│   │   ├── darmasaba/         # PUBLIC-FACING WEBSITE
│   │   │   ├── _com/          # Shared components (Navbar, Footer, etc)
│   │   │   ├── (pages)/       # Public pages route group
│   │   │   │   ├── desa/      #   - Profil, berita, gallery, layanan
│   │   │   │   ├── ppid/      #   - PPID public pages
│   │   │   │   ├── kesehatan/ #   - Health info pages
│   │   │   │   ├── ekonomi/   #   - Economy pages
│   │   │   │   ├── kependudukan/
│   │   │   │   ├── pendidikan/
│   │   │   │   ├── keamanan/
│   │   │   │   ├── lingkungan/
│   │   │   │   ├── inovasi/
│   │   │   │   ├── musik/
│   │   │   │   └── module/    #   - External module links
│   │   │   └── (tambahan)/    # Additional pages
│   │   ├── login/             # Login page
│   │   ├── registrasi/        # Registration page
│   │   ├── waiting-room/      # Waiting room (inactive users)
│   │   ├── terms-of-service/
│   │   ├── layout.tsx         # Root layout (MantineProvider, ViewTransitions)
│   │   └── page.tsx           # Homepage redirect
│   ├── components/
│   │   └── admin/             # Admin shared components
│   │       ├── AdminThemeProvider.tsx
│   │       ├── DarkModeToggle.tsx
│   │       ├── UnifiedSurface.tsx
│   │       └── UnifiedTypography.tsx
│   ├── con/                   # Constants & configuration
│   │   ├── colors.ts          # Color palette definitions
│   │   ├── images.ts
│   │   ├── navbar-list-menu.ts
│   │   ├── router.ts          # Route mapping
│   │   └── sosmed.ts
│   ├── context/               # React contexts
│   │   └── MusicContext.tsx   # Music player context
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility libraries
│   │   ├── router/
│   │   ├── api-auth.ts        # API authentication helpers
│   │   ├── api-fetch.ts       # API fetch wrapper
│   │   ├── EnvStringParse.ts
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── seafile-auth-service.ts
│   │   └── session.ts         # iron-session helper
│   ├── state/                 # Global state (Jotai/Valtio)
│   │   ├── darkModeStore.ts
│   │   ├── state-layanan.ts
│   │   ├── state-list-image.ts
│   │   └── state-nav.ts
│   ├── store/                 # Additional stores
│   │   └── authStore.ts       # Auth state (Jotai)
│   ├── types/                 # TypeScript type definitions
│   └── utils/                 # Utility functions
│       └── themeTokens.ts     # Dark/light theme tokens
├── uploads/                   # Local upload directory (images/files)
├── Dockerfile                 # Multi-stage Docker build (Bun)
├── docker-entrypoint.sh       # Entry script (migrate + start)
├── next.config.ts             # Next.js configuration
├── package.json               # Dependencies & scripts
├── tsconfig.json              # TypeScript configuration
├── biome.json                 # Biome linter config
├── eslint.config.mjs          # ESLint config
├── NOTE.md                    # Deployment notes
├── QWEN.md                    # Project memory & workflow
└── AGENTS.md                  # Agent coding guidelines
```

---

## 3. Arsitektur

### Pola Arsitektur: Full-Stack Monolith dengan App Router

```
Browser
  |
  +-- Next.js 15 (App Router) -- Server Components + Client Components
        |
        +-- /darmasaba/*         -> Public pages (SSR/CSR)
        +-- /admin/*             -> Admin dashboard (protected)
        +-- /api/*               -> Elysia.js API server
              |
              +-- Elysia Server (src/app/api/[[...slugs]]/route.ts)
                    |
                    +-- CORS enabled
                    +-- Swagger docs di /api/docs
                    +-- Static file serving (/api/uploads)
                    +-- Domain modules: Desa, PPID, Kesehatan, Ekonomi, dll
                    +-- Image upload handlers
                    |
                    +-- Prisma ORM --> PostgreSQL
                    +-- Seafile API  --> File Storage
```

### Key Architectural Decisions:

1. **Next.js 15 App Router**: Menggunakan React Server Components sebagai default, dengan `"use client"` untuk interaktivitas
2. **Elysia.js di dalam API Routes**: Catch-all route `[[...slugs]]` meneruskan semua request ke Elysia handler
3. **Route Groups**: `(dashboard)` dan `(pages)` untuk organisasi tanpa mempengaruhi URL path
4. **Multi-tenant Ready**: Role-based access control dengan dynamic navbar berdasarkan roleId
5. **File Uploads**: Local uploads + Seafile integration untuk distributed storage

---

## 4. Modul Domain

### A. PPID (Pejabat Pengelola Informasi dan Dokumentasi)

**Lokasi**: `src/app/admin/(dashboard)/ppid/` dan `src/app/darmasaba/(pages)/ppid/`

| Sub-modul                   | Deskripsi                                      |
| --------------------------- | ---------------------------------------------- |
| Profil PPID                 | Profil pejabat pengelola informasi             |
| Struktur PPID               | Struktur organisasi PPID dengan hierarki       |
| Visi & Misi PPID            | Visi dan misi PPID desa                        |
| Daftar Informasi Publik     | Katalog informasi publik yang tersedia         |
| Dasar Hukum                 | Regulasi dan dasar hukum PPID                  |
| Permohonan Informasi Publik | Form permohonan informasi (NIK, kontak, jenis) |
| Permohonan Keberatan        | Formulir keberatan informasi                   |
| Indeks Kepuasan Masyarakat  | Survey kepuasan dengan grafik demografis       |

### B. Desa (Landing Page & Umum)

**Lokasi**: `src/app/admin/(dashboard)/desa/` dan `src/app/darmasaba/(pages)/desa/`

| Sub-modul                  | Deskripsi                                      |
| -------------------------- | ---------------------------------------------- |
| Profil Desa                | Sejarah, visi-misi, lambang, maskot            |
| Profil Perbekel            | Biodata, pengalaman, program unggulan perbekel |
| Perbekel dari Masa ke Masa | Historis perbekel per periode                  |
| Berita                     | Artikel berita dengan kategori & multi-image   |
| Gallery                    | Foto dan video galeri                          |
| Pengumuman                 | Pengumuman desa dengan kategori                |
| Potensi Desa               | Potensi desa dengan kategori                   |
| Layanan Desa               | Surat keterangan, ajukan permohonan            |
| Penghargaan                | Prestasi dan penghargaan desa                  |
| Desa Anti Korupsi          | Transparansi anti-korupsi                      |
| SDGs Desa                  | Sustainable Development Goals desa             |
| APBDes                     | Anggaran desa dengan hierarki item & realisasi |
| Prestasi Desa              | Katalog prestasi                               |

### C. Kesehatan

**Lokasi**: `src/app/admin/(dashboard)/kesehatan/` dan `src/app/darmasaba/(pages)/kesehatan/`

| Sub-modul            | Deskripsi                                      |
| -------------------- | ---------------------------------------------- |
| Fasilitas Kesehatan  | Info rumah sakit/klinik (jam, dokter, tarif)   |
| Puskesmas            | Data puskesmas dengan jam operasional & kontak |
| Posyandu             | Jadwal dan informasi posyandu                  |
| Program Kesehatan    | Program-program kesehatan desa                 |
| Penanganan Darurat   | Prosedur penanganan darurat                    |
| Kontak Darurat       | Kontak emergency dengan WhatsApp               |
| Info Wabah Penyakit  | Informasi wabah penyakit                       |
| Artikel Kesehatan    | Artikel kesehatan lengkap                      |
| Data Kesehatan Warga | Statistik kesehatan warga                      |
| Kelahiran & Kematian | Data vital statistik                           |
| Grafik Kepuasan      | Grafik kepuasan layanan kesehatan              |

### D. Ekonomi

**Lokasi**: `src/app/admin/(dashboard)/ekonomi/` dan `src/app/darmasaba/(pages)/ekonomi/`

| Sub-modul                      | Deskripsi                                  |
| ------------------------------ | ------------------------------------------ |
| Pasar Desa                     | Katalog pasar desa dengan produk & rating  |
| Struktur BUMDes                | Organisasi BUMDes dengan pengurus          |
| APBDes (PADesa)                | Pendapatan Asli Desa                       |
| Program Kemiskinan             | Program dan statistik kemiskinan           |
| Sektor Unggulan                | Sektor ekonomi unggulan desa               |
| Lowongan Kerja Lokal           | Info lowongan pekerjaan                    |
| Demografi Pekerjaan            | Distribusi pekerjaan penduduk              |
| Jumlah Pengangguran            | Statistik pengangguran                     |
| Penduduk Usia Kerja Menganggur | Analisis pengangguran by usia & pendidikan |
| Jumlah Penduduk Miskin         | Tren kemiskinan tahunan                    |

### E. Kependudukan

**Lokasi**: `src/app/admin/(dashboard)/kependudukan/` dan `src/app/darmasaba/(pages)/kependudukan/`

| Sub-modul         | Deskripsi                              |
| ----------------- | -------------------------------------- |
| Data Banjar       | Data penduduk per banjar               |
| Distribusi Agama  | Statistik agama penduduk               |
| Distribusi Umur   | Piramida umur penduduk                 |
| Migrasi Penduduk  | Data migrasi masuk/keluar              |
| Dinamika Penduduk | Kelahiran, kematian, migrasi per tahun |

### F. Pendidikan

**Lokasi**: `src/app/admin/(dashboard)/pendidikan/` dan `src/app/darmasaba/(pages)/pendidikan/`

| Sub-modul               | Deskripsi                                   |
| ----------------------- | ------------------------------------------- |
| Info Sekolah & PAUD     | Data sekolah per jenjang (TK, SD, SMP, SMA) |
| Beasiswa Desa           | Program beasiswa & pendaftar                |
| Program Pendidikan Anak | Program pendidikan anak                     |
| Bimbingan Belajar       | Informasi bimbingan belajar                 |
| Pendidikan Non Formal   | Tempat & program non-formal                 |
| Perpustakaan Digital    | Katalog buku & peminjaman                   |
| Data Pendidikan         | Statistik pendidikan                        |

### G. Keamanan

**Lokasi**: `src/app/admin/(dashboard)/keamanan/` dan `src/app/darmasaba/(pages)/keamanan/`

| Sub-modul                             | Deskripsi                                 |
| ------------------------------------- | ----------------------------------------- |
| Keamanan Lingkungan (Pecalang/Patwal) | Sistem keamanan tradisional Bali          |
| Polsek Terdekat                       | Data polsek dengan layanan & map          |
| Kontak Darurat                        | Kontak darurat keamanan                   |
| Pencegahan Kriminalitas               | Info pencegahan kriminal                  |
| Laporan Publik                        | Laporan masyarakat dengan tracking status |
| Tips Keamanan                         | Tips dan panduan keamanan                 |

### H. Lingkungan

**Lokasi**: `src/app/admin/(dashboard)/lingkungan/` dan `src/app/darmasaba/(pages)/lingkungan/`

| Sub-modul            | Deskripsi                         |
| -------------------- | --------------------------------- |
| Pengelolaan Sampah   | Bank sampah & pengelolaan         |
| Program Penghijauan  | Program penghijauan desa          |
| Data Lingkungan      | Data lingkungan desa              |
| Gotong Royong        | Kegiatan gotong royong            |
| Edukasi Lingkungan   | Edukasi lingkungan hidup          |
| Konservasi Adat Bali | Tri Hita Karana & konservasi adat |

### I. Inovasi

**Lokasi**: `src/app/admin/(dashboard)/inovasi/` dan `src/app/darmasaba/(pages)/inovasi/`

| Sub-modul                    | Deskripsi                     |
| ---------------------------- | ----------------------------- |
| Desa Digital (Smart Village) | Transformasi digital desa     |
| Program Kreatif Desa         | Program kreatif & inovatif    |
| Kolaborasi Inovasi           | Kolaborasi dengan mitra       |
| Info Teknologi Tepat Guna    | Info teknologi untuk desa     |
| Ajukan Ide Inovatif          | Form pengajuan ide dari warga |
| Layanan Online Desa          | Layanan administrasi online   |

### J. Musik Desa

**Lokasi**: `src/app/admin/(dashboard)/musik/` dan `src/app/darmasaba/(pages)/musik/`

Model `MusikDesa` dengan audio file, cover image, genre, dan durasi. Dilengkapi dengan `FixedPlayerBar` di layout publik.

### K. User & Role (Admin)

**Lokasi**: `src/app/admin/(dashboard)/user&role/`

- **Role-based Access Control**: Role dengan permission JSON
- **User Session Management**: Multiple sessions per user dengan JWT
- **OTP Authentication**: Login dengan nomor telepon + OTP
- **Menu Access Control**: Dynamic navbar berdasarkan menu akses user

---

## 5. Database Schema (Prisma)

Schema terdiri dari **2413 baris** dengan **100+ model** dan **berbagai enum**. Berikut model-model utama:

### Core Models

| Model                                              | Keterangan                                      |
| -------------------------------------------------- | ----------------------------------------------- |
| `FileStorage`                                      | Central file storage untuk semua uploaded files |
| `AppMenu` / `AppMenuChild`                         | Menu navigasi aplikasi                          |
| `User` / `Role` / `UserSession` / `UserMenuAccess` | Sistem autentikasi & otorisasi                  |
| `KodeOtp`                                          | OTP codes untuk login                           |

### Landing Page & Desa

| Model                                         | Keterangan                                     |
| --------------------------------------------- | ---------------------------------------------- |
| `PejabatDesa`                                 | Pejabat desa dengan foto                       |
| `ProfilPerbekel`                              | Profil perbekel (biodata, pengalaman, program) |
| `PerbekelDariMasaKeMasa`                      | Historis perbekel                              |
| `Berita` / `KategoriBerita`                   | Berita desa                                    |
| `PotensiDesa` / `KategoriPotensi`             | Potensi desa                                   |
| `Pengumuman` / `CategoryPengumuman`           | Pengumuman                                     |
| `GalleryFoto` / `GalleryVideo`                | Gallery media                                  |
| `Penghargaan`                                 | Penghargaan desa                               |
| `APBDes` / `APBDesItem` / `RealisasiItem`     | Anggaran dengan realisasi                      |
| `DesaAntiKorupsi` / `KategoriDesaAntiKorupsi` | Transparansi                                   |
| `SdgsDesa`                                    | SDGs desa                                      |
| `PrestasiDesa` / `KategoriPrestasiDesa`       | Prestasi                                       |
| `MusikDesa`                                   | Musik desa                                     |

### PPID

| Model                                                   | Keterangan                 |
| ------------------------------------------------------- | -------------------------- |
| `StrukturPPID` / `PosisiOrganisasiPPID` / `PegawaiPPID` | Struktur organisasi        |
| `VisiMisiPPID`                                          | Visi misi                  |
| `ProfilePPID`                                           | Profil pejabat             |
| `DasarHukumPPID`                                        | Regulasi                   |
| `DaftarInformasiPublik`                                 | Katalog informasi          |
| `PermohonanInformasiPublik`                             | Permohonan + lookup tables |
| `FormulirPermohonanKeberatan`                           | Keberatan                  |
| `IndeksKepuasanMasyarakat` + grafik breakdown           | Survey kepuasan            |

### Kesehatan

| Model                                               | Keterangan                                     |
| --------------------------------------------------- | ---------------------------------------------- |
| `FasilitasKesehatan`                                | Fasilitas lengkap (dokter, tarif, prosedur)    |
| `Puskesmas` / `JamOperasional` / `KontakPuskesmas`  | Puskesmas                                      |
| `Posyandu`                                          | Pos pelayanan terpadu                          |
| `ProgramKesehatan`                                  | Program kesehatan                              |
| `ArtikelKesehatan`                                  | Artikel lengkap (gejala, pencegahan, P3K, dll) |
| `PenangananDarurat` / `KontakDarurat`               | Darurat                                        |
| `InfoWabahPenyakit`                                 | Wabah                                          |
| `DataKematian_Kelahiran` / `Kelahiran` / `Kematian` | Vital statistik                                |
| `GrafikKepuasan`                                    | Kepuasan                                       |

### Ekonomi

| Model                                                         | Keterangan          |
| ------------------------------------------------------------- | ------------------- |
| `PasarDesa` / `KategoriProduk` / `KategoriToPasar`            | Pasar desa          |
| `StrukturBumDes` / `PosisiOrganisasiBumDes` / `PegawaiBumDes` | BUMDes              |
| `ProgramKemiskinan` / `StatistikKemiskinan`                   | Kemiskinan          |
| `SektorUnggulanDesa`                                          | Sektor unggulan     |
| `LowonganPekerjaan`                                           | Lowongan            |
| `DataDemografiPekerjaan`                                      | Demografi pekerjaan |
| `DetailDataPengangguran`                                      | Pengangguran        |
| `GrafikJumlahPendudukMiskin`                                  | Tren kemiskinan     |

### Kependudukan

| Model              | Keterangan             |
| ------------------ | ---------------------- |
| `DataBanjar`       | Data per banjar        |
| `DistribusiAgama`  | Distribusi agama       |
| `DistribusiUmur`   | Distribusi umur        |
| `MigrasiPenduduk`  | Migrasi (MASUK/KELUAR) |
| `DinamikaPenduduk` | Dinamika tahunan       |

### Pendidikan

| Model                                                  | Keterangan                     |
| ------------------------------------------------------ | ------------------------------ |
| `JenjangPendidikan` / `Lembaga` / `Siswa` / `Pengajar` | Data sekolah                   |
| `BeasiswaPendaftar`                                    | Beasiswa (dengan enum lengkap) |
| `DataPerpustakaan` / `KategoriBuku` / `PeminjamanBuku` | Perpustakaan                   |
| `DataPendidikan`                                       | Statistik                      |

### Keamanan

| Model                                                            | Keterangan          |
| ---------------------------------------------------------------- | ------------------- |
| `KeamananLingkungan`                                             | Keamanan lingkungan |
| `PolsekTerdekat` / `LayananPolsek` / `LayananToPolsek`           | Polsek              |
| `KontakDaruratKeamanan` / `KontakItem`                           | Kontak darurat      |
| `PencegahanKriminalitas`                                         | Pencegahan          |
| `LaporanPublik` / `PenangananLaporanPublik` (enum StatusLaporan) | Laporan             |
| `Pelapor`                                                        | Pelapor             |
| `MenuTipsKeamanan`                                               | Tips                |

### Lingkungan

| Model                                                 | Keterangan         |
| ----------------------------------------------------- | ------------------ |
| `PengelolaanSampah`                                   | Pengelolaan sampah |
| `KeteranganBankSampahTerdekat`                        | Bank sampah        |
| `ProgramPenghijauan`                                  | Penghijauan        |
| `DataLingkunganDesa`                                  | Data lingkungan    |
| `KegiatanDesa` / `KategoriKegiatan`                   | Gotong royong      |
| `FilosofiTriHita` / `BentukKonservasiBerdasarkanAdat` | Konservasi Bali    |

### Inovasi

| Model                                    | Keterangan           |
| ---------------------------------------- | -------------------- |
| `DesaDigital`                            | Smart village        |
| `ProgramKreatif`                         | Program kreatif      |
| `KolaborasiInovasi` / `MitraKolaborasi`  | Kolaborasi           |
| `InfoTekno`                              | Teknologi tepat guna |
| `AjukanIdeInovatif`                      | Ide dari warga       |
| `AdministrasiOnline` / `JenisLayanan`    | Layanan online       |
| `PengaduanMasyarakat` / `JenisPengaduan` | Pengaduan            |

---

## 6. API Routes

Semua API ditangani oleh **Elysia.js** di `src/app/api/[[...slugs]]/route.ts`:

| Endpoint Group   | Prefix               | Deskripsi                                      |
| ---------------- | -------------------- | ---------------------------------------------- |
| **File Storage** | `/api/file-storage`  | CRUD file storage                              |
| **Landing Page** | `/api/landing-page`  | Profil, prestasi, anti-korupsi, SDGs, APBDes   |
| **Desa**         | `/api/desa`          | Berita, gallery, potensi, pengumuman, layanan  |
| **PPID**         | `/api/ppid`          | Semua endpoint PPID                            |
| **Kesehatan**    | `/api/kesehatan`     | Fasilitas, puskesmas, posyandu, artikel, wabah |
| **Ekonomi**      | `/api/ekonomi`       | Pasar desa, BUMDes, APBDes, pengangguran       |
| **Keamanan**     | `/api/keamanan`      | Keamanan, polsek, laporan, kriminalitas        |
| **Lingkungan**   | `/api/lingkungan`    | Sampah, penghijauan, gotong royong             |
| **Pendidikan**   | `/api/pendidikan`    | Sekolah, beasiswa, perpustakaan                |
| **Kependudukan** | `/api/kependudukan`  | Banjar, agama, umur, migrasi                   |
| **Inovasi**      | `/api/inovasi`       | Desa digital, kolaborasi, pengaduan            |
| **User**         | `/api/admin/user`    | CRUD user                                      |
| **Role**         | `/api/admin/role`    | CRUD role                                      |
| **Search**       | `/api/search`        | Global search                                  |
| **Utils**        | `/api/utils/version` | Version info                                   |

### Utility Endpoints

| Endpoint              | Method | Deskripsi                     |
| --------------------- | ------ | ----------------------------- |
| `/api/img/:name`      | GET    | Serve image dengan resize     |
| `/api/img/:name`      | DELETE | Delete image                  |
| `/api/imgs`           | GET    | List images dengan pagination |
| `/api/upl-img`        | POST   | Upload multiple images        |
| `/api/upl-img-single` | POST   | Upload single image           |
| `/api/upl-csv`        | POST   | Upload CSV multiple           |
| `/api/upl-csv-single` | POST   | Upload single CSV             |

### Auth Endpoints

| Endpoint           | Method | Deskripsi        |
| ------------------ | ------ | ---------------- |
| `/api/auth/login`  | POST   | Login dengan OTP |
| `/api/auth/logout` | POST   | Logout           |
| `/api/auth/me`     | GET    | Get current user |

**Swagger Documentation**: Tersedia di `/api/docs`

---

## 7. Halaman Admin

Admin dashboard menggunakan **Mantine AppShell** dengan sidebar navigasi dinamis berbasis role.

### Route Group: `/admin`

| Section          | Path                   | Deskripsi                                                          |
| ---------------- | ---------------------- | ------------------------------------------------------------------ |
| **Landing Page** | `/admin/landing-page/` | Profil desa, prestasi, anti-korupsi, SDGs, media sosial            |
| **Desa**         | `/admin/desa/`         | Berita, gallery, layanan, penghargaan, pengumuman, potensi, profil |
| **PPID**         | `/admin/ppid/`         | 8 sub-modul PPID lengkap                                           |
| **Kesehatan**    | `/admin/kesehatan/`    | 8 sub-modul kesehatan                                              |
| **Ekonomi**      | `/admin/ekonomi/`      | 10 sub-modul ekonomi                                               |
| **Kependudukan** | `/admin/kependudukan/` | 4 sub-modul kependudukan                                           |
| **Pendidikan**   | `/admin/pendidikan/`   | 7 sub-modul pendidikan                                             |
| **Keamanan**     | `/admin/keamanan/`     | 6 sub-modul keamanan                                               |
| **Lingkungan**   | `/admin/lingkungan/`   | 6 sub-modul lingkungan                                             |
| **Inovasi**      | `/admin/inovasi/`      | 6 sub-modul inovasi                                                |
| **Musik**        | `/admin/musik/`        | Manajemen musik desa                                               |
| **User & Role**  | `/admin/user&role/`    | Manajemen user, role, menu access                                  |

### Fitur Admin:

- **Role-based Dynamic Navbar**: Navbar berubah berdasarkan roleId user
- **Dark Mode Toggle**: Tema gelap/terang
- **OTP Login**: Login dengan nomor telepon + kode OTP
- **Session Management**: Multiple sessions per user dengan JWT tokens
- **CSV Upload**: Import data via CSV
- **Image Upload**: Upload dengan preview dan management
- **Rich Text Editor**: Tiptap untuk konten HTML

### Role-Based Redirect:

| roleId  | Role                     | Default Redirect                                    |
| ------- | ------------------------ | --------------------------------------------------- |
| 0, 1, 2 | Super Admin / Admin Desa | `/admin/landing-page/profil/program-inovasi`        |
| 3       | Admin Kesehatan          | `/admin/kesehatan/posyandu/list-posyandu`           |
| 4       | Admin Pendidikan         | `/admin/pendidikan/info-sekolah/jenjang-pendidikan` |

---

## 8. Halaman Publik

Public website di `/darmasaba/` dengan layout yang mencakup **Navbar**, **Footer**, dan **Fixed Music Player Bar**.

### Route Group: `/darmasaba`

| Section          | Path                      | Deskripsi                                                         |
| ---------------- | ------------------------- | ----------------------------------------------------------------- |
| **Home**         | `/darmasaba`              | Landing page utama                                                |
| **Desa**         | `/darmasaba/desa`         | Profil, berita, gallery, layanan, pengumuman, potensi             |
| **PPID**         | `/darmasaba/ppid`         | 7 sub-halaman PPID publik                                         |
| **Kesehatan**    | `/darmasaba/kesehatan`    | Info kesehatan publik                                             |
| **Ekonomi**      | `/darmasaba/ekonomi`      | Info ekonomi desa                                                 |
| **Kependudukan** | `/darmasaba/kependudukan` | Data kependudukan                                                 |
| **Pendidikan**   | `/darmasaba/pendidikan`   | Info pendidikan                                                   |
| **Keamanan**     | `/darmasaba/keamanan`     | Info keamanan                                                     |
| **Lingkungan**   | `/darmasaba/lingkungan`   | Info lingkungan                                                   |
| **Inovasi**      | `/darmasaba/inovasi`      | Info inovasi                                                      |
| **Musik**        | `/darmasaba/musik`        | Musik desa                                                        |
| **Module**       | `/darmasaba/module/*`     | Link ke modul eksternal (DAVES, MANGAN, Bicara-Darma, BARES, dll) |

### Fitur Publik:

- **Fixed Music Player Bar**: Player musik yang selalu tampil di bottom
- **Global Search**: Pencarian global
- **News Reader**: Notifikasi berita modern
- **View Transitions**: Smooth page transitions
- **Responsive Design**: Mobile-first dengan Mantine breakpoints

---

## 9. Komponen Utama

### Admin Components (`src/components/admin/`)

| Komponen                 | Deskripsi                         |
| ------------------------ | --------------------------------- |
| `AdminThemeProvider.tsx` | Theme provider untuk admin        |
| `DarkModeToggle.tsx`     | Toggle dark/light mode            |
| `UnifiedSurface.tsx`     | Consistent surface/card component |
| `UnifiedTypography.tsx`  | Consistent typography system      |

### Public Shared Components (`src/app/darmasaba/_com/`)

| Komponen                     | Deskripsi                        |
| ---------------------------- | -------------------------------- |
| `Navbar.tsx`                 | Main navigation bar              |
| `NavbarMainMenu.tsx`         | Main menu dengan kategori        |
| `NavbarSubMenu.tsx`          | Submenu dropdown                 |
| `Footer.tsx`                 | Footer dengan info desa          |
| `FixedPlayerBar.tsx`         | Music player bar fixed di bottom |
| `LoadDataFirstClient.tsx`    | Client-side data preloader       |
| `globalSearch.tsx`           | Global search component          |
| `NewsReader.tsx`             | News notification reader         |
| `ModernNewsNotification.tsx` | News toast notifications         |

### Global Components (`src/app/_com/`)

| Komponen          | Deskripsi             |
| ----------------- | --------------------- |
| `SpashScreen.tsx` | Splash screen on load |
| `WebVitals.tsx`   | Web Vitals monitoring |

---

## 10. State Management

Proyek menggunakan **multi-layer state management**:

| Library            | Penggunaan                                | Lokasi                             |
| ------------------ | ----------------------------------------- | ---------------------------------- |
| **Jotai**          | Auth state (`authStore`)                  | `src/store/authStore.ts`           |
| **Valtio**         | Dark mode, layanan, image list, nav state | `src/state/*.ts`                   |
| **SWR**            | Server state fetching & caching           | Digunakan di components            |
| **React Context**  | Music player context                      | `src/app/context/MusicContext.tsx` |
| **React useState** | Local component state                     | Di components                      |

### State Files:

```
src/state/
  darkModeStore.ts     -- Valtio proxy untuk dark mode
  state-layanan.ts     -- State layanan desa
  state-list-image.ts  -- State list image untuk upload
  state-nav.ts         -- State navigasi

src/store/
  authStore.ts         -- Jotai atom untuk auth user state
```

---

## 11. Autentikasi

Sistem autentikasi menggunakan **OTP (One-Time Password)** via WhatsApp/Telepon dengan **iron-session** untuk session management.

### Flow Autentikasi:

1. User memasukkan **nomor telepon** di `/login`
2. Sistem mengirim **kode OTP** via WhatsApp Server
3. OTP disimpan di model `KodeOtp`
4. User memasukkan kode OTP
5. Jika valid, session dibuat dengan **iron-session** + **JWT token**
6. Session disimpan di `UserSession` model dengan expiry

### Session Structure:

```typescript
// src/lib/session.ts
type SessionData = {
  user?: {
    id: string;
    name: string;
    roleId: number;
    menuIds?: string[] | null;
    isActive?: boolean;
  };
};
```

### Role-Based Access:

| roleId  | Role                     | Default Redirect                                    |
| ------- | ------------------------ | --------------------------------------------------- |
| 0, 1, 2 | Super Admin / Admin Desa | `/admin/landing-page/profil/program-inovasi`        |
| 3       | Admin Kesehatan          | `/admin/kesehatan/posyandu/list-posyandu`           |
| 4       | Admin Pendidikan         | `/admin/pendidikan/info-sekolah/jenjang-pendidikan` |

### Authorization:

- **UserMenuAccess**: Mapping user ke menu yang boleh diakses
- **Dynamic Navbar**: Navbar dirender berdasarkan `menuIds` user
- **Inactive Users**: Dialihkan ke `/waiting-room`

---

## 12. Deployment

### Docker Setup

**Dockerfile** menggunakan **multi-stage build** dengan base image `oven/bun:1-debian`:

```
Stage 1: Builder
  - Install dependencies (bun install --frozen-lockfile)
  - Generate Prisma client
  - Build Next.js (bun run build)

Stage 2: Runner
  - Copy .next, node_modules, public, prisma, src/lib, tsconfig.json
  - Non-root user (nextjs:nodejs)
  - Volume /app/uploads untuk file uploads
  - Port 3000
```

### Entry Point (`docker-entrypoint.sh`):

```bash
bunx prisma migrate deploy   # Run migrations
exec bun start               # Start Next.js production server
```

### CI/CD dengan GitHub Actions

Terdapat **3 workflow**:

| Workflow             | Trigger                    | Fungsi                                                             |
| -------------------- | -------------------------- | ------------------------------------------------------------------ |
| `docker-publish.yml` | Push tag `v*`              | Auto build & push ke GHCR                                          |
| `publish.yml`        | Manual (workflow_dispatch) | Build & push ke GHCR dengan input `stack_env` + `tag`              |
| `re-pull.yml`        | Manual (workflow_dispatch) | Re-pull image di Portainer dengan input `stack_name` + `stack_env` |

### Deployment Workflow (Sequential):

```
1. Update version di package.json (semver)
2. Commit perubahan
3. Push ke branch target (stg/prod)
4. Trigger publish.yml:
   gh workflow run publish.yml --ref main -f stack_env=stg -f tag=<version>
5. Tunggu sampai publish selesai (status: completed)
6. Trigger re-pull.yml:
   gh workflow run re-pull.yml --ref main -f stack_name=desa-darmasaba -f stack_env=stg
7. Verifikasi di Portainer
```

**PENTING**: `publish.yml` dan `re-pull.yml` TIDAK boleh dijalankan bersamaan (race condition).

### Environments:

- **dev**: Development
- **stg**: Staging (`desa-darmasaba-stg.wibudev.com`)
- **prod**: Production

### Notification:

- Telegram notification via `notify.sh` script setelah setiap workflow

---

## 13. Scripts

| Script            | Command                                | Deskripsi                        |
| ----------------- | -------------------------------------- | -------------------------------- |
| `dev`             | `next dev`                             | Development server               |
| `build`           | `next build`                           | Production build                 |
| `start`           | `next start`                           | Production server                |
| `test:api`        | `vitest run`                           | Run API unit tests               |
| `test:e2e`        | `playwright test`                      | Run E2E tests                    |
| `test`            | `bun run test:api && bun run test:e2e` | Run all tests                    |
| `seed`            | `bun run prisma/seed.ts`               | Seed database                    |
| `prisma:generate` | `bunx prisma generate`                 | Generate Prisma client           |
| `prisma:push`     | `bunx prisma db push`                  | Push schema to database          |
| `prisma:studio`   | `bunx prisma studio`                   | Open Prisma Studio GUI           |
| `gen:api`         | _(empty)_                              | Generate API types (placeholder) |

### Prisma Seed Configuration:

```json
// package.json
{
  "prisma": {
    "seed": "bun run prisma/seed.ts"
  }
}
```

---

## 14. Environment Variables

File: `.env.example`

| Variable                     | Deskripsi                            | Contoh                                                 |
| ---------------------------- | ------------------------------------ | ------------------------------------------------------ |
| `DATABASE_URL`               | PostgreSQL connection string         | `postgresql://user:pass@localhost:5432/desa-darmasaba` |
| `SEAFILE_TOKEN`              | Seafile API token                    | `your_seafile_token`                                   |
| `SEAFILE_REPO_ID`            | Seafile repository ID                | `your_repo_id`                                         |
| `SEAFILE_URL`                | Seafile instance URL                 | `https://seafile.example.com`                          |
| `SEAFILE_PUBLIC_SHARE_TOKEN` | Token untuk public share             | `your_share_token`                                     |
| `WIBU_UPLOAD_DIR`            | Upload directory path                | `uploads`                                              |
| `WA_SERVER_TOKEN`            | WhatsApp server token                | `your_wa_token`                                        |
| `NEXT_PUBLIC_BASE_URL`       | Base URL aplikasi                    | `/` (relative)                                         |
| `EMAIL_USER`                 | Email untuk notifikasi               | `your_email@gmail.com`                                 |
| `EMAIL_PASS`                 | Email app password                   | `your_app_password`                                    |
| `BASE_TOKEN_KEY`             | JWT secret key                       | `your_jwt_secret`                                      |
| `BOT_TOKEN`                  | Telegram bot token                   | `your_bot_token`                                       |
| `CHAT_ID`                    | Telegram chat ID                     | `your_chat_id`                                         |
| `SESSION_PASSWORD`           | iron-session password (min 32 chars) | `secure_32_char_password`                              |
| `ELEVENLABS_API_KEY`         | ElevenLabs API (TTS - optional)      | `your_elevenlabs_key`                                  |

---

## 15. Layanan Eksternal

### PostgreSQL

- **Provider**: PostgreSQL via Prisma ORM
- **Schema**: `public`
- **Connection**: Via `DATABASE_URL` environment variable
- **Migrations**: `prisma migrate deploy` di docker entrypoint

### Seafile (File Storage)

- **Tipe**: Self-hosted file sync & share
- **Penggunaan**: Storage untuk images, documents, audio files
- **Integrasi**: `src/lib/seafile-auth-service.ts`
- **CDN**: URL generation untuk public sharing
- **Config**: Token, repo ID, base URL

### WhatsApp Server

- **Penggunaan**: Kirim OTP codes saat login
- **Config**: `WA_SERVER_TOKEN`

### Telegram Bot

- **Penggunaan**: Notifikasi deployment & sistem
- **Config**: `BOT_TOKEN` + `CHAT_ID`
- **Integration**: `notify.sh` script di GitHub Actions

### ElevenLabs (Optional)

- **Penggunaan**: Text-to-Speech (TTS) features
- **Config**: `ELEVENLABS_API_KEY`

### Email (Nodemailer)

- **Penggunaan**: Notifikasi email untuk subscription/pengumuman
- **Config**: `EMAIL_USER` + `EMAIL_PASS`
- **Provider**: Gmail (app password)

---

## Ringkasan Cepat

| Aspek         | Detail                                     |
| ------------- | ------------------------------------------ |
| **Framework** | Next.js 15 (App Router) + Elysia.js        |
| **Database**  | PostgreSQL + Prisma (100+ models)          |
| **Auth**      | OTP + iron-session + JWT                   |
| **Storage**   | Seafile + local uploads                    |
| **UI**        | Mantine UI + Tiptap + Framer Motion        |
| **State**     | Jotai + Valtio + SWR                       |
| **Deploy**    | Docker + GHCR + Portainer + GitHub Actions |
| **Runtime**   | Bun                                        |
| **Testing**   | Vitest + Playwright                        |
| **Version**   | 0.1.11                                     |
