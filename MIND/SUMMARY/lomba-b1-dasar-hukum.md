# Lomba Batch 1: Dasar Hukum multi-dokumen (revisi)

Branch: `feature/lomba-batch-1-dasar-hukum-multi` · Juknis 2.5 (Kanal PPID).

## Latar belakang
Menu admin Dasar Hukum PPID adalah singleton (satu `DasarHukumPPID`, id `'1'`), jadi `fileId` tunggal hasil worker
sebelumnya hanya muat 1 PDF, padahal desa punya 8 PDF (peraturan desa/perbekel, SK, SOP). Keputusan user: daftar
dokumen FLAT (tanpa folder), banyak PDF, bisa dilihat di browser dan diunduh.

## Perubahan
- **Schema/migrasi:** `DasarHukumPPID.fileId` + relasi dibuang (migration `20261118100000_lomba_ppid_file_profil_lembaga`
  direvisi di tempat karena belum pernah dirilis). Model baru `DokumenDasarHukumPPID` (judul, urutan, file wajib
  CASCADE, soft-delete fields, indeks `[isActive, urutan]` & `[fileId]`) di migration baru
  `20261118130000_lomba_dokumen_dasar_hukum_ppid` (idempoten, dibuat dari `prisma migrate diff` offline; dua pernyataan
  DROP kolom lama sengaja dibuang karena kolomnya tidak pernah ada di lingkungan mana pun).
- **API** `/api/ppid/dasarhukumppid/dokumen/*` (`_lib/ppid/dasar_hukum/dokumen/`): `GET find-many` publik; `POST create`,
  `PUT updt/:id`, `PUT reorder`, `DELETE del/:id` admin-only lewat `guardAdmin` (role 0-4). Hapus = baris dulu, baru
  `removeStoredFile` (urutan aman dari bug FK Maskot). Judul: trim, maks 200, teks polos (tanpa `<`/`>`).
  `find-by-id`/`update` Dasar Hukum dikembalikan ke bentuk semula (tanpa `fileId`/`file`).
- **Admin:** `PdfMultiDropzoneField` (komponen bersama), state `dokumenDasarHukum.ts`, `DokumenDasarHukumManager`
  di `ppid/dasar-hukum/edit` (unggah banyak PDF berurutan, kegagalan satu berkas tidak membatalkan yang lain,
  percobaan ulang tidak mengunggah dobel; ubah judul, naik/turun, Lihat, hapus + konfirmasi) dan pratinjau di
  `ppid/dasar-hukum`. `edit/page.tsx` kini memuat baris tunggal bila dibuka langsung lewat URL (dulu form kosong id `''`).
- **Publik:** `DokumenDasarHukumSection` di bawah teks: judul + "Lihat" (tab baru) + "Unduh". Tersembunyi bila kosong.
  Tautan unduh tunggal hasil worker sebelumnya dihapus (`PpidFileLink` tetap dipakai Daftar Informasi Publik).

## Keputusan lihat vs unduh
`/api/fileStorage/findUnique/<nama>` (publik, `PUBLIC_GET_PATH_PREFIXES`) melayani PDF dengan `Content-Type:
application/pdf` tanpa `Content-Disposition`, jadi browser menampilkannya inline. Maka **Lihat** = tautan biasa
`target="_blank"`; **Unduh** = tautan yang sama dengan atribut `download={realName}` (satu-asal, relatif). Tidak ada
perubahan route `fileStorage`.

## Temuan saat implementasi
- Valtio membungkus objek `File` dengan proxy (`file.name` lalu gagal "private member"); `setItems` memakai `ref()`.
  Dijaga test.
- Test baru: `ppid_dokumen_dasar_hukum_{api,state,admin_ui,public_ui}`; test lama disesuaikan hanya bagian Dasar Hukum.
