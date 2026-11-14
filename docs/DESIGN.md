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

## 5. Layout Public Site (`/`)

File: `src/app/(public)/layout.tsx`

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

- **Bar**: tinggi 44px, `rgba(251,251,253,0.8)` + `backdrop-filter: saturate(180%) blur(20px)`, isi max-width 1100px. Di 992–1099px padding item 5px & gap 6px (bukan 8px) supaya 12 menu + ikon cari + baca suara (+ admin) muat tanpa ikon terjepit. Menu aktif = teks biru brand 600. Jangan bungkus navbar dengan elemen ber-`backdrop-filter`/`filter`: induk seperti itu membuat overlay blur di dalamnya tidak bisa mem-blur halaman.
- **Flyout**: hover menu (jeda 100ms) → latar `#fbfbfd` mengembang dari bawah bar (transisi `clip-path` 320ms `cubic-bezier(0.32,0.72,0,1)`, tinggi mengikuti isi yang diukur `ResizeObserver`, jadi pindah menu ikut retarget). Isi: label kecil abu + link 22px/600 dalam satu kolom (bila melebihi tinggi layar, panel bisa di-scroll).
- **Reveal teks**: `opacity` + `translateY(-8px)` 300ms `cubic-bezier(0.23,1,0.32,1)`, stagger 30ms per baris.
- **Blur halaman**: overlay `fixed` `backdrop-filter: blur(18px)` + tint, fade `opacity`. Tulis `backdrop-filter` **tanpa** `-webkit-backdrop-filter` manual: Lightning CSS (Turbopack) menggabungkan keduanya jadi hanya versi `-webkit-` yang diabaikan Chrome.
- **Tutup**: cursor keluar area bar+panel (jeda 120ms), Escape, klik overlay, klik link, atau route berganti. Pencarian dibuka/tutup lewat klik ikon (tidak ikut hover).
- **Aksesibilitas**: menu utama `<button aria-expanded>`, submenu `<a>` (bisa keyboard & tab baru), Enter membuka + fokus link pertama, panel `inert` saat tertutup. `prefers-reduced-motion`: tanpa gerak, hanya fade. Hover warna hanya untuk `(hover: hover) and (pointer: fine)`.
- **Pencarian** (`_com/globalSearch.tsx`): dropdown berisi bagian "Halaman" (submenu navbar yang cocok, dari `_com/searchMenu.ts` atas `src/con/navbar-list-menu.ts` lalu `src/con/search-extra-pages.ts` untuk halaman publik di luar navbar, langsung tanpa menunggu API) di atas "Konten" (hasil API). "Halaman" menampilkan 5 hasil dulu (`MENU_PREVIEW_COUNT`, `previewMenuResults`), sisanya dibuka di tempat lewat tombol "Tampilkan N halaman lainnya" (`_com/SearchShowMoreButton.tsx`); ketikan berubah → kembali 5. Baris dirender `_com/SearchResultRow.tsx`. Dites di `__tests__/api/search_menu.test.ts`.

### Mode Baca Suara (aksesibilitas)

Tombol ikon kursi roda di navbar, **kanan ikon cari** (desktop) dan **kiri burger** (mobile, selalu terlihat — tidak disembunyikan di panel). File: `_com/NavbarSpeechToggle.tsx` (tombol), `_com/useHoverSpeech.ts` (dipasang sekali di `Navbar.tsx`, berlaku di semua halaman publik), `_com/hover-speech.logic.ts` (teks yang dibaca; tombol & ikon dilewati), state `src/state/state-hover-speech.ts`. Dites di `__tests__/api/navbar_baca_suara.test.tsx`.

- Aktif → teks yang diarahkan kursor dibacakan `speechSynthesis` (`id-ID`, jeda 250ms); di layar sentuh, teks yang diketuk. Status tetap saat pindah halaman (client-side), reset saat reload.
- Tampilan: lingkaran 30px; aktif = terisi biru brand + ikon putih. `aria-pressed` + label/tooltip "Aktifkan/Matikan mode baca suara".
- Menggantikan tombol melayang di kiri beranda (`NewsReaderalanding.tsx`) dan tombol ikon musik di detail berita/pengumuman/kesejahteraan (`NewsReader.tsx`); keduanya dihapus karena menimpa konten dan fungsinya sudah tercakup mode ini.

### Navbar Mobile

Gaya apple.com. File: `_com/NavbarMobile.tsx` + `_com/navbar-mobile.module.css` (variabel warna/kurva dipakai bersama dari `.root` di `navbar.module.css`). State buka di `stateNav.mobileOpen`.

- **Bar**: tinggi 48px, kaca sama dengan desktop, logo kiri, tombol baca suara + `Burger` kanan.
- **Panel**: kaca penuh layar `rgba(251,251,253,0.82)` + `backdrop-filter: saturate(180%) blur(20px)` (halaman ter-blur), membuka dari bawah bar lewat `clip-path` 320ms. Scroll halaman dikunci selama terbuka.
- **Drill-down**: awalnya hanya menu utama (24px/600 + chevron). Tap menu → submenu masuk dari kanan dengan tombol "Kembali"; kembali → menu utama masuk dari kiri. Reveal bertahap 25ms per baris.
- **Tutup**: burger, Escape, klik link, atau route berganti. Panel `inert` saat tertutup.

### Hero Beranda (Landing)

Layar pertama beranda: menjawab "ini situs siapa" sebelum yang lain. Folder: `_com/main-page/landing-page/` — `index.tsx` (section), `HeroInfo.tsx` (status kantor + media sosial), `HeroProfile.tsx` (foto + kartu nama Perbekel), `HeroPrograms.tsx` (rel program inovasi) + `use-rail-scroll.ts` (hook geser) + `rail.logic.ts` (helper murni) + `programs.module.css`, `HeroRibbons.tsx` (pita latar) + `ribbons.logic.ts` (geometri), `use-landing-data.ts` (hook), `landing.logic.ts` (jam kerja, helper murni), `landing.text.ts`, `landing.module.css`. Test: `__tests__/api/landing_hero_ui.test.tsx`.

- **Sumber data** (tidak berubah): `/api/landingpage/mediasosial/findMany`, `/api/landingpage/pejabatdesa/edit`, `/api/landingpage/harilibur/cek?date=`, dan state Valtio `programInovasi.findMany` (limit bawaan 10).
- **Bentuk**: satu permukaan `#D1D9E8` (`colors.Bg`) selebar layar, jarak tepi `--edge-gutter` (`globals.css`: `clamp(24px, 4vw, 64px)`; mobile 16px), **tanpa kartu pembungkus**. Kiri: 2 logo (ubin putih 56px) + "PEMERINTAH DESA DARMASABA" (15px kapital, `blue-button`) + wilayah; `h1` sambutan (`clamp(2rem, 4.4vw, 3.6rem)`, `blue-button-7`) dengan baris salam di atasnya; status kantor; ikon media sosial (bulat putih 44px, tautan asli tab baru). Kanan: foto Perbekel `object-fit: contain` rata bawah **setinggi hero** (kolom kanan merentang dua baris grid: `"copy profile" / "programs profile"`, kolom `1.3fr / 1fr`), tinggi `--photo-h` = `clamp(340px, min(38vw, 66vh), 700px)` (ikut tinggi layar supaya hero tetap di layar pertama laptop), kartu nama putih menimpa dasar foto 32px. Tanpa foto → hanya kartu nama.
- **Status kantor**: satu baris pil putih — titik hijau/merah, "Kantor buka/tutup", lalu "Jam layanan 07:30 - 15:30" atau nama hari libur/"Libur Akhir Pekan". Jam: Senin–Kamis 07:30–15:30, Jumat 07:30–12:00; hari libur nasional mengalahkan jam kerja; diperbarui tiap menit.
- **Pita latar** (`HeroRibbons`): satu SVG diam di belakang semua isi — berkas 11 pita sejajar (biru brand, biru muda, putih, satu garis emas `#d4a72c`, satu garis merah `#c8102e`; warna dari seragam Perbekel) yang turun dari atas-tengah lalu mendatar di belakang foto sampai keluar tepi kanan; melebar 1,35× di pangkal (kipas), memudar ke atas lewat mask. Path dihitung sekali saat modul dimuat dari garis tengah Bézier (`ribbons.logic.ts`); `preserveAspectRatio="none"` supaya ikut ukuran hero. Tepi luar berkas tetap, jadi pita tidak pernah menyentuh teks sambutan. **Tanpa gerak.** Di mobile pita pindah ke sel foto saja (lihat butir Mobile). Alasan bentuk: panel warna di belakang foto dan foto desa sebagai latar penuh sudah dicoba dan ditolak.
- **Program inovasi**: judul kecil kapital "Program Inovasi Desa" + rel geser berisi **semua program** (urutan dari API) di kiri bawah, di bawah teks. Ubin putih seragam (radius 16px, logo `contain` tinggi 72px, nama 14px maks 2 baris) → `/program-inovasi/{id}`. 4 ubin terlihat penuh (`RAIL_VISIBLE_TILES` = `--visible-tiles`), ubin ke-5 mengintip 48px. Geser dengan scroll bawaan browser (`scroll-snap-type: x mandatory`, berhenti di tepi ubin): seret, trackpad, atau 2 tombol panah bulat putih 40px di kanan judul (sekali klik = 2 ubin; mati di ujung). **Tanpa putar otomatis, tanpa loop** — logo yang berjalan sendiri terbaca seperti banner sponsor, dan galeri Layanan & Potensi di bawahnya sudah bergerak sendiri; mesin galeri itu sengaja tidak dipakai ulang. Tepi rel **memudar bertahap** (`mask-image`, 72px; mobile 40px) hanya di sisi yang masih punya ubin tersembunyi (`data-fade-start`/`data-fade-end` dari posisi geser; lebar gradasi bertransisi lewat `@property`). Di bawah rel: garis posisi 3px biru brand polos di lintasan biru tipis (lebar = porsi terlihat), ditulis langsung ke DOM tiap event scroll. Gerak lain: ubin masuk bergiliran sekali (70ms per ubin), hover naik 2px (pointer saja). ≤4 program → tanpa panah, garis posisi, dan gradasi. Reduced motion: tanpa animasi masuk/transisi, panah menggeser seketika.
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
- **Bentuk**: latar putih, isi selebar layar tanpa max-width dengan jarak tepi `--edge-gutter` (`globals.css`: `clamp(24px, 4vw, 64px)`, ≤734px tetap 24px; sama dengan hero supaya tepinya sejajar), kepala **rata kiri** sejajar tepi grid: judul "Kabar Desa" 40px (tablet 36, mobile 28) warna `blue-button` di kiri, tautan "Lihat semua berita ›" (17px, mobile 15px) → `/pemerintahan/berita/semua` di kanan (hanya bila ada berita), tanpa subjudul, jarak ke kartu 24px. Padding atas section 56px (mobile 40px). Kartu/panel `#f5f5f7` tanpa border/bayangan; kartu berita (dan fotonya) **bersudut lancip tanpa radius** (senada tile Prestasi), panel pengumuman radius 18px.
- **Berita utama**: berita terbaru, satu kartu-tautan 2 kolom (foto 3fr | teks 2fr, tinggi min `clamp(440px, 32vw, 620px)`; tablet 320px): baris meta kategori (warna brand) · tanggal (12px kapital), judul 32px maks 4 baris, ringkasan 17px abu maks 3 baris.
- **Kartu kecil**: 3 berita berikutnya, grid 3 kolom gap 20px, foto 16:10 di atas, meta + judul 19px maks 3 baris. Tanpa foto → ikon koran abu di latar `#e8e8ed`. Hover (pointer saja): foto zoom 1.03 700ms + judul bergaris bawah; mati saat reduced motion.
- **Pengumuman**: panel berjudul "Pengumuman" + tautan "Semua pengumuman ›" (`/pemerintahan/pengumuman`), 3 baris (judul 1 baris · tanggal · chevron) dipisah garis tipis. Sengaja tanpa gambar di beranda (gambar utama hanya jadi thumbnail di halaman daftar Pengumuman).
- **Tautan detail**: `/pemerintahan/berita/{kategori}/{id}` dan `/pemerintahan/pengumuman/{kategori}/{id}`; kategori di-`encodeURIComponent`, kosong → `umum` (halaman detail hanya membaca `id`).
- **Tanggal**: ringkas `3 Nov 2026`, zona WITA (`DESA_TIME_ZONE` dari `apbdes.logic.ts`).
- **Mobile ≤734px**: berita utama bertumpuk (foto 16:9 di atas); 3 kartu kecil jadi baris geser horizontal sampai tepi layar (`scroll-snap`, kartu 78% lebar, kartu berikutnya mengintip); baris pengumuman: judul maks 2 baris, tanggal di bawahnya.
- **Loading**: placeholder abu berdenyut seukuran kartu & baris (tanpa denyut saat reduced motion).

### APBDes (Beranda & halaman detail)

Gaya bersih apple.com. Folder: `_com/main-page/apbdes/` — `index.tsx` (section, tahun, data), `components/ApbdesSummary.tsx` (3 kartu), `components/ApbdesChart.tsx` (`@mantine/charts` BarChart), `components/ApbdesDetail.tsx` (accordion rincian), `components/ApbdesSkeleton.tsx`, `apbdes.logic.ts` (helper murni, dites di `__tests__/api/apbdes_beranda_logic.test.ts`), `apbdes.meta.ts` (ikon + warna kategori), `apbdes.text.ts` (label), `apbdes.module.css` (section, kartu, panel, dokumen), `apbdes.detail.module.css` (accordion + baris rincian).

- **Bentuk**: latar putih, isi max-width 1100px, kartu/panel `#f5f5f7` radius 18px tanpa border/bayangan. Judul 48px (mobile 32px) warna `blue-button`, subjudul abu `#6e6e73`. Tidak ada pemilih tahun: hanya satu tahun ditampilkan, yaitu tahun terbesar yang sudah punya item (`pickLatestApbdes`; bila tak ada yang punya item, tahun terbesar yang ada), sebagai teks "Tahun X" di tengah. Di bawahnya "Data diperbarui {tanggal}" (abu 14px) = waktu terbaru dari `updatedAt` APBDes, item, dan realisasi (`latestUpdate`), format panjang zona WITA (`Asia/Makassar`).
- **Ringkasan**: 3 kartu Pendapatan / Belanja / Pembiayaan — ikon Tabler (`IconCash`, `IconReceipt2`, `IconBuildingBank`, tanpa emoji) dalam lingkaran tint, pagu ringkas (`Rp 23,14 M`) + penuh, progress tipis 6px, persen realisasi. Warna aksen per kategori (teal / biru brand / oranye) **netral**: realisasi rendah atau 0 tidak diberi merah — 0 ditulis "Belum ada realisasi".
- **Angka**: satuan ringkas Indonesia Rb/Jt/M/T (bukan B), Rupiah penuh `Rp 1.234.567`, persen `8,8%`.
- **Total kategori** = jumlah item akar (kode yang bukan turunan kode lain). Data bisa berhirarki (4 → 4.1 → 4.1.1) di mana induk sudah memuat jumlah anaknya; menjumlah semua item menghitung ganda. Realisasi baris = realisasi item + turunannya.
- **Grafik**: pagu (`blue-button-3`) vs realisasi (`blue-button`), legend di atas, grid horizontal, sumbu ringkas, tooltip Rupiah penuh. Bila realisasi tahun itu kosong muncul catatan di bawah grafik.
- **Rincian**: `Accordion multiple` per kategori (tertutup awal), header = jumlah pos + pagu ringkas. Desktop: header kolom kecil (Uraian / Realisasi / Anggaran) lalu baris kode 72px | uraian (indentasi 16px per tingkat, induk tebal) | realisasi 220px (bar 6px warna aksen kategori + persen, nominal realisasi di bawahnya bila > 0) | anggaran 168px rata kanan. Pos beranggaran 0 tanpa bar. Tablet ≤1068px: kolom 64/160/150px. Mobile ≤734px: header kolom disembunyikan; di bawah uraian berturut-turut anggaran, bar + persen, "Realisasi Rp …" — tanpa scroll horizontal.
- **Gerak**: konten fade + naik 6px 280ms tiap ganti tahun (`key=tahun`); progress bar transisi lebar 600ms. `prefers-reduced-motion`: keduanya mati. Loading = skeleton (bukan overlay).
- **CTA**: pill "Lihat semua data APBDes" → `/apbdes`, di bawah section.
- **Halaman detail** `(tambahan)/apbdes/page.tsx`: memakai `ApbdesBody` (`components/ApbdesBody.tsx`) + hook `use-apbdes-data.ts` yang sama dengan beranda, `variant="full"` (beranda `"compact"`). Bedanya: `BackButton` di atas, judul `h1`, accordion terbuka semua sejak awal, kolom kelima **Lebih/(Kurang)** = anggaran − realisasi gabungan (desktop 72 | uraian | 200 | 160 | 160px; tablet 56/140/140/140; mobile baris ke-4 di bawah realisasi), dan panel dokumen (`components/ApbdesDocument.tsx`: judul + tombol "Unduh dokumen", tanpa gambar) yang hanya muncul bila tahun terpilih punya `file`.

### Prestasi dan Penghargaan Desa (Beranda & halaman gabungan)

Section Penghargaan & Prestasi lama **digabung** — tampilan maupun data: satu tabel `PrestasiDesa`, penghargaan = kategori "Penghargaan" (field opsional `juara`). Folder: `_com/main-page/prestasi/` — `index.tsx` (section beranda), `PrestasiHero.tsx` (video), `PrestasiGrid.tsx` (tile), `PrestasiListPage.tsx` (halaman gabungan), `use-prestasi-data.ts` (hook), `prestasi.source.ts` (adapter satu endpoint), `PrestasiJuara.tsx` (juara di halaman detail), `prestasi.logic.ts` (helper murni), `prestasi.meta.ts` (limit, rute, video, warna), `prestasi.text.ts`, `prestasi.module.css`, `prestasi.page.module.css`. Test: `__tests__/api/prestasi_penghargaan_{logic,source,ui,merge_data}.test.ts(x)`, `__tests__/api/prestasi_desa_juara_api.test.ts`.

- **Sumber data**: satu `find-many` prestasi desa (`page`, `limit`, `search` — cari juga di `juara` — urut `createdAt desc`, `total` dari server). Keluaran `PrestasiPage` sama seperti era adapter dua endpoint; `source` = `penghargaan` bila kategori "Penghargaan".
- **Hero**: video `award.mp4` apa adanya + poster `mangupuraaward.jpeg`, lapisan gelap `rgba(0,0,0,.6)→.85` dan tinggi min 720px (mobile 500px) sama seperti section Penghargaan lama. Teks putih di tengah: judul "Prestasi dan Penghargaan Desa" 56px (tablet 48, mobile 36), subtext 21px (19/17) maks 680px, pill CTA brand "Selengkapnya" → `/prestasi-desa`. Video `preload="none"`, diputar hanya saat terlihat (`useInViewport`), tidak autoplay bila `prefers-reduced-motion`; tombol jeda/putar bulat 36px kanan bawah (WCAG 2.2.2).
- **Grid**: 4 entri terbaru gabungan, 2 kolom, gap 10px, tile 16:10 tanpa radius; seluruh tile = tautan ke detail `/prestasi-desa/{id}` (juga untuk penghargaan), judul `name` kiri bawah (28px, tablet 24, mobile 21; maks 3 baris) di atas gradasi gelap. Ganjil → tile terakhir lebar 2 kolom (21:9); kosong → grid disembunyikan. Loading = placeholder abu. Mobile ≤734px: 1 kolom, tile 4:3. Hover foto zoom 1.03 700ms (mati saat reduced motion).
- **Halaman gabungan** `/prestasi-desa`: latar putih, kepala max-width 1100px (kembali, judul `h1` 48px warna brand, subtext abu, cari 320px di kanan — mobile di bawah), grid tile yang sama, 8 per halaman + `Pagination` bila > 1 halaman. Cari debounce 400ms. `/penghargaan` dan `/penghargaan/{id}` dialihkan permanen (next.config) ke halaman ini / detail prestasi dengan id sama; detail menampilkan `juara` bila ada. Menu navbar Desa → "Prestasi dan Penghargaan".

### Desa Anti Korupsi (Beranda)

Gaya bersih apple.com, pola halaman spesifikasi. Folder: `_com/main-page/desaantikorupsi/` — `index.tsx` (section), `AntiKorupsiGroups.tsx` (panel grup), `use-antikorupsi-data.ts` (hook atas `korupsiState`), `desaantikorupsi.logic.ts` (helper murni), `desaantikorupsi.meta.ts` (limit, rute, warna), `desaantikorupsi.text.ts`, `desaantikorupsi.module.css`. Test: `__tests__/api/desa_anti_korupsi_logic.test.ts`.

- **Sumber data**: `korupsiState.desaAntikorupsi.findMany.load()` (default limit 10, urut `name asc`), tampil 6 butir pertama (`ANTIKORUPSI_LIMIT`).
- **Teks**: data desa tersimpan HURUF KAPITAL dan diawali nomor indikator (`1.1 ADANYA ...`). Tampilan: nomor dipisah (`splitIndicatorNumber`), teks & nama kategori jadi sentence case (`toSentenceCase`, hanya bila teks tak memuat huruf kecil sama sekali) dengan ejaan singkatan dipertahankan lewat `KEEP_CASE_TERMS` (Perdes, SOP, APBDes, RKP, SKM, Trantibumlinmas). Data di DB tidak diubah. Nama dirender sebagai teks, bukan `innerHTML`.
- **Bentuk**: latar putih, isi max-width 1100px, kepala tengah: judul `h2` 40px (tablet 36, mobile 28) warna `blue-button` + pengantar abu 19px (mobile 17). Satu panel `#f5f5f7` radius 18px tanpa border/bayangan; tiap kategori = satu grup (`groupByKategori`, urutan kemunculan) dipisah garis tipis: nama kategori `h3` 21px di kolom kiri 260px (tablet 200px), butir di kanan = nomor brand 600 tabular + teks 17px, antarbutir garis tipis. Tanpa ikon. Mobile ≤734px: nama kategori di atas butirnya.
- **CTA**: pill "Selengkapnya ›" → `/desa-anti-korupsi/detail`, di bawah panel.
- **Loading / kosong**: 6 baris placeholder abu berdenyut (tanpa denyut saat reduced motion); data kosong → satu pesan "Belum ada indikator desa anti korupsi.".

### Desa Anti Korupsi — halaman detail (`/desa-anti-korupsi/detail`)

Daftar indikator per kategori, tiap indikator berisi surat (PDF). Folder `(tambahan)/desa-anti-korupsi/`: `detail/page.tsx` (muat `findMany.load(1, 100)`, state kategori, Suspense) → `_com/AntiKorupsiKategoriPills.tsx` (pil) + `_com/AntiKorupsiDokumenList.tsx` (daftar + kerangka), `_com/antikorupsi-detail.logic.ts` (`toDokumenRows`, `documentHref`, `documentType`, `kategoriNames`, `countByKategori`, `countDokumen`), `_com/antikorupsi-detail.text.ts`, `_com/antikorupsi-detail.module.css`; tab kategori dari `_lib/kategori-tab.ts` (`?kategori=` tetap). Teks memakai `toSentenceCase`/`splitIndicatorNumber` dari section beranda. Test: `__tests__/api/desa_anti_korupsi_detail.test.tsx`, `__tests__/api/desa_anti_korupsi_kategori_tab.test.ts`.

