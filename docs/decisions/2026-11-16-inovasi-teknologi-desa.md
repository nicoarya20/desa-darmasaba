# Inovasi Teknologi Desa (gabungan Desa Digital + Info Teknologi Tepat Guna)

Tanggal: 2026-11-16

## Masalah
Menu Inovasi punya dua submenu berisi informasi yang sama: **Desa Digital / Smart Village** (model `DesaDigital`) dan
**Info Teknologi Tepat Guna** (model `InfoTekno`). Kedua model identik (`name`, `deskripsi`, `image`, `isActive`), jadi
admin mengisi dua tempat dan warga membuka dua halaman untuk hal serupa.

## Keputusan
- **Satu tabel, satu menu, satu halaman: "Inovasi Teknologi Desa"**, dibedakan kolom `kategori`:
  `digital` (Desa Digital / Smart Village) dan `tepat-guna` (Teknologi Tepat Guna). Nilai & label di
  `src/lib/inovasi-teknologi/kategori.ts`; DB dijaga CHECK `DesaDigital_kategori_check`, API memvalidasi body (422)
  dan query `?kategori=` (400).
- **Tabel fisik tetap `"DesaDigital"`** (model Prisma `InovasiTeknologiDesa` + `@@map`) supaya id, FK gambar, dan URL
  detail lama tetap berlaku. Migrasi `20261116120000_inovasi_teknologi_desa` menambah kolom (DEFAULT `digital`),
  lalu menyalin baris `InfoTekno` sebagai `tepat-guna` (id & imageId sama, `ON CONFLICT (id) DO NOTHING`; bentrok id
  dicetak lewat NOTICE, datanya tetap di `InfoTekno`).
- **`InfoTekno` tidak di-drop** di rilis ini — cadangan sampai prod terverifikasi. Model Prisma-nya dipertahankan agar
  schema selaras dengan DB (tanpa model, migrasi berikutnya yang dibuat Prisma akan berisi DROP TABLE). Hutang:
  `docs/debt/2026-11-16-drop-info-tekno.md`.
- **API**: `/api/inovasi/inovasiteknologi/*` (create, find-many, `/:id`, del, PUT) menggantikan
  `/api/inovasi/desadigital/*` dan `/api/inovasi/infotekno/*` (dihapus; konsumennya hanya admin/halaman publik repo ini).
  `kategori` opsional di body (create → `digital`, PUT tanpa field → kategori lama dipertahankan).
- **Admin**: satu submenu "Inovasi Teknologi Desa" di `/admin/inovasi/inovasi-teknologi-desa` (tab kategori, cari,
  paginasi, field kategori di form). URL admin lama di-redirect.
- **Publik**: `/inovasi/inovasi-teknologi-desa` (`?kategori=`, `?search=`, `?page=`) + detail `/:id`. URL lama
  di-redirect permanen di `next.config.ts`: `/inovasi/desa-digital-smart-village` → `?kategori=digital`,
  `/inovasi/desa-digital-smart-village/:id` → `/inovasi/inovasi-teknologi-desa/:id`,
  `/inovasi/info-teknologi-tepat-guna` → `?kategori=tepat-guna`.

## Menu Access (kontrak ID)
- ID `inovasi.desa-digital-smart-village` **dipertahankan** (nama tampil berubah jadi "Inovasi Teknologi Desa",
  path/basePath pindah ke `/admin/inovasi/inovasi-teknologi-desa`).
- ID `inovasi.info-teknologi-tepat-guna` **dihapus**. Migrasi memberi pemilik akses lama ID yang dipertahankan (bila
  belum punya) lalu menghapus baris lama — idempoten. Snapshot `__tests__/api/menu_access_ids.contract.test.ts`
  diperbarui di commit yang sama.

## Visibilitas menu publik
`MenuVisibility.menuKey` = href submenu navbar. Dua href lama digabung ke `/inovasi/inovasi-teknologi-desa`:
tersembunyi hanya bila **kedua** href lama disembunyikan admin (href tanpa baris = tampil). Baris href lama dihapus.

## Konsumen lain yang ikut pindah
Navbar publik (`src/con/navbar-list-menu.ts`, satu entri), Footer, pencarian global (tipe `inovasiTeknologiDesa`,
`searchUrl.tsx`), registry Jenna (`inovasi_teknologi_desa`, field `kategori` ikut dibaca — snapshot registry
diperbarui), seed (`seed_desa_digital.ts`/`seed_info_teknologi.ts` menulis ke tabel gabungan dengan kategori).
