# Dokumentasi Struktur Proyek - Desa Darmasaba

## 1. Ringkasan Proyek

**Desa Darmasaba** adalah aplikasi web komprehensif untuk layanan pemerintahan desa di Desa Darmasaba, Kabupaten Badung, Bali. Aplikasi ini berfungsi sebagai platform digital untuk layanan pemerintah, informasi publik, dan keterlibatan masyarakat.

### Tech Stack

| Kategori | Teknologi |
|----------|-----------|
| **Framework Frontend** | Next.js 15 dengan App Router |
| **Bahasa** | TypeScript (strict mode) |
| **Styling** | Mantine UI v9 + Custom CSS |
| **Backend API** | Elysia.js (high-performance TypeScript framework) |
| **Database** | PostgreSQL |
| **ORM** | Prisma 6.3.1 |
| **Runtime** | Bun |
| **State Management** | Jotai + Valtio + SWR |
| **Autentikasi** | iron-session + JWT |
| **File Storage** | Seafile |
| **Rich Text Editor** | TipTap |
| **Charts** | Recharts + Chart.js |
| **Maps** | Leaflet + react-leaflet |
| **UI Components** | Mantine, PrimeReact, Framer Motion |
| **Validasi** | Zod |
| **Testing** | Vitest (unit), Playwright (E2E) |
| **Deployment** | Docker + GitHub Actions + Portainer |
| **Registry** | GitHub Container Registry (GHCR) |

---

## 2. Struktur Direktori