- **Bentuk**: latar putih, isi max-width 1100px, kepala rata kiri (pola Potensi): tombol kembali, `h1` 48px (tablet 40, mobile 32) warna brand, pengantar abu 19px (17). Pil kategori sentence case + angka jumlah (`#f5f5f7` → aktif latar brand, `aria-pressed`); mobile ≤734px pil satu baris digeser horizontal dan pil aktif digeser ke tengah. Di bawahnya `h2` nama kategori 28px (mobile 24) + "x dari y dokumen tersedia" abu kanan, lalu satu panel `#f5f5f7` radius 18px: baris nomor brand tabular | teks 17px | aksi dokumen, antarbaris garis tipis. Mobile: aksi pindah ke bawah teks.
- **Dokumen**: sumber = relasi opsional `DesaAntiKorupsi.file` (admin: edit indikator → unggah dokumen; tersimpan di MinIO, link `/api/fileStorage/findUnique/...` dilayani inline). Ada file dengan link aman (relatif `/…` atau http(s); `documentHref`) → **seluruh baris tautan** `target="_blank"` ke file, pil putih "Buka PDF ↗" (ikon PDF; jenis lain → ekstensi, mis. "Buka DOCX") yang jadi brand saat hover. Tanpa file → baris bukan tautan, pil abu ikon jam + "Dokumen belum tersedia" — tempat ini terisi sendiri begitu admin mengunggah surat.
- **Loading / kosong**: 5 baris placeholder berdenyut (tanpa denyut saat reduced motion); data kosong → "Belum ada indikator desa anti korupsi."; kategori tanpa butir → "Belum ada indikator untuk kategori ini.".

### Desa Anti Korupsi — halaman utama (`/desa-anti-korupsi`)

Memakai gaya section beranda (judul + pengantar + panel `#f5f5f7` grup per kategori), data dari `findMany.load(1, 100)` — kategori tidak lagi di-hardcode. File: `page.tsx`, `_com/AntiKorupsiUtama.tsx`, `_com/antikorupsi-utama.{data,text}.ts`, `_lib/antikorupsi-utama.logic.ts`. Test: `__tests__/api/desa_anti_korupsi_utama.test.tsx`, `__tests__/api/desa_anti_korupsi_groups_link.test.tsx`.

- **Ringkasan**: strip kecil "N kategori · N indikator · N dokumen" di bawah pengantar.
- **Tautan**: `AntiKorupsiGroups` menerima prop **opsional** `itemHref` (seluruh baris butir → `/desa-anti-korupsi/program/{id}`, hover brand, chevron, badge "N dokumen"/"Belum ada dokumen", focus-visible) dan `kategoriHref` (nama kategori → `/detail?kategori=` + petunjuk "Lihat dokumen →"). Tanpa prop itu (beranda) butir tetap teks biasa, limit 6, dan CTA "Selengkapnya" tetap ada; halaman utama tidak punya CTA.

### Desa Anti Korupsi — halaman program (`/desa-anti-korupsi/program/{id}`)

Kerangka sama dengan halaman detail (`.page`/`.inner` dari `antikorupsi-detail.module.css`: latar putih, isi 1100px) supaya alur detail → program tidak terasa pindah situs. Gaya khusus di `_com/program-folder.module.css`.

- **Kepala** (`ProgramHeader`): tombol kembali kotak ikon brand (senada `BackButton`) tetapi berupa **tautan bertujuan pasti**, bukan `history.back()` — `tujuanKembali` di `_lib/program-folder.ts`: folder dibuka lewat `?folder=` → daftar folder program ("Kembali ke daftar folder"); selain itu → tab kategori halaman detail ("Kembali ke daftar indikator"). Lalu breadcrumb, nomor indikator jadi badge brand, `h1` judul sentence case (`_lib/program-judul.ts`) 32px (tablet 28, mobile 22). Deskripsi disembunyikan bila hanya mengulang nama program (`isDeskripsiDuplikat`).
- **Baris alat**: cari dokumen (+ "Urutkan" saat daftar dokumen tampil) di kiri, "Unduh semua (ZIP)" + petunjuk 100 MB di kanan. Tidak dirender bila program tanpa folder & dokumen.
- **Daftar folder** (`FolderList`): panel `#f5f5f7` radius 18px, satu baris per folder (pola daftar indikator halaman detail) — ikon dalam kotak tint brand, nama, "N dokumen · ukuran · Diperbarui {tanggal unggah terbaru}", cuplikan 2 judul + "+N lainnya" (`_lib/folder-kartu.ts`), chevron. Folder kosong redup + badge "Kosong", tetap bisa dibuka.
- **Folder tunggal**: tanpa `?folder=` dan hanya satu folder berisi dokumen (folder kosong tidak dihitung) → folder itu langsung dibuka (`folderTunggalBerisi`), bukan crumb terakhir, dan Kembali tetap ke tab kategori.
- **Folder terbuka** (`FolderAktif`): baris chip `FolderChips` (hanya bila >1 folder; `aria-current`, `?urut=` ikut), "Unduh folder (ZIP)" tidak dirender bila folder kosong, daftar dokumen dalam panel `#f5f5f7` yang sama; empty state dengan subteks + tombol "Kembali".
- Test: `__tests__/api/desa_anti_korupsi_program_tampilan.test.tsx`, `__tests__/api/desa_anti_korupsi_program_navigasi.test.tsx`.

### SDGs Desa (Beranda)

Folder: `_com/main-page/sdgs/` — `index.tsx` (section), `SdgsCards.tsx` (kartu + skeleton), `use-sdgs-data.ts` (hook), `sdgs.logic.ts` (helper murni, dites di `__tests__/api/sdgs_desa_logic.test.ts`), `sdgs.meta.ts` (endpoint, limit, rute, warna), `sdgs.text.ts`, `sdgs.module.css`.

- **Sumber data**: `GET /api/landingpage/sdgsdesa/findMany` (respons paginasi default 10, sudah filter `isActive`). `jumlah` = string skor dari admin; dibaca `parseSkor` (titik atau koma desimal, kosong/tidak valid → dibuang), lalu 4 skor tertinggi (`pickTopSdgs`, skor sama = urutan asal). Label skor ditampilkan apa adanya.
- **Bentuk**: latar `#f5f5f7`, isi max-width 1100px, kepala di tengah: judul `h2` "SDGs Desa" 40px (mobile 32) warna `blue-button` + paragraf abu 19px (mobile 17). Keterangan kecil "Tujuan dengan skor tertinggi" di atas kartu. Kartu putih radius 18px tanpa border/bayangan, grid 4 kolom (≤1068px 2 kolom): ikon SDG 72px (`alt` = nama tujuan; tanpa gambar → kotak abu `#e8e8ed`), nama tujuan 17px/600 rata kiri, lalu "Skor" (14px abu) + angka 40px/700 (tablet 32) di dasar kartu (`margin-top: auto`) sehingga sejajar antar kartu. Skor **bukan** heading.
- **Mobile ≤734px**: 1 kolom, kartu baris — ikon 64px kiri, nama + skor (28px) kanan.
- **CTA**: pill "Jelajahi semua tujuan SDGs Desa" → `/sdgs-desa` (pola `.ctaLink` APBDes).
- **Loading / kosong**: 4 skeleton kartu; kosong atau gagal → satu pesan di panel putih (galat dicatat `console.error`).

### Indeks Kepuasan Masyarakat (Beranda)

Gaya bersih apple.com, sejalan APBDes. Folder: `_com/main-page/kepuasan/` — `index.tsx` (section tipis), `use-kepuasan-data.ts` (hook: muat `responden.findMany` halaman 1 limit 1000 + ringkasan), `components/KepuasanCharts.tsx` (susunan grafik), `components/KepuasanMonthlyChart.tsx` (BarChart per bulan + total), `components/KepuasanDonutCard.tsx` (DonutChart + legenda), `components/KepuasanEmpty.tsx`, `components/KepuasanSkeleton.tsx`, `components/CtaButton.tsx`, `components/RespondenFormModal.tsx` (form "Ajukan Responden"), `kepuasan.logic.ts` (helper murni), `kepuasan.meta.ts` (kategori + warna, limit), `kepuasan.text.ts`, `kepuasan.module.css`. Test: `__tests__/api/kepuasan_logic.test.ts`, `__tests__/api/kepuasan_ui.test.tsx`, `__tests__/api/ikm_responden_create_status.test.ts` (status `create()`).

- **Bentuk**: latar putih, isi max-width 1100px, judul 40px (mobile 32px) warna `blue-button` + paragraf pengantar abu 19px (mobile 17px), rata tengah. Panel/kartu `#f5f5f7` radius 18px tanpa border/bayangan.
- **Ada data**: panel "Responden per bulan" (h3 + keterangan, total responden server 40px di kanan; mobile di bawah judul) berisi grafik batang `blue-button` (sumbu bulan ringkas "Mar 2026", tooltip "Maret 2026"). Di bawahnya 3 kartu (Jenis kelamin / Ulasan / Umur; mobile 1 kolom): donat 168px + legenda jumlah & persen (semua kategori, termasuk 0 / 0%). Jenis kelamin & umur: palet satu rona biru brand gelap → terang. Ulasan: skala rating standar baik → buruk dari token tema Mantine — Sangat Baik `green.8`, Baik `lime.8`, Kurang Baik `orange.6`, Sangat Kurang Baik `red.8`, rating tak dikenal `gray.6` (`ratingColor` di `kepuasan.meta.ts`). Donat hanya menggambar irisan bernilai > 0 (`donutSlices`); bila tinggal satu irisan, garis pemisah 0 (`donutStrokeWidth`) — recharts menutup irisan penuh dengan sisi radial di jam 3 yang ikut ber-stroke. Pil "Ajukan Responden" di bawah section.
- **Kategori** dicocokkan dari nama opsi (tanpa beda huruf besar/kecil) dengan daftar tetap di `kepuasan.meta.ts`; nama opsi baru buatan admin tidak muncul di grafik sampai daftar ditambah.
- **0 responden**: satu kartu pesan "Belum ada responden" + pil "Ajukan Responden"; tanpa grafik kosong.
- **Form** (`RespondenFormModal`): field Nama, Jenis Kelamin, Rating, Kelompok Umur (wajib, bertanda bintang). Kontrak payload tetap — `indeksKepuasanState.responden.create.form` `{ name, tanggal, jenisKelaminId, ratingId, kelompokUmurId }` lalu `create.create()`; `tanggal` diisi otomatis saat submit = hari ini jam lokal `YYYY-MM-DD` (`todayLocalIsoDate`, bukan `toISOString` yang mundur sehari di WITA 00:00–07:59). `create()` mengembalikan `true`/`false`; form direset + modal ditutup hanya bila `true` (`submitResponden`), bila gagal isian tetap. Setelah percobaan submit pertama field wajib yang kosong menampilkan pesan (`missingFormFields`, teks sama dengan zod store). Tombol Submit `loading` selama `create.loading`. Form admin create/edit responden tetap memakai input tanggal manual.

### Layanan Masyarakat (Beranda)

Akses utama ke 4 layanan desa, tepat di bawah Indeks Kepuasan Masyarakat dan di atas footer. Folder: `_com/main-page/layanan-masyarakat/` — `index.tsx` (section + modal pengaduan), `LayananCard.tsx` (kartu), `layanan-masyarakat.meta.ts` (ikon + warna), `layanan-masyarakat.text.ts`, `layanan-masyarakat.module.css`. Daftar layanan (judul, deskripsi, label aksi, tujuan) ada di `src/con/layanan-desa.ts` (`LAYANAN_DESA`), **sumber yang sama dengan grup "Layanan Desa" di footer**: ubah di sana, keduanya ikut berubah. Test: `__tests__/api/layanan_masyarakat_ui.test.tsx`.

- **Bentuk**: latar `#f5f5f7` (pembeda dari IKM yang putih), isi max-width 1100px, judul 40px (mobile 32px) warna `blue-button` + pengantar abu 19px (mobile 17px), rata tengah. 4 kartu putih radius 18px tanpa border: ikon Tabler dalam lingkaran `blue-button-1`, judul h3 21px, deskripsi abu 15px, label aksi brand + chevron di dasar kartu. Grid 4 kolom → 2 (≤1068px) → 1 (≤734px).
- **Interaksi**: seluruh kartu bisa diklik. Kartu tautan = `next/link` (tab yang sama). Kartu Pengaduan = `<button aria-haspopup="dialog">` yang membuka `PengaduanMasyarakatModal` yang sama dengan footer (dimuat `dynamic`, baru dipasang saat pertama dibuka). Hover (pointer halus saja): kartu naik 2px + bayangan tipis, label aksi bergaris bawah; tanpa gerak bila `prefers-reduced-motion`.
- **Label aksi** menyebut apa yang terjadi ("Lihat layanan surat", "Sampaikan pengaduan", …), bukan "Selengkapnya" seragam. Tidak ada "Lihat Semua Layanan" karena belum ada halaman yang menghimpun keempatnya.

### Footer

```tsx
Stack bg="linear-gradient(180deg, #1C6EA4, #124170)"
  SimpleGrid cols={{ base:1, sm:2, md:4 }}
    // Tentang Darmasaba
    // Layanan Desa
    // Tautan Penting
    // Berlangganan
```

Isi grup "Layanan Desa" diambil dari `LAYANAN_DESA` (`src/con/layanan-desa.ts`), sama dengan section Layanan Masyarakat beranda.

### Potensi Desa (`/pemerintahan/potensi`)

Folder `(pages)/pemerintahan/potensi/`: `page.tsx` (tombol kembali + `_com/PotensiHeader.tsx`, state saring; muat `findMany.load(1, POTENSI_LIST_LIMIT)` = 100 agar semua potensi tampil, bukan default 10) → `_com/PotensiGrid.tsx` (grid + kerangka) → `_com/PotensiCard.tsx` (kartu) dan `_com/PotensiDetailModal.tsx` (overlay) + `_com/PotensiDetailInfo.tsx` (info + dokumentasi), `_com/potensi.logic.ts` (tipe, `potensiInfoRows`, `dokumentasiImages`, saring kategori; sanitasi HTML memakai `sanitizeRichText` dari `src/lib/rich-text.ts`), `_com/potensi.text.ts`, `_com/potensi.meta.ts` (variabel warna brand di akar halaman), `_com/potensi.module.css` (kartu), `_com/potensi-header.module.css` (kepala), `_com/potensi-detail.module.css` (overlay). Data `potensiDesa.findMany` (`name`, `deskripsi`, `content`, `kategori`, `image`; `lokasi`, `pengelola`, `status`, `dokumentasi` **belum ada di backend** — TODO(potensi-info)). Test: `__tests__/api/potensi_desa_ui.test.tsx`; helper teks kaya diuji di `__tests__/api/rich_text.test.ts`.

- **Kepala**: judul `h1` 48px (mobile 32) warna brand, pengantar 19px (17) abu `#515154` rata kiri maks 640px, lalu **pil saring** "Semua · Potensi · Wisata" dengan angka jumlah di dalam pil (menggantikan kotak angka biru). Wisata = kategori bernama "wisata" (abaikan huruf/spasi), sisanya Potensi (`countByFilter`, `filterPotensi`). Pil: tinggi 40px, putih 70% → aktif latar brand teks putih; `role="group"` + `aria-pressed`; selama memuat pil nonaktif tanpa angka. Saring di klien (semua data sudah dimuat); hasil kosong → "Belum ada data di kategori …".
- **Kartu**: putih radius 24px, bayangan lembut; foto 4:3 dengan pil kategori putih kiri atas dan judul `name` **selalu tampil** kiri bawah (24px, tablet/mobile 22; maks 2 baris) di atas gradasi gelap — pola tile Prestasi. Di bawah foto: `deskripsi` sebagai teks polos (tag editor dibuang, maks 3 baris, 15px abu) lalu pil brand "Lihat Detail →". Grid 3/2/1 kolom (≤1068 / ≤734px), gap 28/24/20px. Hover: bayangan menebal + foto zoom 1.04 (mati saat reduced motion).
- **Klik**: area klik seluruh kartu (`::after` tombol), satu kontrol fokus `button aria-haspopup="dialog"`. Membuka **overlay**, bukan pindah ke `/pemerintahan/potensi/{id}` (rute detail tetap ada karena galeri beranda masih menautkannya).
- **Overlay**: `Modal.Root` Mantine 760px radius 28px, latar halaman di-blur (`Modal.Overlay` blur 10px, gelap 45%), transisi pop 220ms. Hero foto 16:8.5 (mobile 4:3) + gradasi; pil kategori gelap transparan huruf kapital + judul (`Modal.Title`, 40px / tablet 34 / mobile 28) kiri bawah; tombol × bulat 44px kanan atas. Isi (tanpa label judul): `content` yang disanitasi `sanitizeRichText` (`src/lib/rich-text.ts`, DOMPurify dengan tag `RICH_TEXT_TAGS` `p, br, strong, em, u, ul, ol, li`, sama dengan admin; kosong → "Belum ada deskripsi…"), lalu `<dl>` 3 kotak abu muda radius 16px **Lokasi · Pengelola · Status** (label 13px abu, nilai 16px semibold; Status hijau `#1f8a4c`; kosong → "–" abu + teks pembaca layar "Belum ada data"; mobile bertumpuk 1 kolom), lalu label "DOKUMENTASI" + grid foto 3 kolom (mobile 2) 16:10 radius 16px — **disembunyikan bila tak ada foto**. Tutup: ×, Escape, klik luar. Kelas kartu putih dipasang lewat `classNames.content` (bukan `className` `Modal.Content`, yang ikut ke lapisan inner selebar layar).

### Daftar Layanan (`/pemerintahan/layanan`)

Senada galeri "Layanan dan Potensi Desa" beranda dan halaman daftar Berita/Pengumuman. Folder `(pages)/pemerintahan/layanan/`: `page.tsx` (kerangka `.page` + 4 bagian) → `_com/LayananHeader.tsx` (kembali, `h1`, pengantar), `_com/LayananSection.tsx` (kepala bagian `h2` + pengantar + slot kanan/meta), `_com/LayananSearch.tsx`, `_com/SuratKeteranganCard.tsx`, bagian `_com/pelayananSuratKeterangan.tsx` · `pelayananPerizinanBerusaha.tsx` · `pelayananTelunjukSaktiDesa.tsx` · `pelayananPendudukNonPermanent.tsx`, `_com/layanan.logic.ts` (tipe, `filterByName`, `externalHref`, `OSS_STEPS`), `_com/layanan.meta.ts` (limit, id `edit`, `OSS_URL`, variabel brand), `_com/layanan.text.ts`, CSS `layanan.module.css` (kerangka, kepala, cari, kosong), `layanan-surat.module.css` (kartu), `layanan-info.module.css` (OSS, Telunjuk Sakti, Non-Permanen). Test: `__tests__/api/layanan_page_logic.test.ts`, `__tests__/api/layanan_page_ui.test.tsx`.

- **Kerangka**: latar putih, tepi `--edge-gutter`, padding atas 40px (mobile 24), jarak antar bagian 96px (mobile 72). Kepala: judul `h1` 48px (mobile 32) brand + pengantar 19px abu rata kiri. Kepala bagian: `h2` 32px (mobile 24) tinta + pengantar 17px, slot kanan sejajar bawah (turun ke bawah di ponsel).
- **Surat Keterangan**: `findMany.load(1, LAYANAN_LIST_LIMIT)` = 100 → semua layanan tampil sekaligus, **tanpa paginasi** (dulu muat 9 lalu 10 per halaman → item ke-10 tak pernah tampil). Kolom cari pil `#f5f5f7` 44px di kanan kepala bagian, menyaring nama di klien saat mengetik (huruf besar/kecil & spasi ganda diabaikan); tak cocok → "Tidak ada surat keterangan yang cocok dengan “…”". Grid 3/2/1 kolom (≤1068 / ≤734px), gap 20/16px. Kartu = kartu baris atas galeri beranda: foto 4:3 **tanpa radius**, gradasi gelap dari bawah, nama 21px (mobile 19) maks 2 baris kiri bawah + pil putih "Lihat layanan" kanan bawah; badge waktu & biaya (`LayananWaktuBiayaBadge onDark`) kiri atas hanya bila diisi admin. Seluruh kartu satu tautan ke `/pemerintahan/layanan/{id}`. Hover (pointer): foto zoom 1.03 700ms (mati saat reduced motion).
- **Perizinan Berusaha (OSS)**: judul tetap "Perizinan Berusaha Berbasis Risiko melalui OSS", deskripsi admin (rich text, kolom 860px), lalu "Alur pendaftaran NIB" = 6 ubin statis `#f5f5f7` radius 18px (nomor 01–06 brand, judul 19px, keterangan 15px abu) grid 3/2/1 — menggantikan Stepper Kembali/Lanjut. Penutup: catatan 14px abu + pil brand "Buka oss.go.id ↗" (tab baru).
- **Telunjuk Sakti Desa**: panel `#f5f5f7` radius 18px berisi baris bergaris pemisah (pola panel Pengumuman): ikon dokumen di kotak putih 48px · nama 17px semibold (tidak dipotong) + `deskripsi` sebagai label tautan warna brand + badge waktu & biaya · panah ↗. Baris = tautan tab baru; tautan admin tanpa skema (mis. `www.…`) diberi `https://` (`externalHref`).
- **Penduduk Non-Permanen**: judul `h2` dari data (`name`), badge waktu & biaya, isi rich text di panel `#f5f5f7` padding 40px (mobile 24/20). Tanggal "25 Mei 2021" yang tertulis di kode dan 4 tombol bagikan tanpa aksi dihapus.
- **Memuat/kosong**: kerangka abu berdenyut (kartu, baris, panel); kosong → kotak `#f5f5f7` berisi pesan. Rekaman tunggal (OSS, Non-Permanen) melacak selesai-memuat terpisah karena `findById.data` tetap `null` saat gagal.
- **Detail** (`/layanan/{id}`, `[id]/page.tsx` → `_com/detail/LayananDetail.tsx`; hook `use-layanan-detail.ts`, formulir `AjukanPermohonanModal.tsx`, teks `layanan-detail.text.ts`, CSS `layanan-detail.module.css`; test `__tests__/api/layanan_detail_ui.test.tsx`): pola detail Pengumuman — kolom 860px di tengah, **tanpa foto utama** (foto kartu hanya dipakai di daftar). Urutan: kembali → kategori "Layanan Surat Keterangan" 12px kapital brand (tautan ke daftar) → judul `h1` 40px (mobile 28) tinta → pil brand "Ajukan Permohonan" + badge waktu & biaya → persyaratan (`deskripsi` rich text 19px, mobile 17) → gambar alur (`image2`) di panel `#f5f5f7` padding 32px (mobile 16), maks tinggi `min(80vh, 900px)`, klik = ukuran penuh tab baru → panel penutup `#f5f5f7` "Sudah menyiapkan persyaratan?" + pil "Ajukan Permohonan" (mobile bertumpuk). Bagian kosong tidak dirender. Memuat → kerangka berdenyut (`aria-busy`); id tidak ada → "Layanan tidak ditemukan…" + tautan "Lihat semua layanan".
- **Formulir permohonan**: modal tengah radius 24px, overlay blur 8px, transisi pop 220ms; isian Nama · NIK (16 digit) · Alamat · Nomor KK (16 digit) · Kategori (`findManyAll`), validasi setelah isian disentuh; pil "Simpan" aktif hanya bila semua valid, terkunci dengan spinner selama pengiriman (`create.loading`) agar tidak terkirim ganda. `ajukanPermohonan.create.create()` mengembalikan `Promise<boolean>`: formulir hanya dikosongkan + modal ditutup bila tersimpan; gagal (API/jaringan) → toast galat, modal tetap terbuka dengan isian utuh.

