# Summary: Batch 1 Lomba — Menu Dokumen Perencanaan + Laporan Penduduk Bulanan

Branch: `feature/lomba-batch-1-penduduk` (turunan `feature/lomba-batch-1`). Juknis 2.2 dan 1.3. Tidak ada push/merge/bump versi.

## 1. Dokumen Perencanaan → submenu Pemerintahan (tanpa perubahan schema)

- Halaman admin dipindah (`git mv`, riwayat terjaga) ke `src/app/admin/(dashboard)/pemerintahan/dokumen-perencanaan/` (list, `create`, `[id]/edit`, `_com/DokumenPerencanaanForm.tsx`).
- Menu: `desa.dokumen-perencanaan` ("Dokumen Perencanaan", path = basePath = `/admin/pemerintahan/dokumen-perencanaan`) di `domains.ts`, tepat setelah Kegiatan Desa. Tab-nya dihapus dari `kegiatan-desa/_com/layoutTabs.tsx`.
- Redirect: `next.config.ts` → `/admin/pemerintahan/kegiatan-desa/dokumen-perencanaan/:path*` → `/admin/pemerintahan/dokumen-perencanaan/:path*` (permanent, pola sama dengan redirect admin lain; berlaku untuk list, `create`, `<id>/edit`).
- `DokumenPerencanaanForm` memakai `PdfDropzoneField` (label tetap "Berkas PDF (Opsional)"); `uploadDokumenPdf` mendelegasikan ke `uploadPdfFile`. Perilaku sama; satu-satunya beda: pesan `console.error` unggah gagal kini dari helper bersama.
- Referensi path: state `dokumenPerencanaan.ts` dan `sampah-panel.logic.ts` ternyata tidak memuat path rute (hanya teks/tipe), jadi tidak berubah; satu-satunya referensi path ada di tiga page yang dipindah (sudah diperbarui) dan import test `sampah_panel_ui`.

### Keputusan Menu Access: opsi (ii) data-migration SQL (bukan alias guard)

Cara kerja: `UserMenuAccess.menuId` menyimpan id menu; `filterNavByMenuIds` membentuk sidebar dan `adminGuardRedirect` mencocokkan pathname dengan `basePath` submenu yang diizinkan. Ada dua jalur:

- User dengan ID section `Desa` atau tanpa Menu Access (fallback role 1/2) sudah mencakup semua submenu → otomatis dapat menu baru.
- User yang hanya memegang `desa.kegiatan-desa` akan terkunci dari rute baru (guard redirect) — inilah yang dijaga.

Alasan memilih (ii): (1) halaman Menu Access menampilkan centang berdasarkan id tersimpan; alias di guard membuat tampilan centang dan akses nyata tidak sinkron (admin yang menyimpan ulang form diam-diam mencabut akses), (2) alias adalah kode permanen di jalur guard yang dipakai semua menu, sedangkan data-migration adalah satu `INSERT … SELECT` idempoten, polanya sama dengan migrasi `20261116100000_kategori_gotong_royong`, (3) setelah migrasi admin bisa mencabut Dokumen Perencanaan terpisah dari Kegiatan Desa — memang tujuan memisahkan menu.

SQL (di migration yang sama, bagian 2): beri `desa.dokumen-perencanaan` kepada tiap user pemegang `desa.kegiatan-desa`; lewati yang sudah punya `desa` / id baru; `ON CONFLICT ("userId","menuId") DO NOTHING`; id dicocokkan trim+lowercase; tidak menghapus/mengubah baris lama (`desa.kegiatan-desa` tetap menu valid).
**Catatan penting untuk coordinator:** akses baru bergantung pada migration ini terpasang di DB target (stg/prod) sebelum/bersamaan dengan rilis kode. Tanpa itu, user pemegang `desa.kegiatan-desa` saja tidak bisa membuka Dokumen Perencanaan (dilindungi test "tanpa ID baru, guard menolak…").

### Bagian publik: DITUNDA (atas keputusan coordinator via `ask`)

Entri navbar publik "Dokumen Perencanaan" tidak dikerjakan. Alasan: navbar publik bersumber dari data statis `src/con/navbar-list-menu.ts` (bukan `NavbarMainMenu`/`navbar-menu.logic`); Pemerintahan sudah punya "Monev & Pembangunan" (2.10) yang memuat section Dokumen Perencanaan (`DOKUMEN_PERENCANAAN_PUBLIC_HREF` = `/pemerintahan/monev-pembangunan#dokumen-perencanaan`). Entri baru ber-hash tidak ringan: `menuKey` MenuVisibility = href (key baru), hash tak pernah cocok di `isPathActive`, serta dampak ke Peta Informasi, sitemap, pencarian, Jenna sitemap dan ±19 file test. Halaman monev tidak diubah.

## 2. Laporan penduduk bulanan (model baru, aditif)

