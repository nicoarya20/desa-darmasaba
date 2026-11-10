# DESIGN.md — Desa Darmasaba Design System

Dokumen ini mencatat UI/UX conventions, design tokens, komponen, dan pola yang dipakai di seluruh codebase. Tujuan: AI dan developer baru langsung paham "bahasa visual" project ini tanpa perlu baca semua file satu per satu.

---

## 1. Tech Stack UI

| Paket | Versi | Kegunaan |
|---|---|---|
| `@mantine/core` | 9.7.4 | Komponen utama (AppShell, Paper, Button, Input, dll) |
| `@mantine/dates` | 9.7.4 | Date picker |
| `@mantine/dropzone` | 9.7.4 | Upload file/gambar |
| `@mantine/tiptap` | 9.7.4 | Rich text editor (wrapper custom di `_com/createEditor.tsx`) |
| `@tiptap/*` | ^3.32.2 | Engine rich text editor (StarterKit, Highlight, TextAlign, Superscript, Subscript; Link via `@mantine/tiptap`) — lihat §17 |
| `@mantine/charts` | 9.7.4 | BarChart, PieChart, dll |
| `@tabler/icons-react` | ^3.30.0 | Semua ikon (Tabler Icons) |
| `framer-motion` | ^12.38.0 | Animasi (hover cards, stagger) |
| `recharts` | ^3.8.0 | Grafik langsung di beberapa halaman data (pendidikan, kesehatan, ekonomi) |
| `primereact` | ^10.9.6 | Beberapa komponen tabel |
| `@mantine/hooks` | 9.7.4 | Hooks pendukung Mantine (dipakai luas bareng `@mantine/core`) |
| `chart.js` | ^4.4.8 | Grafik tambahan di luar `@mantine/charts` |

**Catatan Mantine 9** (lihat `docs/decisions/2026-11-04-mantine-9-upgrade.md`):
- Jarak kolom `Grid` memakai prop `gap`, bukan `gutter` (sudah dihapus di v9).
- Tampilan v8 dipertahankan di theme `src/app/layout.tsx`: `defaultRadius: "sm"`, `cssVariablesResolver={v8CssVariablesResolver}`, `fontWeights.medium: "500"`, dan override `--mantine-font-weight-medium: 600` di `Button` (+ `ButtonGroupSection`/`ActionIconGroupSection`), supaya tombol tetap 600 seperti di v8. Jangan dihapus sebelum fondasi tema baru diterapkan.
- `accept` Dropzone yang berisi MIME wildcard **dan** ekstensi (mis. `image/*` + `.jpg`) kini hanya menerima ekstensi itu saja (react-dropzone 20).

---

## 2. Color Tokens

File sumber: `src/con/colors.ts`, `src/utils/themeTokens.ts`

### 2.1 Palette Utama (Public Site)

| Token | Hex | Penggunaan |
|---|---|---|
| `blue-button` | `#0A4E78` | Primary action, link aktif, border aktif |
| `blue-button-1` | `#E5F2FA` | Background ringan, hover |
| `blue-button-2` | `#B8DAEF` | — |
| `blue-button-3` | `#8AC1E3` | — |
| `blue-button-4` | `#5DA9D8` | — |
| `blue-button-5` | `#2F91CC` | — |
| `blue-button-6` | `#083F61` | — |
| `blue-button-7` | `#062F49` | Teks gelap di atas background biru |
| `orange` | `#FCAE00` | Aksen/highlight |
| `Bg` | `#D1D9E8` | Background halaman login |
| `BG-trans` | `#B1C5F2` | Background transparan |
| `grey-1` | `#F4F5F6` | Background section halaman publik |
| `grey-2` | `#CBCACD` | Border ringan |
| `white-1` | `#FBFBFC` | Background Paper admin |

### 2.2 Token Semantik Admin — Light Mode

| Token | Nilai |
|---|---|
| `bg.base` | `#f6f9fc` — AppShellMain background |
| `bg.app` | `#ffffff` — Sidebar background |
| `bg.card` | `#ffffff` — UnifiedCard |
| `bg.surface` | `#f8fafc` — Surface sekunder |
| `text.primary` | `#1a1b1e` |
| `text.secondary` | `#495057` |
| `text.muted` | `#868e96` |
| `primary` | `#0A4E78` |
| `border.default` | `#e2e8f0` |
| `success` | `#22c55e` |
| `warning` | `#facc15` |
| `error` | `#ef4444` |
| `info` | `#38bdf8` |

### 2.3 Token Semantik Admin — Dark Mode

| Token | Nilai |
|---|---|
| `bg.base` | `#0B1220` |
| `bg.app` | `#0F172A` |
| `bg.card` | `#162235` |
| `bg.surface` | `#1E2A3D` |
| `text.primary` | `#E5E7EB` |
| `primary` | `#3B82F6` |
| `border.default` | `#2A3A52` |

### 2.4 Gradient Standar Button Simpan