### Daftar Berita (`/pemerintahan/berita/{semua|kategori}`)

Halaman "Lihat semua berita" dari Kabar Desa, **memakai kartu yang sama dengan beranda** (`KabarBerita` + `kabar.module.css`, `layout="grid"`). Folder `(pages)/pemerintahan/berita/`: `layout.tsx` (detail `/{kategori}/{id}` tetap gaya lama; daftar → `_com/BeritaShell.tsx`), `_com/BeritaShell.tsx` (bungkus `.section` Kabar Desa: latar putih, tepi `--edge-gutter`, variabel warna kartu), `_com/BeritaHeader.tsx` (pil kategori berita → `KabarListHeader`), `_com/BeritaList.tsx` (daftar + paginasi), `_com/berita-list.source.ts`, `_com/berita-list.logic.ts`, `_com/berita.meta.ts`, `_com/berita.text.ts`. Kepala (kembali, judul, cari, pil), paginasi, hook muat-halaman, helper URL/slug kategori, dan CSS-nya dipakai bersama Pengumuman dan Kegiatan Desa dari `_com/kabar-list/` (`KabarListHeader.tsx`, `KabarListPagination.tsx`, `use-kabar-page.ts`, `kabar-list.logic.ts`, `kabar-list.meta.ts`, `kabar-list.module.css`; kerangka detail `kabar-detail.module.css` dipakai Pengumuman, Kegiatan Desa, Posyandu, Program Kesehatan, Kontak Darurat Kesehatan, Keamanan Lingkungan, Pencegahan Kriminalitas, dan Laporan Publik). Test: `__tests__/api/berita_page_logic.test.ts`, `__tests__/api/kabar_berita_layout_ui.test.tsx`.

- **Kepala**: tombol kembali, judul `h1` 48px (mobile 32) warna brand + pengantar 19px abu rata kiri; kolom cari pil `#f5f5f7` 44px di kanan (mobile selebar layar, di bawah pengantar), ketik → `?search=` setelah 500ms (`router.replace`, Enter langsung). Prop `searchable` (bawaan `true`): `false` → kolom cari tidak dirender sama sekali, untuk daftar pendek (dipakai Tips Keamanan). Lalu **pil kategori** = tautan (`aria-current="page"`), "Semua" + kategori dari `kategoriBerita.findMany`; nonaktif `#f5f5f7`, aktif latar brand teks putih. Mobile: pil jadi baris geser sampai tepi layar, pil aktif digeser ke tengah.
- **Isi per halaman**: `find-many` limit 7 (`BERITA_PAGE_LIMIT`) = 1 berita utama (kartu besar 3fr|2fr, sama dengan beranda) + 6 kartu kecil grid 3 kolom (tablet 2, mobile 1 bertumpuk — bukan baris geser seperti beranda). Tiap halaman diawali kartu utama. Kategori dari segmen URL (huruf kecil, filter API case-insensitive), cari dari `?search=`, halaman dari `?page=` — berlaku untuk "Semua" maupun kategori. Pindah kategori mempertahankan kata kunci dan kembali ke halaman 1.
- **Paginasi**: `Pagination` Mantine di tengah, tombol bulat 36px tanpa border, aktif latar brand; hanya tampil bila > 1 halaman.
- **Kosong/galat**: kotak `#f5f5f7` — "Belum ada berita.", "Belum ada berita di kategori X.", "Tidak ada berita yang cocok dengan “…”.", atau "Berita gagal dimuat…" bila API gagal.

### Pengumuman (`/pemerintahan/pengumuman[/{kategori}[/{id}]]`)

Halaman "Semua pengumuman" dari panel Pengumuman Kabar Desa, senada panel beranda dan halaman Berita. Folder `(pages)/pemerintahan/pengumuman/`: `layout.tsx` (daftar → `_com/PengumumanShell.tsx`; detail punya kerangka sendiri), `page.tsx` & `[name]/page.tsx` (keduanya `PengumumanList`), `[name]/[id]/page.tsx` → `_com/detail/PengumumanDetail.tsx`. Test: `__tests__/api/pengumuman_page_logic.test.ts`, `__tests__/api/pengumuman_page_ui.test.tsx`.

- **Kepala**: sama dengan Berita (`KabarListHeader`): judul "Pengumuman Desa Darmasaba", cari `?search=`, pil "Semua" + kategori dari `kategoripengumuman/findMany` (limit 50). **Kategori tanpa pengumuman disembunyikan**, kecuali sedang dibuka. URL kategori = nama asli di-encode (`/pengumuman/Lelang%20%26%20Pengadaan`, sama dengan tautan lama); filter API case-insensitive.
- **Daftar**: panel `#f5f5f7` radius 18px berisi baris bergaris pemisah (pola panel beranda): thumbnail 72px radius 10px (gambar utama dipotong dari **atas** karena umumnya pindaian surat — yang terlihat kop surat; tanpa gambar → ikon dokumen di kotak putih) · nama kategori 12px kapital brand (disembunyikan saat sudah disaring satu kategori) + judul 17px maks 2 baris · tanggal terbit ringkas · chevron. 10 baris per halaman (`PENGUMUMAN_PAGE_LIMIT`), paginasi bulat sama dengan Berita. Mobile ≤734px: thumbnail 56px, judul maks 3 baris, tanggal di bawah judul. Judul ditampilkan apa adanya (tidak dipaksa kapital).
- **Detail**: `.section` Kabar Desa, kolom 860px di tengah (kerangka dari `_com/kabar-list/kabar-detail.module.css`; gambar utama, galeri, dan lampiran di `pengumuman-detail.module.css`): kembali → baris meta (kategori kapital brand = tautan ke daftar kategori · tanggal terbit panjang) → judul `h1` 40px (mobile 28) warna tinta → gambar utama di panel `#f5f5f7` padding 32px (mobile 16) seperti pratinjau dokumen (maks tinggi `min(80vh, 900px)`, klik = ukuran penuh tab baru) → isi `content` 19px (mobile 17) → "Galeri" (`DokumentasiGaleri`) → "Lampiran Dokumen": panel baris PDF (ikon · nama + ukuran · pil putih "Pratinjau" · pil brand "Unduh"; mobile tombol turun ke bawah nama), pratinjau = `PengumumanPdfModal` (dipakai juga daftar lampiran admin). Bagian kosong tidak dirender. Memuat → kerangka; id tidak ada → "Pengumuman tidak ditemukan…" + tautan ke daftar; galat → pesan muat ulang.
- Komponen lama `PengumumanThumbnail` / `PengumumanGambarUtama` / `PengumumanLampiranBawah` / `PengumumanDokumenList` tetap dipakai detail admin dan Informasi Desa.

### Kegiatan Desa (`/pemerintahan/kegiatan-desa/{semua|kategori}[/{id}]`)

Daftar kegiatan **memakai kartu yang sama dengan Berita** (`KabarBerita` + `kabar.module.css`, `layout="grid"`). Folder `(pages)/pemerintahan/kegiatan-desa/`: `layout.tsx` (daftar → `_com/KegiatanShell.tsx`; detail punya kerangka sendiri), `semua/page.tsx` (tautan navbar) & `[kategori]/page.tsx` (keduanya `_com/KegiatanList.tsx`), `[kategori]/[id]/page.tsx` → `_com/detail/KegiatanDetail.tsx`. Pendukung daftar: `_com/KegiatanHeader.tsx`, `_com/kegiatan-list.source.ts`, `_com/kegiatan-list.logic.ts`, `_com/use-kegiatan-kategori.ts`, `_com/kegiatan.meta.ts`, `_com/kegiatan.text.ts`. Pendukung detail: `_com/detail/kegiatan-detail.source.ts`, `use-kegiatan-detail.ts`, `kegiatan-detail.text.ts`, `kegiatan-detail.module.css` (foto utama dari `.photo` `kabar-detail.module.css`). `_com/PembangunanInfo.tsx` dipakai bersama Monev Pembangunan. Test: `__tests__/api/kegiatan_desa_page_logic.test.ts`, `__tests__/api/kegiatan_desa_page_ui.test.tsx`.

- **Kepala**: sama dengan Berita (`KabarListHeader`): judul "Kegiatan Desa Darmasaba", kolom cari `?search=` (API mencari di judul & lokasi), pil "Semua" + **semua** kategori dari `kategorikegiatan/findMany` (limit 100, urutan admin). Kategori kosong tidak disembunyikan karena API kategori tidak mengirim jumlah item. URL kategori = nama huruf kecil di-encode (`/kegiatan-desa/pkk%20%26%20pemberdayaan%20perempuan`); filter API `contains`, case-insensitive. Mobile: kolom cari selebar layar, pil jadi baris geser (halaman tidak geser horizontal).
- **Daftar**: `find-many` limit 7 (`KEGIATAN_PAGE_LIMIT`) = 1 kegiatan utama (kartu besar 3fr|2fr) + 6 kartu kecil grid 3 kolom (tablet 2, mobile 1 bertumpuk). Label kartu = `kategoriKegiatan.nama` (12px kapital brand) · **tanggal pelaksanaan** (`tanggal`, WITA, mis. "26 MEI 2022"); kartu utama juga menampilkan `deskripsiSingkat`. Info pembangunan tidak tampil di kartu (hanya di detail). Urutan mengikuti API (`tanggal` naik — terlama dulu). Paginasi bulat sama dengan Berita, hanya bila > 1 halaman.
- **Kosong/galat**: kotak `#f5f5f7` — "Belum ada kegiatan desa.", "Belum ada kegiatan di kategori X.", "Tidak ada kegiatan yang cocok dengan “…”.", atau "Kegiatan desa gagal dimuat…" bila API gagal.
- **Detail**: pola detail Pengumuman (`kabar-detail.module.css`), kolom 860px di latar putih, tanpa kartu: kembali → meta (kategori kapital brand = tautan ke daftar kategori · tanggal pelaksanaan panjang, mis. "Kamis, 26 Mei 2022") → judul `h1` 40px (mobile 28) tinta → `deskripsiSingkat` sebagai pengantar 21px (mobile 19) abu → baris ikon lokasi + "N partisipan" 15px → foto bersudut lancip selebar kolom (maks tinggi `min(80vh, 720px)`, `object-fit: cover`, klik = ukuran penuh tab baru) → **"Progres Pembangunan"** (`PembangunanInfo` + sumber dana di panel `#f5f5f7` radius 18px) hanya untuk kategori Pembangunan (`isKegiatanPembangunan`) → `deskripsiLengkap` 19px (mobile 17) **rata kiri**. Bagian kosong tidak dirender. Memuat → kerangka berdenyut (`aria-busy`); id tidak ada → "Kegiatan tidak ditemukan…" + tautan "Lihat semua kegiatan"; galat → pesan muat ulang. API membalas HTTP 200 `success:false` untuk tidak-ditemukan maupun galat DB; keduanya dibedakan dari pesan "tidak ditemukan".
- **Modul bersama yang ikut berubah**: `_com/kabar-list/kabar-list.logic.ts` kini memuat `SEMUA_SLUG`, `kategoriSlug`, `activeSlug`, `kategoriLabel` (dipindah dari `berita-list.logic.ts`, dipakai Berita & Kegiatan) serta `paginate` (paginasi di klien; dipindah dari `program-kesehatan/_com/program.logic.ts`, dipakai Program Kesehatan & Pencegahan Kriminalitas); `_com/kabar-list/kabar-detail.module.css` = kerangka artikel detail (`.wrap` 860px, kepala/meta/judul, `.content`, kosong/galat, kerangka memuat), dipindah persis dari `pengumuman-detail.module.css` dan dipakai Pengumuman & Kegiatan; juga foto utama bersama `.photo`/`.photoImg` (bersudut lancip selebar kolom, latar `#e8e8ed`, maks tinggi `min(80vh, 720px)`, `object-fit: cover`, fokus terlihat pada tautan ukuran penuh) yang dipakai detail Kegiatan Desa, Posyandu, Program Kesehatan, dan Keamanan Lingkungan (dulu salinan di CSS detail masing-masing; dipindah tanpa perubahan tampilan); `KabarBerita` menerima `listLabel`/`loadingLabel` opsional (bawaan "Berita terbaru"/"Memuat kabar desa"; Kegiatan memakai "Kegiatan lainnya"/"Memuat kegiatan desa").

### Program Kesehatan (`/kesehatan/program-kesehatan[/{id}]`)

Daftar program **memakai kartu yang sama dengan Kegiatan Desa/Berita** (`KabarBerita` + `kabar.module.css`, `layout="grid"`) di `.section` Kabar Desa. Folder `(pages)/kesehatan/program-kesehatan/`: `page.tsx` (Suspense) → `_com/ProgramKesehatanPage.tsx` (kepala `KabarListHeader` dengan `tabs=[]` + `ProgramKesehatanBody` + `ProgramManfaat`), `_com/ProgramManfaat.tsx`, `_com/program.logic.ts`, `_com/program.source.ts`, `_com/use-program-kesehatan.ts`, `_com/program.meta.ts`, `_com/program.text.ts`, `_com/program.module.css`; detail `[id]/page.tsx` → `_com/detail/ProgramDetail.tsx` (+ `use-program-detail.ts`, `program-detail.module.css`; foto utama dari `.photo` `kabar-detail.module.css`). Test: `__tests__/api/program_kesehatan_page_logic.test.ts`, `__tests__/api/program_kesehatan_page_ui.test.tsx`.

- **Kepala**: sama dengan Berita (`KabarListHeader`): kembali, judul "Program Kesehatan Desa", pengantar, kolom cari `?search=` (API mencari di nama). **Tanpa pil kategori** (program tidak berkategori). `KabarListHeader` tidak merender `<nav>` pil bila `tabs` kosong.
- **Entri indikator disaring**: data program memuat 4 entri statistik (mis. Gizi Baik 86%). Atas keputusan user, metrik kesehatan tampil di Ringkasan Posyandu dari data nyata, bukan di sini. `isIndikator` = `persentase` > 0 **dan** tanpa foto. Form admin tidak bisa mengisi `persentase` (default 0) dan mewajibkan gambar, jadi entri admin selalu tampil; aturan tidak bergantung nama entri.
- **Data**: satu `programkesehatan/find-many` (page 1, limit `PROGRAM_FETCH_LIMIT` = 100, urut createdAt terbaru), indikator dibuang, lalu dipaginasi di klien (`paginate` dari `_com/kabar-list/kabar-list.logic.ts`). Ini mitigasi sementara karena API tidak punya filter jenis; entri > 100 tidak tampil (console.warn). Usulan backend: `?jenis=indikator|kegiatan`.
- **Program dan kegiatan**: judul `h2` 28px (mobile 24) tinta, lalu 7 per halaman (`PROGRAM_PAGE_LIMIT`) = 1 kartu utama (dengan `deskripsiSingkat`) + 6 kartu kecil grid 3 kolom (tablet 2, mobile 1). Meta kartu = tanggal entri dibuat (tanpa kategori, **tanpa label penulis**). `?page=` di luar jangkauan → halaman terakhir. Paginasi bulat `KabarListPagination` bila > 1 halaman.
- **Kosong/galat**: kotak `#f5f5f7`: "Belum ada program kesehatan.", "Tidak ada program atau kegiatan yang cocok dengan “…”." (juga bila kata kunci hanya cocok dengan indikator), atau "Program kesehatan gagal dimuat…".
- **Manfaat Program Kesehatan**: isi teks sama dengan halaman lama (3 butir). Ubin statis `#f5f5f7` radius 18px, 3 kolom (mobile 1): ikon garis Tabler 32px brand tanpa lingkaran, judul 21px, teks 17px abu. Tanpa denyut atau hover. Jarak antarblok `--section-pad-y`.
- **Detail**: pola Kegiatan/Pengumuman (`kabar-detail.module.css`), kolom 860px: kembali → meta tanggal dibuat panjang → judul `h1` → `deskripsiSingkat` sebagai pengantar 21px (mobile 19) abu → foto bersudut lancip (klik = ukuran penuh) → `deskripsi` 19px (mobile 17) rata kiri. Entri indikator tidak ditautkan dari daftar, tetapi URL lamanya tetap terbuka: meta "INDIKATOR KESEHATAN" dan panel `#f5f5f7` berisi angka persen 80px (mobile 56) brand + "Data diperbarui {tanggal}" sebagai ganti foto. Memuat → kerangka; 404 → "Program kesehatan tidak ditemukan…" + "Lihat semua program kesehatan"; galat → pesan muat ulang.

### Agenda & Kalender Desa (`/pemerintahan/event-budaya`)

Halaman "Agenda & Kalender Desa" (route lama tetap dipakai), senada kepala Berita/Pengumuman (`kabar-list.module.css` + `KABAR_BRAND_VARS`). Folder `(pages)/pemerintahan/event-budaya/`: `page.tsx` (state bulan tampil, kategori tersembunyi, saklar Rerainan Bali, modal) → `_com/`: `agenda-mendatang.tsx`, `agenda-kategori.tsx`, `agenda-tahun.tsx`, `agenda-kalender.tsx` (bilah alat + isi bulan), `kalender-bulan.tsx` (desktop/tablet), `kalender-ringkas.tsx` + `agenda-daftar-bulan.tsx` (ponsel), `agenda-detail-modal.tsx`, `agenda-hitung.tsx`; data `agenda.source.ts` + `use-agenda-data.ts` (`eventbudaya/find-many`, `tahun=` dan `mendatang=true`; hasil per tahun disimpan agar bolak-balik bulan tidak memuat ulang), logika `kalender.logic.ts`, konstanta `agenda.meta.ts`, teks `agenda.text.ts`, CSS `kalender.module.css` / `kalender-ponsel.module.css` / `agenda-mendatang.module.css` / `agenda-panel.module.css`. Semua tanggal dihitung sebagai hari kalender **WITA** (`hariWita`), bukan zona peramban. Test: `__tests__/api/agenda_kalender_{desa,logic,seed,ui,waktu}.test.ts(x)`.

- **Tata letak**: grid 2 kolom — panel kiri `minmax(300px, 340px)` (Acara mendatang → Kategori → Sepanjang tahun) | kalender. ≤1068px satu kolom, urutan: Acara mendatang → Kategori → kalender → ringkasan tahun.
- **Acara mendatang**: baris "Hari ini" (tanggal Masehi + baris Bali, lihat bawah), lalu sorotan acara terdekat (`AGENDA_MENDATANG_LIMIT` = 5: 1 sorotan + 4 baris) berwarna kategori dengan hitung mundur besar ("Hari ini", "Besok", "Lusa", "N hari/minggu/bulan lagi", "Hari ke-2 dari 3 hari"; nada warna segera ≤6 hari / nanti / berlangsung), kategori, nama, tanggal, lokasi. Sisa → "+N acara lain sudah terjadwal". Kosong → ikon + "Belum ada acara terjadwal"; galat → pesan.
- **Kategori**: legenda ala Outlook — kotak warna + nama + jumlah acara tahun ini; klik menyembunyikan/menampilkan kategori (hanya kategori yang punya acara; bila cuma satu, tampil sebagai keterangan: titik warna tanpa tombol, bukan kotak centang). Di bawahnya saklar **Rerainan Bali** (kunyit `#e09a1a`, selalu ada) yang menyalakan/mematikan seluruh lapisan Bali.
- **Sepanjang {tahun}**: 12 sel bulan berwarna menurut jumlah acara (kosong / 1 / 2–3 / ≥4) + total; klik membuka bulan itu.
- **Bilah kalender**: pil "Hari ini" (nonaktif di bulan ini), ‹ ›, judul bulan + baris sasih/Çaka · jumlah acara bulan (`aria-live`). Pindah bulan → isi bergeser masuk 16px searah tombol, 240ms (mati saat reduced motion). Memuat → kerangka berdenyut; galat → "Kalender gagal dimuat." + "Coba lagi"; bulan kosong → "Belum ada acara di {bulan}."
- **Kalender bulan (desktop/tablet, >734px)**: pola Outlook — 7 kolom Minggu–Sabtu (≤900px nama hari disingkat), hari ini dalam lingkaran, acara = blok pucat bergaris tebal warna kategori (`varWarnaKategori`), acara beberapa hari = pita melintang yang bersambung antar minggu; maksimal `KALENDER_LAJUR_MAKS` = 3 lajur per minggu, sisanya "+N lainnya". Acara yang sudah lewat diredupkan. Angka tanggal mana pun dalam bulan membuka modal hari.
- **Ponsel (≤734px)**: kalender ringkas (angka + maks `KALENDER_TITIK_MAKS` = 3 titik warna kategori, tanpa teks acara) + daftar bulan per hari (kolom tanggal kiri; baris hari Bali, rerainan, lalu kartu acara). Ketuk tanggal → loncat ke kelompok hari di daftar, atau langsung buka modal hari bila hari itu tak ada di daftar.
- **Modal**: tengah, radius 18px, lebar 560px. Satu acara → kategori, nama, pil hitung mundur, tanggal, lokasi, deskripsi. Satu hari (dari tanggal / "+N lainnya") → semua acara hari itu (kosong → "Tidak ada agenda desa pada hari ini.") lalu bagian Bali.
- **Kalender Bali** (`_com/kalender-bali.{logic,meta,wariga}.ts`, `kalender-bali.tsx`, `kalender-bali-hari.tsx`, `kalender-bali.module.css`; test `__tests__/api/kalender_bali_{logic,tahunan,ui}.test.ts(x)`):
  - Hitungan dari `balinese-date-js-lib` 0.4.3 (Apache-2.0), dihitung di klien sekali per bulan tampil. Pustaka membaca tanggal lokal, jadi `Date` dibangun dari komponen tanggal WITA (`dateUntukPustaka`) → hasil sama di zona waktu peramban mana pun (diuji di 3 zona).
  - **Tampil**: label wuku tegak di tepi kiri tiap minggu; nama hari Bali (saptawara + pancawara, mis. "Wraspati Pon") di kepala sel (turun 2 baris bila sempit, disembunyikan ≤900px atau bila tak muat); ikon purnama (cakram kuning) / tilem (cakram gelap bercincin) sejajar tengah tepat di kanan angka tanggal; rerainan sebagai teks kecil di bawah tanggal — hari raya besar = belah ketupat penuh, cokelat tebal; rutin (Kajeng Kliwon, Purnama/Tilem, Buda Cemeng, Anggara Kasih, dst.) = belah ketupat garis, abu. Maks `RERAINAN_SEL_MAKS` = 2 baris per sel, sisanya "+N rerainan"; nama panjang dipotong "…". Sengaja teks, **bukan** blok berwarna, agar agenda desa tetap jadi fokus. Ponsel: cukup ikon bulan atau belah ketupat di kalender ringkas; wewaran · wuku + rerainan di daftar.
  - **Kartu "Hari ini"**: tiga baris — "Wraspati Pon · Wuku Landep", "Penanggal 3 · Sasih Kanem", "Rerainan berikutnya: {hari raya besar terdekat} · N hari lagi" (cari s.d. 70 hari).
  - **Modal hari**: ringkasan (hari Bali · wuku · penanggal/pangelong · sasih · Çaka), daftar rerainan + catatan "agenda desa yang ditampilkan", lalu **wariga**: wewaran eka–dasa wara, pawukon (wuku + urip, ingkel, lintang, pancasuda, dll.), sasih (sasih, hari sasih, tahun Çaka). Hanya nama & angka hitungan — **tanpa** makna hari raya, dewasa ayu, atau ramalan.
  - **Agenda admin menang**: rerainan disembunyikan di hari yang punya agenda desa yang namanya memuat nama rerainan itu (dinormalisasi: tanpa "hari raya/rahina/hari", varian ejaan disamakan; kata utuh, bukan sebagian), mis. agenda "Perayaan Galungan dan Kuningan" menyembunyikan Galungan & Kuningan tapi tidak Penampahan.
  - **Rerainan tambahan** (tidak dihitung pustaka, `RERAINAN_TAMBAHAN`): Tumpek Krulut (Saniscara Kliwon wuku Krulut, tingkat besar), Hari Bhatara Sri, Buda Kliwon {wuku} (kecuali Sinta/Dungulan/Pahang), Redite Umanis Ukir, Soma Umanis Tolu, Soma Paing Warigadean, Buda Paing Kuningan, Anggara Paing Medangkungan, Watugunung Runtuh, Paid-paidan.
  - **Ejaan** (`EJAAN_BALI`, tiap entri mencatat sumbernya): Sabuh Emas→Sabuh Mas, Pager Wesi→Pagerwesi, Siwa Ratri→Siwaratri, Destha→Jiyestha, sasih sisipan Nampih→**Mala** (ikut kalenderbali.org, mis. "Purnama Mala Jiyestha" 20 Mei 2027). Ejaan pustaka & varian (Keliwon, Kesanga, Anggar Kasih, Nampih, …) tetap dikenali saat membandingkan dengan agenda.
  - **Validasi**: test mencocokkan purnama/tilem, rerainan per bulan, dan hari raya besar (Siwaratri, Nyepi, Galungan, Kuningan, Saraswati, Pagerwesi) dengan kalenderbali.org untuk 2026–2030 (`kalender_bali_tahunan.test.ts` = 2028–2030) — test merah bila pustaka suatu saat meleset dari kalender resmi. kalenderbali.org hanya dipakai sebagai kunci jawaban test; teksnya tidak disalin.

