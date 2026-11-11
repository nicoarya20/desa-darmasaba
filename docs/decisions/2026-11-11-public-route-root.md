# Website Publik di Root URL (tanpa prefix `/darmasaba`)

Tanggal: 2026-11-11 · Migrasi: `20261111130000_strip_darmasaba_prefix_menu_key` (data-only)

## Konteks
Website publik dulu berada di `src/app/darmasaba/*`, sehingga semua URL berprefix (`/darmasaba`, `/darmasaba/ppid/profil-ppid`, …) dan `src/app/page.tsx` hanya `redirect("/darmasaba")`. Prefix itu redundan dengan domain desa, memperpanjang URL yang dibagikan warga, dan membuat beranda selalu butuh satu redirect.

## Keputusan
- **Route group `src/app/(public)`** menggantikan folder `darmasaba` (`git mv`, struktur dalam tidak berubah). Nama dalam kurung tidak muncul di URL, jadi beranda = `/` dan halaman publik = `/ppid/profil-ppid`, sementara `(public)/layout.tsx` tetap hanya membungkus halaman publik (bukan `/admin`, `/login`, dll). `src/app/page.tsx` dihapus karena bentrok dengan `(public)/page.tsx`; splash pembuka (`GateSplash`) kini diputar di `/` (`GATE_SPLASH_LANDING_PATHS = ["/"]`).
- **Path internal** di kode, test, dan seed diubah ke versi tanpa prefix; import alias `@/app/darmasaba/` → `@/app/(public)/`. Logika yang menghitung jumlah segmen pathname (layout berita, galeri, kegiatan desa, gotong royong, perpustakaan digital) disesuaikan: halaman detail kini 4 segmen, bukan 5.
- **Redirect permanen** di `next.config.ts`: `/darmasaba` → `/` dan `/darmasaba/:path*` → `/:path*` agar link lama (dibagikan warga, terindeks mesin pencari, tersimpan di konten DB) tetap jalan. Redirect lama (`desa` → `pemerintahan`, `penghargaan` → `prestasi-desa`) tersedia dalam versi tanpa prefix, dan versi berprefix langsung ke tujuan final supaya tidak terjadi redirect berantai. Entri spesifik diletakkan sebelum wildcard (Next memakai redirect pertama yang cocok). Test: `__tests__/api/public_route_redirects.test.ts`, `__tests__/api/next_config_redirects.test.ts`.
- **`MenuVisibility.menuKey`** (href submenu, unique) dimigrasi: row berprefix yang versi tanpa-prefix-nya sudah ada dihapus dulu (hindari bentrok unique; versi tanpa prefix = keputusan admin terbaru), lalu prefix dibuang dengan `substring("menuKey" from 11)`. Idempoten: run kedua tidak menemukan key `/darmasaba/%`. Tanpa migrasi ini override admin akan diabaikan diam-diam karena key lama tidak dikenali `toOverrides`.

## Konsekuensi
- Konten DB lain yang mungkin menyimpan path lama (rich text berita/pengumuman, kolom `link`/`url` yang diisi admin) **tidak** dimigrasi; redirect 301/308 menutupinya. Migrasi konten hanya dilakukan setelah diskusi.
- Redirect `/darmasaba/*` harus dipertahankan selama link lama masih beredar.