```ts
background: `linear-gradient(135deg, ${colors['blue-button']}, #4facfe)`
boxShadow: '0 4px 15px rgba(79, 172, 254, 0.4)'
```

Gradient ini dipakai di button "Simpan" hampir semua halaman Create/Edit admin.

---

## 3. Tipografi

File sumber: `src/app/layout.tsx`, `src/utils/themeTokens.ts`

### Font Family

- **Primary**: `San Francisco` (custom, `/assets/fonts/font.otf`)  
  Fallback: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`
- **Monospace**: `SFMono-Regular, Menlo, Monaco, Consolas, monospace`

### Skala Heading (Admin)

| Level | Font Size | Weight | Line Height |
|---|---|---|---|
| H1 | `2.25rem` | 700 | 1.2 |
| H2 | `2rem` | 700 | 1.25 |
| H3 | `1.75rem` | 700 | 1.3 |
| H4 | `1.5rem` | 600 | 1.35 |
| Body | `1rem` | 400 | 1.5 |
| Small | `0.875rem` | 400 | 1.4 |
| Label | `0.75rem` | 600 | 1.4 |

### Heading Responsif (Public)

```tsx
// H1 hero (APBDes, Landing)
fz={{ base: "2rem", md: "3.6rem" }}

// H1 section
fz={{ base: "1.75rem", md: "3rem" }}

// Kartu kecil
fz={{ base: "sm", md: "md" }}
```

---

## 4. Spacing & Border Radius

| Token | Nilai |
|---|---|
| `xs` | `0.625rem` (10px) |
| `sm` | `1rem` (16px) |
| `md` | `1.5rem` (24px) |
| `lg` | `2rem` (32px) |
| `xl` | `2.5rem` (40px) |

| Radius | Nilai |
|---|---|
| `sm` | `8px` |
| `md` | `12px` |
| `lg` | `16px` |
| `xl` | `20px` |

---

## 5. Layout Public Site (`/darmasaba/`)

File: `src/app/darmasaba/layout.tsx`

```
Stack (gap=0, bg=grey[1])
  Navbar (fixed, z-index=100)
  Space h={{ base:"3rem", md:"2.75rem" }}  // = tinggi bar mobile 48px / desktop 44px
  {children}
  Footer
  FixedPlayerBar
```

### Navbar Desktop

Gaya apple.com. File: `_com/NavbarMainMenu.tsx` (bar), `_com/NavbarFlyout.tsx` (panel), `_com/useNavbarFlyout.ts` (state & interaksi), `_com/navbar.module.css` (gaya + animasi, variabel warna di `.root`), `_com/navbar-menu.logic.ts` (helper murni, dites di `__tests__/api/navbar_menu_logic.test.ts`). State terbuka di `stateNav.openMenuId` / `stateNav.isSearch`.

- **Bar**: tinggi 44px, `rgba(251,251,253,0.8)` + `backdrop-filter: saturate(180%) blur(20px)`, isi max-width 1100px. Menu aktif = teks biru brand 600. Jangan bungkus navbar dengan elemen ber-`backdrop-filter`/`filter`: induk seperti itu membuat overlay blur di dalamnya tidak bisa mem-blur halaman.
- **Flyout**: hover menu (jeda 100ms) → latar `#fbfbfd` mengembang dari bawah bar (transisi `clip-path` 320ms `cubic-bezier(0.32,0.72,0,1)`, tinggi mengikuti isi yang diukur `ResizeObserver`, jadi pindah menu ikut retarget). Isi: label kecil abu + link 22px/600 dalam satu kolom (bila melebihi tinggi layar, panel bisa di-scroll).
- **Reveal teks**: `opacity` + `translateY(-8px)` 300ms `cubic-bezier(0.23,1,0.32,1)`, stagger 30ms per baris.
- **Blur halaman**: overlay `fixed` `backdrop-filter: blur(18px)` + tint, fade `opacity`. Tulis `backdrop-filter` **tanpa** `-webkit-backdrop-filter` manual: Lightning CSS (Turbopack) menggabungkan keduanya jadi hanya versi `-webkit-` yang diabaikan Chrome.
- **Tutup**: cursor keluar area bar+panel (jeda 120ms), Escape, klik overlay, klik link, atau route berganti. Pencarian dibuka/tutup lewat klik ikon (tidak ikut hover).
- **Aksesibilitas**: menu utama `<button aria-expanded>`, submenu `<a>` (bisa keyboard & tab baru), Enter membuka + fokus link pertama, panel `inert` saat tertutup. `prefers-reduced-motion`: tanpa gerak, hanya fade. Hover warna hanya untuk `(hover: hover) and (pointer: fine)`.
- **Pencarian** (`_com/globalSearch.tsx`): dropdown berisi bagian "Halaman" (submenu navbar yang cocok, dari `_com/searchMenu.ts` atas `src/con/navbar-list-menu.ts` lalu `src/con/search-extra-pages.ts` untuk halaman publik di luar navbar, langsung tanpa menunggu API) di atas "Konten" (hasil API). "Halaman" menampilkan 5 hasil dulu (`MENU_PREVIEW_COUNT`, `previewMenuResults`), sisanya dibuka di tempat lewat tombol "Tampilkan N halaman lainnya" (`_com/SearchShowMoreButton.tsx`); ketikan berubah → kembali 5. Baris dirender `_com/SearchResultRow.tsx`. Dites di `__tests__/api/search_menu.test.ts`.

### Navbar Mobile

Gaya apple.com. File: `_com/NavbarMobile.tsx` + `_com/navbar-mobile.module.css` (variabel warna/kurva dipakai bersama dari `.root` di `navbar.module.css`). State buka di `stateNav.mobileOpen`.

- **Bar**: tinggi 48px, kaca sama dengan desktop, logo kiri, `Burger` kanan.
- **Panel**: kaca penuh layar `rgba(251,251,253,0.82)` + `backdrop-filter: saturate(180%) blur(20px)` (halaman ter-blur), membuka dari bawah bar lewat `clip-path` 320ms. Scroll halaman dikunci selama terbuka.
- **Drill-down**: awalnya hanya menu utama (24px/600 + chevron). Tap menu → submenu masuk dari kanan dengan tombol "Kembali"; kembali → menu utama masuk dari kiri. Reveal bertahap 25ms per baris.
- **Tutup**: burger, Escape, klik link, atau route berganti. Panel `inert` saat tertutup.

### Hero Beranda (Landing)

Layar pertama beranda: menjawab "ini situs siapa" sebelum yang lain. Folder: `_com/main-page/landing-page/` — `index.tsx` (section), `HeroInfo.tsx` (status kantor + media sosial), `HeroProfile.tsx` (foto + kartu nama Perbekel), `HeroPrograms.tsx` (rel program inovasi) + `use-rail-scroll.ts` (hook geser) + `rail.logic.ts` (helper murni) + `programs.module.css`, `HeroRibbons.tsx` (pita latar) + `ribbons.logic.ts` (geometri), `use-landing-data.ts` (hook), `landing.logic.ts` (jam kerja, helper murni), `landing.text.ts`, `landing.module.css`. Test: `__tests__/api/landing_hero_ui.test.tsx`.

- **Sumber data** (tidak berubah): `/api/landingpage/mediasosial/findMany`, `/api/landingpage/pejabatdesa/edit`, `/api/landingpage/harilibur/cek?date=`, dan state Valtio `programInovasi.findMany` (limit bawaan 10).
- **Bentuk**: satu permukaan `#D1D9E8` (`colors.Bg`) selebar layar, jarak tepi 24px (mobile 16px), **tanpa kartu pembungkus**. Kiri: 2 logo (ubin putih 56px) + "PEMERINTAH DESA DARMASABA" (15px kapital, `blue-button`) + wilayah; `h1` sambutan (`clamp(2rem, 4.4vw, 3.6rem)`, `blue-button-7`) dengan baris salam di atasnya; status kantor; ikon media sosial (bulat putih 44px, tautan asli tab baru). Kanan: foto Perbekel `object-fit: contain` rata bawah **setinggi hero** (kolom kanan merentang dua baris grid: `"copy profile" / "programs profile"`, kolom `1.3fr / 1fr`), tinggi `--photo-h` = `clamp(340px, min(38vw, 66vh), 700px)` (ikut tinggi layar supaya hero tetap di layar pertama laptop), kartu nama putih menimpa dasar foto 32px. Tanpa foto → hanya kartu nama.
- **Status kantor**: satu baris pil putih — titik hijau/merah, "Kantor buka/tutup", lalu "Jam layanan 07:30 - 15:30" atau nama hari libur/"Libur Akhir Pekan". Jam: Senin–Kamis 07:30–15:30, Jumat 07:30–12:00; hari libur nasional mengalahkan jam kerja; diperbarui tiap menit.
- **Pita latar** (`HeroRibbons`): satu SVG diam di belakang semua isi — berkas 11 pita sejajar (biru brand, biru muda, putih, satu garis emas `#d4a72c`, satu garis merah `#c8102e`; warna dari seragam Perbekel) yang turun dari atas-tengah lalu mendatar di belakang foto sampai keluar tepi kanan; melebar 1,35× di pangkal (kipas), memudar ke atas lewat mask. Path dihitung sekali saat modul dimuat dari garis tengah Bézier (`ribbons.logic.ts`); `preserveAspectRatio="none"` supaya ikut ukuran hero. Tepi luar berkas tetap, jadi pita tidak pernah menyentuh teks sambutan. **Tanpa gerak.** Di mobile pita pindah ke sel foto saja (lihat butir Mobile). Alasan bentuk: panel warna di belakang foto dan foto desa sebagai latar penuh sudah dicoba dan ditolak.
- **Program inovasi**: judul kecil kapital "Program Inovasi Desa" + rel geser berisi **semua program** (urutan dari API) di kiri bawah, di bawah teks. Ubin putih seragam (radius 16px, logo `contain` tinggi 72px, nama 14px maks 2 baris) → `/darmasaba/program-inovasi/{id}`. 4 ubin terlihat penuh (`RAIL_VISIBLE_TILES` = `--visible-tiles`), ubin ke-5 mengintip 48px. Geser dengan scroll bawaan browser (`scroll-snap-type: x mandatory`, berhenti di tepi ubin): seret, trackpad, atau 2 tombol panah bulat putih 40px di kanan judul (sekali klik = 2 ubin; mati di ujung). **Tanpa putar otomatis, tanpa loop** — logo yang berjalan sendiri terbaca seperti banner sponsor, dan galeri Layanan & Potensi di bawahnya sudah bergerak sendiri; mesin galeri itu sengaja tidak dipakai ulang. Tepi rel **memudar bertahap** (`mask-image`, 72px; mobile 40px) hanya di sisi yang masih punya ubin tersembunyi (`data-fade-start`/`data-fade-end` dari posisi geser; lebar gradasi bertransisi lewat `@property`). Di bawah rel: garis posisi 3px biru brand polos di lintasan biru tipis (lebar = porsi terlihat), ditulis langsung ke DOM tiap event scroll. Gerak lain: ubin masuk bergiliran sekali (70ms per ubin), hover naik 2px (pointer saja). ≤4 program → tanpa panah, garis posisi, dan gradasi. Reduced motion: tanpa animasi masuk/transisi, panah menggeser seketika.
- **Tablet ≤1068px**: rel program melebar penuh di bawah teks dan foto (kolom kiri terlalu sempit untuk 4 ubin); foto `clamp(300px, 42vw, 460px)`.
- **Mobile ≤734px**: satu kolom (teks → foto 320px → program); rel program sampai tepi layar (ubin 132px, ubin berikutnya mengintip), tanpa tombol panah. Pita latar hanya di belakang foto: SVG jadi item grid di sel `profile`, dilebarkan 1600/1100 kali lebar layar dan digeser ke kiri sehingga yang tampil potongan kanan gambar (x 500–1600) — turun dari kiri atas foto lalu keluar tepi kanan, tidak menyentuh teks. Jarak ikon media sosial → foto 16px.
- **Loading**: placeholder berdenyut seukuran foto, pil status, dan 4 ubin (tanpa denyut saat reduced motion).

### Galeri Layanan & Potensi Desa (Beranda)

Gaya galeri apple.com ("Endless entertainment."). Folder: `_com/main-page/layanan-potensi/` — `index.tsx` (section, data, timer), `GalleryRow.tsx` (baris loop + swipe), `GalleryControls.tsx` (titik + progress + jeda), `use-loop-carousel.ts` (state baris), `use-wheel-step.ts` (geser trackpad), `gallery.logic.ts` (helper murni, dites di `__tests__/api/layanan_potensi_gallery_logic.test.ts`), `gallery.module.css`, `gallery.text.ts` (label).

- **Isi**: judul "Layanan dan Potensi Desa" tanpa subteks. Baris atas = Layanan (`suratKeterangan.findMany`), baris bawah = Potensi (`potensiDesa.findMany`), masing-masing limit default 10.
- **Bentuk**: kartu tanpa radius. Desktop: atas 49% lebar (rasio 976:522), bawah 18.4% (16:9). ≤1068px: 64% / 28%. Mobile ≤734px: kartu potret 69% (550:992) / 47% (3:4), caption + pill di tengah bawah.
- **Gerak**: tiap 5 detik kedua baris maju 1 kartu bersamaan; kartu aktif selalu di tengah lewat satu `translateX(50% - w/2 - index·(w+gap))`. Track jangan diberi padding: `flex-basis` % mengacu ke content box track, `translate` % ke border box — padding membuat kartu mengecil dan tidak di tengah. Loop: item diulang di track, setelah `transitionend` indeks lompat tanpa animasi ke salinan tengah.
- **Titik + progress**: 5 titik, titik aktif (panjang) selalu di tengah. Titik aktif berisi progress bar abu-abu → hitam linear 5 detik; `animationend`-nya adalah jam putar otomatis (bukan `setInterval`), jadi jeda membekukan bar di tempat dan lanjut dari situ. Saat maju, strip bergeser 1 titik (kunci = `position` kumulatif yang tak dinormalkan) sehingga titik kanan meluncur ke tengah dan memanjang.
- **Geser**: sentuh/pen = swipe; trackpad dua jari (atau Shift+scroll) di atas baris = 1 kartu per gerakan termasuk momentum. Kunci per gerakan dibuka oleh jeda hening 160ms **atau** deteksi gerakan baru (`WHEEL_GESTURE`: melemah lalu naik lagi, lonjakan >2×, atau berbalik arah) — momentum macOS bisa 1–2 detik, jadi tanpa deteksi ini geser cepat beruntun tertelan. Geser baris mana pun atau klik titik → **kedua baris** bergeser bersama sejauh langkah yang sama (`stepAll` di `index.tsx`); hanya fokus keyboard ke kartu samping yang menggeser barisnya sendiri. Gestur "Back" browser dicegah dengan `overscroll-behavior-x: none` di `<html>` selama kursor di atas baris (lapis utama — Chrome hanya mengizinkan `preventDefault` pada event wheel pertama satu gerakan, jadi `preventDefault` saja tidak cukup) + `preventDefault` pada event dominan horizontal. Scroll vertikal tetap jalan; di luar galeri gestur Back normal.
- **Jeda**: tombol pause, fokus keyboard di kartu, tab tidak aktif, `prefers-reduced-motion` (tanpa gerak otomatis & tanpa transisi). Hover tidak menjeda. Geser atau klik titik mengulang progress dari 0.
- **Aksesibilitas**: hanya salinan tengah yang bisa di-Tab/terbaca screen reader; fokus keyboard ke kartu samping membawanya ke tengah.

### Kabar Desa (Beranda)

Berita + pengumuman terbaru, tepat di bawah Landing (hero) dan di atas APBDes. Menggantikan panel melayang "Berita & Pengumuman" (`ModernNewsNotification`, dihapus beserta polling 30 detiknya). Folder: `_com/main-page/kabar-desa/` — `index.tsx` (section), `KabarBerita.tsx` (utama + kartu), `KabarPengumuman.tsx` (daftar), `use-kabar-data.ts` (hook), `kabar.source.ts` (fetch + validasi respons), `kabar.logic.ts` (helper murni), `kabar.meta.ts` (limit, rute, warna), `kabar.text.ts`, `kabar.module.css`, `kabar.pengumuman.module.css`. Test: `__tests__/api/kabar_desa_logic.test.ts`.

- **Sumber data**: `GET /api/desa/berita/find-many` (limit 4) dan `/api/desa/pengumuman/find-many` (limit 3) — keduanya sudah filter `isActive` dan urut `createdAt desc`. Dimuat paralel; satu gagal → bagian itu saja disembunyikan, keduanya gagal → pesan galat. `deskripsi` berita (HTML editor) ditampilkan sebagai teks polos (`htmlToText`), bukan `innerHTML`.
- **Bentuk**: latar putih, isi selebar layar tanpa max-width dengan jarak tepi 24px di semua ukuran, kepala **rata kiri** sejajar tepi grid: judul "Kabar Desa" 40px (tablet 36, mobile 28) warna `blue-button` di kiri, tautan "Lihat semua berita ›" (17px, mobile 15px) → `/darmasaba/pemerintahan/berita/semua` di kanan (hanya bila ada berita), tanpa subjudul, jarak ke kartu 24px. Padding atas section 56px (mobile 40px). Kartu/panel `#f5f5f7` tanpa border/bayangan; kartu berita (dan fotonya) **bersudut lancip tanpa radius** (senada tile Prestasi), panel pengumuman radius 18px.
- **Berita utama**: berita terbaru, satu kartu-tautan 2 kolom (foto 3fr | teks 2fr, tinggi min `clamp(440px, 32vw, 620px)`; tablet 320px): baris meta kategori (warna brand) · tanggal (12px kapital), judul 32px maks 4 baris, ringkasan 17px abu maks 3 baris.
- **Kartu kecil**: 3 berita berikutnya, grid 3 kolom gap 20px, foto 16:10 di atas, meta + judul 19px maks 3 baris. Tanpa foto → ikon koran abu di latar `#e8e8ed`. Hover (pointer saja): foto zoom 1.03 700ms + judul bergaris bawah; mati saat reduced motion.
- **Pengumuman**: panel berjudul "Pengumuman" + tautan "Semua pengumuman ›" (`/darmasaba/pemerintahan/pengumuman`), 3 baris (judul 1 baris · tanggal · chevron) dipisah garis tipis. Pengumuman tidak punya foto di schema.
- **Tautan detail**: `/darmasaba/pemerintahan/berita/{kategori}/{id}` dan `/darmasaba/pemerintahan/pengumuman/{kategori}/{id}`; kategori di-`encodeURIComponent`, kosong → `umum` (halaman detail hanya membaca `id`).
- **Tanggal**: ringkas `3 Nov 2026`, zona WITA (`DESA_TIME_ZONE` dari `apbdes.logic.ts`).
- **Mobile ≤734px**: berita utama bertumpuk (foto 16:9 di atas); 3 kartu kecil jadi baris geser horizontal sampai tepi layar (`scroll-snap`, kartu 78% lebar, kartu berikutnya mengintip); baris pengumuman: judul maks 2 baris, tanggal di bawahnya.
- **Loading**: placeholder abu berdenyut seukuran kartu & baris (tanpa denyut saat reduced motion).

### APBDes (Beranda & halaman detail)

Gaya bersih apple.com. Folder: `_com/main-page/apbdes/` — `index.tsx` (section, tahun, data), `components/ApbdesSummary.tsx` (3 kartu), `components/ApbdesChart.tsx` (`@mantine/charts` BarChart), `components/ApbdesDetail.tsx` (accordion rincian), `components/ApbdesSkeleton.tsx`, `apbdes.logic.ts` (helper murni, dites di `__tests__/api/apbdes_beranda_logic.test.ts`), `apbdes.meta.ts` (ikon + warna kategori), `apbdes.text.ts` (label), `apbdes.module.css` (section, kartu, panel, dokumen), `apbdes.detail.module.css` (accordion + baris rincian).

- **Bentuk**: latar putih, isi max-width 1100px, kartu/panel `#f5f5f7` radius 18px tanpa border/bayangan. Judul 48px (mobile 32px) warna `blue-button`, subjudul abu `#6e6e73`. Tahun dipilih lewat `SegmentedControl` di tengah (teks "Tahun X" bila hanya satu tahun). Di bawahnya "Data diperbarui {tanggal}" (abu 14px) = waktu terbaru dari `updatedAt` APBDes, item, dan realisasi (`latestUpdate`), format panjang zona WITA (`Asia/Makassar`).
- **Ringkasan**: 3 kartu Pendapatan / Belanja / Pembiayaan — ikon Tabler (`IconCash`, `IconReceipt2`, `IconBuildingBank`, tanpa emoji) dalam lingkaran tint, pagu ringkas (`Rp 23,14 M`) + penuh, progress tipis 6px, persen realisasi. Warna aksen per kategori (teal / biru brand / oranye) **netral**: realisasi rendah atau 0 tidak diberi merah — 0 ditulis "Belum ada realisasi".
- **Angka**: satuan ringkas Indonesia Rb/Jt/M/T (bukan B), Rupiah penuh `Rp 1.234.567`, persen `8,8%`.
- **Total kategori** = jumlah item akar (kode yang bukan turunan kode lain). Data bisa berhirarki (4 → 4.1 → 4.1.1) di mana induk sudah memuat jumlah anaknya; menjumlah semua item menghitung ganda. Realisasi baris = realisasi item + turunannya.
- **Grafik**: pagu (`blue-button-3`) vs realisasi (`blue-button`), legend di atas, grid horizontal, sumbu ringkas, tooltip Rupiah penuh. Bila realisasi tahun itu kosong muncul catatan di bawah grafik.
- **Rincian**: `Accordion multiple` per kategori (tertutup awal), header = jumlah pos + pagu ringkas. Desktop: header kolom kecil (Uraian / Realisasi / Anggaran) lalu baris kode 72px | uraian (indentasi 16px per tingkat, induk tebal) | realisasi 220px (bar 6px warna aksen kategori + persen, nominal realisasi di bawahnya bila > 0) | anggaran 168px rata kanan. Pos beranggaran 0 tanpa bar. Tablet ≤1068px: kolom 64/160/150px. Mobile ≤734px: header kolom disembunyikan; di bawah uraian berturut-turut anggaran, bar + persen, "Realisasi Rp …" — tanpa scroll horizontal.
- **Gerak**: konten fade + naik 6px 280ms tiap ganti tahun (`key=tahun`); progress bar transisi lebar 600ms. `prefers-reduced-motion`: keduanya mati. Loading = skeleton (bukan overlay).
- **CTA**: pill "Lihat semua data APBDes" → `/darmasaba/apbdes`, di bawah section.
- **Halaman detail** `(tambahan)/apbdes/page.tsx`: memakai `ApbdesBody` (`components/ApbdesBody.tsx`) + hook `use-apbdes-data.ts` yang sama dengan beranda, `variant="full"` (beranda `"compact"`). Bedanya: `BackButton` di atas, judul `h1`, accordion terbuka semua sejak awal, kolom kelima **Lebih/(Kurang)** = anggaran − realisasi gabungan (desktop 72 | uraian | 200 | 160 | 160px; tablet 56/140/140/140; mobile baris ke-4 di bawah realisasi), dan panel dokumen (`components/ApbdesDocument.tsx`: gambar 160px rasio 3:4 + tombol "Unduh dokumen") yang hanya muncul bila tahun terpilih punya `file`/`image`.

### Prestasi dan Penghargaan Desa (Beranda & halaman gabungan)

Section Penghargaan & Prestasi lama **digabung** (frontend dulu; tabel backend masih dua). Folder: `_com/main-page/prestasi/` — `index.tsx` (section beranda), `PrestasiHero.tsx` (video), `PrestasiGrid.tsx` (tile), `PrestasiListPage.tsx` (halaman gabungan), `use-prestasi-data.ts` (hook), `prestasi.source.ts` (**adapter sementara** dua endpoint), `prestasi.logic.ts` (helper murni), `prestasi.meta.ts` (limit, rute, video, warna), `prestasi.text.ts`, `prestasi.module.css`, `prestasi.page.module.css`. Test: `__tests__/api/prestasi_penghargaan_logic.test.ts`, `__tests__/api/prestasi_penghargaan_source.test.ts`.

- **Sumber data**: `find-many` prestasi desa + penghargaan (keduanya urut `createdAt desc`). Halaman *p* ukuran *n* = ambil *p×n* teratas tiap sumber → gabung urut terbaru → potong (`pageWindow` + `mergeNewest`); total = jumlah kedua total. Entri dobel antar-tabel **tidak** disaring (bersihkan datanya). Saat backend menyatukan tabel, cukup ganti isi `prestasi.source.ts` (keluaran `PrestasiPage` tetap).
- **Hero**: video `award.mp4` apa adanya + poster `mangupuraaward.jpeg`, lapisan gelap `rgba(0,0,0,.6)→.85` dan tinggi min 720px (mobile 500px) sama seperti section Penghargaan lama. Teks putih di tengah: judul "Prestasi dan Penghargaan Desa" 56px (tablet 48, mobile 36), subtext 21px (19/17) maks 680px, pill CTA brand "Selengkapnya" → `/darmasaba/prestasi-desa`. Video `preload="none"`, diputar hanya saat terlihat (`useInViewport`), tidak autoplay bila `prefers-reduced-motion`; tombol jeda/putar bulat 36px kanan bawah (WCAG 2.2.2).
- **Grid**: 4 entri terbaru gabungan, 2 kolom, gap 10px, tile 16:10 tanpa radius; seluruh tile = tautan ke detail sesuai sumber (`/darmasaba/prestasi-desa/{id}` atau `/darmasaba/penghargaan/{id}`), judul `name` kiri bawah (28px, tablet 24, mobile 21; maks 3 baris) di atas gradasi gelap. Ganjil → tile terakhir lebar 2 kolom (21:9); kosong → grid disembunyikan. Loading = placeholder abu. Mobile ≤734px: 1 kolom, tile 4:3. Hover foto zoom 1.03 700ms (mati saat reduced motion).
- **Halaman gabungan** `/darmasaba/prestasi-desa`: latar putih, kepala max-width 1100px (kembali, judul `h1` 48px warna brand, subtext abu, cari 320px di kanan — mobile di bawah), grid tile yang sama, 8 per halaman + `Pagination` bila > 1 halaman. Cari debounce 400ms ke kedua sumber. `/darmasaba/penghargaan` dialihkan ke halaman ini; halaman detail `[id]` keduanya tetap. Menu navbar Desa → "Prestasi dan Penghargaan".

### Desa Anti Korupsi (Beranda)

Gaya bersih apple.com, pola halaman spesifikasi. Folder: `_com/main-page/desaantikorupsi/` — `index.tsx` (section), `AntiKorupsiGroups.tsx` (panel grup), `use-antikorupsi-data.ts` (hook atas `korupsiState`), `desaantikorupsi.logic.ts` (helper murni), `desaantikorupsi.meta.ts` (limit, rute, warna), `desaantikorupsi.text.ts`, `desaantikorupsi.module.css`. Test: `__tests__/api/desa_anti_korupsi_logic.test.ts`.

- **Sumber data**: `korupsiState.desaAntikorupsi.findMany.load()` (default limit 10, urut `name asc`), tampil 6 butir pertama (`ANTIKORUPSI_LIMIT`).
- **Teks**: data desa tersimpan HURUF KAPITAL dan diawali nomor indikator (`1.1 ADANYA ...`). Tampilan: nomor dipisah (`splitIndicatorNumber`), teks & nama kategori jadi sentence case (`toSentenceCase`, hanya bila teks tak memuat huruf kecil sama sekali) dengan ejaan singkatan dipertahankan lewat `KEEP_CASE_TERMS` (Perdes, SOP, APBDes, RKP, SKM, Trantibumlinmas). Data di DB tidak diubah. Nama dirender sebagai teks, bukan `innerHTML`.
- **Bentuk**: latar putih, isi max-width 1100px, kepala tengah: judul `h2` 40px (tablet 36, mobile 28) warna `blue-button` + pengantar abu 19px (mobile 17). Satu panel `#f5f5f7` radius 18px tanpa border/bayangan; tiap kategori = satu grup (`groupByKategori`, urutan kemunculan) dipisah garis tipis: nama kategori `h3` 21px di kolom kiri 260px (tablet 200px), butir di kanan = nomor brand 600 tabular + teks 17px, antarbutir garis tipis. Tanpa ikon. Mobile ≤734px: nama kategori di atas butirnya.
- **CTA**: pill "Selengkapnya ›" → `/darmasaba/desa-anti-korupsi/detail`, di bawah panel.
- **Loading / kosong**: 6 baris placeholder abu berdenyut (tanpa denyut saat reduced motion); data kosong → satu pesan "Belum ada indikator desa anti korupsi.".

### Desa Anti Korupsi — halaman detail (`/darmasaba/desa-anti-korupsi/detail`)

Daftar indikator per kategori, tiap indikator berisi surat (PDF). Folder `(tambahan)/desa-anti-korupsi/`: `detail/page.tsx` (muat `findMany.load(1, 100)`, state kategori, Suspense) → `_com/AntiKorupsiKategoriPills.tsx` (pil) + `_com/AntiKorupsiDokumenList.tsx` (daftar + kerangka), `_com/antikorupsi-detail.logic.ts` (`toDokumenRows`, `documentHref`, `documentType`, `kategoriNames`, `countByKategori`, `countDokumen`), `_com/antikorupsi-detail.text.ts`, `_com/antikorupsi-detail.module.css`; tab kategori dari `_lib/kategori-tab.ts` (`?kategori=` tetap). Teks memakai `toSentenceCase`/`splitIndicatorNumber` dari section beranda. Test: `__tests__/api/desa_anti_korupsi_detail.test.tsx`, `__tests__/api/desa_anti_korupsi_kategori_tab.test.ts`.

- **Bentuk**: latar putih, isi max-width 1100px, kepala rata kiri (pola Potensi): tombol kembali, `h1` 48px (tablet 40, mobile 32) warna brand, pengantar abu 19px (17). Pil kategori sentence case + angka jumlah (`#f5f5f7` → aktif latar brand, `aria-pressed`); mobile ≤734px pil satu baris digeser horizontal dan pil aktif digeser ke tengah. Di bawahnya `h2` nama kategori 28px (mobile 24) + "x dari y dokumen tersedia" abu kanan, lalu satu panel `#f5f5f7` radius 18px: baris nomor brand tabular | teks 17px | aksi dokumen, antarbaris garis tipis. Mobile: aksi pindah ke bawah teks.
- **Dokumen**: sumber = relasi opsional `DesaAntiKorupsi.file` (admin: edit indikator → unggah dokumen; tersimpan di MinIO, link `/api/fileStorage/findUnique/...` dilayani inline). Ada file dengan link aman (relatif `/…` atau http(s); `documentHref`) → **seluruh baris tautan** `target="_blank"` ke file, pil putih "Buka PDF ↗" (ikon PDF; jenis lain → ekstensi, mis. "Buka DOCX") yang jadi brand saat hover. Tanpa file → baris bukan tautan, pil abu ikon jam + "Dokumen belum tersedia" — tempat ini terisi sendiri begitu admin mengunggah surat.
- **Loading / kosong**: 5 baris placeholder berdenyut (tanpa denyut saat reduced motion); data kosong → "Belum ada indikator desa anti korupsi."; kategori tanpa butir → "Belum ada indikator untuk kategori ini.".

### SDGs Desa (Beranda)

Folder: `_com/main-page/sdgs/` — `index.tsx` (section), `SdgsCards.tsx` (kartu + skeleton), `use-sdgs-data.ts` (hook), `sdgs.logic.ts` (helper murni, dites di `__tests__/api/sdgs_desa_logic.test.ts`), `sdgs.meta.ts` (endpoint, limit, rute, warna), `sdgs.text.ts`, `sdgs.module.css`.

- **Sumber data**: `GET /api/landingpage/sdgsdesa/findMany` (respons paginasi default 10, sudah filter `isActive`). `jumlah` = string skor dari admin; dibaca `parseSkor` (titik atau koma desimal, kosong/tidak valid → dibuang), lalu 4 skor tertinggi (`pickTopSdgs`, skor sama = urutan asal). Label skor ditampilkan apa adanya.
- **Bentuk**: latar `#f5f5f7`, isi max-width 1100px, kepala di tengah: judul `h2` "SDGs Desa" 40px (mobile 32) warna `blue-button` + paragraf abu 19px (mobile 17). Keterangan kecil "Tujuan dengan skor tertinggi" di atas kartu. Kartu putih radius 18px tanpa border/bayangan, grid 4 kolom (≤1068px 2 kolom): ikon SDG 72px (`alt` = nama tujuan; tanpa gambar → kotak abu `#e8e8ed`), nama tujuan 17px/600 rata kiri, lalu "Skor" (14px abu) + angka 40px/700 (tablet 32) di dasar kartu (`margin-top: auto`) sehingga sejajar antar kartu. Skor **bukan** heading.
- **Mobile ≤734px**: 1 kolom, kartu baris — ikon 64px kiri, nama + skor (28px) kanan.
- **CTA**: pill "Jelajahi semua tujuan SDGs Desa" → `/darmasaba/sdgs-desa` (pola `.ctaLink` APBDes).
- **Loading / kosong**: 4 skeleton kartu; kosong atau gagal → satu pesan di panel putih (galat dicatat `console.error`).

### Indeks Kepuasan Masyarakat (Beranda)

Gaya bersih apple.com, sejalan APBDes. Folder: `_com/main-page/kepuasan/` — `index.tsx` (section tipis), `use-kepuasan-data.ts` (hook: muat `responden.findMany` halaman 1 limit 1000 + ringkasan), `components/KepuasanCharts.tsx` (susunan grafik), `components/KepuasanMonthlyChart.tsx` (BarChart per bulan + total), `components/KepuasanDonutCard.tsx` (DonutChart + legenda), `components/KepuasanEmpty.tsx`, `components/KepuasanSkeleton.tsx`, `components/CtaButton.tsx`, `components/RespondenFormModal.tsx` (form "Ajukan Responden"), `kepuasan.logic.ts` (helper murni), `kepuasan.meta.ts` (kategori + warna, limit), `kepuasan.text.ts`, `kepuasan.module.css`. Test: `__tests__/api/kepuasan_logic.test.ts`, `__tests__/api/kepuasan_ui.test.tsx`, `__tests__/api/ikm_responden_create_status.test.ts` (status `create()`).

- **Bentuk**: latar putih, isi max-width 1100px, judul 40px (mobile 32px) warna `blue-button` + paragraf pengantar abu 19px (mobile 17px), rata tengah. Panel/kartu `#f5f5f7` radius 18px tanpa border/bayangan.
- **Ada data**: panel "Responden per bulan" (h3 + keterangan, total responden server 40px di kanan; mobile di bawah judul) berisi grafik batang `blue-button` (sumbu bulan ringkas "Mar 2026", tooltip "Maret 2026"). Di bawahnya 3 kartu (Jenis kelamin / Ulasan / Umur; mobile 1 kolom): donat 168px + legenda jumlah & persen (semua kategori, termasuk 0 / 0%). Jenis kelamin & umur: palet satu rona biru brand gelap → terang. Ulasan: skala rating standar baik → buruk dari token tema Mantine — Sangat Baik `green.8`, Baik `lime.8`, Kurang Baik `orange.6`, Sangat Kurang Baik `red.8`, rating tak dikenal `gray.6` (`ratingColor` di `kepuasan.meta.ts`). Donat hanya menggambar irisan bernilai > 0 (`donutSlices`); bila tinggal satu irisan, garis pemisah 0 (`donutStrokeWidth`) — recharts menutup irisan penuh dengan sisi radial di jam 3 yang ikut ber-stroke. Pil "Ajukan Responden" di bawah section.
- **Kategori** dicocokkan dari nama opsi (tanpa beda huruf besar/kecil) dengan daftar tetap di `kepuasan.meta.ts`; nama opsi baru buatan admin tidak muncul di grafik sampai daftar ditambah.
- **0 responden**: satu kartu pesan "Belum ada responden" + pil "Ajukan Responden"; tanpa grafik kosong.
- **Form** (`RespondenFormModal`): field Nama, Jenis Kelamin, Rating, Kelompok Umur (wajib, bertanda bintang). Kontrak payload tetap — `indeksKepuasanState.responden.create.form` `{ name, tanggal, jenisKelaminId, ratingId, kelompokUmurId }` lalu `create.create()`; `tanggal` diisi otomatis saat submit = hari ini jam lokal `YYYY-MM-DD` (`todayLocalIsoDate`, bukan `toISOString` yang mundur sehari di WITA 00:00–07:59). `create()` mengembalikan `true`/`false`; form direset + modal ditutup hanya bila `true` (`submitResponden`), bila gagal isian tetap. Setelah percobaan submit pertama field wajib yang kosong menampilkan pesan (`missingFormFields`, teks sama dengan zod store). Tombol Submit `loading` selama `create.loading`. Form admin create/edit responden tetap memakai input tanggal manual.

### Footer

```tsx
Stack bg="linear-gradient(180deg, #1C6EA4, #124170)"
  SimpleGrid cols={{ base:1, sm:2, md:4 }}
    // Tentang Darmasaba
    // Layanan Desa
    // Tautan Penting
    // Berlangganan
```

### Potensi Desa (`/darmasaba/pemerintahan/potensi`)

Folder `(pages)/pemerintahan/potensi/`: `page.tsx` (tombol kembali + `_com/PotensiHeader.tsx`, state saring; muat `findMany.load(1, POTENSI_LIST_LIMIT)` = 100 agar semua potensi tampil, bukan default 10) → `_com/PotensiGrid.tsx` (grid + kerangka) → `_com/PotensiCard.tsx` (kartu) dan `_com/PotensiDetailModal.tsx` (overlay) + `_com/PotensiDetailInfo.tsx` (info + dokumentasi), `_com/potensi.logic.ts` (tipe, `htmlToPlainText`, `sanitizePotensiHtml`, `potensiInfoRows`, `dokumentasiImages`), `_com/potensi.text.ts`, `_com/potensi.meta.ts` (variabel warna brand di akar halaman), `_com/potensi.module.css` (kartu), `_com/potensi-header.module.css` (kepala), `_com/potensi-detail.module.css` (overlay). Data `potensiDesa.findMany` (`name`, `deskripsi`, `content`, `kategori`, `image`; `lokasi`, `pengelola`, `status`, `dokumentasi` **belum ada di backend** — TODO(potensi-info)). Test: `__tests__/api/potensi_desa_ui.test.tsx`.

- **Kepala**: judul `h1` 48px (mobile 32) warna brand, pengantar 19px (17) abu `#515154` rata kiri maks 640px, lalu **pil saring** "Semua · Potensi · Wisata" dengan angka jumlah di dalam pil (menggantikan kotak angka biru). Wisata = kategori bernama "wisata" (abaikan huruf/spasi), sisanya Potensi (`countByFilter`, `filterPotensi`). Pil: tinggi 40px, putih 70% → aktif latar brand teks putih; `role="group"` + `aria-pressed`; selama memuat pil nonaktif tanpa angka. Saring di klien (semua data sudah dimuat); hasil kosong → "Belum ada data di kategori …".
- **Kartu**: putih radius 24px, bayangan lembut; foto 4:3 dengan pil kategori putih kiri atas dan judul `name` **selalu tampil** kiri bawah (24px, tablet/mobile 22; maks 2 baris) di atas gradasi gelap — pola tile Prestasi. Di bawah foto: `deskripsi` sebagai teks polos (tag editor dibuang, maks 3 baris, 15px abu) lalu pil brand "Lihat Detail →". Grid 3/2/1 kolom (≤1068 / ≤734px), gap 28/24/20px. Hover: bayangan menebal + foto zoom 1.04 (mati saat reduced motion).
- **Klik**: area klik seluruh kartu (`::after` tombol), satu kontrol fokus `button aria-haspopup="dialog"`. Membuka **overlay**, bukan pindah ke `/darmasaba/pemerintahan/potensi/{id}` (rute detail tetap ada karena galeri beranda masih menautkannya).
- **Overlay**: `Modal.Root` Mantine 760px radius 28px, latar halaman di-blur (`Modal.Overlay` blur 10px, gelap 45%), transisi pop 220ms. Hero foto 16:8.5 (mobile 4:3) + gradasi; pil kategori gelap transparan huruf kapital + judul (`Modal.Title`, 40px / tablet 34 / mobile 28) kiri bawah; tombol × bulat 44px kanan atas. Isi (tanpa label judul): `content` yang disanitasi DOMPurify (tag `p, br, strong, em, u, ul, ol, li`, sama dengan admin; kosong → "Belum ada deskripsi…"), lalu `<dl>` 3 kotak abu muda radius 16px **Lokasi · Pengelola · Status** (label 13px abu, nilai 16px semibold; Status hijau `#1f8a4c`; kosong → "–" abu + teks pembaca layar "Belum ada data"; mobile bertumpuk 1 kolom), lalu label "DOKUMENTASI" + grid foto 3 kolom (mobile 2) 16:10 radius 16px — **disembunyikan bila tak ada foto**. Tutup: ×, Escape, klik luar. Kelas kartu putih dipasang lewat `classNames.content` (bukan `className` `Modal.Content`, yang ikut ke lapisan inner selebar layar).

### Peta Informasi (`/darmasaba/peta-informasi`)

Folder `(tambahan)/peta-informasi/`: `page.tsx` tipis → `_com/PetaInformasi.tsx` (H1, `TextInput` berlabel "Saring halaman", ringkasan `aria-live`, `SimpleGrid` 1/2/3 kolom) → `_com/PetaInformasiGroupCard.tsx` (kartu per menu utama: H2 + `<ul>/<li>` `Anchor component={Link}`). Data dari `_lib/petaInformasi.ts` atas config yang sama dengan pencarian (`DEFAULT_SEARCH_MENUS` = navbar lalu `search-extra-pages.ts`): grup senama digabung, href ganda & halaman peta sendiri dibuang, saring lewat `searchMenu` tanpa API. Pintu masuk: footer "Tautan Penting", entri pencarian "Peta Informasi (Semua Halaman)", dan tautan "Buka Peta Informasi" di keadaan "Tidak ada hasil". Dites di `__tests__/api/peta_informasi.test.ts`.

### Profil PPID (`/darmasaba/ppid/profil-ppid`)

Satu file `(pages)/ppid/profil-ppid/page.tsx` + `profil-ppid.module.css`; data `stateProfilePPID.profile.load('edit')` (`name`, `image`, `biodata`, `riwayat`, `pengalaman`, `unggulan` — HTML dari editor admin). Test: `__tests__/api/profil_ppid_ui.test.tsx`.

- **Grid 2 kolom mulai `lg` (Mantine 75em = 1200px)**, 1 kolom di bawahnya. Kiri: kartu foto + nama. Kanan, berurutan: Biografi, Riwayat Karir, Pengalaman Organisasi, Program Unggulan — keempatnya satu kolom agar tinggi kedua kolom seimbang (sebelumnya Organisasi & Program selebar kartu di bawah grid sehingga ada ruang kosong di bawah Riwayat Karir). Isi keempat section ukuran huruf sama: 1rem / md 1.1rem / lg 1.2rem, **rata kiri** (bukan justify — di kolom ±400px dan ponsel justify melebarkan celah antarkata).
- **Kartu foto sticky** (`top` = navbar desktop 44px + 32px) hanya di ≥75em — breakpoint ditulis literal, bukan `$mantine-breakpoint-lg` (80em di `postcss.config.js`), agar sama persis dengan breakpoint grid. Di 1 kolom sticky dimatikan karena akan menutupi teks di bawahnya.

### Struktur Organisasi PPID (`/darmasaba/ppid/struktur-ppid`)

Bagan hierarki atas-ke-bawah (pola "Hierarchical Structure") dengan kartu ala referensi BKHM, menggantikan bagan PrimeReact `OrganizationChart` (meluber ±1700px, hanya menggambar akar pertama) beserta kontrol Zoom/Fullscreen. Folder `(pages)/ppid/struktur-ppid/`: `page.tsx` (muat `pegawai.findMany.load(1, 100)` + `posisiOrganisasi.findManyAll.load()`, saring debounce 300ms) → `_com/StrukturHeader.tsx` (kepala), `_com/StrukturChart.tsx` (bagan + kerangka), `_com/StrukturCard.tsx` (kartu), `_com/struktur.logic.ts` (`buildOrgTree`, `filterOrgTree`, `leafSlot`, `toneForDepth`), `_com/struktur.meta.ts` (limit, `LEAF_COLS`, rute profil, variabel warna), `_com/struktur.text.ts`, CSS `struktur-header` / `struktur-chart` / `struktur-card.module.css`. Test: `__tests__/api/struktur_ppid_logic.test.ts`, `__tests__/api/struktur_ppid_ui.test.tsx`.

- **Pohon**: satu simpul per jabatan dari pegawai **aktif**; jabatan berisi beberapa pegawai menggambar **satu kartu per pegawai** (`cardsOf`). Di grid daun tiap pegawai jadi satu kotak grid; jabatan yang punya bawahan menjajarkan kartunya dalam grup berpalang kecil (atas: dari atasan, bawah: ke bawahan), dan di ≤1068px kartunya bertumpuk dengan rel kiri menyambung ke kartu pertama. Pencarian nama hanya menyisakan pegawai yang cocok; pencarian jabatan menyisakan semua pegawainya. Jabatan induk yang belum punya pegawai diambil dari daftar jabatan dan digambar sebagai kotak redup bergaris putus "Belum ditugaskan" (tanpa tautan) supaya bawahannya tetap di bawah induknya. API jabatan tidak mengirim `parentId`, jadi kotak tanpa induk ditempel ke akar utama bila tingkatnya lebih rendah; selain itu jadi akar terpisah. Anak diurut `hierarki` lalu nama jabatan.
- **Kartu**: jabatan huruf kapital 13px/700 (akar 15px, maks 3 baris) + pil nama putih teks brand (maks 2 baris) di kiri; foto di kanan selebar tinggi kartu (`object-fit: cover`, fokus atas) dengan tepi kiri dipudarkan `mask-image` ke gradasi kartu — foto pegawai umumnya persegi berlatar tidak transparan. Tanpa foto → siluet `IconUserFilled` transparan. Ukuran (variabel di `.chart`, dibaca kartu): akar 440×176, bawahan bercabang 320×136, bawahan daun 290×120; radius 16px. Gradasi per tingkat (`--tone-*`): akar `#062F49→#0A4E78`, bawahan langsung `#0A4E78→#2F91CC`, selebihnya `#145F8F→#5DA9D8` (kiri digelapkan dari `#2F91CC` agar teks putih ≥ 4.5:1). Seluruh kartu = tautan ke `/darmasaba/ppid/struktur-ppid/{id}`; hover naik 3px + foto zoom 1.04 (mati saat reduced motion).
- **Garis**: `<ul>/<li>` bersarang + pseudo-element, warna solid `#8ba8c1` (garis transparan menggelap di titik tumpang-tindih). Bawahan yang punya bawahan → **baris berpalang** (turun dari induk, palang, turun ke tiap kartu). Bawahan yang semuanya daun → **grid** 2 kolom (≥1800px 4 kolom; `LEAF_COLS`, sengaja genap): garis induk turun di celah tengah sampai palang baris terakhir, tiap kartu menggambar palang dari tengahnya ke garis induk (`leafSlot().offset` × lebar kolom + celah). Jumlah ≤ kolom → satu baris biasa. Baris terakhir yang tidak penuh digeser ke tengah (`leafSlot().shift`). Bagan lebih lebar dari layar → geser horizontal (rata kiri), selain itu di tengah. Data stg: Kepala Desa → Kaur Umum (→ Kaur Keuangan) + Sekretaris (→ 5 Kadus: 2+2+1, ≥1800px 4+1), muat tanpa geser di 1200px.
- **Tablet & mobile ≤1068px**: semua bawahan bertumpuk berindentasi (40px, mobile 28px) dengan rel kiri, kartu selebar kolom maks 560px (mobile selebar layar, tinggi 148/128/116px); tanpa geser horizontal.
- **Kepala**: pola Potensi — `h1` 48px (mobile 32) brand, pengantar abu 19px (17) maks 640px, kotak cari pil 320px di kanan (≤1068px di bawah). Tidak ada yang cocok → "Tidak ada nama atau jabatan yang cocok dengan “…”".
- **Loading / kosong**: kerangka 1 + 2 kartu berdenyut; tanpa pegawai aktif → pesan + pil "Muat Ulang".

---

## 6. Layout Admin (`/admin/`)

File: `src/app/admin/layout.tsx`

Menggunakan Mantine `AppShell`:

```tsx
<AppShell
  header={{ height: 64 }}
  navbar={{
    width: { base: 260, sm: 280, lg: 300 },
    breakpoint: 'sm',
    collapsed: { mobile: !mobileOpened, desktop: !desktopOpened }
  }}
>
```

### Header (64px)

Background: `linear-gradient(90deg, #ffffff, #f9fbff)` (light) / dark equivalent.  
Konten: Logo + "Admin Darmasaba" | Spacer | Toggle sidebar (desktop) | Burger (mobile) | Link ke website | Tombol logout.

### Sidebar

`AppShellNavbar` dengan `ScrollArea`. Navigasi 2 level: parent item dan children.

Active state per `NavLink`:
```ts
borderLeft: `3px solid ${tokens.colors.primary}`
background: tokens.colors.bg.surface
```

Deteksi aktif: `useSelectedLayoutSegments()` dari Next.js App Router.

### Main

`AppShellMain` bg `#f6f9fc`.

---

## 7. Menu Navigasi

### Menu Public (10 domain)

File: `src/con/navbar-list-menu.ts`

| # | Menu | Jumlah Sub |
|---|---|---|
| 1 | PPID | 8 |
| 2 | Desa | 10 (termasuk Agenda & Kalender Desa, Monev & Pembangunan) |
| 3 | Kesehatan | 7 |
| 4 | Keamanan | 7 |
| 5 | Ekonomi | 11 (termasuk Kesejahteraan Masyarakat) |
| 6 | Inovasi | 6 |
| 7 | Lingkungan | 6 |
| 8 | Kependudukan | 5 |
| 9 | Pendidikan | 7 |
| 10 | Musik | 1 |

### Sidebar Admin

File: `src/app/admin/_com/list_PageAdmin.tsx` (re-export saja; data sebenarnya ada di `src/app/admin/_com/nav/domains.ts` dan dirakit di `src/app/admin/_com/nav/index.ts`)

Export: `navBar` (semua domain), `role1`, `role2`, `role3` (role-based subset), `devBar`.  
Logic pemilihan: `getNavbar({ roleId, menuIds })` — ada di `src/app/admin/(dashboard)/user&role/_com/dynamicNavbar.ts`, dipakai di `src/app/admin/layout.tsx`. Filter berdasarkan `menuIds` (dengan normalisasi ID) jika tersedia, fallback ke role (`roleId 0→devBar, 1→navBar, 2→role1, 3→role2, 4→role3`).

---

## 8. Komponen Shared Admin

File-file di `src/app/admin/(dashboard)/_com/` dan `src/components/admin/`:

### HeaderSearch

```tsx
// src/app/admin/(dashboard)/_com/header.tsx
<Grid>
  <Grid.Col span={{ base: 12, md: 9 }}>
    <UnifiedTitle order={3}>{judul}</UnifiedTitle>
  </Grid.Col>
  <Grid.Col span={{ base: 12, md: 3 }}>
    <TextInput radius="lg" leftSection={<IconSearch />} value={search} onChange={...} />
  </Grid.Col>
</Grid>
```

### JudulList

```tsx
// src/app/admin/(dashboard)/_com/judulList.tsx
<Grid>
  <Grid.Col span={11}>/* title */</Grid.Col>
  <Grid.Col span={1}>
    <Button leftSection={<IconCircleDashedPlus />} style={{ background: gradient }}>
      {namaTambah}
    </Button>
  </Grid.Col>
</Grid>
```

### JudulListTab

Grid 3 kolom (8/3/1) — title + search + create button. Untuk halaman yang memiliki Tab.

### ModalKonfirmasiHapus

```tsx
// src/app/admin/(dashboard)/_com/modalKonfirmasiHapus.tsx
<Modal centered opened={opened} onClose={onClose}>
  <Text>{text}</Text>
  <Group>
    <Button bg={colors['blue-button']} onClick={onClose}>Batal</Button>
    <Button color="red" onClick={onConfirm} loading={loading}>Yakin Hapus</Button>
  </Group>
</Modal>
```

State modal dikelola di page-level via `useState(false)`, bukan `useDisclosure`.

### UnifiedCard

```tsx
// src/components/admin/UnifiedSurface.tsx
<Paper bg={tokens.colors.bg.card} radius={tokens.radius.lg} withBorder>
  <UnifiedCard.Header />  {/* dengan divider */}
  <UnifiedCard.Body />
  <UnifiedCard.Footer />
</Paper>
```

### UnifiedTitle & UnifiedText

```tsx
// src/components/admin/UnifiedTypography.tsx
<UnifiedTitle order={3} color="primary">Judul</UnifiedTitle>
<UnifiedText size="body" weight="medium">Teks</UnifiedText>
<UnifiedPageHeader title="..." subtitle="..." action={<Button />} />
```

---

## 9. Pola Tabel Admin

Semua halaman list menggunakan pola ini secara konsisten:

```tsx
// Desktop (visibleFrom="md")
<Paper withBorder bg={colors['white-1']} p="lg" shadow="md" radius="md">
  <Group justify="space-between">
    <Title order={4}>Daftar [Entity]</Title>
    <Button leftSection={<IconPlus />} color="blue" variant="light">Tambah Baru</Button>
  </Group>
  <Table highlightOnHover layout="fixed">
    <Table.Thead><Table.Tr><Table.Th>...</Table.Th></Table.Tr></Table.Thead>
    <Table.Tbody>...</Table.Tbody>
  </Table>
</Paper>

// Mobile (hiddenFrom="md")
<Stack gap="sm">
  {items.map(item => (
    <Paper withBorder p="sm" radius="md">
      <Stack>
        <Box><Text size="xs" c="dimmed">Label</Text><Text>{value}</Text></Box>
        {/* ... */}
      </Stack>
      <Button fullWidth>Detail</Button>
    </Paper>
  ))}
</Stack>

// Pagination
<Center mt="md">
  <Pagination value={page} onChange={setPage} total={totalPages} color="blue" radius="md" />
</Center>
```

### Variant Action Buttons Tabel

- **Satu tombol "Detail"** → `router.push(/${item.id})` — dipakai di posyandu, lowongan
- **Pisah tombol** → `<Button color="green">Edit</Button>` + `<Button color="red">Hapus</Button>` atau `<ActionIcon>` — dipakai di event budaya, data banjar

---

## 10. Pola Form Admin

### Create

```tsx
<Box px={{ base: 0, md: 'lg' }} py="xs">
  <Group mb="md">
    <Button variant="subtle" onClick={() => router.back()}>
      <IconArrowBack color={colors['blue-button']} />
    </Button>
    <Title order={4}>Tambah [Entity]</Title>
  </Group>
  <Paper w={{ base: '100%', md: '50%' }} bg={colors['white-1']} p="lg" radius="md" shadow="sm">
    <Stack gap="md">
      <Dropzone maxSize={5 * 1024 ** 2} onDrop={...}>/* preview gambar */</Dropzone>
      <TextInput label="..." placeholder="..." required />
      <Select clearable searchable data={[...]} />
      <CreateEditor value={content} onChange={setContent} />
      <Group justify="right">
        <Button variant="outline" color="gray" onClick={resetForm}>Reset</Button>
        <Button
          disabled={!isFormValid() || isSubmitting}
          style={{ background: 'linear-gradient(135deg, #0A4E78, #4facfe)', boxShadow: '...' }}
        >
          {isSubmitting ? <Loader size="sm" color="white" /> : 'Simpan'}
        </Button>
      </Group>
    </Stack>
  </Paper>
</Box>
```

**Catatan penting**: Halaman form menggunakan `useState` manual + validasi di `handleSubmit` (`@mantine/form`/`useForm` tidak dipasang). Error feedback via `toast.error()` (react-toastify).

### Edit

Sama dengan Create, perbedaan:
- Data di-load dari state via `useEffect` saat mount
- Simpan `originalData` untuk tombol "Batal" (bukan "Reset")
- Success feedback: `toast.success('... berhasil diperbarui!')`

### Detail (`[id]/page.tsx`)

```tsx
<Paper bg="#ECEEF8">
  <Stack>
    {/* field-by-field display */}
    <Group>
      <Button color="green" onClick={() => router.push(`${id}/edit`)}>Edit</Button>
      <Button color="red" onClick={() => setModalHapus(true)}>Hapus</Button>
    </Group>
  </Stack>
</Paper>
```

---

## 11. Pola Tab Navigation

File: `src/app/admin/(dashboard)/kesehatan/posyandu/_com/layoutTabs.tsx`

```tsx
<Tabs variant="pills" color={colors['blue-button']} radius="lg"
  value={activeTab} onChange={handleTabChange}>
  <ScrollArea type="hover">
    <Tabs.List
      style={{
        background: 'linear-gradient(135deg, #e7ebf7, #f9faff)',
        borderRadius: '1rem',
        padding: '0.25rem'
      }}
    >
      <Tabs.Tab value="ringkasan">Ringkasan</Tabs.Tab>
      <Tabs.Tab value="data-posyandu">Data Posyandu</Tabs.Tab>
      {/* ... */}
    </Tabs.List>
  </ScrollArea>
  <Tabs.Panel value="..." style={{
    background: 'linear-gradient(180deg, #ffffff, #f5f6fa)',
    borderRadius: '1rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
  }}>
    {/* content */}
  </Tabs.Panel>
</Tabs>
```

Tab routing berbasis URL — setiap tab = path unik. Tab aktif dideteksi dari URL segment.

---

## 12. State Management

- **Valtio** (`proxy`, `useSnapshot`) — state dominan di project ini (180+ file), dipakai untuk semua domain (posyandu, kependudukan, ekonomi, dll) **dan** dark mode (`src/state/darkModeStore.ts` — bukan Zustand; Zustand tidak ada di dependencies)
- **Jotai** — ada di `package.json` tapi tidak dipakai sama sekali (0 import) — jangan dipakai untuk kode baru
- **SWR** — hanya dipakai di 1 file (`src/state/state-layanan.ts`), bukan pola umum

Pattern state per domain (contoh posyandu):
```ts
// src/app/admin/(dashboard)/_state/kesehatan/posyandu/posyandu.ts
const statePosyandu = proxy({
  list: { data: [], loading: false, page: 1, total: 0 },
  findUnique: { data: null, loading: false },
  create: { loading: false },
  edit: { data: null, loading: false },
})
```

---

## 13. Dark Mode

File: `src/utils/themeTokens.ts`, `src/state/darkModeStore.ts`

- State: `useDarkMode()` hook dari `src/state/darkModeStore.ts`
- Diterapkan via `themeTokens(isDark)` + props/style inline di komponen admin (mis. `src/app/admin/layout.tsx`). Color scheme Mantine sendiri tidak di-switch: satu-satunya `MantineProvider` aktif ada di `src/app/layout.tsx` (`defaultColorScheme="light"`).
- `src/components/admin/AdminThemeProvider.tsx` (pakai `forceColorScheme`) **tidak dipakai** (0 importer) dan tidak punya compat look Mantine 9 — jangan dipasang tanpa menyamakan theme-nya dengan `layout.tsx` (lihat `docs/decisions/2026-11-04-mantine-9-upgrade.md` §6).
- Semua komponen admin konsumsi `themeTokens(isDark)` untuk styling inline
- ⚠️ `src/styles/dark-mode-table.css` (hover tabel `[data-mantine-color-scheme="dark"] tr:hover`) **tidak aktif**: hanya di-import oleh `AdminThemeProvider.tsx` yang tidak dipakai, dan color scheme Mantine tidak pernah `dark`. Kandidat poles tampilan.
- Transisi: `transition: 'background 0.3s ease, border-color 0.3s ease'`
- Halaman publik tidak ada dark mode (fixed light)

---

## 14. Animasi & Efek Visual

### Glass Effect

Kartu kaca memakai `.glass3` (`src/app/globals.css`): `rgba(255,255,255,0.3)` + `backdrop-filter: blur(40px)`. Navbar punya gaya kaca sendiri di CSS module-nya.

Tulis `backdrop-filter` **tanpa** `-webkit-backdrop-filter` manual — Lightning CSS (Turbopack) menggabungkan keduanya jadi hanya versi `-webkit-` yang diabaikan Chrome. Dijaga test `__tests__/api/navbar_menu_logic.test.ts`.

### Splash Pembuka Beranda (Candi Bentar)

`src/app/darmasaba/_com/splash/` — kamera menembus celah Candi Bentar menuju cahaya fajar (±2,5 dtk), dipasang di beranda `/darmasaba`. `/` redirect server ke beranda.

- **Kapan tampil:** hanya bila beranda adalah halaman pendaratan dan belum dilihat di tab ini (`sessionStorage`). Skrip inline di `<head>` root layout menulis `<html data-gate-splash="play|skip">` sebelum paint; CSS menampilkan splash hanya saat `play`, jadi tak ada kedipan bagi yang tak perlu splash. Selesai → `done`.
- **Struktur:** `gate-splash.timeline.ts` (rencana animasi, data murni, diuji) → `gate-splash.player.ts` (Web Animations API per `data-part`) → `GateSplash.tsx`. Siluet = `gate-splash.path.ts` (hasil jiplak foto, jangan edit manual).
- **Batas performa:** zoom adegan selayar penuh ≤ `MAX_SCENE_SCALE` (1.25); tanpa `filter: blur`/`mix-blend-mode` selayar penuh. Browser me-raster layer animasi pada skala maksimalnya — di monitor 4K eksternal zoom besar melebihi memori GPU (gerbang/logo hilang). Yang dianimasikan harus elemen HTML (`<div>`), bukan `<svg>`: animasi transform pada `<svg>` berjalan di main thread dan tertinggal dari bagian lain saat beranda sibuk memuat (tembok terlepas dari gerbang). Uji gerak secara real-time (screencast), bukan screenshot yang di-pause.
- **Aksesibilitas & failsafe:** klik/tap/Escape melewati; "kurangi animasi" → fade saja; tanpa JS splash pudar sendiri setelah ±6 dtk.
- Dijaga test `__tests__/api/gate_splash.test.ts`.

### Framer Motion Patterns

```ts
// Card hover
whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}  // potensi, layanan
whileHover={{ scale: 1.05 }}                               // SDGs

// Stagger fade-up (beberapa halaman publik)
initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
transition={{ delay: index * 0.1 }}  // 0.1s, 0.2s, 0.3s, 0.4s
```

### Shadows

| Token | Nilai |
|---|---|
| `sm` | `0 1px 3px rgba(0,0,0,0.1)` |
| `md` | `0 4px 6px rgba(0,0,0,0.1)` |
| `lg` | `0 10px 15px rgba(0,0,0,0.1)` |

Dark mode: ganti alpha `0.1` → `0.3`.

---

## 15. Responsive Patterns

Breakpoint utama: `md` (~992px)

| Pattern | Mobile | Desktop |
|---|---|---|
| Navigasi admin | `Burger` + slide overlay | `AppShell Navbar` fixed |
| Tabel data | `Stack` kartu per row | `Table` `highlightOnHover` |
| Form create | `w="100%"` | `w="50%"` |
| Container publik | `w="100%"` | `w="80%"` |
| Grid kartu | `cols={1}` | `cols={2/4}` |

Props Mantine yang sering dipakai:
```tsx
visibleFrom="md"   // hanya tampil di ≥md
hiddenFrom="md"    // hanya tampil di <md
span={{ base: 12, md: 6 }}
fz={{ base: "sm", md: "lg" }}
p={{ base: "sm", md: "lg" }}
```

---

## 16. Konten Halaman Publik

### Landing Page

- Hero: identitas pemerintah desa, sambutan, status kantor, media sosial, foto Perbekel, rel program inovasi (lihat §5 "Hero Beranda")
- Berita terbaru (polling tiap 30 detik)

### Domain Utama

| Domain | Konten Utama |
|---|---|
| PPID | Profil, Struktur, Visi Misi, Dasar Hukum, Permohonan Informasi |
| Desa | Profil, Potensi, Berita, Pengumuman, Gallery, Layanan, Penghargaan, Agenda & Kalender Desa |
| Kesehatan | Data Posyandu (balita, ibu hamil, ringkasan), Puskesmas, Program, Info Wabah |
| Kependudukan | Dashboard statistik, Data Per Banjar, Dinamika, Distribusi Agama/Umur |
| Ekonomi | UMKM, Lowongan Kerja, BUMDesa, PADesa, Transparansi APBDes (grafik + tabel) |
| Keamanan | Data keamanan wilayah |
| Lingkungan | Bank Sampah, Penghijauan, Gotong Royong |
| Pendidikan | Data lembaga pendidikan |
| Inovasi | Inovasi desa |
| Musik | Koleksi musik/gamelan |

### Transparansi APBDes

Grafik interaktif (Recharts) + tabel per tahun. Komponen `Mantine Transition` fade-slide saat ganti tahun. Staggered animation pada section cards.

### Survey Kepuasan Masyarakat

Form survei + hasil via `Mantine BarChart` (per bulan) dan `DonutChart` (komposisi). Detail: §5 "Indeks Kepuasan Masyarakat (Beranda)".

---

## 17. Rich Text Editor

File: `src/app/admin/(dashboard)/_com/createEditor.tsx`, `editEditor.tsx`

Editor memakai **Tiptap 3**. Konfigurasi wajib (`StarterKit.configure({ link: false, trailingNode: false })`, `shouldRerenderOnTransaction: true`, `setContent(value, { emitUpdate: false })`) dan alasannya ada di `docs/decisions/2026-11-04-mantine-8-staged-upgrade.md` §3.

Wrapper `Mantine RichTextEditor` (`@mantine/tiptap`) dengan ekstensi:
- Format: Bold, Italic, Underline, Strikethrough, Highlight, Code
- Struktur: H1, H2, H3, H4, Blockquote, BulletList, OrderedList
- Link: Link, Unlink
- Alignment: Left, Center, Right, Justify
- History: Undo, Redo

---

## 18. Upload & Preview Gambar

Pattern di halaman Create/Edit:

```tsx
<Box style={{ border: '2px dashed #ccc', borderRadius: 8, position: 'relative' }}>
  {preview
    ? <>
        <Image src={preview} alt="preview" height={200} fit="contain" />
        <ActionIcon
          color="red" variant="filled"
          style={{ position: 'absolute', top: 8, right: 8 }}
          onClick={() => { setFile(null); setPreview(null) }}
        >
          <IconX />
        </ActionIcon>
      </>
    : <Dropzone maxSize={5 * 1024 ** 2} accept={IMAGE_MIME_TYPE} onDrop={handleDrop}>
        <Text ta="center">Klik atau seret gambar ke sini</Text>
      </Dropzone>
  }
</Box>
```

---

## 19. Notifikasi & Feedback

| Situasi | Komponen |
|---|---|
| Success CRUD | `toast.success('...')` — react-toastify |
| Error CRUD | `toast.error('...')` — react-toastify |
| Konfirmasi hapus | `ModalKonfirmasiHapus` (Modal centered) |
| Konfirmasi nonaktif | `ModalKonfirmasiNonAktif` |
| Loading submit | `<Loader size="sm" color="white" />` di dalam Button |

---

## 20. File Kunci Design System

| File | Isi |
|---|---|
| `src/con/colors.ts` | Raw color palette |
| `src/utils/themeTokens.ts` | Token warna, tipografi, spacing, radius, shadows |
| `src/app/layout.tsx` | `createTheme` Mantine (font, overrides) |
| `src/components/admin/AdminThemeProvider.tsx` | Tidak dipakai (0 importer); dark mode admin lewat `themeTokens` — lihat §13 |
| `src/components/admin/UnifiedSurface.tsx` | UnifiedCard komponen |
| `src/components/admin/UnifiedTypography.tsx` | UnifiedTitle, UnifiedText, UnifiedPageHeader |
| `src/app/admin/(dashboard)/_com/header.tsx` | HeaderSearch |
| `src/app/admin/(dashboard)/_com/judulList.tsx` | JudulList |
| `src/app/admin/(dashboard)/_com/judulListTab.tsx` | JudulListTab |
| `src/app/admin/(dashboard)/_com/modalKonfirmasiHapus.tsx` | Modal konfirmasi delete |
| `src/app/admin/(dashboard)/_com/createEditor.tsx` | Rich text editor wrapper |
| `src/styles/dark-mode-table.css` | CSS override dark mode tabel |
| `src/app/darmasaba/layout.tsx` | Public site layout |
| `src/app/admin/layout.tsx` | Admin AppShell layout |
| `src/app/admin/_com/list_PageAdmin.tsx` | Konfigurasi menu sidebar |
