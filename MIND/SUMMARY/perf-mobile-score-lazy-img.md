# W2 — perf/mobile-score-lazy-img: foto beranda lazy + srcset

Dasar: join 0.1.314. Tidak ada build, DB, push, merge, bump versi, atau perubahan `img.ts`/`next.config.ts`/hero/splash/tema.

## 1. Audit `<img>` beranda (sebelum)

| Komponen | Posisi | Loading sebelum | Ukuran tampil (CSS px) | Asal URL |
|---|---|---|---|---|
| Hero: HeroProfile (foto Perbekel) | atas | eager + fetchpriority high | ± kolom hero | `/api/img/<id>-desktop.webp` — **tidak disentuh** |
| Hero: HeroPrograms (logo program), landing-page/index (logo desa/pudak) | atas | lazy / default | kecil | — **tidak disentuh** |
| Kabar Desa — foto utama (`KabarBerita`, rail) | bawah | lazy | ±60vw desktop, 100vw ponsel (16:9) | `/api/img/…` |
| Kabar Desa — 3 kartu kecil | bawah | lazy | ±31vw desktop, 78vw ponsel (16:10) | `/api/img/…` |
| Apbdes, Layanan Masyarakat, Desa Anti Korupsi, Kepuasan | bawah | tak ada `<img>` | – | – |
| Prestasi (`PrestasiGrid`, 4 kartu) | bawah | lazy | 50vw (wide 100vw); ponsel 100vw (4:3) | `/api/img/…` |
| **Layanan & Potensi (`GalleryRow`, 2 baris, track loop)** | bawah | **eager semua** | feature 49/64/69vw; tile 18,4/28/47vw | `/api/img/…` |
| SDGs (`SdgsCards`, 4 ikon) | bawah | lazy | 72px (64 ponsel) | `/api/img/…` |
| ProgramTiles / ProgramTileLogo | tidak dipakai beranda (halaman Inovasi dll.) | lazy | logo kecil | tak diubah |
| Navbar/Gate logo | atas | — | ≤150px | aset statis, tak diubah |

Temuan utama: hanya galeri Layanan & Potensi yang eager. Track loop menggandakan tiap kartu (`buildLoopTrack`: (2·⌈4/N⌉+1)·N `<img>` per baris, mis. N=5 → 15, N=8 → 24, N=3 → 15), lalu semuanya eager. Itu sumber utama 79 `<img>` di DOM dan sebagian besar dari 34 permintaan. (Jumlah item sebenarnya di prod tidak saya ukur — tanpa DB/stg.)

## 2. Perubahan

| File | Perubahan |
|---|---|
| `src/app/(public)/_com/responsive-image.logic.ts` (baru, 47 baris) | `responsiveImageProps(src, sizes, widths=[480,768,1280])` → `{src, srcSet, sizes}` untuk `/api/img/<nama>` webp/jpg/png; selain itu (eksternal, ber-query/hash, svg, gif, tanpa ekstensi, lebar kosong) hanya `{src}`. Lebar diurut, unik, hanya bilangan bulat > 0. |
| `main-page/layanan-potensi/gallery-image.logic.ts` (baru) | `galleryImageLoading()` + `PRELOAD_DISTANCE` + `GALLERY_IMAGE_SIZES`. |
| `main-page/layanan-potensi/use-near-viewport.ts` (baru) | Hook IntersectionObserver (rootMargin 600px, sekali lalu tetap). Tanpa IO → tetap lazy. |
| `main-page/layanan-potensi/GalleryRow.tsx:120-127`, `index.tsx` (ref section + prop `preloadImages`) | Foto kartu: `loading` dari `galleryImageLoading`, `decoding="async"`, srcSet/sizes. Ruang tetap sudah ada (`.card` punya `aspect-ratio`, `<img>` absolut). |
| `main-page/kabar-desa/KabarBerita.tsx` | srcSet/sizes (`PHOTO_SIZES`); loading tak diubah (rail lazy, foto utama halaman daftar tetap eager+high). |
| `main-page/prestasi/PrestasiGrid.tsx` | srcSet/sizes (`CARD_SIZES`/`WIDE_CARD_SIZES`); sudah lazy. |
| `_com/imageErrorRetry.ts` | `removeAttribute("srcset")` pada fallback `?format=jpeg` dan retry (lihat §5). |

**Kenapa galeri tidak "lazy murni":** kartu di luar viewport baris terpotong `overflow:hidden`, sehingga `loading="lazy"` baru memuatnya setelah slide masuk → kotak gelap `#1d1d1f` sesaat tiap slide (autoplay 5 dtk). Solusi: lazy semua sampai section dekat layar (600px), lalu kartu aktif ±2 (feature) / ±4 (tile) eager — kartu yang terlihat + satu di luarnya; sisanya (salinan loop jauh) tetap lazy. Pola sama dengan `lazyPreloadPrevNext` Swiper. Jarak 4 untuk tile = kasus terburuk desktop (18,4%/kartu).