### Monev & Pembangunan (`/pemerintahan/monev-pembangunan`)

Gaya halaman detail APBDes. Kerangka `.section`/`.page`/`.inner`/`.header`/`.card`/`.panel` dipinjam dari `_com/main-page/apbdes/apbdes.module.css` bersama `APBDES_BRAND_VARS` (`apbdes.meta.ts`) dan format angka dari `apbdes.logic.ts` (`formatRupiah`, `formatRupiahCompact`, `formatPercent`, `barWidth`). Paginasinya `KabarListPagination` (`_com/kabar-list/`). Folder `(pages)/pemerintahan/monev-pembangunan/`:
- `page.tsx`: memuat data via state `monevPembangunan` dan menyusun bagian halaman.
- Komponen `_com/`: `MonevSummary.tsx` (3 kartu), `MonevApbdesLink.tsx`, `MonevKegiatanPanel.tsx` + `MonevKegiatanRow.tsx`, `DokumenPerencanaanSection.tsx` (+ `DokumenList`) + `DokumenPerencanaanRow.tsx`, `MonevStates.tsx` (ubin kosong, galat + coba lagi, kerangka).
- Pendukung `_com/`: `monev.logic.ts` (`isMonevEmpty`, `statusSegments`, `kegiatanStatus`/`kegiatanProgres`/`kegiatanMeta`, `FILTER_OPTIONS`, `statusQuery`), `monev.meta.ts` (warna status, `APBDES_HREF`, `MONEV_BRAND_VARS`), `monev.text.ts`.
- CSS: `monev.module.css` (ringkasan, kosong, panel APBDes, kepala panel), `monev-rows.module.css` (baris kegiatan & dokumen).
- Test: `__tests__/api/monev_page_logic.test.ts`, `__tests__/api/monev_page_ui.test.tsx`.

- **Kerangka**: latar putih, isi max-width 1100px. Atas: `BackButton`, judul `h1` 48px (mobile 32) brand rata tengah, pengantar abu. Antarbagian berjarak 20px (mobile 12). Urutan: ringkasan → panel "Realisasi anggaran desa" → panel "Daftar kegiatan" → panel "Dokumen Perencanaan".
- **Ringkasan**: 3 kartu `#f5f5f7` gaya kartu APBDes, ikon dalam lingkaran tint brand. Grid desktop 1.35fr | 1fr | 1fr; mobile ≤734px 2 kolom dengan kartu pertama selebar penuh (bukan 2+2+1).
  - **Kegiatan pembangunan**: angka besar + "kegiatan", lalu batang sebaran status 6px bertumpuk (lebar = porsi dari `totalKegiatan`). Di bawahnya legenda Rencana/Berjalan/Selesai + jumlah; "Status belum diisi" hanya bila `belumDiisi` > 0.
  - **Total anggaran**: Rupiah ringkas (`Rp 4,99 M`) + penuh. Anggaran 0 → "Belum tercatat".
  - **Rata-rata progres**: persen (`61,4%`) + bar 6px brand, dengan catatan "Dari kegiatan yang sudah melaporkan progres" (rata-rata API mengabaikan progres null).
  - Agregat selalu atas seluruh kegiatan; filter status tidak mengubahnya.
- **Tautan APBDes**: panel `#f5f5f7` berisi ikon, "Realisasi anggaran desa", teks, dan pil brand "Buka Realisasi APBDes ›" → `/apbdes`. Selalu tampil, juga saat data kosong. Mobile: tersusun ke bawah.
- **Warna status**: mengikuti `STATUS_PEMBANGUNAN_COLOR` (gray/blue/green shade 6, sama dengan badge admin); belum diisi = gray-4. Pil status putih + titik warna, karena tint pucat tidak terbaca di atas `#f5f5f7`.
- **Daftar kegiatan**:
  - Kepala panel: judul "Daftar kegiatan" + pengantar di kiri, `SegmentedControl` Semua/Rencana/Berjalan/Selesai di kanan (mobile di bawahnya). Ganti filter → halaman 1.
  - Kolom desktop (dengan header kecil Kegiatan / Progres / Anggaran): foto 64px radius 10 (tanpa foto → ikon di kotak putih) · judul 17px maks 2 baris + baris meta "lokasi · Sumber dana: …" + label "Bersumber dari RKP Desa {tahun}" (tautan PDF bila RKP tahun itu punya berkas) · pil status + bar progres 6px + persen · anggaran Rupiah penuh rata kanan.
  - Lebar kolom: desktop 64 | 1fr | 220 | 168px; tablet ≤1068px 56 | 1fr | 170 | 140px. Mobile: foto 56px, status/progres lalu "Anggaran Rp …" di bawah judul, tanpa header kolom.
  - Seluruh baris = tautan ke `/pemerintahan/kegiatan-desa/pembangunan/{id}` (tautan judul diregangkan); tautan RKP tetap bisa diklik sendiri.
  - Status/progres/anggaran null → "Status belum diisi" / "Progres belum diisi" (tanpa bar) / "Belum diisi" — progres null bukan 0%.
- **Dokumen perencanaan**:
  - Panel ber-`id="dokumen-perencanaan"` (`DOKUMEN_PERENCANAAN_PUBLIC_HREF`, dipakai PPID), `scroll-margin-top` 80px.
  - Kepala sama dengan daftar kegiatan, dengan tab RPJM Desa / RKP Desa / Berita Acara Musyawarah (≤734px disingkat "Berita Acara").
  - Baris: ikon dokumen di kotak putih 48px · periode/tahun (+ jenis musyawarah) 12px kapital brand · judul 17px · "Nomor Perdes: …" · ringkasan maks 3 baris · pil putih "Lihat PDF" (tab baru) + pil brand "Unduh". Tanpa berkas → "Berkas PDF belum tersedia." Mobile: tombol turun ke bawah teks.
  - Kosong per jenis → "Belum ada dokumen {jenis}…".
- **Kosong**: `totalKegiatan` 0 → ringkasan, filter, dan daftar tidak dirender; gantinya satu ubin `#f5f5f7` (ikon, "Belum ada kegiatan pembangunan yang dipantau", penjelasan). Tidak ada "Rp 0" atau 0% di layar. Data tidak pernah dikarang: nilai yang tidak ada ditulis "belum diisi"/"Belum tercatat".
- **Memuat/galat**: memuat → kerangka abu (3 kartu / baris). Galat → pesan + pil putih "Coba lagi": di ubin atas bila ringkasan belum ada, di dalam panel bila daftar atau dokumen gagal.
- **Paginasi**: `KabarListPagination` (bulat 36px, aktif latar brand) di bawah panel, hanya bila > 1 halaman. Kegiatan 9 per halaman (state `monevPembangunan`), dokumen 6 per halaman (state `dokumenPerencanaanPublik`).

### Posyandu (`/kesehatan/posyandu`)

Gaya halaman Monev/APBDes. Kerangka `.section`/`.page`/`.inner`/`.header`/`.card`/`.panel` dari `_com/main-page/apbdes/apbdes.module.css` + `POSYANDU_BRAND_VARS`. Folder `(pages)/kesehatan/posyandu/`: `page.tsx` (Suspense) → `_com/PosyanduPage.tsx`; komponen `PosyanduTabs`, `RingkasanPanel`, `PosyanduDirectory` + `PosyanduRow`, `BanjarStatsPanel` (kerangka panel per banjar) + `BalitaPanel` + `IbuHamilPanel`, `PosyanduStates`; pendukung `posyandu.logic.ts` (`formatHitungan`, `targetStuntingTampil`, `persenTampil`, `banjarLabel`, `telHref`, `mapWithLimit`, `hasUnassigned`, `parseTab`), `posyandu.meta.ts` (`PRIVASI_AMBANG` = 3, khusus persentase, `BANJAR_STATS_CONCURRENCY` = 4, `POSYANDU_LIST_LIMIT` = 100), `posyandu.source.ts`, `use-posyandu-data.ts` (`loadBanjarStats`), `posyandu.text.ts`; hook muat `useLazyLoad` + tipe `LoadState` dari modul bersama `src/app/(public)/_com/lazy-load/use-lazy-load.ts` (juga dipakai CCTV); CSS `posyandu.module.css`, `posyandu-rows.module.css`. Test: `__tests__/api/posyandu_page_{logic,ui}.test.ts(x)`.

- **Kerangka**: latar putih, isi 1100px. `BackButton`, judul `h1` 48px (mobile 32) brand rata tengah, pengantar abu. Di bawahnya `SegmentedControl` di tengah (gaya pemilih tahun APBDes): Ringkasan / Data Posyandu / Balita / Ibu Hamil; ponsel ≤734px "Data Posyandu" disingkat "Posyandu". Tab tersimpan di `?tab=` (`router.replace`, tanpa gulir) supaya kembali dari detail mendarat di tab yang sama. Ganti tab → isi fade + naik 6px 280ms (mati saat reduced motion). Data tiap tab dimuat saat tab pertama kali dibuka lalu disimpan selama halaman terbuka.
- **Ringkasan**: dua baris 3 kartu `#f5f5f7` gaya kartu APBDes dari `GET /kesehatan/ringkasankesehatan/stats` (seluruh desa). Baris 1 hitungan: Ibu hamil aktif (brand) · Balita terdaftar (teal) · Alert stunting (oranye, "Balita berstatus alert atau stunting"); warna netral, bukan penilaian. Kartu Alert stunting menutup dengan baris **Target stunting desa** (`targetStuntingPct`, diatur admin): garis tipis di atas, label abu kiri, nilai "10%" tinta kanan, menempel di dasar kartu (mobile: nilai di bawah label). Baris ini hanya tampil bila target > 0 (0/null tidak ditulis "0%"), dan sengaja tanpa bar, persen capaian, atau perbandingan, karena `alertStunting` adalah hitungan gabungan alert + stunting, bukan prevalensi stunting. Baris 2 persentase + bar 6px: Imunisasi lengkap · Gizi baik · Pemeriksaan rutin, catatan "Dari balita terdaftar". Di bawahnya catatan privasi rata tengah. Mobile: kartu pertama tiap baris selebar penuh, dua lainnya berdampingan.
- **Ambang privasi** (berlaku di semua tab): hitungan selalu angka asli (tanpa "< 3"). Persentase hanya tampil bila balita ≥ 3; balita 1-2 → "Belum cukup data", tanpa balita → "Belum ada data" (API membalas 0%, jadi 0% tidak pernah ditampilkan).
- **Data Posyandu**: panel berisi kepala (judul "Daftar posyandu" + "N posyandu terdaftar…", kolom cari pil `LayananSearch` berlatar putih, menyaring nama di klien) lalu baris bergaris pemisah: foto 64px radius 10 hanya bila ada dan berhasil dimuat (tanpa foto/rusak → ikon di kotak putih, tidak ada gambar "No image") · nama banjar 12px kapital brand + nama 17px semibold + jadwal (`jadwalToText`, ikon kalender, maks 2 baris) · pil putih nomor telepon (`tel:`, spasi/tanda hubung dibuang) · chevron. Seluruh baris = tautan detail (tautan nama diregangkan), pil telepon bisa diklik sendiri. Urut nama, semua posyandu sekaligus tanpa paginasi (limit 100). Badge "Aktif" palsu dihapus. Kosong ditulis jujur: "Banjar belum diisi" / "Jadwal belum diisi" / "Nomor belum diisi". Nama banjar yang sudah berawalan "Banjar" tidak digandakan. Mobile: foto 56px, pil telepon turun ke bawah jadwal.
- **Balita** (panel "Balita per banjar"): angka gabungan per banjar dari `stats?banjarId=` (daftar banjar `GET /kesehatan/banjar/find-many`, paling banyak 4 permintaan bersamaan) + baris pertama "Seluruh desa" (brand, tebal). Kolom desktop: Banjar · Balita terdaftar · Alert stunting · Imunisasi lengkap · Gizi baik · Pemeriksaan rutin, angka rata kanan tabular. Mobile: kepala kolom disembunyikan, tiap banjar jadi blok berlabel 6 lajur (2 hitungan setengah lebar, 3 persen sepertiga lebar). Tanpa nama/data pribadi; endpoint `balita/find-many` & `ibuhamil/find-many` tidak dipakai lagi di halaman publik.
- **Ibu Hamil** (panel "Ibu hamil aktif per banjar"): ubin putih radius 14px, "Seluruh desa" selebar penuh lalu grid per banjar (mobile 2 kolom), angka 32px (mobile 28) + "orang". Hanya status aktif (API tidak merinci status lain).
- **Catatan panel**: bila angka desa lebih besar dari jumlah banjar → "Sebagian data belum terhubung ke banjar…" (tanpa angka selisih). Catatan privasi di bawah tiap panel.
- **Memuat/galat**: kerangka abu berdenyut; galat → ubin pesan + pil putih "Coba lagi". Daftar banjar gagal → seluruh panel galat; satu banjar (atau angka desa) gagal → baris itu "Gagal dimuat", baris lain tetap tampil.
- **Detail** (`/kesehatan/posyandu/{id}`, `[id]/page.tsx` → `_com/detail/PosyanduDetail.tsx`; hook `use-posyandu-detail.ts`, CSS `posyandu-detail.module.css`, foto utama dari `.photo` `kabar-detail.module.css`): pola detail Pengumuman, `.section` Kabar Desa, kolom 860px (`kabar-detail.module.css`). Kembali → nama banjar 12px kapital brand → judul `h1` 40px (mobile 28) tinta → foto selebar kolom bersudut lancip (maks `min(80vh, 720px)`, klik = ukuran penuh tab baru) hanya bila ada dan termuat; tanpa placeholder "Tidak ada gambar" → panel info `#f5f5f7` radius 18px berisi baris ikon (lingkaran putih) · label · nilai: Banjar, Jadwal pelayanan (per baris "Senin–Jumat 08.00–12.00"; data lama teks polos), Telepon (nomor + pil brand "Telepon" `tel:`); nilai kosong "… belum diisi". Mobile: label di atas nilai → "Tentang posyandu" (`deskripsi` rich text 19px, mobile 17) hanya bila ada isi. Memuat → kerangka (`aria-busy`); 404 → "Posyandu tidak ditemukan…", galat → pesan muat ulang; keduanya + tautan "Lihat semua posyandu" (`?tab=posyandu`).

### Kontak Darurat Kesehatan (`/kesehatan/kontak-darurat`)

Daftar "call-first": nomor dan tombol panggil langsung di daftar, tidak perlu membuka detail dulu. Folder `(pages)/kesehatan/kontak-darurat/`: `page.tsx` → `_com/KontakDaruratList.tsx` (memakai `NationalEmergency`, `KontakRow`, `KontakActions` dari modul bersama `(public)/_com/kontak-darurat/`, yang juga dipakai Kontak Darurat Keamanan dan Polsek Terdekat), `[id]/page.tsx` → `_com/detail/KontakDaruratDetail.tsx`. Pendukung: `_com/kontak-darurat.logic.ts` (`toPlainText`, `filterKontak`), `kontak-darurat.source.ts`, `use-kontak-darurat.ts`, `kontak-darurat.meta.ts` (limit, `NATIONAL_EMERGENCY_NUMBERS`), `kontak-darurat.text.ts` (`KONTAK_TEXT`, `NATIONAL_TEXT`). Modul bersama `(public)/_com/kontak-darurat/`: `kontak-phone.logic.ts` (`phoneInfo`, `phoneDigits`; normalisasi WhatsApp memakai ulang `normalizeWaNumber` dari `ekonomi/umkm/_lib/pesanan.ts`), `kontak-darurat.meta.ts` (`KONTAK_BRAND_VARS`, `KONTAK_SEARCH_THRESHOLD`, `NationalEmergencyEntry`), `kontak-darurat.text.ts` (`KONTAK_CALL_TEXT`, `PHONE_KIND_LABEL`, `NATIONAL_BASE_TEXT`). CSS bersama: `kontak-darurat.module.css` (panel, baris, nomor, tombol, kerangka), `kontak-nasional.module.css` (blok nasional); khusus Kesehatan: `detail/kontak-detail.module.css`. Kerangka, kepala halaman & kepala bagian dari `layanan/_com/layanan.module.css`, detail dari `_com/kabar-list/kabar-detail.module.css`. Test: `__tests__/api/kontak_darurat_kesehatan_page_logic.test.ts`, `__tests__/api/kontak_darurat_kesehatan_page_ui.test.tsx`, `__tests__/api/kontak_darurat_phone_logic.test.ts` (modul bersama).

- **Kerangka**: sama dengan Daftar Layanan. Latar putih, tepi `--edge-gutter`, kembali, judul `h1` "Kontak Darurat Kesehatan" 48px (mobile 32) warna brand, pengantar 19px abu. Dua bagian berjarak 96px (mobile 72), masing-masing dengan kepala `h2` 32px (mobile 24) + pengantar 17px.
- **Darurat nasional** (bagian pertama): 112 "Panggilan darurat terpadu" (polisi, ambulans, pemadam kebakaran) dan 119 "Ambulans gawat darurat (PSC 119)", pengantar "Gratis dan aktif 24 jam, berlaku di seluruh Indonesia."
  - Data statis, bukan dari API: nomor di `kontak-darurat.meta.ts`, nama, `shortName` dan keterangan di `NATIONAL_TEXT` (112 memakai `NATIONAL_BASE_TEXT.emergency112` bersama). Nomor nasional sama di seluruh Indonesia.
  - Dua kartu `#f5f5f7` radius 18px berdampingan; tablet ≤1068px satu kolom. Isi kartu: ikon (SOS / ambulans) dalam lingkaran merah muda `#fde8ea` warna `#d70015` 56px, nomor 40px tebal tabular, nama 17px semibold, keterangan 15px abu, pil brand "Telepon" (`tel:112` / `tel:119`, tanpa WhatsApp).
  - Mobile ≤734px: kartu ringkas 2×2 (gap 12px, padding 16/12): ikon 32px sebaris dengan nomor 30px, lalu nama pendek 15px (`shortName`: "Darurat terpadu", "Ambulans"), keterangan dan nama lengkap disembunyikan (nama lengkap tetap di `aria-label` tombol), tombol "Telepon" selebar kartu tinggi 48px di dasar kartu supaya sejajar antarkartu. `NationalEmergency` merender `nameFull` + `nameShort`, CSS memilih salah satu. Muat sampai lebar 320px.
  - Selalu tampil, juga saat daftar desa memuat/gagal/kosong, dan **tidak ikut disaring** kolom cari.
- **Layanan kesehatan terdekat** (bagian kedua): `find-many` limit 50 (`KONTAK_LIST_LIMIT`), semua kontak tampil sekaligus **tanpa paginasi**. Kolom cari pil (`LayananSearch`, saring di klien: nama, deskripsi, digit nomor) di slot kanan kepala bagian, hanya bila kontak > 6 (`KONTAK_SEARCH_THRESHOLD`, modul bersama).
- **Baris**: panel `#f5f5f7` radius 18px berisi baris bergaris pemisah. Isi tiap baris:
  - foto 72px radius 10 (mobile 56px) hanya bila ada; tanpa foto → ikon kotak P3K di kotak putih;
  - nama `h3` 19px semibold = tautan ke detail + chevron;
  - deskripsi diratakan jadi teks (`toPlainText`, menghindari bug lineClamp WebKit pada tag blok), maks 2 baris (mobile 3);
  - di kanan: label jenis 12px kapital ("Seluler" / "Telepon tetap") + nomor 24px (mobile 26) tabular, lalu pil brand "Telepon" dan pil putih "WhatsApp" (ikon hijau).
  - Kolom tombol minimal selebar dua tombol supaya nomor sejajar antarbaris.
  - Tablet ≤1068px: nomor di atas tombol. Mobile ≤734px: nomor dan tombol turun selebar baris, dua tombol berbagi lebar, tinggi 48px.
- **Nomor**: field API `whatsapp` berisi nomor apa pun.
  - Seluler 08xx/+628xx → `tel:+628…` + `https://wa.me/628…` (tab baru), tampil "0812 3958 0000".
  - Telepon tetap → `tel:+62361…` saja. Nomor pelanggan dipisah sebelum 4 digit terakhir: 7 digit "(0361) 846 3263", 8 digit "(021) 1234 5678"; nomor pelanggan 6 digit (nomor lama) dibagi 3+3: "(0361) 411 270". Kode wilayah 2 digit untuk 021/022/024/031/061.
  - Nomor layanan pendek (112/119) → `tel:` apa adanya.
  - `tel:` tidak pernah `target="_blank"`. Nomor kosong → "Nomor belum diisi" tanpa tombol.
  - Catatan "Tombol WhatsApp hanya tersedia untuk nomor seluler." tampil bila ada nomor desa tanpa WhatsApp.