```
desa-darmasaba/
├── .github/workflows/           # GitHub Actions CI/CD
│   ├── docker-publish.yml       # Auto build & push saat tag v*
│   ├── publish.yml              # Manual build & push ke GHCR
│   ├── re-pull.yml              # Manual re-pull image di Portainer
│   └── script/                  # Script deployment
│
├── prisma/
│   ├── schema.prisma            # Database schema (2413 baris, 100+ model)
│   ├── seed.ts                  # Database seeder utama
│   └── _seeder_list/            # Data seed per modul
│       ├── desa/                # Seed berita, gallery, layanan, dll
│       ├── ekonomi/             # Seed APBDes, demografi, dll
│       ├── inovasi/             # Seed ide inovatif, desa digital
│       ├── keamanan/            # Seed keamanan, kontak darurat
│       ├── kesehatan/           # Seed fasilitas kesehatan, posyandu
│       ├── kependudukan/        # Seed data penduduk
│       ├── lingkungan/          # Seed lingkungan desa
│       ├── pendidikan/          # Seed sekolah, beasiswa
│       ├── ppid/                # Seed PPID
│       └── landing-page/        # Seed landing page
│
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── _com/                # Komponen global (SplashScreen, WebVitals)
│   │   ├── admin/               # Panel administrasi (protected)
│   │   │   ├── _com/            # Komponen admin shared
│   │   │   ├── (dashboard)/     # Dashboard admin dengan route groups
│   │   │   │   ├── _com/        # Komponen dashboard shared
│   │   │   │   ├── _state/      # State khusus dashboard
│   │   │   │   ├── _utils/      # Utilitas dashboard
│   │   │   │   ├── auth/        # Autentikasi admin
│   │   │   │   ├── desa/        # Admin: berita, gallery, profil, layanan
│   │   │   │   ├── ekonomi/     # Admin: APBDes, demografi, BUMDes
│   │   │   │   ├── inovasi/     # Admin: ide inovatif, desa digital
│   │   │   │   ├── keamanan/    # Admin: keamanan, kontak darurat
│   │   │   │   ├── kependudukan/# Admin: banjar, agama, umur, migrasi
│   │   │   │   ├── kesehatan/   # Admin: puskesmas, posyandu, wabah
│   │   │   │   ├── landing-page/# Admin: konten landing page
│   │   │   │   ├── lingkungan/  # Admin: konservasi, sampah, penghijauan
│   │   │   │   ├── musik/       # Admin: musik desa
│   │   │   │   ├── pendidikan/  # Admin: sekolah, beasiswa, perpustakaan
│   │   │   │   ├── ppid/        # Admin: PPID, IKM, permohonan
│   │   │   │   └── user&role/   # Admin: manajemen user & role
│   │   │   ├── auth/            # Halaman login admin
│   │   │   ├── csv/             # Upload/demo CSV
│   │   │   ├── images/          # Manajemen gambar
│   │   │   └── upload-demo/     # Demo upload
│   │   │
│   │   ├── api/                 # API routes (Elysia.js)
│   │   │   ├── [[...slugs]]/    # Catch-all route untuk Elysia
│   │   │   │   ├── _lib/        # Modul API per domain
│   │   │   │   │   ├── auth/    # Autentikasi API
│   │   │   │   │   ├── desa/    # API modul desa
│   │   │   │   │   ├── ekonomi/ # API modul ekonomi
│   │   │   │   │   ├── fileStorage/ # API file storage
│   │   │   │   │   ├── inovasi/ # API modul inovasi
│   │   │   │   │   ├── keamanan/# API modul keamanan
│   │   │   │   │   ├── kependudukan/ # API modul kependudukan
│   │   │   │   │   ├── kesehatan/    # API modul kesehatan
│   │   │   │   │   ├── landing_page/ # API landing page
│   │   │   │   │   ├── lingkungan/   # API modul lingkungan
│   │   │   │   │   ├── pendidikan/   # API modul pendidikan
│   │   │   │   │   ├── ppid/         # API modul PPID
│   │   │   │   │   ├── search/       # API pencarian global
│   │   │   │   │   └── user/         # API user management
│   │   │   │   └── route.ts     # Entry point Elysia server
│   │   │   ├── admin/           # API khusus admin
│   │   │   ├── auth/            # API autentikasi
│   │   │   ├── health/          # Health check endpoint
│   │   │   ├── layout/          # API layout
│   │   │   ├── news/            # API berita
│   │   │   ├── subscribe/       # API subscription (email)
│   │   │   └── tts/             # Text-to-Speech (ElevenLabs)
│   │   │
│   │   ├── context/             # React contexts
│   │   │   └── MusicContext.tsx # Context untuk pemutar musik
│   │   │
│   │   ├── darmasaba/           # Halaman publik (front-facing)
│   │   │   ├── _com/            # Komponen shared publik
│   │   │   │   ├── main-page/   # Komponen halaman utama
│   │   │   │   ├── Navbar.tsx   # Navigasi utama
│   │   │   │   ├── Footer.tsx   # Footer
│   │   │   │   ├── FixedPlayerBar.tsx # Music player bar
│   │   │   │   ├── LoadDataFirstClient.tsx # Data prefetching
│   │   │   │   ├── NewsReader.tsx # Component pembaca berita
│   │   │   │   ├── globalSearch.tsx # Pencarian global
│   │   │   │   └── scrollToTopButton.tsx
│   │   │   ├── (pages)/         # Halaman publik utama
│   │   │   │   ├── desa/        # Halaman: profil, berita, gallery, layanan
│   │   │   │   ├── ekonomi/     # Halaman: APBDes, BUMDes, demografi
│   │   │   │   ├── inovasi/     # Halaman: inovasi desa
│   │   │   │   ├── keamanan/    # Halaman: keamanan lingkungan
│   │   │   │   ├── kependudukan/# Halaman: data penduduk
│   │   │   │   ├── kesehatan/   # Halaman: fasilitas kesehatan
│   │   │   │   ├── lingkungan/  # Halaman: lingkungan desa
│   │   │   │   ├── module/      # Halaman modul tambahan
│   │   │   │   ├── musik/       # Halaman: musik desa
│   │   │   │   ├── pendidikan/  # Halaman: pendidikan
│   │   │   │   └── ppid/        # Halaman: PPID publik
│   │   │   ├── (tambahan)/      # Halaman tambahan
│   │   │   ├── layout.tsx       # Layout utama publik
│   │   │   └── page.tsx         # Landing page utama
│   │   │
│   │   ├── login/               # Halaman login
│   │   ├── registrasi/          # Halaman registrasi
│   │   ├── waiting-room/        # Halaman waiting room
│   │   ├── terms-of-service/    # Halaman syarat layanan
│   │   ├── test-upload/         # Halaman tes upload
│   │   ├── validasi/            # Halaman validasi
│   │   ├── coba/                # Halaman percobaan
│   │   ├── percobaan/           # Halaman percobaan lainnya
│   │   ├── layout.tsx           # Root layout (MantineProvider)
│   │   ├── page.tsx             # Root page
│   │   ├── error.tsx            # Error boundary
│   │   ├── not-found.tsx        # 404 page
│   │   ├── globals.css          # Global styles
│   │   └── favicon.ico
│   │
│   ├── components/
│   │   └── admin/               # Komponen admin reusable
│   │       ├── AdminThemeProvider.tsx
│   │       ├── DarkModeToggle.tsx
│   │       ├── UnifiedSurface.tsx
│   │       └── UnifiedTypography.tsx
│   │
│   ├── con/                     # Constants & konfigurasi
│   │   └── colors.ts            # Palet warna
│   │
│   ├── lib/                     # Utility functions
│   │   ├── router/              # Router utilities
│   │   ├── api-auth.ts          # Autentikasi API
│   │   ├── api-fetch.ts         # Helper fetch API
│   │   ├── EnvStringParse.ts    # Parser environment variables
│   │   ├── prisma.ts            # Prisma client instance
│   │   ├── seafile-auth-service.ts # Integrasi Seafile
│   │   └── session.ts           # iron-session helper
│   │
│   ├── middlewares/             # Next.js middleware
│   ├── state/                   # Global state (Jotai/Valtio)
│   │   ├── darkModeStore.ts     # State dark mode
│   │   ├── state-layanan.ts     # State layanan
│   │   ├── state-list-image.ts  # State daftar gambar
│   │   └── state-nav.ts         # State navigasi
│   │
│   ├── store/                   # State management tambahan
│   └── types/                   # TypeScript type definitions
│
├── public/                      # Static assets
│   └── assets/                  # Gambar, icon, dll
│
├── uploads/                     # Directory upload (runtime)
│   └── image/                   # Upload gambar
│
├── .env.example                 # Contoh environment variables
├── .gitignore
├── AGENTS.md                    # Panduan untuk AI coding agents
├── Dockerfile                   # Docker image definition
├── docker-entrypoint.sh         # Entry point container
├── next.config.ts               # Next.js configuration
├── package.json                 # Dependencies & scripts
├── tsconfig.json                # TypeScript configuration
├── biome.json                   # Biome linter config
├── eslint.config.mjs            # ESLint config
├── NOTE.md                      # Catatan deployment
└── QWEN.md                      # Konteks & memori proyek
```

