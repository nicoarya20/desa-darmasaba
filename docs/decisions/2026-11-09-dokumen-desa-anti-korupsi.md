# Folder Dokumen Desa Anti Korupsi

Tanggal: 2026-11-09 · Migrasi: `20261109103000_dokumen_desa_anti_korupsi`, `20261109140000_folder_dokumen_desa_anti_korupsi`

## Keputusan
- **Tabel anak** `DokumenDesaAntiKorupsi` (program → banyak dokumen) menggantikan kolom tunggal `DesaAntiKorupsi.fileId`. Migrasi membuat tabel, menyalin setiap `fileId` lama menjadi satu dokumen (`urutan` 0, judul = `FileStorage.realName`, fallback nama program, id `dakdok_<md5(id program)>`), baru kemudian menghapus kolom + FK lama.
- **FK CASCADE** ke program (hapus program = hapus foldernya; hapus program di API memang hard delete) dan ke `FileStorage` (`/api/fileStorage/delete` menghapus permanen; RESTRICT akan membuat hapus berkas gagal).
- **Update = sinkronisasi set dokumen.** Body `dokumen` adalah daftar final: item tanpa `id` dibuat, item ber-`id` diperbarui judul/urutannya bila berubah, dokumen aktif yang tidak dikirim di-soft-delete (`isActive=false` + `deletedAt`). `dokumen` tidak dikirim = folder tidak disentuh. Semua dalam satu transaksi. Berkas dokumen lama tidak bisa diganti — hapus lalu unggah baru.
- **Validasi** bentuk dasar di Elysia (`t.Array(t.Object(...))`, maks 50), aturan detail di `src/lib/desa-anti-korupsi-dokumen.ts` (`parseDokumenList`, `planDokumenSync`) supaya pesan error seragam (400). `fileId` baru wajib menunjuk `FileStorage` aktif.
- **Upload** memakai `POST /api/fileStorage/create` (MinIO) yang sudah ada; admin mengunggah berkas saat Simpan, bukan saat dipilih, agar batal tidak meninggalkan berkas yatim. Berkas MinIO milik dokumen yang di-soft-delete **tidak** dibersihkan (repo belum punya pembersih berkas yatim).
- **Pratinjau** hanya untuk PDF (iframe); format lain disimpan ter-gzip oleh endpoint upload sehingga hanya ditawarkan sebagai unduhan.

## Folder dokumen (satu tingkat) — migrasi `20261109140000_folder_dokumen_desa_anti_korupsi`
- **Kenapa:** program bisa berisi puluhan dokumen; menampilkan semuanya di kartu publik membuat tinggi kartu tidak proporsional dan halaman detail admin sangat panjang. Admin juga perlu memilah dokumen.
- **Model:** `FolderDokumenDesaAntiKorupsi` (program → banyak folder, `nama`, `urutan`, soft delete `isActive`/`deletedAt`, FK CASCADE ke program) dan `DokumenDesaAntiKorupsi.folderId` nullable (FK SET NULL). **Satu tingkat saja** (Program → Folder → Dokumen) supaya UI tetap sederhana; tidak ada sub-folder.
- **"Umum" = folder virtual**, bukan baris DB: dokumen dengan `folderId` NULL. Dokumen lama tidak di-backfill. Key URL/UI-nya `umum` (`FOLDER_UMUM_KEY`).
- **Hapus folder = soft delete + dokumennya dipindah ke "Umum"** (`folderId = NULL` di transaksi yang sama), tidak ikut terhapus. SET NULL di FK hanya jaring pengaman bila baris folder terhapus permanen.
- **Validasi** (`src/lib/desa-anti-korupsi-folder.ts`, `planProgramSync` di `src/lib/desa-anti-korupsi-sync.ts`, murni & teruji): nama wajib, ≤100 karakter, unik per program tanpa beda kapital/spasi tepi, maks 30 folder, `id` folder harus milik program, `tempKey` yang dirujuk dokumen harus ada di `folders`. Keunikan nama dijaga di aplikasi (bukan index DB) karena index fungsional `lower(trim(nama))` tidak bisa dimodelkan Prisma dan akan dianggap drift.
- **Satu transaksi:** buat folder baru (tempKey → id) → ubah nama/urutan → hapus folder (lepas dokumen ke Umum) → soft delete / ubah / buat dokumen → baca ulang detail. `urutan` dokumen dihitung per folder.
- **Daftar program ringan:** `findMany` hanya mengirim `jumlahFolder` & `jumlahDokumen` (aktif) lewat `_count` relasi terfilter (satu query, tanpa N+1); isi dokumen hanya di `/:id`.
- **Tampilan:** kartu publik ringkas → halaman `/darmasaba/desa-anti-korupsi/program/[id]` (grid folder, `?folder=<id|umum>` bisa dibagikan, cari judul lintas folder); admin detail = tabel per folder dalam Accordion + pratinjau modal; editor admin = pengelola folder + unggah ke folder terpilih + Select pindah folder, semua tersimpan dengan satu request.
- **Berkas unik per folder, bukan per program:** satu `fileId` boleh dipakai dokumen di beberapa folder program yang sama (admin menyalin dokumen ke folder lain tanpa mengunggah ulang), tapi dua dokumen dengan `fileId` sama di satu folder ditolak 400 (`file yang sama dipakai dua kali di folder yang sama`). Folder dibandingkan sesuai bentuk rujukannya (`{ id }`, `{ tempKey }`, null = Umum). Cek `FileStorage` aktif menghitung berkas unik.

