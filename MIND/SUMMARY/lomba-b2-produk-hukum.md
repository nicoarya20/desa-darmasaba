# Lomba Batch 2: Produk Hukum (Pemerintahan)

Branch: `feature/lomba-batch-2-produk-hukum`. Hanya fitur + halaman kosong yang sopan; tidak ada seed/isi data.

## Yang dibuat
- **Migrasi** `prisma/migrations/20261118140000_lomba_produk_hukum/migration.sql`: tabel `ProdukHukum` + 2 indeks + FK `fileId` ON DELETE SET NULL (idempoten, aditif, tidak menyentuh tabel lain). Model `ProdukHukum` dan relasi balik `FileStorage.ProdukHukum` (satu baris, setelah `DokumenDasarHukumPPID`) di `prisma/schema.prisma`.
- **Lib** `src/lib/produk-hukum.ts`: kategori (`PERDES`, `PERATURAN_PERBEKEL`, `SK_PERBEKEL`, `LAINNYA`), label, batas, `parseProdukHukumInput`, tipe `ProdukHukumRecord`.
- **API** `/api/desa/produkhukum` (`_lib/desa/produk-hukum/*`, didaftarkan di `_lib/desa/index.ts`): `GET /find-many` + `GET /:id` publik; `POST /create`, `PUT /updt/:id`, `PUT /reorder`, `DELETE /del/:id` lewat `guardAdmin` (role 0-4).
- **Admin** `/admin/pemerintahan/produk-hukum` (list + filter kategori + cari + paginasi, `create`, `[id]/edit`) dan state `_state/desa/produkHukum.ts`.
- **Publik** `/pemerintahan/produk-hukum`: tabel No · Nama · Tahun · Kategori · File (Lihat + Unduh), pil kategori `?kategori=`, cari `?search=`, paginasi `?page=`, keadaan memuat/gagal/kosong.

## Keputusan
- Hapus entri = hapus baris permanen (pola Dasar Hukum), lalu `removeStoredFile`. Mengganti/melepas PDF saat edit juga membersihkan berkas lama SESUDAH baris diperbarui (hanya bila tak dirujuk data lain).
- Urutan daftar publik: `tahun` menurun (tanpa tahun di akhir) → `urutan` → `createdAt`. `urutan` hanya pemutus seri; `PUT /reorder` ada di API tetapi belum dipakai UI admin (tidak diminta).
- `fileId` hanya diperiksa ada di FileStorage (spec), tidak dipaksa berformat PDF; batas PDF 20 MB dijaga dropzone.
- Kolom cari publik muncul bila entri > 6 (`LIST_SEARCH_THRESHOLD`) atau sedang mencari; pil kategori disembunyikan bila belum ada entri sama sekali.
- Param publik `search` (URL) dipetakan ke `q` di API.

## Belum dikerjakan (milik coordinator)
- Entri navbar, ID menu admin `desa.produk-hukum`, `search-extra-pages`, peta informasi, DESIGN.md §5, CHANGELOG, versi.
