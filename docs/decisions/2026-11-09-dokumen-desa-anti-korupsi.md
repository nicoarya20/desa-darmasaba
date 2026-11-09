# Folder Dokumen Desa Anti Korupsi

Tanggal: 2026-11-09 · Migrasi: `20261109103000_dokumen_desa_anti_korupsi`

## Keputusan
- **Tabel anak** `DokumenDesaAntiKorupsi` (program → banyak dokumen) menggantikan kolom tunggal `DesaAntiKorupsi.fileId`. Migrasi membuat tabel, menyalin setiap `fileId` lama menjadi satu dokumen (`urutan` 0, judul = `FileStorage.realName`, fallback nama program, id `dakdok_<md5(id program)>`), baru kemudian menghapus kolom + FK lama.
- **FK CASCADE** ke program (hapus program = hapus foldernya; hapus program di API memang hard delete) dan ke `FileStorage` (`/api/fileStorage/delete` menghapus permanen; RESTRICT akan membuat hapus berkas gagal).
- **Update = sinkronisasi set dokumen.** Body `dokumen` adalah daftar final: item tanpa `id` dibuat, item ber-`id` diperbarui judul/urutannya bila berubah, dokumen aktif yang tidak dikirim di-soft-delete (`isActive=false` + `deletedAt`). `dokumen` tidak dikirim = folder tidak disentuh. Semua dalam satu transaksi. Berkas dokumen lama tidak bisa diganti — hapus lalu unggah baru.
- **Validasi** bentuk dasar di Elysia (`t.Array(t.Object(...))`, maks 50), aturan detail di `src/lib/desa-anti-korupsi-dokumen.ts` (`parseDokumenList`, `planDokumenSync`) supaya pesan error seragam (400). `fileId` baru wajib menunjuk `FileStorage` aktif.
- **Upload** memakai `POST /api/fileStorage/create` (MinIO) yang sudah ada; admin mengunggah berkas saat Simpan, bukan saat dipilih, agar batal tidak meninggalkan berkas yatim. Berkas MinIO milik dokumen yang di-soft-delete **tidak** dibersihkan (repo belum punya pembersih berkas yatim).
- **Pratinjau** hanya untuk PDF (iframe); format lain disimpan ter-gzip oleh endpoint upload sehingga hanya ditawarkan sebagai unduhan.

## Kontrak `/api/landingpage/desaantikorupsi`
| Method | Path | Body / respons |
|---|---|---|
| GET | `/findMany`, `/:id` | tiap program membawa `dokumen: { id, judul, urutan, fileId, file: { id, link, realName, mimeType } }[]` (aktif saja, urut `urutan`, lalu `createdAt`); field `file`/`fileId` program dihapus |
| POST | `/create` | `{ name, deskripsi, kategoriId, dokumen?: { fileId, judul, urutan }[] }` |
| PUT | `/:id` | `{ name, deskripsi, kategoriId, dokumen?: { id?, fileId, judul, urutan }[] }` |