## Kontrak `/api/landingpage/desaantikorupsi`
`FolderRef` = `{ id }` (folder tersimpan) · `{ tempKey }` (folder baru di request yang sama) · `null`/tidak dikirim (= "Umum").

| Method | Path | Body / respons |
|---|---|---|
| GET | `/findMany` | tiap program: field program + `kategori` + `jumlahFolder` + `jumlahDokumen` (aktif). **Tidak** lagi membawa `dokumen`. |
| GET | `/:id` | field program + `kategori` + `folders: { id, nama, urutan, dokumen: Dokumen[] }[]` (urut `urutan`) + `dokumenUmum: Dokumen[]`. `Dokumen` = `{ id, judul, urutan, fileId, createdAt (ISO), file: { id, link, realName, mimeType, size } }` (aktif, urut `urutan` lalu `createdAt`; `size` byte, `null` = berkas lama belum di-backfill). |
| GET | `/:id/zip?folder=<folderId\|umum>` | **Publik.** ZIP dokumen aktif. Tanpa `folder` = seluruh program (subfolder per nama folder + `Umum`); dengan `folder` = isi folder itu di akar arsip. 200 `application/zip` + `Content-Disposition: attachment` (`<slug-program>[-<slug-folder>].zip`, `filename*` RFC 5987). 404 program/folder tidak ada/nonaktif atau tidak ada dokumen; 413 total ukuran > `DAK_ZIP_MAX_BYTES` (default 100 MB); 502 berkas gagal dibaca dari MinIO. Error = `{ success: false, message }`. |
| POST | `/create` | `{ name, deskripsi, kategoriId, folders?: { tempKey, nama, urutan }[], dokumen?: { fileId, judul, urutan, folder?: FolderRef }[] }` → `data` berbentuk detail `/:id` |
| PUT | `/:id` | `{ name, deskripsi, kategoriId, folders?: { id? \| tempKey?, nama, urutan }[], dokumen?: { id?, fileId, judul, urutan, folder?: FolderRef }[] }`. `folders`/`dokumen` tidak dikirim = bagian itu tidak diubah; array = set final. → `data` berbentuk detail `/:id` |

Error validasi isi program: HTTP 400 `{ success: false, message }`.

## Ukuran berkas & unduh ZIP — migrasi `20261109150000_add_file_storage_size`
- **`FileStorage.size Int?`** (byte): diisi upload baru (`/api/fileStorage/create` & upload gambar pengaduan); baris lama diisi `prisma/backfill-file-size.ts` (lihat `docs/DEPLOYMENT.md`). Nullable karena ukuran baris lama hanya bisa diketahui dari MinIO.
- **Makna ukuran = isi yang diterima pengguna**: dokumen non-PDF disimpan ter-gzip, `size` = ukuran asli (backfill membaca ISIZE di trailer gzip); gambar = ukuran WebP tersimpan.
- **ZIP**: dibangun di memori dengan `adm-zip`, maka total isi dibatasi (`DAK_ZIP_MAX_BYTES`, default 100 MB) dan dicek dari `size` (fallback `statObject` bila null) **sebelum** mengunduh isi dari MinIO. Isi ter-gzip dibuka sehingga entri ZIP berisi dokumen aslinya. Nama entri = judul + ekstensi berkas asli, disanitasi (tanpa pemisah path/karakter kontrol) dan nama kembar diberi akhiran ` (2)`. Logika murni di `src/lib/desa-anti-korupsi-zip.ts`.
- **Publik tanpa whitelist baru**: `/api/landingpage/*` GET tidak termasuk `ADMIN_ONLY_GET_PATHS` di `route.ts` dan tidak dicocokkan matcher `src/proxy.ts` (dikunci di `proxy_matcher_contract.test.ts`).