- Schema: `LaporanPendudukBulanan` (id cuid, `banjar` teks, `tahun`, `bulan`, `lakiLaki`, `perempuan`, timestamps, `deletedAt?`, `isActive`, `@@index([tahun, bulan])`, `@@index([banjar])`). `DataBanjar`, summary dashboard, dan halaman publik Kependudukan TIDAK disentuh.
- Migration: `prisma/migrations/20261118120000_lomba_laporan_penduduk_bulanan/migration.sql` — `CREATE TABLE/INDEX IF NOT EXISTS` (dibuat dari `prisma migrate diff` offline lalu dirapikan) + data-migration Menu Access di atas. Komentar menjelaskan alasan.
- API `_lib/kependudukan/laporan-bulanan/` (prefix `/api/kependudukan/laporanbulanan`, didaftarkan di `kependudukan/index.ts`):
  - `GET /find-many` publik: terpaginasi (default 20, maks 100), filter `tahun`, `bulan`, `banjar` (mengandung, tak peka huruf); filter tak valid → 400 (tidak diam-diam diabaikan); hanya `isActive`; select hanya kolom agregat.
  - `GET /:id` publik: hanya `isActive`, 404 bila tak ada.
  - `POST /create`, `PUT /:id`, `DELETE /del/:id`: admin-only (role 0–4) lewat `guardAdmin` di tiap handler (401 tanpa sesi, 403 bukan admin). Delete = soft delete (`isActive=false` + `deletedAt`).
  - Validasi (`laporan-bulanan.rules.ts`, satu sumber untuk API dan form admin): bulan bulat 1–12; tahun bulat `TAHUN_MIN`(2000)–tahun berjalan+1; L/P bulat 0–`JUMLAH_MAX`(1.000.000); banjar wajib, ≤100 karakter, spasi dirapikan.
  - Duplikat aktif (banjar [tak peka huruf] + tahun + bulan) ditolak 409 dengan pesan jelas di create dan update (update mengecualikan baris sendiri).
- Admin: menu "Laporan Bulanan" di Kependudukan (`kependudukan.laporan-bulanan`, setelah Data Banjar). List: filter tahun/bulan/cari banjar, kolom Banjar/Periode (nama bulan Indonesia)/L/P/Total, paginasi, hapus dengan konfirmasi. Form create/edit: banjar via `Autocomplete` (saran dari endpoint Data Banjar yang sudah ada, tetap boleh teks bebas), tahun, bulan dropdown nama, L/P `NumberInput`, total L+P read-only. Halaman memakai `useProxy(state, { sync: true })` (caret tidak loncat).

## Test (vitest, env node + SSR)

| File | Isi |
|---|---|
| `__tests__/api/dokumen_perencanaan_menu.test.tsx` (baru) | item menu + tab lama hilang, redirect rute lama→baru, Menu Access (migrasi + sidebar/guard), form PDF bersama, delegasi unggah |
| `__tests__/api/kependudukan_laporan_bulanan_api.test.ts` (baru) | validasi, duplikat 409, soft delete, 401/403 non-admin, find-many tersaring, routing |
| `__tests__/api/kependudukan_laporan_bulanan_ui.test.tsx` (baru) | menu, SSR form/tabel/list/create/edit, state submit |
| diubah (perlu karena snapshot/angka/import) | `menu_access_ids.contract.test.ts` (tambah dua ID baru, aditif), `next_config_redirects.test.ts` (satu entri), `navbar_labels.test.ts` (10→11 submenu), `sampah_panel_ui.test.tsx` (path import) |

## File di luar Target yang disentuh (4 test + 1 config; ≤5, tidak perlu eskalasi)

`next.config.ts` (redirect, disebut eksplisit di spec), dan empat file test di atas. Tidak ada kode produksi lain di luar Target.

## Hutang teknis / catatan

- Duplikat dicegah di aplikasi (cek-lalu-tulis), jadi dua POST bersamaan untuk periode yang sama secara teori bisa lolos keduanya. Tanpa unique index karena soft delete (spec). Bila ingin ketat: partial unique index SQL `(lower(banjar), tahun, bulan) WHERE "isActive"` — tidak bisa dinyatakan di Prisma schema (risiko drift), jadi tidak dipasang.
- `YearFilter` (komponen bersama kependudukan) hanya menawarkan tahun ≥ 2020, sementara API menerima ≥ 2000.
- Setelah memindah folder route, `.next/types` basi: jalankan `bunx next typegen` sebelum `tsc`. Aku tidak menjalankan tsc/build (batas resource); tipe ditulis hati-hati (union respons Eden dipersempit lewat `bodyOf`, bukan alias kondisi).
- Temuan di luar scope (tidak diperbaiki): mutasi API Dokumen Perencanaan (`desa/dokumen-perencanaan/{create,updt,del}`) hanya dijaga `requireAuth()` (sisa T19 — role 5 bisa mengubah); `data-banjar/del.ts` hard delete dan `findUnique` mengabaikan `isActive` (BACKEND-TODO sudah mencatat pola serupa).
- Docs umum/CHANGELOG/versi tidak disentuh (coordinator yang mengonsolidasi). Perlu catatan di `docs/DATABASE.md`/CHANGELOG: tabel baru, menu baru, redirect, dan data-migration Menu Access.