- **Memuat/kosong/galat** (bagian desa saja): kerangka baris berdenyut (`aria-busy`); kosong → kotak `#f5f5f7` "Belum ada kontak darurat kesehatan."; galat API → pesan + pil putih "Coba lagi".
- **Detail**: kolom 860px, urutan:
  - kembali;
  - kategori "Kontak Darurat Kesehatan" 12px kapital brand (tautan ke daftar);
  - `h1` nama 40px (mobile 28);
  - panel `#f5f5f7` berisi label + nomor 32px (mobile 28) + tombol yang sama (mobile bertumpuk, tombol selebar panel);
  - deskripsi rich text 19px (mobile 17);
  - foto selebar kolom (maks tinggi `min(70vh, 560px)`), hanya bila ada.
  - Tampilan bergaya form admin dihapus. HTTP 404 atau `isActive:false` → "Kontak tidak ditemukan…" + "Lihat semua kontak"; galat → pesan + "Coba lagi".

### Keamanan Lingkungan (`/keamanan/keamanan-lingkungan-pecalang-patwal[/{id}]`)

Daftar **memakai kartu yang sama dengan Kegiatan Desa/Berita** (`KabarBerita` + `kabar.module.css`, `layout="grid"`) di `.section` Kabar Desa (latar putih, tepi `--edge-gutter`, `KABAR_BRAND_VARS`). Folder `(pages)/keamanan/keamanan-lingkungan-pecalang-patwal/`: `page.tsx` (Suspense) → `_com/KeamananLingkunganPage.tsx` (kepala `KabarListHeader` dengan `tabs=[]` + `KeamananLingkunganBody`), `_com/keamanan-lingkungan.logic.ts` (`toKeamananLingkunganItem`, `keamananLingkunganDetailHref`, `keamananLingkunganListHref`, `hasHtmlContent`), `_com/keamanan-lingkungan.source.ts` (`loadKeamananLingkunganPage`, `loadKeamananLingkunganDetail`), `_com/keamanan-lingkungan.meta.ts`, `_com/keamanan-lingkungan.text.ts`; detail `[id]/page.tsx` → `_com/detail/KeamananLingkunganDetail.tsx` (+ `use-keamanan-lingkungan-detail.ts`). Tanpa CSS sendiri: daftar dari `kabar.module.css` + `kabar-list.module.css`, detail sepenuhnya dari `_com/kabar-list/kabar-detail.module.css` (termasuk `.photo`). Dipakai ulang: `KabarListHeader`, `KabarListPagination`, `useKabarPage`, `withListQuery`, `htmlToText`, `formatTanggalTerbit`, `BackButton`. Test: `__tests__/api/keamanan_lingkungan_tips_logic.test.ts`, `__tests__/api/keamanan_lingkungan_tips_ui.test.tsx` (dipakai bersama Tips Keamanan).

- **Kepala**: sama dengan Program Kesehatan (`KabarListHeader`): kembali, judul "Keamanan Lingkungan (Pecalang / Patwal)", pengantar "Pecalang dan Patwal (Patroli Pengawal) bertugas memastikan desa tetap aman, tertib, dan kondusif bagi seluruh warga.", kolom cari `?search=` selalu tampil (API mencari di judul dan deskripsi). **Tanpa pil kategori** (entri tidak berkategori).
- **Daftar**: `keamananlingkungan/find-many` limit 7 (`KEAMANAN_LINGKUNGAN_PAGE_LIMIT`), paginasi di server = 1 kartu utama (kartu besar 3fr|2fr dengan ringkasan) + 6 kartu kecil grid 3 kolom (tablet 2, mobile 1 bertumpuk). Judul `h2` daftar hanya untuk pembaca layar. Ringkasan kartu = `deskripsi` HTML diratakan jadi teks (`htmlToText`), tidak rata kanan-kiri. Gambar hanya bila entri punya tautan foto. Meta kartu = **tanggal entri dibuat** (`createdAt`), tanpa kategori dan tanpa label penulis; menunggu kolom tanggal kegiatan dari backend (docs/BACKEND-TODO.md). Urutan mengikuti API. `?page=` menentukan halaman; paginasi bulat `KabarListPagination` hanya bila > 1 halaman.
- **Detail**: pola Kegiatan/Program Kesehatan (`kabar-detail.module.css`), kolom 860px tanpa kartu dan **tanpa label "Deskripsi"**: kembali → meta tanggal dibuat panjang (`formatTanggalTerbit`, `createdAt`; menunggu kolom tanggal kegiatan dari backend (docs/BACKEND-TODO.md)) → judul `h1` 40px (mobile 28) tinta → foto bersudut lancip selebar kolom (`.photo`/`.photoImg`, maks tinggi `min(80vh, 720px)`, `object-fit: cover`, klik = ukuran penuh tab baru) → `deskripsi` 19px (mobile 17) rata kiri. Bagian kosong tidak dirender: tanpa foto tidak ada placeholder, dan isi editor kosong (`<p></p>`) dianggap kosong oleh `hasHtmlContent` (berisi bila ada teks atau `<img>`). Memuat → kerangka berdenyut (`aria-busy`).
- **Kosong**: kotak `#f5f5f7`: "Belum ada informasi keamanan lingkungan." atau "Tidak ada informasi keamanan lingkungan yang cocok dengan “…”.". Detail 404 → "Informasi keamanan lingkungan tidak ditemukan atau sudah tidak ditampilkan." + tautan "Lihat semua keamanan lingkungan ›".
- **Galat**: daftar → "Keamanan lingkungan gagal dimuat. Coba muat ulang halaman."; detail (selain 404) → pesan yang sama + tautan "Lihat semua keamanan lingkungan ›". Pemuat melempar Error berkonteks (endpoint + status HTTP), bukan menelan galat.
- **Mobile (≤ 734px)**: kartu kecil satu kolom bertumpuk, kolom cari selebar layar di bawah pengantar, detail judul 28px dan isi 17px, tanpa geser horizontal (diuji 390px dan 1440px).

### Polsek Terdekat (`/keamanan/polsek-terdekat`)

Satu halaman "call-first" berisi semua kantor polisi, urut dari yang terdekat, dengan satu peta untuk polsek terpilih. Folder `(pages)/keamanan/polsek-terdekat/`: `page.tsx` → `_com/PolsekTerdekatPage.tsx` (`PolsekRow.tsx`, `PolsekMapPanel.tsx`); `semua-polsek/page.tsx` hanya redirect. Pendukung: `_com/polsek.logic.ts` (`filledText`, `parseJarakKm`, `formatJarak`, `sortByJarak`, `jamInfo`, `layananNames`, `mapEmbedSrc`, `directionsHref`, `pickMapPolsek`), `polsek.source.ts` (`GET /keamanan/polsekterdekat/find-many` limit 50 lewat `readFindMany`, galat dilempar dengan konteks), `use-polsek.ts`, `polsek.meta.ts` (`POLSEK_LIST_LIMIT`, `POLSEK_HREF`, `POLSEK_MAP_SECTION_ID`, `POLSEK_BRAND_VARS`), `polsek.text.ts`; CSS `polsek.module.css` (baris, ubin jarak, peta). Dipakai ulang tanpa salin: `KontakActions`, `phoneInfo` (`kontak-phone.logic.ts`), `KontakRowPlaceholder`, dan kelas `.panel`/`.btn`/`.btnCall`/`.btnWa`/`.retry` dari `_com/kontak-darurat/`; kerangka, kepala halaman & kepala bagian dari `layanan/_com/layanan.module.css`; pil pemilih peta `.pills`/`.pill` dari `_com/kabar-list/kabar-list.module.css`. State admin `polsekTerdekat` tidak dipakai lagi di halaman publik. Test: `__tests__/api/polsek_terdekat_page_logic.test.ts`, `__tests__/api/polsek_terdekat_page_ui.test.tsx`.

- **Kepala**: sama dengan Kontak Darurat Kesehatan. Latar putih, tepi `--edge-gutter`, kembali, judul `h1` "Kantor Polisi Terdekat" 48px (mobile 32) warna brand, pengantar 19px abu. Dua bagian berjarak 96px (mobile 72) dengan kepala `h2` 32px (mobile 24): "Kantor polisi di sekitar desa" (pengantar: jarak dihitung dari Desa Darmasaba) dan "Peta lokasi".
- **Baris polsek**: semua polsek sekaligus, **tanpa paginasi dan tanpa kolom cari**, di panel `#f5f5f7` radius 18px bergaris pemisah. Isi tiap baris:
  - ubin putih jarak 88px radius 14 (tablet 76px, mobile 60px): angka 28px tebal tabular ("5,8") + satuan 13px abu ("km"; di bawah 1 km ditulis meter). Jarak tak diketahui → ikon perisai brand;
  - nama `h3` 19px semibold (mobile 17), bukan tautan (tidak ada halaman detail). Baris pertama diberi label "TERDEKAT" 12px kapital (latar tint brand `#E5F2FA`, teks brand), hanya bila jaraknya diketahui dan polsek lebih dari satu;
  - jam operasional (lihat butir Telepon & jam), lalu alamat 15px abu;
  - pil putih "Petunjuk arah" 38px (mobile 44px) ke `linkPetunjukArah` (tab baru, `noopener`), lalu tautan teks brand "Lihat di peta" (ikon peta; `aria-controls` ke bagian peta, `aria-pressed` = polsek yang sedang di peta). Klik → polsek itu tampil di peta dan halaman bergulir ke bagian peta (instan bila reduced motion);
  - di kanan `KontakActions`: label "TELEPON TETAP" + nomor 24px tabular + pil brand "Telepon".
- **Telepon & jam ("-" disembunyikan)**: isian kosong, berisi tanda hubung atau tanda pisah saja ("-" dan sejenisnya), "." atau "N/A" diperlakukan sebagai tidak ada dan **tidak ditampilkan sama sekali**: tanpa teks "-", tanpa "Nomor belum diisi", tanpa kolom nomor.
  - Nomor lewat `phoneInfo`: `tel:+62…` tanpa `target`, tampil "(0361) 829 949". WhatsApp hanya untuk seluler (data polsek saat ini semua telepon tetap).
  - Badge hijau "Buka 24 jam" (titik `#30a14e`, teks `#1d7a34`) **hanya** bila seluruh isian jam berbunyi "24 jam" / "Buka 24 Jam" / "24 jam setiap hari" / "24/7". Isian campuran seperti "08.00-16.00, piket 24 jam" tidak dianggap 24 jam. Jam lain ditulis apa adanya dengan ikon jam, abu. Badge "Buka" hardcoded lama dihapus.
  - Tombol "Petunjuk arah" hanya untuk URL http(s); "Lihat di peta" hanya bila polsek punya URL embed yang sah.
- **Urutan jarak**: dari teks bebas `jarakKeDesa` (`parseJarakKm`): "7 Km" → 7, "5,8 Km" → 5,8, "1.5 km" → 1,5, "800 m" → 0,8, "1.200 meter" → 1,2; tanpa satuan dianggap km. Jarak kosong/"-"/tanpa angka ditaruh paling bawah dengan urutan asal API tetap. API sendiri mengurutkan `createdAt` desc.
- **Peta**: **satu** iframe Google Maps untuk polsek terpilih, bukan iframe per kartu. Default polsek terdekat yang punya peta.
  - `loading="lazy"`, `title` "Peta lokasi {nama}", `referrerPolicy="no-referrer-when-downgrade"`. Sumber hanya `https://www.google.com/maps/embed…` (`mapEmbedSrc`).
  - Pil pemilih (`aria-pressed`, aktif latar brand) tampil bila polsek berpeta lebih dari satu.
  - Kotak peta radius 18px di kiri (desktop 1.65fr, tinggi min 420px). Di kanan ubin info `#f5f5f7` (1fr): nama 24px; "Di Google Maps: …" bila `namaTempatMaps` beda dengan nama; daftar label kapital 12px Alamat (`alamatMaps`, cadangan `alamat`) / Jam operasional / Layanan tersedia (`LayananToPolsek` aktif + `layananPolsek`, tanpa duplikat, ikon centang brand); pil brand "Petunjuk arah".
  - Bagian peta ber-`id="peta-polsek"`, `scroll-margin-top` 80px. Tidak dirender bila tidak ada polsek berpeta.
- **Memuat/galat/kosong**: memuat → `KontakRowPlaceholder` berdenyut (`aria-busy`). Galat API → pesan "Data kantor polisi gagal dimuat…" + pil putih "Coba lagi" (galat tidak pernah tampil sebagai daftar kosong). Kosong → kotak `#f5f5f7` "Belum ada data kantor polisi.". Peta tidak tampil di ketiga keadaan ini.
- **Redirect semua-polsek 307**: `/keamanan/polsek-terdekat/semua-polsek` (dulu daftar 3 per halaman dengan iframe per kartu) kini server component `redirect(POLSEK_HREF)`, yaitu 307 sementara (bukan 308 yang di-cache browser) agar tautan lama tetap hidup dan mudah dibalik. Tombol "Lihat Kantor Polisi Lainnya" dihapus.
- **Mobile**:
  - Tablet ≤1068px: ubin jarak 76px, nomor di atas tombol Telepon, peta (tinggi min 360px) di atas ubin info.
  - Mobile ≤734px: baris jadi ubin jarak 60px + isi; nomor dan tombol Telepon turun selebar baris (tinggi 48px, aturan `.call` bersama); pil "Petunjuk arah" dan "Lihat di peta" setinggi 44px. Pil pemilih peta jadi baris geser sampai tepi layar (pola Berita). Peta tinggi min 300px. Ubin info berpadding 24/20px dengan "Petunjuk arah" selebar ubin, tinggi 48px.

### Kontak Darurat Keamanan (`/keamanan/kontak-darurat`)

Pola "call-first" yang sama dengan Kontak Darurat Kesehatan, dari modul bersama `(public)/_com/kontak-darurat/`, tetapi kontak dikelompokkan per kategori dan tanpa halaman detail. Folder `(pages)/keamanan/kontak-darurat/`: `page.tsx` → `_com/KontakKeamananList.tsx` (memakai `NationalEmergency`, `KontakRow`, `KontakActions` bersama). Pendukung: `_com/kontak-keamanan.logic.ts` (`toGroups`, `filterGroups`, `countItems`), `kontak-keamanan.source.ts` (`GET /api/keamanan/kontakdaruratkeamanan/findMany`, camelCase; `find-many` tidak ada), `use-kontak-keamanan.ts`, `kontak-keamanan.meta.ts` (`KATEGORI_LIST_LIMIT`, `KEAMANAN_NATIONAL_ENTRIES`), `kontak-keamanan.text.ts` (`KEAMANAN_TEXT`). CSS: `kontak-keamanan.module.css` (kelompok + judul berikon); panel, baris, nomor dan tombol dari `_com/kontak-darurat/kontak-darurat.module.css`. Kerangka, kepala halaman & kepala bagian dari `layanan/_com/layanan.module.css`. Test: `__tests__/api/kontak_darurat_keamanan_page.test.tsx`.

- **Kerangka**: sama dengan Kontak Darurat Kesehatan. `h1` "Kontak Darurat Keamanan", pengantar "Nomor polisi, pemadam kebakaran, dan tim penyelamat untuk warga Desa Darmasaba. Tekan Telepon untuk langsung menghubungi." Dua bagian: Darurat nasional, lalu Kontak keamanan wilayah.
- **Darurat nasional**: komponen bersama `NationalEmergency` dengan empat nomor statis (`KEAMANAN_NATIONAL_ENTRIES`, bukan dari API): 112 "Panggilan darurat terpadu", 110 "Polisi", 113 "Pemadam kebakaran", 115 "Basarnas (pencarian dan pertolongan)". Desktop kartu 2×2, tablet ≤1068px satu kolom, mobile ≤734px kartu ringkas 2×2 dengan `shortName` ("Darurat terpadu", "Polisi", "Damkar", "Basarnas (SAR)"). Selalu tampil dan tidak ikut disaring cari.
- **Kontak keamanan wilayah**: `h2` + pengantar "Kantor polisi, pemadam kebakaran, dan instansi lain yang melayani wilayah Desa Darmasaba." Semua kategori dimuat sekaligus (limit 50) **tanpa paginasi**, urutan dari API (`createdAt` desc).
  - Kategori → kelompok: judul `h3` 21px semibold (mobile 19) dengan ikon kategori (`IconMapper` admin, 20px) dalam lingkaran `#f5f5f7` 36px warna brand, lalu panel baris. Jarak antarkelompok 48px (mobile 40), judul ke panel 16px (mobile 12).
  - Kategori tanpa kontak (mis. "SAR & Evakuasi") **disembunyikan**. Relasi `kategori` dari API diabaikan: isinya hanya salinan kontak pertama yang dipilih saat create, bukan nomor utama.
  - Baris = `KontakRow` bersama dengan nama `h4` (tanpa tautan, tanpa deskripsi), ikon item (`IconMapper`, 28px) di kotak putih, nomor besar + pil "Telepon" + "WhatsApp" hanya untuk seluler. Satu kontak boleh muncul di dua kategori (key baris = id relasi).
  - Cari (`LayananSearch`) hanya bila total kontak > 6 (`KONTAK_SEARCH_THRESHOLD`): nama kategori cocok → seluruh kontaknya tampil; selain itu kontak yang nama atau digit nomornya cocok (≥ 3 digit, boleh berspasi/kurung). Kelompok tanpa sisa kontak hilang.
  - Catatan "Tombol WhatsApp hanya tersedia untuk nomor seluler." tampil bila ada nomor tanpa WhatsApp (data saat ini semua 0361).
- **Memuat/kosong/galat** (bagian wilayah saja): kerangka baris berdenyut (`aria-busy`); semua kategori kosong → kotak `#f5f5f7` "Belum ada kontak darurat keamanan."; tidak cocok → "Tidak ada kontak yang cocok dengan “…”."; galat API → pesan + pil putih "Coba lagi".

### Pencegahan Kriminalitas (`/keamanan/pencegahan-kriminalitas[/{id}]`)

Satu halaman daftar senada Kegiatan Desa dan Program Kesehatan di `.section` Kabar Desa (latar putih, tepi `--edge-gutter`, `KABAR_BRAND_VARS`); halaman lama "Program Lainnya" dilebur ke sini. Folder `(pages)/keamanan/pencegahan-kriminalitas/`: `page.tsx` (Suspense) → `_com/PencegahanPage.tsx` (kepala `KabarListHeader` dengan `tabs=[]` + `PencegahanBody`), `_com/PencegahanSorotan.tsx`, `_com/PencegahanCards.tsx` (kartu + kerangka memuat), `_com/VideoFacade.tsx`, `_com/YoutubeThumb.tsx`, `_com/pencegahan.logic.ts` (`youtubeId`, `externalVideoHref`, URL pratinjau/pemutar, href, `toPencegahanItem`, `arrangePencegahan`), `_com/pencegahan.source.ts`, `_com/use-pencegahan.ts`, `_com/pencegahan.meta.ts`, `_com/pencegahan.text.ts`, `_com/pencegahan.module.css`; detail `[id]/page.tsx` → `_com/detail/PencegahanDetail.tsx` (+ `use-pencegahan-detail.ts`, `pencegahan-detail.module.css`); `program-lainnya/page.tsx` = redirect. Dipakai ulang dari modul bersama: `KabarListHeader`, `KabarListPagination`, `parsePage`/`withListQuery`/`paginate` (`kabar-list.logic.ts`), kelas kartu `kabar.module.css`, kerangka detail `kabar-detail.module.css`, `readFindMany`, `htmlToText`, `formatTanggalKabar`, `formatTanggalTerbit`, `BackButton`. Test: `__tests__/api/pencegahan_kriminalitas_page_logic.test.ts`, `__tests__/api/pencegahan_kriminalitas_page_ui.test.tsx`.

- **Kepala**: sama dengan Program Kesehatan (`KabarListHeader`): kembali, judul "Pencegahan Kriminalitas", pengantar "Program keamanan komunitas dan pencegahan kriminal di Desa Darmasaba.", kolom cari `?search=` (API mencari di judul, deskripsi, dan deskripsi singkat, case-insensitive). **Tanpa pil kategori**.
- **Sorotan**: entri terbaru (urutan API `createdAt` desc; `find-first` tidak dipanggil lagi karena hasilnya sama). Pola kartu utama Kabar Desa: ubin `#f5f5f7` bersudut lancip, video 16:9 kiri 3/5 + teks kanan 2/5. Teks: meta "SOROTAN · tanggal" 12px kapital, judul `h2` 32px (tablet 28, mobile 24) tinta sebagai tautan detail, ringkasan (`deskripsiSingkat` teks polos) 17px abu maks 4 baris, lalu "Baca selengkapnya ›" brand. Hanya tampil di halaman 1 tanpa kata kunci, dan **tidak muncul lagi sebagai kartu** di halaman mana pun. Tanpa video YouTube yang valid → panel teks saja selebar baca 860px (tanpa pratinjau kosong, tanpa iframe).
- **Video (fasad)**: pratinjau `i.ytimg.com/vi/{id}/hqdefault.jpg` (`object-fit: cover`) + lingkaran putar 76px (mobile 60) hitam 55% dengan `backdrop-filter` blur, hover (pointer halus) = latar brand + skala 1,06. Iframe `youtube-nocookie.com/embed/{id}?autoplay=1&rel=0&playsinline=1` **baru dimuat setelah tombol putar diklik** (tidak ada iframe sebelum interaksi), lalu langsung diputar di tempat. ID dibaca dari `watch?v=`, `youtu.be/`, `/embed/`, `/shorts/`, `/live/` (www, m, youtube-nocookie); host lain atau ID bukan 11 karakter → tanpa video. Video dihapus/privat: i.ytimg membalas 404 berisi gambar abu 120×90 yang tetap dirender (onError tidak terpicu), jadi lebar asli ≤ 120px dianggap tidak tersedia → ubin abu `#e8e8ed` "Video tidak tersedia" + ikon, tanpa tombol putar.
- **Daftar program**: judul `h2` 28px (mobile 24) "Program lainnya" (dengan kata kunci: "Hasil pencarian"), lalu kartu kecil Kabar (`.rail.railGrid`, 3 kolom, tablet 2, mobile 1): pratinjau video 16:10 (diperbesar 12% lewat properti `scale` agar pita hitam `hqdefault` 4:3 hilang; hover kartu Kabar tetap berlaku) + lencana putar 32px kiri bawah, tanggal, judul. Tanpa video atau video tidak tersedia → ikon perisai 40px di ubin abu, tanpa lencana. Kartu ber-video diberi teks pembaca layar "(berisi video)". 6 kartu per halaman (`PENCEGAHAN_PAGE_SIZE`), `?page=` di luar jangkauan → halaman terakhir, paginasi bulat `KabarListPagination` hanya bila > 1 halaman.
- **Kosong/galat**: kotak `#f5f5f7`: "Belum ada program pencegahan kriminalitas.", "Tidak ada program yang cocok dengan “…”.", atau "Program pencegahan kriminalitas gagal dimuat. Coba muat ulang halaman.". Memuat → kerangka sorotan (hanya halaman 1 tanpa kata kunci) + 6 kartu berdenyut (`aria-busy`).
- **Detail**: pola Kegiatan/Program Kesehatan (`kabar-detail.module.css`), kolom 860px tanpa kartu dan **tanpa label bergaya form admin**: kembali → meta (kategori "PENCEGAHAN KRIMINALITAS" brand = tautan daftar · tanggal dibuat panjang) → judul `h1` 40px (mobile 28) tinta → `deskripsiSingkat` sebagai pengantar 21px (mobile 19) abu → video fasad selebar kolom (URL http(s) non-YouTube → tautan "Buka video di tab baru ↗"; teks bukan URL → tanpa video) → `deskripsi` 19px (mobile 17). Bagian kosong tidak dirender. Memuat → kerangka; 404 → "Program pencegahan kriminalitas tidak ditemukan atau sudah tidak ditampilkan." + "Lihat semua program pencegahan kriminalitas ›" (dulu menaut ke halaman admin); galat → pesan muat ulang.
- **Redirect**: `/keamanan/pencegahan-kriminalitas/program-lainnya` → `redirect()` 307 ke halaman utama (bukan permanen agar mudah dibalik), supaya tautan tersimpan tidak 404. `next.config.ts` tidak disentuh.
- **Mitigasi**: sorotan dikeluarkan dari kartu di semua halaman, jadi kartu halaman n mulai di offset 1 + (n-1)×6, sedangkan `find-many` hanya punya `page`/`limit`. Karena itu daftar dimuat sekali (page 1, limit `PENCEGAHAN_FETCH_LIMIT` = 100, `?search=` diteruskan ke API) lalu dipaginasi di klien (`paginate`). Entri > 100 tidak tampil (console.warn). Usulan backend: param `offset`/`skip` di `find-many`.
- **Mobile (≤ 734px)**: sorotan bertumpuk (video di atas, teks padding 24px), kartu satu kolom, jarak sorotan ke daftar 48px (desktop 64px), kolom cari selebar layar, tanpa geser horizontal (diuji 390px, 1440px, 1920×1080 @2x).