---

## 3. Arsitektur Aplikasi

### 3.1 Arsitektur Keseluruhan

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Browser)                      │
└────────────┬────────────────────────────┬────────────────┘
             │                            │
             │  Next.js Pages             │  API Calls
             │  (SSR/CSR)                 │
             ▼                            ▼
┌────────────────────────┐    ┌────────────────────────────┐
│   Next.js 15 App Router│    │   Elysia.js API Server     │
│   - Pages publik       │    │   - RESTful endpoints      │
│   - Admin dashboard    │    │   - File upload            │
│   - Server components  │    │   - Swagger docs (/api/docs│
│   - Client components  │    │   - Static file serving    │
└────────────┬───────────┘    └────────────┬───────────────┘
             │                             │
             │                             │
             ▼                             ▼
┌─────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                   │
│                    (via Prisma ORM)                      │
└─────────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────┐
│                    Seafile File Storage                  │
│                    (Images & Documents)                  │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Next.js App Router

- Menggunakan **App Router** (bukan Pages Router)
- Route groups `(dashboard)`, `(pages)`, `(tambahan)` untuk organisasi tanpa mempengaruhi URL
- Layout bersarang: root layout -> admin/darmasaba layout -> page layouts
- `force-dynamic` digunakan untuk menghindari error prerendering
- View Transitions API diaktifkan via `next-view-transitions`

### 3.3 Elysia.js API Server

- Terintegrasi sebagai **catch-all route** di `/api/[[...slugs]]/route.ts`
- Semua HTTP methods (GET, POST, PATCH, DELETE, PUT) di-handle oleh Elysia
- Plugin yang digunakan:
  - `@elysiajs/cors` - CORS configuration
  - `@elysiajs/static` - Static file serving dari `/uploads`
  - `@elysiajs/swagger` - API documentation di `/api/docs`
  - `@elysiajs/jwt` - JWT authentication
  - `@elysiajs/cookie` - Cookie handling
- Endpoint file upload: `/api/upl-img`, `/api/upl-img-single`, `/api/upl-csv`
- Image serving: `/api/img/:name` dengan resize support

### 3.4 Rendering Strategy

- **Server Components**: Halaman publik untuk SEO optimal
- **Client Components**: Komponen interaktif (form, state, animasi)
- **Force Dynamic**: Beberapa halaman menggunakan `force-dynamic`
- **ISR**: Caching header untuk assets (1 jam cache)

---

## 4. Modul Domain

### 4.1 Profil Desa (Desa)
**Admin**: `/admin/pemerintahan/*` | **Publik**: `/darmasaba/pemerintahan/*`

| Sub-modul | Fungsi |
|-----------|--------|
| `berita` | CRUD berita/pengumuman desa |
| `gallery` | Galeri foto dan video |
| `layanan` | Manajemen layanan desa |
| `pengumuman` | Pengumuman publik |
| `potensi` | Potensi desa (pertanian, pariwisata, dll) |
| `profil` | Profil desa (sejarah, visi misi, lambang, maskot, perangkat) |

### 4.2 PPID (Pejabat Pengelola Informasi dan Dokumentasi)
**Admin**: `/admin/ppid/*` | **Publik**: `/darmasaba/ppid/*`

| Sub-modul | Fungsi |
|-----------|--------|
| `profil-ppid` | Profil pejabat PPID |
| `struktur-ppid` | Struktur organisasi PPID |
| `visi-misi-ppid` | Visi dan misi PPID |
| `daftar-informasi-publik` | Daftar informasi yang tersedia |
| `dasar-hukum` | Dasar hukum PPID |
| `permohonan-informasi-publik` | Form permohonan informasi |
| `permohonan-keberatan-informasi-publik` | Form keberatan |
| `indeks-kepuasan-masyarakat` | Survei kepuasan masyarakat (IKM) |

### 4.3 Kesehatan
**Admin**: `/admin/kesehatan/*` | **Publik**: `/darmasaba/kesehatan/*`

| Sub-modul | Fungsi |
|-----------|--------|
| `fasilitas-kesehatan` | Data puskesmas, klinik, dokter |
| `posyandu` | Manajemen posyandu |
| `program-kesehatan` | Program kesehatan desa |
| `info-wabah-penyakit` | Informasi wabah |
| `penanganan-darurat` | Prosedur penanganan darurat |
| `kontak-darurat` | Kontak darurat kesehatan |
| `data-kesehatan-warga` | Statistik kesehatan warga |
| `artikel-kesehatan` | Artikel kesehatan |

### 4.4 Ekonomi
**Admin**: `/admin/ekonomi/*` | **Publik**: `/darmasaba/ekonomi/*`

| Sub-modul | Fungsi |
|-----------|--------|
| `APBDes` | Anggaran Pendapatan dan Belanja Desa (hierarki items + realisasi) |
| `PADesa-pendapatan-asli-desa` | Pendapatan asli desa |
| `demografi-pekerjaan` | Demografi pekerjaan penduduk |
| `jumlah-penduduk-miskin` | Data penduduk miskin |
| `jumlah-pengangguran` | Data pengangguran |
| `lowongan-kerja-lokal` | Lowongan kerja lokal |
| `pasar-desa` | Data pasar desa |
| `program-kemiskinan` | Program penanganan kemiskinan |
| `sektor-unggulan-desa` | Sektor unggulan ekonomi |
| `Struktur-Organisasi-Dan-Sk-Pengurus-BumDes` | Struktur BUMDes |

### 4.5 Kependudukan
**Admin**: `/admin/kependudukan/*` | **Publik**: `/darmasaba/kependudukan/*`

| Sub-modul | Fungsi |
|-----------|--------|
| `data-banjar` | Data banjar (unit wilayah tradisional Bali) |
| `distribusi-agama` | Distribusi agama penduduk |
| `distribusi-umur` | Distribusi umur penduduk |
| `migrasi-penduduk` | Data migrasi (masuk/keluar) |

### 4.6 Pendidikan
**Admin**: `/admin/pendidikan/*` | **Publik**: `/darmasaba/pendidikan/*`

| Sub-modul | Fungsi |
|-----------|--------|
| `beasiswa-desa` | Program beasiswa |
| `bimbingan-belajar-desa` | Bimbingan belajar |
| `data-pendidikan` | Data statistik pendidikan |
| `info-sekolah` | Informasi sekolah |
| `pendidikan-non-formal` | Pendidikan non-formal |
| `perpustakaan-digital` | Perpustakaan digital |
| `program-pendidikan-anak` | Program pendidikan anak |

### 4.7 Keamanan
**Admin**: `/admin/keamanan/*` | **Publik**: `/darmasaba/keamanan/*`

| Sub-modul | Fungsi |
|-----------|--------|
| `keamanan-lingkungan-pecalang-patwal` | Keamanan lingkungan (pecalang Bali) |
| `kontak-darurat` | Kontak darurat keamanan |
| `laporan-publik` | Laporan publik |
| `pencegahan-kriminalitas` | Pencegahan kriminalitas |
| `polsek-terdekat` | Data polsek terdekat |
| `tips-keamanan` | Tips keamanan |

### 4.8 Lingkungan
**Admin**: `/admin/lingkungan/*` | **Publik**: `/darmasaba/lingkungan/*`

| Sub-modul | Fungsi |
|-----------|--------|
| `data-lingkungan-desa` | Data lingkungan desa |
| `edukasi-lingkungan` | Edukasi lingkungan |
| `gotong-royong` | Kegiatan gotong royong |
| `konservasi-adat-bali` | Konservasi adat Bali |
| `pengelolaan-sampah-bank-sampah` | Bank sampah |
| `program-penghijauan` | Program penghijauan |

### 4.9 Inovasi
**Admin**: `/admin/inovasi/*` | **Publik**: `/darmasaba/inovasi/*`

| Sub-modul | Fungsi |
|-----------|--------|
| `ajukan-ide-inovatif` | Form pengajuan ide inovatif |
| `desa-digital-smart-village` | Program desa digital |
| `info-teknologi-tepat-guna` | Info teknologi tepat guna |
| `kolaborasi-inovasi` | Kolaborasi inovasi |
| `layanan-online-desa` | Layanan online desa |
| `program-kreatif-desa` | Program kreatif desa |

### 4.10 Musik Desa
**Admin**: `/admin/musik/*` | **Publik**: `/darmasaba/musik/*`

- Manajemen audio dan cover musik desa
- Fixed player bar di halaman publik
- Context provider untuk state pemutar musik

### 4.11 Landing Page
**Admin**: `/admin/landing-page/*`

| Sub-modul | Fungsi |
|-----------|--------|
| `desa-anti-korupsi` | Konten anti-korupsi |
| `prestasi-desa` | Prestasi dan Penghargaan (penghargaan = kategori "Penghargaan", field opsional `juara`) |
| `sdgs-desa` | SDGs (Sustainable Development Goals) |
| `profil-landing-page` | Profil dan media sosial |

### 4.12 User & Role
**Admin**: `/admin/user&role/*`

- Manajemen pengguna admin
- Manajemen role dan permission
- Manajemen menu akses

---

## 5. Database Schema

### 5.1 Overview

Database menggunakan **PostgreSQL** dengan **Prisma ORM** (versi 6.3.1).
Schema terdiri dari **2413 baris** dengan **100+ model**.

### 5.2 Model Utama

#### FileStorage
Model sentral untuk semua file (gambar, dokumen, audio):
```prisma
model FileStorage {
  id           String   @id @default(cuid())
  name         String   @unique
  realName     String
  path         String
  mimeType     String
  category     String   // "image" / "document" / "audio" / "other"
  link         String
  isActive     Boolean  @default(true)
  // Relasi ke 50+ model lain (Berita, PotensiDesa, GalleryFoto, dll)
}
```

#### AppMenu & AppMenuChild
Menu navigasi aplikasi:
```prisma
model AppMenu {
  id           String         @id @default(cuid())
  name         String         @unique
  link         String
  isActive     Boolean        @default(true)
  AppMenuChild AppMenuChild[]
}
```

#### User & Role (Autentikasi Admin)
- `User` - Data pengguna admin
- `Role` - Role/peran pengguna
- `Menu` - Menu akses per role

#### Modul Desa
- `Berita` - Berita desa (dengan featured image & gallery)
- `GalleryFoto` / `GalleryVideo` - Galeri media
- `Layanan` - Layanan desa
- `Pengumuman` - Pengumuman
- `PotensiDesa` - Potensi desa
- `ProfileDesaImage` - Gambar profil desa
- `ProfilPerbekel` - Profil perbekel (kepala desa)
- `PejabatDesa` - Pejabat desa
- `PrestasiDesa` - Prestasi & penghargaan (tabel `Penghargaan` lama digabung ke sini, lihat Landing Page)
- `MediaSosial` - Media sosial desa

#### Modul PPID
- `StrukturPPID` - Struktur organisasi
- `PosisiOrganisasiPPID` - Posisi dengan hierarki
- `PegawaiPPID` - Data pegawai
- `ProfilePPID` - Profil PPID
- `VisiMisiPPID` - Visi misi
- `DasarHukumPPID` - Dasar hukum
- `DaftarInformasiPublik` - Daftar informasi
- `PermohonanInformasiPublik` - Permohonan informasi
- `FormulirPermohonanKeberatan` - Formulir keberatan
- `IndeksKepuasanMasyarakat` - IKM
- `Responden` + lookup tables - Data responden IKM

#### Modul Kesehatan
- `Puskesmas` - Data puskesmas
- `Posyandu` - Data posyandu
- `ProgramKesehatan` - Program kesehatan
- `FasilitasKesehatan` - Fasilitas
- `InfoWabahPenyakit` - Info wabah
- `PenangananDarurat` - Penanganan darurat
- `KontakDarurat` - Kontak darurat
- `ArtikelKesehatan` - Artikel

#### Modul Ekonomi
- `APBDes` & `APBDesItem` - Anggaran desa (hierarki tree structure)
- `RealisasiItem` - Realisasi anggaran (multiple per item)
- `PasarDesa` - Pasar desa
- `PegawaiBumDes` - Pegawai BUMDes
- `StrukturBumDes` - Struktur BUMDes
- `DemografiPekerjaan` - Demografi pekerjaan
- `JumlahPendudukMiskin` - Data kemiskinan
- `JumlahPengangguran` - Data pengangguran
- `LowonganKerjaLokal` - Lowongan kerja
- `ProgramKemiskinan` - Program kemiskinan
- `SektorUnggulanDesa` - Sektor unggulan
- `PendapatanAsli` - Pendapatan asli desa

#### Modul Kependudukan
- `DataBanjar` - Data banjar
- `DistribusiAgama` - Distribusi agama
- `DistribusiUmur` - Distribusi umur
- `MigrasiPenduduk` - Migrasi

#### Modul Pendidikan
- `InfoSekolah` - Data sekolah
- `BeasiswaDesa` - Beasiswa
- `BimbinganBelajar` - Bimbingan belajar
- `PendidikanNonFormal` - Pendidikan non-formal
- `DataPerpustakaan` - Perpustakaan

#### Modul Keamanan
- `KeamananLingkungan` - Keamanan lingkungan
- `MenuTipsKeamanan` - Tips keamanan
- `PencegahanKriminalitas` - Pencegahan kriminalitas
- `PolsekTerdekat` - Polsek terdekat
- `LaporanPublik` - Laporan publik

#### Modul Lingkungan
- `DataLingkunganDesa` - Data lingkungan
- `KonservasiAdatBali` - Konservasi adat
- `BankSampah` - Bank sampah
- `ProgramPenghijauan` - Penghijauan
- `GotongRoyong` - Gotong royong
- `EdukasiLingkungan` - Edukasi

#### Modul Inovasi
- `ProgramInovasi` - Program inovasi
- `DesaDigital` - Desa digital
- `InfoTekno` - Info teknologi
- `KolaborasiInovasi` + `MitraKolaborasi` - Kolaborasi
- `LayananOnlineDesa` - Layanan online
- `ProgramKreatifDesa` - Program kreatif
- `Ajukan` - Pengajuan ide

#### Modul Musik
- `MusikDesa` - Musik desa
  - `audioFile` -> FileStorage
  - `coverImage` -> FileStorage

#### Landing Page
- `DesaAntiKorupsi` + `KategoriDesaAntiKorupsi`
- `SdgsDesa` - SDGs
- `PrestasiDesa` + `KategoriPrestasiDesa` — termasuk penghargaan (kategori "Penghargaan", `juara String?`); tabel `Penghargaan` dihapus di migrasi `20261109123000_merge_penghargaan_into_prestasi_desa`
- `MediaSosial`
- `LandingPage_Layanan`

#### APBDes (Struktur Hierarki)
```prisma
model APBDesItem {
  kode           String       // "4", "4.1", "4.1.2"
  uraian         String       // Nama item
  anggaran       Float        // Anggaran dalam Rupiah
  tipe           String?      // "pendapatan" | "belanja" | "pembiayaan"
  level          Int          // 1, 2, 3
  parentId       String?      // Self-referencing untuk tree
  children       APBDesItem[]
  totalRealisasi Float        @default(0)  // Auto-calculated
  selisih        Float        @default(0)  // totalRealisasi - anggaran
  persentase     Float        @default(0)  // (totalRealisasi / anggaran) * 100
  realisasiItems RealisasiItem[]
}
```

### 5.3 Pola Umum Model

Hampir semua model mengikuti pola:
```prisma
model Contoh {
  id        String   @id @default(cuid())
  // ... fields
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  deletedAt DateTime? @default(now())  // Soft delete
  isActive  Boolean  @default(true)    // Soft delete flag
}
```

---

## 6. API Routes

### 6.1 Struktur API

Semua API routes ditangani oleh **Elysia.js** di `/src/app/api/[[...slugs]]/route.ts`

### 6.2 API Groups

| Prefix | Modul | Contoh Endpoints |
|--------|-------|------------------|
| `/api/layanan` | Layanan | `GET /api/layanan` |
| `/api/potensi` | Potensi | `GET /api/potensi` |
| `/api/desa/*` | Desa | CRUD berita, gallery, profil, dll |
| `/api/ppid/*` | PPID | CRUD struktur, profil, permohonan |
| `/api/kesehatan/*` | Kesehatan | CRUD puskesmas, posyandu, dll |
| `/api/ekonomi/*` | Ekonomi | CRUD APBDes, BUMDes, demografi |
| `/api/kependudukan/*` | Kependudukan | CRUD banjar, demografi |
| `/api/pendidikan/*` | Pendidikan | CRUD sekolah, beasiswa |
| `/api/keamanan/*` | Keamanan | CRUD keamanan, kontak darurat |
| `/api/lingkungan/*` | Lingkungan | CRUD data lingkungan |
| `/api/inovasi/*` | Inovasi | CRUD program inovasi |
| `/api/landing-page/*` | Landing Page | CRUD konten landing page |
| `/api/user/*` | User | CRUD user admin |
| `/api/user/role/*` | Role | CRUD role & permission |
| `/api/search` | Search | Pencarian global |
| `/api/file-storage/*` | File Storage | CRUD file storage |
| `/api/img/:name` | Image | GET gambar dengan resize |
| `/api/upl-img` | Upload | Upload multiple images |
| `/api/upl-img-single` | Upload | Upload single image |
| `/api/upl-csv` | Upload | Upload CSV files |
| `/api/utils/version` | Utils | GET versi aplikasi |

### 6.3 API Documentation

Swagger UI tersedia di: **`/api/docs`**

### 6.4 API Route Lainnya

| Route | Fungsi |
|-------|--------|
| `/api/health` | Health check endpoint |
| `/api/news` | API berita (standalone) |
| `/api/subscribe` | Subscription email |
| `/api/tts` | Text-to-Speech (ElevenLabs) |
| `/api/admin/*` | API khusus admin |
| `/api/auth/*` | API autentikasi |

---

## 7. Halaman Admin

### 7.1 Struktur

Admin dashboard berada di `/admin` dengan route group `(dashboard)`.

| Section | Path | Fungsi |
|---------|------|--------|
| **Dashboard** | `/admin` | Dashboard utama |
| **Autentikasi** | `/admin/auth` | Login admin |
| **Desa** | `/admin/pemerintahan/*` | Berita, gallery, profil, layanan, pengumuman, potensi |
| **PPID** | `/admin/ppid/*` | Profil, struktur, visi-misi, daftar informasi, dasar hukum, permohonan, IKM |
| **Kesehatan** | `/admin/kesehatan/*` | Puskesmas, posyandu, program kesehatan, wabah, kontak darurat |
| **Ekonomi** | `/admin/ekonomi/*` | APBDes, PAD, demografi, pengangguran, kemiskinan, BUMDes, pasar desa |
| **Kependudukan** | `/admin/kependudukan/*` | Banjar, distribusi agama, distribusi umur, migrasi |
| **Pendidikan** | `/admin/pendidikan/*` | Sekolah, beasiswa, bimbingan belajar, perpustakaan digital |
| **Keamanan** | `/admin/keamanan/*` | Keamanan lingkungan, kontak darurat, pencegahan kriminalitas, polsek |
| **Lingkungan** | `/admin/lingkungan/*` | Data lingkungan, konservasi, bank sampah, penghijauan, gotong royong |
| **Inovasi** | `/admin/inovasi/*` | Ide inovatif, desa digital, teknologi tepat guna, kolaborasi |
| **Musik** | `/admin/musik/*` | Manajemen musik desa |
| **Landing Page** | `/admin/landing-page/*` | Anti-korupsi, prestasi & penghargaan, SDGs, media sosial |
| **User & Role** | `/admin/user&role/*` | Manajemen user dan role |
| **Images** | `/admin/images/*` | Manajemen gambar |
| **CSV** | `/admin/csv/*` | Upload/import CSV |

### 7.2 Komponen Admin Shared

- `AdminThemeProvider.tsx` - Theme provider untuk dark/light mode
- `DarkModeToggle.tsx` - Toggle dark mode
- `UnifiedSurface.tsx` - Komponen surface/card unified
- `UnifiedTypography.tsx` - Tipografi unified

---

## 8. Halaman Publik

### 8.1 Struktur

Halaman publik berada di `/darmasaba` dengan layout yang mencakup Navbar, Footer, dan Fixed Music Player.

| Halaman | Path | Konten |
|---------|------|--------|
| **Landing Page