**`sizes` sengaja dilebihkan** untuk foto 16:9 `object-fit:cover` di kotak yang lebih "kotak": foto mengikuti TINGGI kotak, jadi lebar yang dibutuhkan > lebar kotak (feature ponsel 69vw potret 550/992 ≈ 220vw; tile ponsel ≈ 112vw; prestasi ponsel 4:3 ≈ 134vw; 16:10 ≈ +11%). Tanpa ini ponsel mendapat berkas 480/768w yang di-upscale (buram) — melanggar "tampilan tak berubah". Akibatnya, di ponsel DPR ≥ 2 galeri tetap memilih 1280w (hemat vs 1920 ≈ 1/3 lebih kecil piksel, bukan 4×); penghematan besar terjadi di desktop/tablet dan pada kartu Kabar/Prestasi.

Tabel `sizes`: feature `(max-width: 734px) 220vw, (max-width: 1068px) 64vw, 49vw`; tile `(max-width: 734px) 112vw, (max-width: 1068px) 28vw, 18.4vw`; Kabar utama `…100vw, 60vw`, rail `…87vw, 38vw`, grid `…111vw, …56vw, 38vw`; Prestasi `…134vw, 56vw` (wide `…134vw, 100vw`).

## 3. `<img>` eager vs lazy (hasil render uji, galeri 3 item = 15 `<img>`/baris)

| Kondisi | Eager sebelum | Eager sesudah | Lazy sesudah |
|---|---|---|---|
| Galeri feature, section jauh dari layar (saat dibuka) | 15 | **0** | 15 |
| Galeri tile, jauh dari layar | 15 | **0** | 15 |
| Galeri feature, setelah dekat layar | 15 | 5 | 10 |
| Galeri tile, setelah dekat layar | 15 | 9 | 6 |
| Kabar rail (beranda) / Prestasi / SDGs | 0 | 0 | semua (tak berubah) |

Gambar eager non-hero di beranda saat dibuka: dari seluruh `<img>` galeri (30–50 per 2 baris pada N tipikal) menjadi 0. Foto `/api/img` yang dimuat sekarang memakai `?size=` (480–1280) bukan 1920.

## 4. Verifikasi
- Test baru (vitest, env node): `responsive_image_logic` (17), `gallery_image_logic` (5), `responsive_images_components` (9, renderToStaticMarkup: Kabar rail/grid, Prestasi wide, GalleryRow, SDGs), + 2 test baru di `darmasaba_image_error_retry` — **semua lulus** (juga `image_loading_attrs` lama).
- Mutation check (kode dirusak → test gagal): galeri `preload=false` → eager; Prestasi lazy→eager; guard query `[?#]` dihapus; `removeAttribute("srcset")` dihapus; `aboveFold` Kabar dipaksa true. Semua terdeteksi (guard query awalnya lolos karena regex ekstensi menutupinya; kasus `?next=b.png` ditambah).
- eslint file berubah: 0 error; 6 warning `any` lama di `darmasaba_image_error_retry.test.ts` (sudah ada, berkomentar).
- tsc-terbatas (`/tmp/w2/tsconfig.json`, extends tsconfig repo, hanya 12 file + stub `*.module.css`): bersih. tsc penuh = koordinator.
- Tidak diverifikasi: tampilan/visual, perilaku IntersectionObserver & lazy di browser nyata, byte aktual, skor PageSpeed. **Dampak ke skor baru terukur setelah deploy ke stg.** Tidak ada angka MB yang saya klaim.

## 5. Catatan & risiko
- `imageErrorRetry.ts` (di luar daftar kepemilikan, diff 2 baris + 2 test): `srcset` mengalahkan `src`, jadi tanpa perubahan ini fallback `?format=jpeg` (Safari < 14) dan cache-buster `_retry` diabaikan untuk gambar responsif.
- `img.ts` memakai `sharp.resize(size)` **tanpa `withoutEnlargement`**: foto sumber < lebar yang diminta (mis. unggahan lama 700px + `?size=768/1280`) akan di-upscale dan bisa lebih BESAR dari aslinya. Saran: tambah `{ width: size, withoutEnlargement: true }` di img.ts (bukan wilayah saya).
- Kandidat terbesar 1280w (bukan 1920): kartu lebar di layar retina besar sedikit lebih lunak dibanding sebelumnya. Bila tak diinginkan, tambahkan lebar 1920 sebagai kandidat terakhir (mengabaikan `?size`, memakai berkas asli).
- Tidak diubah: ikon SDGs 72px (tetap satu URL sesuai aturan ≤150px, tapi masih mengunduh berkas 1920 — kandidat `?size=160` terpisah), `ProgramOverlay*` (overlay hero yang hanya tampil saat dibuka), `PrestasiListPage` (foto atas-lipatan halaman daftar masih lazy, di luar target beranda), ProgramTiles (sudah lazy, tak dipakai beranda).
- Kabar rail ponsel: kartu geser horizontal (flex 78%) — kartu ke-2/3 di luar layar tetap ditangani lazy bawaan browser (scroll container, bukan track transform) seperti sebelumnya.

## 6. Saran lanjutan
1. `withoutEnlargement` di `img.ts` (lihat §5). 2. Cek di stg: scroll cepat galeri di ponsel throttling 4G — pastikan tak ada kartu gelap. 3. Ukur ulang PageSpeed "Improve image delivery" & jumlah permintaan setelah deploy. 4. Pertimbangkan `?size=` untuk ikon SDGs dan logo program.