### Laporan Publik (`/keamanan/laporan-publik[/{id}]`)

Daftar laporan **memakai pola baris Pengumuman** (tanpa thumbnail) di `.section` Kabar Desa (`kabar.module.css` + `KABAR_BRAND_VARS`). Folder `(pages)/keamanan/laporan-publik/`: `page.tsx` (Suspense) → `_com/LaporanPublikPage.tsx` (kepala `KabarListHeader` dengan `tabs=[]` + `LaporanListBody`), `_com/LaporanRows.tsx` (baris + kerangka), `_com/LaporanStatus.tsx` (pil status), `_com/LaporanForm.tsx` (modal Tambah Laporan), `_com/laporan.logic.ts` (`statusInfo`, `formatTanggalWaktu`, `laporanListHref`, `laporanDetailHref`, `validateLaporanForm`, `pickerToForm`, `pickerValue`), `_com/laporan.source.ts` (`loadLaporanPage`, `loadLaporanDetail`; galat dilempar dengan konteks), `_com/use-laporan-list.ts`, `_com/laporan.meta.ts` (`LAPORAN_LIST_HREF`, `LAPORAN_PAGE_LIMIT` 10, `LAPORAN_MIN_TEXT` 3), `_com/laporan.text.ts`, CSS `_com/laporan.module.css`, `_com/laporan-status.module.css`, `_com/laporan-form.module.css`; detail `[id]/page.tsx` → `_com/detail/LaporanDetail.tsx` (+ `LaporanLinimasa.tsx`, `use-laporan-detail.ts`, `laporan-detail.text.ts`, `laporan-detail.module.css`). HTML kronologi dan penanganan disanitasi lewat `sanitizeRichText` dari `src/lib/rich-text.ts`. Test: `__tests__/api/laporan_publik_page_logic.test.ts`, `__tests__/api/laporan_publik_page_ui.test.tsx`.

- **Kepala**: sama dengan Berita (`KabarListHeader`): kembali, judul "Laporan Keamanan Lingkungan", pengantar, kolom cari `?search=` (API mencari di judul dan lokasi, placeholder "Cari judul atau lokasi"). **Tanpa pil kategori**.
- **Daftar**: bilah atas berisi `h2` "Laporan terbaru" (24px, mobile 21) dan tombol pil brand "Tambah Laporan" (ikon plus) di kanan. Di bawahnya satu panel `#f5f5f7` radius `--radius` berisi baris bergaris pemisah; tiap baris adalah tautan ke detail: judul 17px/600 (maks 2 baris), meta ikon pin + lokasi ("Lokasi belum diisi" bila kosong) dan `<time>` "Senin, 24 November 2025, 16.58" (zona WITA `DESA_TIME_ZONE`), lalu pil status dan chevron. Data `keamanan/laporanpublik/find-many` 10 per halaman (hanya `isActive`, urut `tanggalWaktu` terbaru). Memuat → kerangka baris `aria-busy`. Paginasi bulat `KabarListPagination` bila lebih dari satu halaman.
- **Status**: pil 26px, teks 13px/600 + titik 7px, warna dan label selalu berpasangan (warna bukan satu-satunya penanda). Selesai "Selesai" hijau `#19733a` di `#e6f4ea`; Proses "Dalam proses" jingga `#8f5100` di `#fdf1dc`; Gagal **"Tidak terselesaikan"** merah `#c4001a` di `#fde8ea`; Baru "Baru" brand di `#e6eef6`; nilai lain tampil apa adanya (kosong → "Tanpa status") abu `#6e6e73` di `#ececf0`. Hanya label tampilan yang berubah: nilai enum/API tetap `Gagal`.
- **Detail + linimasa**: pola `kabar-detail.module.css`, kolom 860px: kembali → meta "LAPORAN PUBLIK" (tautan ke daftar) + pil status → judul `h1` → panel fakta `<dl>` `#f5f5f7` dua kolom (mobile satu): Lokasi (ikon pin) dan Waktu kejadian (ikon kalender), label 13px abu, nilai 17px/500, kosong → "Belum diisi". Lalu `h2` "Perkembangan laporan" 24px dan linimasa bertitik (penanda cincin 14px, rel 2px, warna penanda mengikuti status): **Kronologi** (dengan waktu kejadian; kosong → "Kronologi belum diisi pelapor.") → **Penanganan** (bernomor "Penanganan 1, 2, …" bila lebih dari satu; tidak ada → langkah abu "Belum ada penanganan dari pemerintah desa.") → **Status saat ini** (pil + kalimat, mis. Gagal "Laporan ditutup tanpa penyelesaian."). Label langkah 19px (mobile 17), isi 17px. Laporan `isActive: false` diperlakukan seperti tidak ada.
- **Formulir**: modal Mantine "Tambah Laporan Publik" (size lg, radius 18px, judul 24px, mobile 21) satu kolom. Fungsi sama dengan versi lama (field, endpoint `create`, alur state admin `laporanPublik.create`). Urutan: catatan privasi panel abu ("Laporan tampil untuk umum di halaman ini setelah diverifikasi admin desa. Jangan cantumkan data pribadi seperti NIK atau nomor telepon."), Judul laporan*, Lokasi kejadian*, Tanggal dan waktu kejadian* (`DateTimePicker` locale `id`, format "Senin, 24 November 2025, 16.58", **`maxDate` = sekarang** sehingga hari esok tidak bisa dipilih), Kronologi (editor dasar `PPIDTextEditor toolbar="basic"`, tinggi minimal 140px). Tombol Batal + "Kirim Laporan" (brand, `loading` saat kirim) rata kanan. **Validasi klien sebelum kirim**: judul dan lokasi minimal 3 karakter setelah trim, tanggal wajib, dan waktu tidak boleh melewati sekarang ("Waktu kejadian tidak boleh melewati waktu sekarang.", menangkap jam yang lebih lambat di hari ini). Isian tidak valid → pesan di bawah field, modal tetap terbuka, tidak ada request. Gagal kirim → modal tetap terbuka dengan isian utuh; berhasil → isian dikosongkan, modal ditutup, daftar dimuat ulang. **Moderasi**: kiriman warga ditahan (status `Baru`) dan baru tampil setelah admin mengubah statusnya; toast setelah kirim "Laporan terkirim. Akan tampil setelah diverifikasi admin desa."; lewat batas kiriman (429) → toast pesan server dan modal tetap terbuka (`docs/decisions/2026-11-14-laporan-publik-moderasi.md`). Nilai picker dikirim sebagai `YYYY-MM-DDTHH:mm:ss` (`pickerToForm`) agar terbaca di Safari.
- **Kosong**: kotak `#f5f5f7`: "Belum ada laporan publik." atau "Tidak ada laporan yang cocok dengan “…”.". Detail tidak ada → "Laporan tidak ditemukan atau sudah tidak ditampilkan." + tautan "Lihat semua laporan".
- **Galat**: daftar → "Laporan publik gagal dimuat. Coba muat ulang halaman."; detail → "Detail laporan gagal dimuat. Coba muat ulang halaman." + tombol "Coba lagi" (muat ulang tanpa refresh halaman).
- **Mobile** (≤734px): baris jadi dua tingkat (pil status di atas, judul maks 3 baris + meta bertumpuk 13px di bawah, chevron tetap di kanan); panel fakta satu kolom; tombol modal bertumpuk penuh lebar 48px dengan "Kirim Laporan" di atas.

### Tips Keamanan (`/keamanan/tips-keamanan`)

Tips **dibaca langsung tanpa membuka detail** (tidak ada halaman detail), di kerangka `.section` Kabar Desa yang sama dengan Keamanan Lingkungan. Folder `(pages)/keamanan/tips-keamanan/`: `page.tsx` (Suspense) → `_com/TipsKeamananPage.tsx` (kepala `KabarListHeader` dengan `tabs=[]` + `TipsKeamananBody`), `_com/TipCard.tsx`, `_com/tips-keamanan.logic.ts` (`toTip`, `tipsSearchable`, `tipsKeamananListHref`; `hasHtmlContent` dipakai ulang dari `keamanan-lingkungan.logic.ts`), `_com/tips-keamanan.source.ts` (`loadTipsKeamananPage`), `_com/use-tips-keamanan.ts`, `_com/tips-keamanan.meta.ts`, `_com/tips-keamanan.text.ts`, `_com/tips-keamanan.module.css`. Test: `__tests__/api/keamanan_lingkungan_tips_logic.test.ts`, `__tests__/api/keamanan_lingkungan_tips_ui.test.tsx`.

- **Kepala**: `KabarListHeader`: kembali, judul "Tips Keamanan", pengantar "Kumpulan tips praktis untuk menjaga keamanan diri, keluarga, rumah, dan lingkungan di Desa Darmasaba." (pengantar lama menyalin teks Pecalang/Patwal). **Tanpa pil kategori**. Kolom cari `?search=` hanya dirender bila tips > 6 (`TIPS_KEAMANAN_SEARCH_THRESHOLD`, ambang sama dengan Kontak Darurat) **atau** URL sudah berisi `?search=` (supaya kata kunci dari tautan tersimpan tetap terlihat dan bisa dihapus); `tipsSearchable(search, total, ambang)` → prop `searchable` `KabarListHeader`. Jumlah = field `total` `find-many` (cadangan: jumlah tips di halaman); selama memuat kolom cari belum dirender.
- **Daftar**: `menutipskeamanan/find-many` limit 10 (`TIPS_KEAMANAN_PAGE_LIMIT`), paginasi di server. Tiap tip = ubin `#f5f5f7` (`--tile`) bersudut lancip, jarak antarubin 20px, desktop 2 kolom `2fr | 3fr`:
  - kiri: foto hanya bila entri punya tautan foto (`object-fit: cover`, tinggi minimal 320px, `alt=""` karena judul sudah ada di kolom kanan); tanpa foto → judul `h3` 28px (tablet 24, mobile 21) tinta di kolom kiri. **Tidak ada placeholder "No image"**.
  - kanan: judul (bila ada foto) + isi HTML editor admin 17px rata kiri, lebar baca maks 720px. Jarak antarblok lewat `gap` 0.8em; `<p></p>` kosong dari editor disembunyikan. Butir `ul` = disc, `ol` = angka (dipaksa, karena isi berada di dalam `<li>` dan peramban memberi lingkaran kosong), penanda warna brand, jarak antarbutir 10px.
  - tanpa foto dan tanpa isi → satu kolom berisi judul saja (`.tipSolo`).
  - Paginasi bulat `KabarListPagination` hanya bila > 1 halaman.
- **Detail**: tidak ada; seluruh isi tip tampil di daftar.
- **Kosong**: kotak `#f5f5f7`: "Belum ada tips keamanan." atau "Tidak ada tips keamanan yang cocok dengan “…”.". Memuat → 2 ubin abu berdenyut (`aria-busy`).
- **Galat**: "Tips keamanan gagal dimuat. Coba muat ulang halaman."; pemuat melempar Error berkonteks.
- **Mobile (≤ 734px)**: ubin satu kolom bertumpuk (foto di atas dengan rasio 16:10, lalu judul dan isi; tanpa foto judul langsung di atas isi), padding 24px (tablet 32px, desktop 40px), jarak antarubin 12px, tanpa geser horizontal (diuji 390px dan 1440px).

### CCTV Keamanan Desa (`/keamanan/cctv`)

Gaya halaman Monev/Posyandu. Kerangka `.section`/`.page`/`.inner`/`.header`/`.card`/`.panel` dari `_com/main-page/apbdes/apbdes.module.css` + `CCTV_BRAND_VARS`. Data dimuat lewat `useLazyLoad` (`src/app/(public)/_com/lazy-load/use-lazy-load.ts`). Folder `(pages)/keamanan/cctv/`: `page.tsx` (server component) → `_com/CctvPage.tsx` (+ `CctvContent`); komponen `CctvSummary`, `CctvExplorer` (panel peta + daftar, menyimpan titik terpilih), `CctvList` + `CctvRow`, `CctvMapSection` (Leaflet via `next/dynamic` tanpa SSR), `CctvStates`; pendukung `cctv.logic.ts` (`summarizeCctv`, `filterCctv`, `formatLastActive`, `hasCoords`), `cctv.source.ts` (`loadCctvList`, `toCctvItem`, `toStatusKey`), `cctv.meta.ts` (`CCTV_LIST_LIMIT` = 200, `CCTV_SEARCH_THRESHOLD` = 6, `RELATIVE_MAX_DAYS` = 7, `MAP_FOCUS_ZOOM` = 18, `MAP_FIT_MAX_ZOOM` = 17, `STATUS_META`), `cctv.text.ts`; CSS `cctv.module.css` (ringkasan, kosong/galat), `cctv-explorer.module.css` (panel peta + daftar, penanda, popup). Test: `__tests__/api/cctv_page_{logic,ui}.test.ts(x)`.

- **Kerangka**: latar putih, isi 1100px. `BackButton`, judul `h1` 48px (mobile 32) brand rata tengah, pengantar abu. Urutan: ringkasan → panel "Peta titik CCTV". Antarbagian 20px (mobile 12).
- **Data**: satu permintaan `GET /api/keamanan/cctv/find-many?page=1&limit=200` memuat semua titik sekaligus. Tidak ada paginasi, karena peta dan daftar saling terhubung. `/cctv/stats` tidak dipakai, karena hanya berisi jumlah online + laporan publik minggu ini. Status dinormalkan: "Online"/"Offline" (huruf besar/kecil bebas); nilai lain = "Status belum diisi" (abu). Koordinat bukan angka, di luar rentang, atau hanya sebelah → titik tidak dipetakan.
- **Ringkasan**: 3 kartu `#f5f5f7` gaya kartu APBDes, sama tinggi, angka besar sejajar.
  - **Titik CCTV** (brand, `IconDeviceCctv`): jumlah + "titik". Di dasar kartu ada catatan cakupan peta: "Semua titik tampil di peta" / "N tampil di peta, M belum punya koordinat" / "Koordinat titik belum diisi", lalu "N titik statusnya belum diisi" bila ada.
  - **Online** (hijau `green-8`, `IconVideo`) dan **Offline** (merah `red-8`, `IconVideoOff`): ikon + label + jumlah + "kamera" saja, tanpa persen dan tanpa bar (keputusan user).
  - Di bawah kartu, catatan abu rata tengah (mobile rata kiri): "Status online dan offline sesuai data terakhir yang tercatat di sistem desa." Status dan waktu aktif diisi manual lewat form admin, bukan dari kamera.
  - Hitungan selalu dari seluruh titik; kata kunci cari tidak mengubahnya.
- **Peta**:
  - Leaflet + ubin OpenStreetMap di dalam panel, radius 14px, tinggi 560px.
  - Tampilan awal memuat semua titik (`bounds`, padding 40px, `maxZoom` 17; satu titik → pusat + zoom 17). Saringan cari tidak menggeser peta. Roda gulir tidak memperbesar peta (`scrollWheelZoom` mati).
  - Penanda: bulatan warna status 18px berbingkai putih 2,5px. Terpilih: 26px + cincin brand, di atas penanda lain (`zIndexOffset`). Penanda bisa difokus keyboard; `title` berisi "nama, status".
  - Popup: kode 12px brand, nama 15px tebal, lokasi abu, status berwarna. Isinya `span`, bukan `p`, karena CSS Leaflet memberi margin besar pada `p` di popup.
  - Panel Leaflet dikurung `isolation: isolate` agar tidak menimpa navbar.
- **Daftar**:
  - Kepala panel: judul "Peta titik CCTV" + pengantar "Pilih titik di peta atau di daftar untuk melihat lokasinya." di kiri, legenda titik warna Online/Offline di kanan. "Status belum diisi" hanya muncul bila ada titik semacam itu.
  - Kolom cari pil putih (`LayananSearch`) di atas daftar, hanya bila lebih dari 6 titik. Menyaring kode/nama/lokasi tanpa beda huruf besar/kecil, spasi, atau tanda hubung ("cctv-09" cocok dengan "CCTV - 09"). Berlaku untuk daftar dan penanda sekaligus. Tidak ada hasil → "Tidak ada CCTV yang cocok dengan "…"."
  - Baris ringkas bergaris pemisah:
    - nama 17px semibold + status (titik warna + label tinta 13px) di kanan;
    - ikon pin + lokasi 14px abu, maks 2 baris;
    - kode 13px brand + "Aktif terakhir {waktu}".
  - Waktu aktif: dalam 7 hari ditulis relatif ("baru saja", "5 menit yang lalu", "3 jam yang lalu", "kemarin"); selebihnya "12 Feb 2026, 22.30 WITA" (`Asia/Makassar`). `<time dateTime>` membawa tanggal lengkap di `title`.
  - Baris = `<button aria-pressed>` (teks pembaca layar "Tampilkan di peta: "). Terpilih: latar putih + garis brand 3px di kiri. Hover: tint abu tipis.
  - Titik tanpa koordinat bukan tombol, ditandai "Belum ada titik di peta". Nilai kosong: "Lokasi belum diisi" / "Waktu aktif belum tercatat". Urutan mengikuti API (kode naik).
- **Keterhubungan peta ↔ daftar**:
  - Pilih baris → peta `flyTo` ke titik (zoom ≥ 18, 0,6 detik) lalu popup terbuka. Reduced motion: `setView` langsung. Memilih titik yang sama lagi tetap memfokuskan ulang. Pilihan baru sebelum terbang selesai membatalkan popup titik lama.
  - Klik penanda → popup terbuka, baris tersorot, dan daftar menggulir dirinya sendiri ke baris itu tanpa menggeser halaman. Daftar yang tidak bergulir sendiri (tablet/mobile) tidak digulir.
  - Klik penanda lain → pilihan pindah. Menutup popup (tombol ×, klik peta) → pilihan lepas.
  - Titik terpilih yang tersaring keluar oleh cari tidak lagi dianggap terpilih.
- **Kosong**:
  - 0 titik → satu ubin `#f5f5f7` (ikon CCTV, "Belum ada titik CCTV yang terdata", penjelasan). Tanpa kartu angka 0 dan tanpa peta.
  - Ada titik tetapi tak satu pun berkoordinat → panel bertumpuk satu kolom: pesan peta pendek di kotak putih ("Koordinat titik CCTV belum diisi, jadi peta belum bisa menampilkan lokasinya."), lalu daftar penuh. Bukan kotak kosong 560px. Pengantar "Pilih titik…" tidak ditampilkan.
- **Galat/memuat**:
  - Memuat → kerangka abu: 3 kartu + panel (`aria-busy`). Peta yang belum termuat → kerangka abu seukuran peta.
  - Galat → ubin pesan "Data CCTV gagal dimuat. Periksa koneksi lalu coba lagi." + pil putih "Coba lagi".
- **Tablet (≤1068px)**: peta 440px di atas, daftar penuh di bawahnya tanpa gulir sendiri. Pilih baris saat peta tertutup → halaman menggulir ke peta (`scroll-margin-top` 64px; reduced motion tanpa animasi).
- **Mobile (≤734px)**:
  - Kartu Titik CCTV selebar penuh, Online/Offline berdampingan (angka 28px).
  - Kepala panel bertumpuk (judul, pengantar, legenda).
  - Peta 340px, baris nama 16px.
  - Daftar 8 titik setinggi ±750px (kartu lama ±1.300px).

### Katalog UMKM (`/ekonomi/umkm`)

Susunan gaya Tokopedia (tab Produk | Toko, baris jumlah + Urutkan + chip filter) dengan kartu gaya Decathlon dan panel Filter di kiri. Teks UI memakai kata "Filter" (bukan "Saring"); nama komponen `Saring*` tetap. Website hanya menampilkan apa yang dijual UMKM (pemesanan lewat WhatsApp penjual), jadi **status stok tidak ditampilkan dan tidak bisa disaring**. Folder `(pages)/ekonomi/umkm/`: `page.tsx` (kepala `KabarListHeader` dengan `tabs=[]` → `KatalogTabs` → `KatalogBody`; `--brand` dipasang di akar lewat `KATALOG_BRAND_VARS`) dan `_com/katalog/`. Kerangka & filter: `KatalogTabs`, `KatalogBody`, `KatalogToolbar`, `SaringPanel`, `SaringGroup`, `SaringHarga`, `SaringDrawer`, CSS `katalog-layout.module.css` + `saring.module.css`. Kartu & grid: `ProdukCard`, `TokoCard`, `KatalogMedia` (bingkai foto bersama), `KatalogGrid`, `KatalogEmpty`, CSS `produk-card` / `toko-card` / `katalog-media` / `katalog-grid.module.css`. Logika murni: `katalog-filter.logic.ts` (cari, saring, urut, facet, chip), `katalog-params.logic.ts` (URL), `katalog-adapter.logic.ts` (API → `katalog.types.ts`), `katalog-view.logic.ts`, `katalog-card.logic.ts`. Data: `katalog.source.ts` + `use-katalog-data.ts` (`useLazyLoad`), URL: `use-katalog-params.ts`. Teks di `katalog-filter.text.ts` & `katalog-card.text.ts`. Test: `__tests__/api/umkm_katalog_filter_logic.test.ts`, `umkm_katalog_shell_ui.test.tsx`, `umkm_katalog_card_logic.test.ts`, `umkm_katalog_card_ui.test.tsx`. Detail produk dan detail toko: lihat dua bagian berikut.

- **Data**: `GET /api/ekonomi/umkm/produk/find-many` dan `/api/ekonomi/umkm/find-many`, masing-masing **sekali** dengan limit 100 (`KATALOG_LIST_LIMIT`), lalu cari/saring/urut/hitung di klien. Ini MITIGASI SEMENTARA karena API belum mendukung saringan banyak nilai, harga, stok, urutan, dan facet (`docs/BACKEND-TODO.md` P2); `console.warn` bila total > 100. UMKM nonaktif dan produk milik UMKM nonaktif disembunyikan di klien. `stok` tetap ada di tipe/adapter tetapi tidak dipakai tampilan. Kategori yang namanya sama (ternormalisasi) digabung jadi satu pilihan (data ganda "Makanan" di stg; BACKEND-TODO "Isi data"). Gagal muat → pesan + tombol "Muat ulang" (hanya daftar yang gagal yang dimuat ulang).
- **Kerangka**: latar putih, tepi `--edge-gutter`. Kepala = `KabarListHeader` (kembali, `h1`, pengantar, kolom cari pil di kanan; `?q=` setelah 500ms). Cari: semua kata harus muncul (Produk: nama produk + nama UMKM; Toko: nama, pemilik, alamat).
- **Tab**: "Produk" | "Toko" 17px semibold dengan ikon; aktif teks brand + garis bawah 3px, garis `#d2d2d7` selebar konten; `role="tablist"`, panah kiri/kanan. `?tab=toko` (bawaan produk). Pindah tab mempertahankan `q` dan membuang saringan tab lain.
- **Panel Filter kiri** (>1068px): kolom 264px, sticky `top: 68px`, scroll sendiri. Judul `h2` "Filter" + ikon. Grup akordeon gaya Decathlon (+/−, garis bawah, angka nilai aktif di samping label; grup dengan nilai aktif dari URL terbuka saat dimuat). Produk: Kategori (centang banyak + jumlah, terbuka) · Toko (centang banyak + jumlah, 5 pertama lalu "Lihat semua (n)" bila ≥2 tersembunyi, terbuka) · Harga (2 isian Rp min/maks, berlaku saat blur/Enter, min > maks ditukar) · Produk unggulan (nonaktif bila 0). Toko: Kategori usaha. Jumlah dihitung dari seluruh data yang dimuat.
- **Baris alat**: "Menampilkan **n** produk" / "**n** dari m produk" + "Urutkan" (Produk: Terbaru · Harga terendah · Harga tertinggi · Nama A–Z; Toko: Nama A–Z · Terbaru). Chip filter aktif (pil `#f5f5f7` + ×) + "Hapus semua" (membuang filter, bukan kata kunci/urutan). Di atas grid `h2` tersembunyi "Daftar produk/toko"; judul kartu `h3`.
- **URL**: `tab`, `q`, `kategori` & `toko` (id dipisah koma; kategori gabungan memakai id terkecil sebagai wakil), `min`, `max`, `unggulan=1`, `urut` (`tersedia` lama diabaikan); `router.replace` tanpa scroll; nilai/id tak dikenal diabaikan.
- **Kartu produk** (gaya Decathlon, satu tautan `next-view-transitions` ke detail): tanpa latar/border/radius. Foto persegi di atas `#f5f5f7` (`cover`; tanpa foto → ikon 40px `#86868b`). Label pojok lancip 8px dari tepi hanya "Unggulan" (kuning `#ffd43b`); tanpa label/peredupan "Habis". Harga `Rp80.000` 17px semibold + "/ satuan" abu → nama 16px maks 2 baris → nama UMKM 13px kapital abu (teks, bukan tautan) → bintang + "Belum ada ulasan" 13px. **Rating sengaja tidak membaca field `rating`** (tanpa sumber data, nilai stg = seed; BACKEND-TODO P3). Tanpa titik warna, keranjang, atau tombol toko online (tetap di detail). Hover: foto zoom 1.03, nama bergaris bawah.
- **Kartu toko**: foto persegi sama (fallback ikon toko) → kategori 12px kapital brand → nama 17px semibold → pemilik → alamat (kosong → "Desa Darmasaba") → "n produk" (dihitung dari daftar produk).
- **Grid**: `repeat(auto-fill, minmax(208px, 1fr))`, gap 32/20px; ≤734px 2 kolom gap 24/12px. Memuat → kerangka berbentuk kartu (`aria-busy`, tanpa denyut saat reduced motion). Kosong karena filter → panel `#f5f5f7` "Tidak ada produk yang cocok" + "Hapus semua filter" (ikut mengosongkan kata kunci); data kosong → "Belum ada produk UMKM".
- **≤1068px**: panel kiri diganti pil "Filter" (+ jumlah filter aktif) di baris alat; `Drawer` bawah radius atas 24px, maks 85dvh, kepala `h2` "Filter" + ×, grup yang sama, kaki menempel "Hapus semua" + pil brand "Tampilkan n produk". Filter berlaku langsung; drawer tertutup sendiri bila layar dilebarkan melewati 1068px.

### Detail produk UMKM (`/ekonomi/umkm/produk/[id]`)

Gaya halaman produk Decathlon, disesuaikan dengan pemesanan lewat WhatsApp: **tanpa stok, jumlah, varian, keranjang, atau pengiriman**. `page.tsx` tipis (`useParams` → `DetailProdukView`), komponen di `_com/detail-produk/`. Data: `detail-produk.source.ts` (`GET /api/ekonomi/umkm/produk/:id` lewat `ApiFetch`) → `detail-produk.adapter.logic.ts` (API → `detail-produk.types.ts`, deskripsi lewat `sanitizeRichText`) → `use-detail-produk.ts` (status loading/ready/notFound/error per id; data id lama tidak tampil). **Tidak memakai state admin `umkmState.produk.findUnique`.** Produk terhapus/nonaktif/milik UMKM nonaktif dan pesan "tidak ditemukan" → "Produk tidak ditemukan" (MITIGASI SEMENTARA umkm-detail, BACKEND-TODO P2). Test: `__tests__/api/umkm_detail_produk_logic.test.ts`, `umkm_detail_produk_ui.test.tsx`, `umkm_ulasan_ui.test.tsx`, `umkm_produk_serupa_logic.test.ts`, `umkm_produk_serupa_ui.test.tsx`, `umkm_hubungi_penjual_wa.test.tsx`.
- **Kerangka**: latar putih selebar layar, isi dibatasi `max-width: 1120px` di tengah (gutter `--edge-gutter`). Tautan kembali "Katalog UMKM" → `/ekonomi/umkm`. Grid >1068px: `minmax(0, 480px)` + info, gap 56px, areas `galeri info` / `deskripsi info`; kolom info sticky `top: 92px`. Tablet kolom foto 400px gap 40; ≤734px satu kolom (galeri → info → deskripsi).
- **Galeri** (`ProdukGaleri`): foto utama persegi radius 18px di atas `#f5f5f7` (`cover`, maks 480px, tanpa foto → ikon). Strip thumbnail 64px dengan panah `useRailScroll` **hanya bila foto ≥2**; API kini mengirim satu foto (BACKEND-TODO P3 multi-foto). Tanpa lightbox/zoom.
- **Info** (`ProdukInfo`): NAMA UMKM (tautan halaman toko) · kategori → label "Unggulan" → `h1` → bintang "Belum ada ulasan" (tautan `#ulasan`, tidak membaca `rating`) → harga + "/ satuan" → `HubungiPenjualButton` lebar penuh (pil hijau 48px, pesan WA terisi) + `LinkTokoOnlineButtons`. Panel **Cara memesan** (`#f5f5f7`, 3 langkah bernomor + catatan bahwa transaksi langsung dengan penjual) dan panel **Penjual** (inisial, nama, pemilik, alamat = `alamatUsaha ?? umkm.alamat`, tautan "Lihat semua produk toko ini" → katalog `?toko=`). Saat `UMKM_PESANAN_TERCATAT` true, CTA diganti `PesanWebsiteAksi` (alur "Pesan Sekarang" + `PesananModal` lama, termasuk validasi stok).
- **Deskripsi** (`ProdukDeskripsi`): di bawah galeri, `h2` "Deskripsi produk", HTML tersanitasi; kosong → "Penjual belum menambahkan deskripsi."
- **Ulasan** (`UlasanSection`, `#ulasan`): tata letak Decathlon, **isi sengaja kosong** (keputusan user; `ULASAN_KOSONG`): ★ "–" + "(0 Ulasan)" + "Belum ada ulasan untuk produk ini." + tombol pil "Tulis ulasan" nonaktif dengan keterangan "Penulisan ulasan belum dibuka."; kanan bar 5→1 (track `#e8e8ed`, isi `#1d1d1f`, persen 0 bila total 0). Tanpa daftar ulasan sampai backend punya model ulasan (BACKEND-TODO P3).
- **Produk serupa** (`ProdukSerupa`): rel geser `ProdukCard` (232px, ≤734px 160px, scroll-snap) + "N produk"; panah `useRailScroll` di sisi rel (hanya `hover: hover`, hilang di ujung, fokus pindah ke panah sisi lain). Pilihan `pickProdukSerupa`: kategori sama (nama ternormalisasi) lalu UMKM sama, tanpa produk ini, maks 12, dari `loadKatalogProduk`. 0 hasil → section tidak dirender; galat → pesan + "Coba lagi".

### Detail toko UMKM (`/ekonomi/umkm/[id]`)

Seragam dengan detail produk; **tanpa** panel Cara memesan, rel UMKM lain, Filter, atau stok (keputusan user). `page.tsx` tipis (`useParams` → `DetailTokoView`), komponen di `_com/detail-toko/`. Kerangka `.page/.inner/.back` + token dan helper data (`cleanText`, pembaca respons detail, `isDataTampil`, `inisialNama`) dipakai bersama detail produk dari `_com/detail-umkm/`. Data: `GET /api/ekonomi/umkm/:id` lewat `detail-toko.source.ts` → `detail-toko.adapter.logic.ts` (deskripsi HTML editor admin lewat `sanitizeRichText`; produk dipetakan dengan `toKatalogProduk`) → `use-detail-toko.ts` (loading/ready/notFound/error per id). **Tidak memakai state admin `umkmState.umkm.findUnique`.** UMKM terhapus/nonaktif dan pesan "tidak ditemukan" → "Toko tidak ditemukan"; produk nonaktif disembunyikan (MITIGASI SEMENTARA umkm-detail-toko, BACKEND-TODO P2). Test: `__tests__/api/umkm_detail_toko_logic.test.ts`, `umkm_detail_toko_ui.test.tsx`, `umkm_toko_produk_logic.test.ts`, `umkm_toko_produk_ui.test.tsx`.
- **Kepala toko** (`TokoHeader`): tautan kembali "Katalog UMKM" → `/ekonomi/umkm?tab=toko`. Grid `160px 1fr` gap 40 (≤734px satu kolom, foto 96px). Foto persegi radius 18 di atas `#f5f5f7` (`cover`); tanpa foto → inisial 48px abu. Kategori usaha 13px kapital → `h1` 32/38 (≤734 26/32) → baris meta ikon (pemilik, alamat, "N produk"; yang kosong disembunyikan) → deskripsi tersanitasi 17px maks 68ch → `HubungiPenjualButton` tanpa `produkNama` (pembungkus maks 360px; pesan "Halo *Toko*, saya melihat toko Anda di website Desa Darmasaba dan ingin bertanya tentang produknya."). Garis `#d2d2d7` di bawah kepala.
- **Produk toko** (`TokoProduk`): `h2` "Produk" + "N produk" (disembunyikan bila 0), kanan `KatalogUrutSelect` (komponen Urutkan bersama katalog, state lokal, bawaan Terbaru, tampil mulai 2 produk; ≤734 turun ke baris bawah rata kanan). `KatalogGrid` + `ProdukCard` hasil `sortProduk`; kosong → "Toko ini belum menambahkan produk."
- **Status**: kerangka kepala + 4 kartu; "Toko tidak ditemukan"; "Toko gagal dimuat" + "Coba lagi".

### Peta Informasi (`/peta-informasi`)

Folder `(tambahan)/peta-informasi/`: `page.tsx` tipis → `_com/PetaInformasi.tsx` (H1, `TextInput` berlabel "Saring halaman", ringkasan `aria-live`, `SimpleGrid` 1/2/3 kolom) → `_com/PetaInformasiGroupCard.tsx` (kartu per menu utama: H2 + `<ul>/<li>` `Anchor component={Link}`). Data dari `_lib/petaInformasi.ts` atas config yang sama dengan pencarian (`DEFAULT_SEARCH_MENUS` = navbar lalu `search-extra-pages.ts`): grup senama digabung, href ganda & halaman peta sendiri dibuang, saring lewat `searchMenu` tanpa API. Pintu masuk: footer "Tautan Penting", entri pencarian "Peta Informasi (Semua Halaman)", dan tautan "Buka Peta Informasi" di keadaan "Tidak ada hasil". Dites di `__tests__/api/peta_informasi.test.ts`.

### Halaman 404 (`src/app/not-found.tsx`)

Pola apple.com: satu kalimat besar "Halaman yang Anda cari tidak ditemukan." (h1 56px/700, mobile ≤734px 36px, `text-wrap: balance`, warna `#1d1d1f`) lalu kolom cari lebar (maks 560px, `GlobalSearch` dengan `inputProps` size `xl`, radius 12px, ikon kaca pembesar kiri, border `#d2d2d7` → brand `#0a4e78` saat fokus). Tanpa angka 404, ilustrasi, tombol, atau tautan tambahan (keputusan user). Latar putih, padding 104/168px (mobile 72/112px).
- Satu file untuk seluruh situs: URL tak dikenal, `notFound()` di halaman, submenu tersembunyi (`MenuVisibilityGuard`), dan URL admin tak dikenal. Karena dirender di luar layout publik, file ini memasang sendiri `MenuVisibilityProvider` + `DarmasabaShell` (navbar, footer).
- Metadata: judul tab "Halaman tidak ditemukan", `robots` noindex (menimpa "index, follow" root layout).
- Submenu tersembunyi: `notFound()` dilempar komponen client, jadi isi 404 dirender setelah hidrasi (status tetap 404).
- Teks: `_com/not-found/not-found.text.ts`. Dites di `__tests__/api/not_found_page.test.tsx`.

### Kerangka halaman PPID (`(pages)/ppid/_com/`)

Semua halaman `/ppid/*` memakai satu kerangka agar kepala halamannya identik. Test: `__tests__/api/ppid_page_shell_ui.test.tsx`.

- **`PpidPage`** (`PpidPage.tsx`; props `title`, `lead`, `aside?`, `headerHidden?`, `style?`, `children`): latar `colors.Bg`, tinggi minimal 100vh, jarak tepi `md` / desktop 100px, tombol kembali (`BackButton`), kepala halaman, lalu isi dengan jarak 40px. Menyediakan variabel `--brand` dan `--ppid-measure`; `style` untuk variabel CSS tambahan milik halaman. `headerHidden` menyembunyikan kepala halaman secara visual (`VisuallyHidden`; h1 + pengantar tetap ada untuk pembaca layar) — hanya untuk halaman yang judul tampaknya sudah ada di dalam isi (Visi Misi).
- **Dua lebar isi, didefinisikan sekali di `PpidPage`**: (1) **selebar kerangka** untuk tabel, grafik, dan bagan (Daftar Informasi, IKM, Struktur); (2) **lebar baca/formulir** `--ppid-measure: 75rem` (1200px) untuk teks dan formulir (Visi Misi, Dasar Hukum, kedua Permohonan) — pakai `max-width: var(--ppid-measure)`, jangan menulis angka lebar sendiri di CSS halaman.
- **`PpidHeader`** (`PpidHeader.tsx` + `ppid-header.module.css`; props `title`, `lead`, `aside?`): `h1` 48px (≤734px 32) warna brand dan satu kalimat pengantar abu `#515154` 19px (17) maks 640px, **rata kiri**. `aside` = kontrol di kanan judul selebar 320px (mis. kotak cari Struktur PPID); ≤1068px turun ke bawah pengantar.
- **Aturan isi**: tanpa logo/ikon di atas judul, tanpa teks tengah atau justify, tanpa kartu di dalam kartu — isi langsung di atas latar halaman; kartu putih hanya untuk formulir, tabel, dan grafik. Pengecualian: Visi Misi PPID — satu kartu terang terpusat dengan lambang desa dan judul rata tengah (permintaan user: pertahankan rancangan awal halaman ini, lihat bagiannya).

### Profil PPID (`/ppid/profil-ppid`)

Satu file `(pages)/ppid/profil-ppid/page.tsx` + `profil-ppid.module.css`; data `stateProfilePPID.profile.load('edit')` (`name`, `image`, `biodata`, `riwayat`, `pengalaman`, `unggulan` — HTML dari editor admin). Test: `__tests__/api/profil_ppid_ui.test.tsx`.

- **Grid 2 kolom mulai `lg` (Mantine 75em = 1200px)**, 1 kolom di bawahnya. Kiri: kartu foto + nama. Kanan, berurutan: Biografi, Riwayat Karir, Pengalaman Organisasi, Program Unggulan — keempatnya satu kolom agar tinggi kedua kolom seimbang (sebelumnya Organisasi & Program selebar kartu di bawah grid sehingga ada ruang kosong di bawah Riwayat Karir). Isi keempat section ukuran huruf sama: 1rem / md 1.1rem / lg 1.2rem, **rata kiri** (bukan justify — di kolom ±400px dan ponsel justify melebarkan celah antarkata).
- **Kartu foto sticky** (`top` = navbar desktop 44px + 32px) hanya di ≥75em — breakpoint ditulis literal, bukan `$mantine-breakpoint-lg` (80em di `postcss.config.js`), agar sama persis dengan breakpoint grid. Di 1 kolom sticky dimatikan karena akan menutupi teks di bawahnya.

### Struktur Organisasi PPID (`/ppid/struktur-ppid`)

Bagan hierarki atas-ke-bawah (pola "Hierarchical Structure") dengan kartu ala referensi BKHM, menggantikan bagan PrimeReact `OrganizationChart` (meluber ±1700px, hanya menggambar akar pertama) beserta kontrol Zoom/Fullscreen. Komponen bagan generik (dipakai PPID, Perangkat Desa & BUMDes) ada di `(public)/_com/struktur-organisasi/`; folder `(pages)/ppid/struktur-ppid/` hanya berisi `page.tsx` (merangkai) → kerangka bersama `ppid/_com/PpidPage.tsx` (kepala; kotak cari lewat `aside`) serta `_com/struktur-ppid.source.ts` (adapter `strukturPpidSource` dari state bersama `_state/ppid/struktur_ppid`: `pegawai.findMany.load(1, 100, '', true)` + `posisi.findManyAll.load(true)`; `loadPegawaiPpidDetail`), `_com/struktur-ppid.text.ts`, `_com/struktur-ppid.meta.ts` (rute profil). Bersama: `use-struktur-data.ts` (`useStrukturData(source: StrukturSource)` — sumber = `{ loadPegawai, loadPosisi }`, konstanta modul; susun pohon, saring debounce 300ms), `StrukturBody.tsx` (`StrukturSearch` + `StrukturBody`: kerangka / kosong + Muat Ulang / tidak cocok / bagan), `StrukturChart.tsx` (bagan + kerangka; props wajib `roots`, `label` = nama bagan untuk pembaca layar, `hrefFor(pegawaiId)` = rute profil — bagan dipakai bersama PPID dan Perangkat Desa), `StrukturCard.tsx` (kartu), `struktur.logic.ts` (`buildOrgTree`, `filterOrgTree`, `leafSlot`, `toneForDepth`), `struktur-person.logic.ts` (inisial, baris profil), `StrukturDetail.tsx` + `StrukturDetailView.tsx` (halaman profil), `struktur.meta.ts` (limit, `LEAF_COLS`, variabel warna), `struktur.text.ts`, CSS `struktur-chart` / `struktur-card.module.css`. Test: `__tests__/api/struktur_ppid_logic.test.ts`, `__tests__/api/struktur_ppid_ui.test.tsx`, `__tests__/api/struktur_detail_ui.test.tsx`.

- **Pohon**: satu simpul per jabatan dari pegawai **aktif**; jabatan berisi beberapa pegawai menggambar **satu kartu per pegawai** (`cardsOf`). Di grid daun tiap pegawai jadi satu kotak grid; jabatan yang punya bawahan menjajarkan kartunya dalam grup berpalang kecil (atas: dari atasan, bawah: ke bawahan), dan di ≤1068px kartunya bertumpuk dengan rel kiri menyambung ke kartu pertama. Pencarian nama hanya menyisakan pegawai yang cocok; pencarian jabatan menyisakan semua pegawainya. Jabatan induk (beserta rantai leluhurnya) yang belum punya pegawai diambil dari daftar jabatan dan digambar sebagai kotak redup bergaris putus "Belum ditugaskan" (tanpa tautan) supaya bawahannya tetap di bawah induknya. Bila daftar jabatan membawa `parentId` (Perangkat Desa), kotak itu ditempel ke induk sebenarnya; API jabatan PPID tidak mengirim `parentId`, jadi kotak tanpa induk ditempel ke akar utama bila tingkatnya lebih rendah, selain itu jadi akar terpisah. Siklus `parentId` diputus. Anak diurut `hierarki` → `urutan` (bila ada; tanpa `urutan` di belakang) → nama jabatan.
- **Kartu**: jabatan huruf kapital 13px/700 (akar 15px, maks 3 baris) + pil nama putih teks brand (maks 2 baris) di kiri; foto di kanan selebar tinggi kartu (`object-fit: cover`, fokus atas) dengan tepi kiri dipudarkan `mask-image` ke gradasi kartu — foto pegawai umumnya persegi berlatar tidak transparan. Pegawai tanpa foto → lingkaran inisial nama (huruf pertama kata pertama + terakhir) di tengah area foto; jabatan kosong → siluet `IconUserFilled` transparan. Ukuran (variabel di `.chart`, dibaca kartu): akar 440×176, bawahan bercabang 320×136, bawahan daun 290×120; radius 16px. Gradasi per tingkat (`--tone-*`): akar `#062F49→#0A4E78`, bawahan langsung `#0A4E78→#2F91CC`, selebihnya `#145F8F→#5DA9D8` (kiri digelapkan dari `#2F91CC` agar teks putih ≥ 4.5:1). Seluruh kartu = tautan ke `hrefFor(id)` (PPID: `/ppid/struktur-ppid/{id}`, Perangkat Desa: `/pemerintahan/profil/struktur-perangkat-desa/{id}`); hover naik 3px + foto zoom 1.04 (mati saat reduced motion).
- **Garis**: `<ul>/<li>` bersarang + pseudo-element, warna solid `#8ba8c1` (garis transparan menggelap di titik tumpang-tindih). Bawahan yang punya bawahan → **baris berpalang** (turun dari induk, palang, turun ke tiap kartu). Bawahan yang semuanya daun → **grid** 2 kolom (≥1800px 4 kolom; `LEAF_COLS`, sengaja genap): garis induk turun di celah tengah sampai palang baris terakhir, tiap kartu menggambar palang dari tengahnya ke garis induk (`leafSlot().offset` × lebar kolom + celah). Jumlah ≤ kolom → satu baris biasa. Baris terakhir yang tidak penuh digeser ke tengah (`leafSlot().shift`). Bagan lebih lebar dari layar → geser horizontal (rata kiri), selain itu di tengah. Data stg: Kepala Desa → Kaur Umum (→ Kaur Keuangan) + Sekretaris (→ 5 Kadus: 2+2+1, ≥1800px 4+1), muat tanpa geser di 1200px.
- **Tablet & mobile ≤1068px**: semua bawahan bertumpuk berindentasi (40px, mobile 28px) dengan rel kiri, kartu selebar kolom maks 560px (mobile selebar layar, tinggi 148/128/116px); tanpa geser horizontal.
- **Kepala**: pola Potensi — `h1` 48px (mobile 32) brand, pengantar abu 19px (17) maks 640px, kotak cari pil 320px di kanan (≤1068px di bawah). Tidak ada yang cocok → "Tidak ada nama atau jabatan yang cocok dengan “…”".
- **Loading / kosong**: kerangka 1 + 2 kartu berdenyut; tanpa pegawai aktif → judul "Data sedang disiapkan" (PPID & Perangkat Desa) + hint halaman + pil "Muat Ulang".
- **BUMDes** (`/ekonomi/Struktur-Organisasi-Dan-Sk-Pengurus-BumDes`): section "Struktur Pengurus & SK" (`_com/StrukturBumdesSection.tsx`, di bawah Profil & Unit Usaha) memakai `StrukturSearch` + `StrukturBody` yang sama lewat adapter `_com/struktur-bumdes.source.ts` (state `_state/ekonomi/struktur-organisasi`); variabel `--brand` + gradasi kartu dari `BUMDES_VARS` (`_com/struktur-bumdes.meta.ts`). Chart PrimeReact lama + `struktur.css` dihapus.
- **Profil pegawai `[id]`** (PPID, Perangkat Desa & BUMDes): pembungkus tipis `StrukturDetail` (props `id`, `load(id) → Promise<Detail | null>`, `text` { `infoTitle`, `notFound` }). Tombol kembali + kartu putih: foto bulat 160px (tanpa foto → avatar inisial), `h1` nama + gelar, jabatan, lalu `<dl>` email / telepon — baris kosong disembunyikan — dan status. Alamat & tanggal masuk tidak ditampilkan (tidak bisa diedit admin; data lama di DB dibiarkan). `null` → "tidak ditemukan", galat → pesan gagal.

### Profil Desa (`/pemerintahan/profil`) dan Struktur Perangkat Desa

Halaman panjang di atas `PpidPage` (h1 "Profil Desa" + pengantar, satu tombol kembali). Folder `(pages)/pemerintahan/profil/`: `page.tsx` (server, hanya merangkai section) → `ui/*.tsx` (satu file per section, data dari `stateProfileDesa.*.findUnique.load('edit')`, riwayat `mantanPerbekel.findMany.load(1, 50)`), `_com/ProfilCard.tsx` (`ProfilCard`, `ProfilHeading`, `ProfilProse`, `ProfilEmpty`, `ProfilCardSkeleton`), `_com/use-load-once.ts` (loader CMS mulai `data: null` tanpa `loading` — hook ini membedakan "memuat" dari "kosong"), `_com/profil.text.ts`, `_com/profil.meta.ts` (id CMS, limit, aset, nama Perbekel, peta kantor, rute profil perangkat, variabel CSS), CSS `profil.module.css` + `ui/*.module.css`. Test: `__tests__/api/profil_desa_ui.test.tsx`.

- **Urutan**: Sejarah → Visi Misi → Letak & Batas Wilayah → Lambang → Maskot → Profil Perbekel → Struktur Perangkat Desa → Moto → Perbekel dari Masa ke Masa; jarak antarsection 56px (mobile 40).
- **Kartu section** = kartu terang terpusat Visi Misi PPID (`--vm-card`, radius 32px, bayangan lembut, muncul sekali): lambang/ikon opsional 140px → `h2` 36px/700 brand (mobile 26) rata tengah → isi. Teks CMS di kolom baca `--p-measure: 46rem`, 19px/1.65, **rata kiri** (bukan justify); daftar CMS jadi baris bergaris dengan titik/angka brand.
- **Visi Misi**: `VisiMisiContent` tanpa moto (label "Visi Desa"/"Misi Desa"). **Wilayah**: `<dl>` 4 arah + luas + keterangan, lalu peta CMS (`petaEmbedUrl`); bila kosong, peta Kantor Perbekel berketerangan (dulu peta tanpa judul di puncak halaman). **Maskot**: galeri `auto-fit minmax(200px, 1fr)` foto 4:3 berketerangan.
- **Profil Perbekel** = pola Profil PPID: ≥75em dua kolom, kiri kartu foto + pita nama brand (sticky), kanan blok Biodata / Pengalaman / Pengalaman Organisasi / Program Kerja Unggulan (h3 + ikon; blok kosong disembunyikan). Nama Perbekel masih konstanta di `profil.meta.ts` — model `ProfilPerbekel` belum punya kolom nama.
- **Moto SIGAP**: `<ol>` 5 nilai, tiap huruf (tile brand 64px, `aria-hidden`) berdampingan dengan judul + keterangan; 5 kolom di desktop, baris di ≤1068px; kalimat komitmen dengan **SIGAP** brand.
- **Perbekel dari Masa ke Masa**: judul tanpa kartu (`ProfilHeading`, bukan teks gradasi) + grid kartu potret 4:5 (nama, wilayah, pil periode), 3/2/1 kolom, maks `--ppid-measure`.
- **Struktur Perangkat Desa**: bagan bersama Struktur PPID, sumber dari `_com/struktur-perangkat.source.ts` (`strukturPerangkatSource`, `loadPerangkatDetail` — sementara masih adapter PPID; ganti di file itu saja), `hrefFor` = `strukturPerangkatHref`. Di Profil Desa sebagai section (`_com/StrukturPerangkat.tsx`: h2 + pengantar + cari, tanpa kartu); halaman mandiri `/profil/struktur-perangkat-desa` = `PpidPage` + `StrukturSearch` + `StrukturBody` (menggantikan PrimeReact + Zoom/Fullscreen yang memotong Kaur Umum & Kaur Keuangan). Halaman detail `[id]` = `StrukturDetail` (lihat Struktur PPID).

### Permohonan Informasi & Keberatan PPID (`/ppid/permohonan-informasi-publik`, `/ppid/permohonan-keberatan-informasi-publik`)

Dua halaman formulir dengan satu susunan: `PpidPage` → `PermohonanLayout` (alur di `aside`, formulir di isi). Komponen bersama di `(pages)/ppid/_com/`: `PermohonanSteps.tsx`, `PermohonanLayout.tsx` (`PermohonanLayout`, `PermohonanFormCard`), `permohonan.module.css`, `permohonan.meta.ts`. Test: `__tests__/api/ppid_permohonan_ui.test.tsx`.

- **Alur bernomor** (`PermohonanSteps`; props `title`, `steps: { title, desc }[]`): `h2` brand 24px (mobile 21) + `<ol>`; tiap langkah = lingkaran nomor bergaris brand 36px, judul `h3` 17px, keterangan abu 15px, dihubungkan rel tipis `#8ba8c1`. Langsung di atas latar halaman — menggantikan kotak-kotak navy; tanpa ikon per langkah.
- **Tata letak**: ≥75em (lg tema, ditulis literal) 2 kolom 5fr/7fr gap 64px selebar `--ppid-measure` (1200px), alur **sticky** (`top` = navbar 44px + 32px) di kiri dan formulir di kanan. Di bawahnya bertumpuk, alur di atas; 735px–74.99em langkah jadi 2 kolom tanpa rel supaya formulir tidak terdorong jauh ke bawah.
- **Kartu formulir** (`PermohonanFormCard`): satu-satunya kartu putih (radius 18px, padding 32px / mobile 20px), selebar kolom grid — selebar isi saat bertumpuk, isian **satu kolom**. Semua isian memakai `PERMOHONAN_FIELD` (`size="md" radius="md"`) sehingga input, dropdown, dan editor sama lebar — dropdown tidak lagi dibungkus `Group`. Tombol kirim pil brand di kiri, selebar kartu di mobile.
- **Alasan keberatan**: tetap `PPIDTextEditor` (format HTML ke backend tidak berubah) dengan `toolbar="basic"` — hanya tebal, miring, daftar butir, daftar bernomor.
- **Kontak PPID** (keberatan): `<dl>` Email / WhatsApp di bawah kartu formulir, langsung di atas latar.
- Validasi, isi kiriman, dan notifikasi tidak diubah oleh desain ini.

### Daftar Informasi Publik (`/ppid/daftar-informasi-publik` + `[id]`)

Folder `(pages)/ppid/daftar-informasi-publik/`: `page.tsx` (daftar) dan `[id]/page.tsx` (detail) di atas kerangka bersama `ppid/_com/PpidPage.tsx`; `_com/DaftarTable.tsx` (tabel + kerangka), `_com/DaftarKontak.tsx`, `_com/daftar.logic.ts` (`DAFTAR_PAGE_SIZE` 5, jeda cari 1000ms, `rowNumber`, `formatTanggal`, rute detail), `_com/daftar.text.ts`, `_com/daftar.module.css`. Test: `__tests__/api/ppid_daftar_informasi_ui.test.tsx`, `__tests__/api/ppid_daftar_ikm_pages_ui.test.tsx`.

- **Kepala**: judul + pengantar (teks "tentang" lama), kotak cari pil di slot `aside`. Kepala dan kotak cari tetap terpasang saat memuat ulang — hanya daftar yang berganti (kerangka di muatan pertama, tabel meredup `data-busy` di muatan berikutnya), supaya fokus kotak cari tidak hilang.
- **Catatan Dokumen Perencanaan**: satu baris teks abu + tautan ke Monev & Pembangunan, tanpa kartu.
- **Daftar**: satu kartu putih (radius 18px) berisi `<table>` asli — No, Jenis Informasi (`<th scope="row">`, tebal), Deskripsi, Tanggal Publikasi, tautan "Detail ›". Jenis dan deskripsi **tidak dipotong**; deskripsi ditampilkan sebagai teks polos (`htmlToPlainText` dari `src/lib/rich-text.ts`), baris melebar mengikuti isi. ≤734px: tiap baris jadi kartu putih bertumpuk (kepala tabel hanya untuk pembaca layar, kolom No disembunyikan; urutan jenis → tanggal → deskripsi → Detail).
- **Paginasi**: pil kanan (mobile tengah), hanya tampil bila lebih dari satu halaman. Hasil kosong → satu baris ikon + pesan, tanpa kartu.
- **Kontak PPID**: `h2` + dua baris ikon (email, WhatsApp) langsung di latar, tanpa kartu.
- **Detail**: `<dl>` Jenis (24px/600, mobile 21px) · Tanggal · Deskripsi (HTML dari editor admin, rata kiri, maks 760px) langsung di latar. Id tidak ada → "Informasi tidak ditemukan" + tautan kembali ke daftar. Detail basi milik id lain di store diabaikan.

### Indeks Kepuasan Masyarakat — halaman PPID (`/ppid/indeks-kepuasan-masyarakat`)

Halaman ini **tidak punya grafik/form sendiri**: `page.tsx` hanya merangkai kerangka `PpidPage` dengan modul section beranda `_com/main-page/kepuasan/` (`useKepuasanData`, `KepuasanCharts`, `KepuasanSkeleton`, `KepuasanEmpty`, `CtaButton`, `RespondenFormModal`, `KEPUASAN_BRAND_VARS`). Aturan grafik, warna seri, dan alur form ada di bagian Indeks Kepuasan beranda; perubahan di sana otomatis berlaku di sini. Lokal halaman: `_com/ikm.text.ts` (pengantar) dan `_com/ikm.module.css`.

- **Kepala**: judul + satu kalimat pengantar; tombol "Ajukan Responden" di slot `aside` (kanan; ≤1068px di bawah pengantar, rata kiri).
- **Token**: kelas `kepuasan.module.css` membaca `--ink`, `--muted`, `--tile`, `--radius` yang di beranda dipasang oleh `.section`. Di sini `.surface` memasangnya, dengan `--tile: #fff` karena latar halaman PPID `#D1D9E8` (di beranda tile `#f5f5f7` di atas putih).
- **Isi**: kartu "Responden per bulan" (total responden sebagai angka utama) lalu tiga donat 3 kolom (mobile bertumpuk) — persis susunan beranda, selebar kolom halaman.

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

### Visi Misi PPID dan Dasar Hukum (`/ppid/visi-misi-ppid`, `/ppid/dasar-hukum`)

Dua halaman teks di atas `PpidPage`; teks di `_com/visi-misi.text.ts` / `_com/dasar-hukum.text.ts`, kerangka memuat bersama `ppid/_com/PpidSectionsSkeleton.tsx`. Data: `stateVisiMisiPPID.findById.load('1')` (`visi`, `misi`) dan `stateDasarHukum.findById.load('1')` (`judul`, `content`) — HTML dari editor admin. Daftar dari CMS diurai pengurai bersama `ppid/_com/cms-list.logic.ts` (`parsePlainListItems`: satu `<ol>`/`<ul>` teks polos → teks per butir, selain itu `null`). Test: `__tests__/api/ppid_visi_misi_dasar_hukum_ui.test.tsx`, `ppid_cms_list_logic.test.ts`.

- **Visi Misi** (`visi-misi-ppid/_com/VisiMisiContent.tsx` + `visi-misi.module.css`; `page.tsx` hanya memuat data; props `visi`, `misi`, `labels` {`visi`, `misi`, `logoAlt`}, `moto?` {`title`, `statement`} — tanpa `moto` lambang langsung di atas visi; dipakai juga section Visi Misi Profil Desa): penyempurnaan **rancangan awal** halaman ini — **satu kartu terang terpusat** selebar kerangka, bukan konsep baru. User menolak dua arah lain: baris "label kiri | teks kanan" tanpa kartu (v0.1.236, "jadi jelek") dan moto tipografi besar + kartu visi biru + kartu misi putih (v0.1.239, "tidak seperti ini juga"). Jangan mengganti konsepnya; perbaiki di dalam bentuk ini.
  - **Kartu**: latar `--vm-card` (`colors['white-trans-1']`, dipasang `page.tsx`), garis tepi putih 70%, radius 32px, padding 64px 48px 72px, bayangan lembut `0 16px 40px` biru 10% (≤734px: radius 24px, padding 36px 20px 40px). Muncul sekali saat data selesai dimuat (naik 12px + pudar, 600ms; `prefers-reduced-motion` ditangani `globals.css`). Kepala halaman bersama disembunyikan (`headerHidden`) karena judul tampak sudah ada di kartu.
  - **Urutan, semua rata tengah**: lambang desa 120px (mobile 84) → `h2` "Moto PPID Desa Darmasaba" 36px/700 brand (mobile 26) → kalimat moto 24px/600 (mobile 19) maks 34rem, diapit tanda kutip lengkung lewat `::before`/`::after` → pemisah → `h2` "Visi PPID" 28px (mobile 22) + teks visi 20px/1.65 (mobile 17) → pemisah → `h2` "Misi PPID" + daftar misi. Teks moto tetap di kode; visi dan misi dari CMS.
  - **Pemisah (`.ornament`)**: ikon `IconSparkles` 18px brand diapit dua garis pendek 140px (mobile 72) `#b1bdd1` — bukan garis selebar kartu; `aria-hidden`.
  - **Misi** — bila isi CMS satu daftar teks polos: `<ol>` satu kolom **rata kiri** di kolom terpusat, tiap butir = lencana bulat brand 36px berangka putih (mobile 30; `aria-hidden` karena urutan dibawa `<ol>`) + teks 19px/1.58 (mobile 17). Rancangan awal memakai justify; diganti rata kiri karena justify membuat celah antarkata tak rata. Bila bukan daftar teks polos → HTML dirender apa adanya dengan gaya `.body` di `ppid-sections.module.css`.
  - **Panjang baris** teks visi dan misi dibatasi `--vm-measure: 46rem` (±70 karakter) — panjang baris baca di dalam kartu, bukan lebar isi halaman (pengecualian yang sama dengan Dasar Hukum).
- **Dasar Hukum — bentuk** (`ppid/_com/ppid-sections.module.css`): tanpa kartu — bagian (`<section>`) langsung di atas latar halaman, selebar `--ppid-measure` (1200px), dipisah garis tipis solid `#b1bdd1`. Grid 2 kolom: label kiri 220px | isi kanan; ≤734px satu kolom (label di atas isi). Isi 19px/1.55 (mobile 17) warna `#1d1d1f`, semua rata kiri.
- **Daftar dari CMS yang dirender apa adanya (`.body`)**: `<ol>` → baris bernomor (angka brand tabular lewat CSS counter), `<ul>` → baris bertitik brand; antarbaris garis tipis. Jenis daftar mengikuti markup editor, tidak diubah.
- **Dasar Hukum**: `judul` dari CMS (saat ini ditulis kapital semua) tampil sebagai **label kecil** `h2` 13px/700 abu `#515154` berjarak huruf 0.06em, bukan judul besar; `content` diurai `_com/dasar-hukum.logic.ts` (`parseDasarHukumItems`, di atas `parsePlainListItems`) dan dirender `_com/DasarHukumList.tsx` sebagai **daftar bernomor**: penanda peraturan (teks sebelum "tentang" pertama) 19px/600, perihal di baris bawahnya 17px abu `#515154`; kata "tentang" hanya untuk pembaca layar. Panjang baris teks dibatasi `43rem` (±70 karakter) di `dasar-hukum.module.css` — satu-satunya pengecualian aturan "tanpa angka lebar sendiri", karena ini panjang baris baca, bukan lebar isi; garis antarbaris tetap selebar kolom. Bila isi CMS bukan satu daftar teks polos (paragraf, daftar bersarang, tautan), HTML dirender apa adanya dengan gaya `.body`. Test pengurai: `__tests__/api/ppid_dasar_hukum_logic.test.ts`. Tidak memakai `text-transform`: mengecilkan huruf lewat CSS akan merusak singkatan dan nama diri ("ppid", "darmasaba").
- **Status**: selama memuat → kerangka `role="status"`; selesai tanpa data → satu kalimat "… belum tersedia." Kepala halaman tetap tampil di kedua keadaan.

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

Visibilitas submenu: field `hidden` di config = **default**; Super Admin/Developer (role 0/1) bisa menimpanya per submenu di admin **Pengaturan › Visibilitas Menu** (`/admin/pengaturan/visibilitas-menu`, tabel `MenuVisibility`, key = href submenu). Menu efektif dihitung di `src/app/(public)/_com/menu-visibility.logic.ts`, disuplai layout publik (server) lewat `MenuVisibilityProvider`, dan dipakai navbar, pencarian (menu + hasil konten), serta Peta Informasi. Submenu tersembunyi → halamannya (termasuk sub-path per segmen) 404 lewat `MenuVisibilityGuard`; menu utama yang semua submenunya tersembunyi ikut hilang.

### Sidebar Admin

File: `src/app/admin/_com/list_PageAdmin.tsx` (re-export saja; data sebenarnya ada di `src/app/admin/_com/nav/domains.ts` dan dirakit di `src/app/admin/_com/nav/index.ts`)

Export: `navBar` (semua domain), `role1`, `role2`, `role3` (role-based subset), `devBar`.  
Logic pemilihan: `getNavbar({ roleId, menuIds })` — ada di `src/app/admin/(dashboard)/user&role/_com/dynamicNavbar.ts`, dipakai di `src/app/admin/layout.tsx`; logika murninya di `src/app/admin/_com/nav/menu-access.logic.ts`. Filter berdasarkan `menuIds` (tabel `UserMenuAccess`) jika tersedia, fallback ke role (`roleId 0→devBar, 1→navBar, 2→role1, 3→role2, 4→role3`). Section `pengaturanMenu` (Pengaturan › Visibilitas Menu & Menu Access) tidak ada di `navBar`/`devBar`; `getNavbar` menambahkannya hanya untuk roleId 0/1, apa pun isi Menu Access. Section **User & Role** juga khusus roleId 0/1: dibuang untuk role lain walau tersimpan di DB, dan selalu ditambahkan untuk role 0/1.

ID di `menuIds` (kontrak permanen, dijaga `__tests__/api/menu_access_ids.contract.test.ts`):

- **ID section** (`"Landing Page"`, `"PPID"`, `"Desa"`, …) = akses ke semua submenu section itu. Data lama; dicocokkan dengan normalisasi trim + lowercase.
- **ID submenu** = slug `<section-slug>.<submenu-slug>` (mis. `landing-page.apbdes`, `desa.struktur-perangkat-desa`) = akses ke submenu itu saja; section tampil dengan anak tersaring.
- **`basePath`** per submenu = prefix folder route yang dicakup (list/create/edit/kategori), dicocokkan per segmen (`/admin/x/ab` tidak cocok dengan `/admin/x/a`).

Halaman **Pengaturan › Menu Access** (`/admin/pengaturan/menu-access`; URL lama `/admin/user&role/menu-access` di-redirect) membatasi menu admin per user (tabel `UserMenuAccess`; kosong = fallback role) dengan checkbox pohon (section = induk, indeterminate bila sebagian); simpan ID section bila semua submenu dipilih, selain itu ID submenu. Section User & Role dan Pengaturan tidak bisa dipilih.

Sampah **bukan** menu sidebar: dokumen/foto yang bisa dipulihkan utuh (DAK, APBDes, galeri BUMDes, Dokumen Perencanaan) punya panel Sampah di halaman fiturnya masing-masing (kontrak `/api/sampah/:sumber`: `docs/decisions/2026-11-12-sampah.md`). Logika tampilan item murni bersama: `src/app/admin/(dashboard)/_com/sampah/sampah-item.logic.ts` (badge sisa hari oranye bila ≤ 7, info folder/ukuran/tanggal, paging, teks konfirmasi hapus permanen "tidak bisa dibatalkan"). Menu lain menghapus berkas permanen.

Guard halaman (`adminGuardRedirect` di `src/app/admin/_com/nav/menu-access.guard.ts`, dipanggil `admin/layout.tsx`): path admin yang dicakup menu tetapi tidak ada di sidebar user → redirect ke menu pertama yang diizinkan (atau `/profile` bila kosong). Role 0 dan path tanpa menu (`/admin`, `/admin/auth/*`, dll.) tidak dibatasi. **Ini pembatasan UI, bukan keamanan** — endpoint API per menu belum dijaga Menu Access.

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

`src/app/(public)/_com/splash/` — kamera menembus celah Candi Bentar menuju cahaya fajar (±2,5 dtk), dipasang di beranda `/` (`src/app/(public)/page.tsx`).

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
| Desa | Profil, Potensi, Berita, Pengumuman, Gallery, Layanan, Agenda & Kalender Desa |
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

Halaman publik yang menampilkan HTML editor memakai `src/lib/rich-text.ts`: `sanitizeRichText` (DOMPurify, hanya tag `RICH_TEXT_TAGS` `p, br, strong, em, u, ul, ol, li`, tanpa atribut; string kosong bila tanpa DOM atau isi kosong) untuk dirender sebagai HTML, dan `htmlToPlainText` untuk teks polos di daftar. Dipakai Potensi Desa, Daftar Informasi Publik, dan Laporan Publik. Jangan menulis sanitasi sendiri per halaman. Untuk sanitasi **saat simpan** di API (server, tanpa DOM) pakai `sanitizeRichTextForStorage` dari `src/lib/rich-text-server.ts` (`sanitize-html`, allowlist sama); dipakai create/update Laporan Publik.

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
| `src/app/(public)/layout.tsx` | Public site layout |
| `src/app/admin/layout.tsx` | Admin AppShell layout |
| `src/app/admin/_com/list_PageAdmin.tsx` | Konfigurasi menu sidebar |
