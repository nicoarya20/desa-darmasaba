# Lomba Batch 1: PPID (juknis 2.5)

Branch `feature/lomba-batch-1-ppid` (turunan `feature/lomba-batch-1`). Tidak di-push, tidak di-merge, versi `package.json` dan `CHANGELOG.md` tidak disentuh.

## Yang berubah

1. **Dasar Hukum PPID: berkas PDF (opsional).** `DasarHukumPPID.fileId` -> `FileStorage` (`onDelete: SetNull`).
   - API `POST /api/ppid/dasarhukumppid/update` menerima `fileId` opsional; `fileId` yang tidak ada di FileStorage ditolak 400 (`{ success: false, message }`).
   - `GET .../find-by-id` menyertakan `file { id, link, realName }`.
   - Admin: `PdfDropzoneField` + tautan berkas saat ini di form edit, tautan berkas di pratinjau. Unggah lewat `uploadPdfFile`, lalu `fileId` dikirim hanya bila ada PDF baru.
   - Publik: `DasarHukumSection` menampilkan "Unduh PDF" (tab baru) bila ada berkas; teks lama tidak berubah.
2. **Daftar Informasi Publik: berkas per baris.** `DaftarInformasiPublik.fileId` (nullable, SetNull).
   - `create`, `PUT /:id` menerima `fileId` opsional dengan validasi yang sama; `find-many`, `/:id` menyertakan `file`.
   - Admin create/edit memakai `PdfDropzoneField`; tabel admin punya kolom "Berkas PDF", halaman detail admin punya baris Berkas.
   - Publik: tautan "Unduh PDF" di sel Aksi tabel dan baris "Berkas" di detail, hanya bila ada berkas.
3. **Profil Lembaga PPID (aditif).** Model baru `ProfilLembagaPPID` (deskripsi, tujuan, tugasFungsi, gambarAlurId -> FileStorage, timestamps, deletedAt, isActive). `ProfilePPID` tidak disentuh.
   - API `/api/ppid/profillembagappid`: `GET /find` publik, `PUT /update` admin-only (`guardAdmin`), singleton (ubah baris aktif, atau buat bila belum ada). Teks disanitasi dengan `sanitizeRichTextForStorage`; HTML tanpa isi teks disimpan sebagai `null`; batas 50.000 karakter per bagian.
   - Admin: halaman Profil PPID kini bertab "Profil Lembaga" (form baru, editor basic + gambar alur) dan "Profil Perorangan" (pratinjau lama, dipindah apa adanya ke `_com/ProfilPeroranganPreview.tsx`).
   - Publik: `ProfilLembagaSection` tampil di atas profil perorangan bila ada isinya (render lewat `sanitizeRichText`). Tanpa data lembaga, halaman sama seperti semula (kartu perorangan dipindah apa adanya ke `_com/ProfilPerorangan.tsx`).

## Migrasi

`prisma/migrations/20261118100000_lomba_ppid_file_profil_lembaga/migration.sql`: `ADD COLUMN IF NOT EXISTS` x2, `CREATE TABLE IF NOT EXISTS`, FK dalam blok `DO $$ ... pg_constraint ... $$`. Ditulis dari `prisma migrate diff` offline; belum dijalankan di DB (tugas coordinator). Tidak ada index baru (tabel kecil, `fileId` tidak dipakai di WHERE).

## Keputusan dan asumsi

- **Mengganti/menghapus berkas**: relasi dipindah dulu lewat update baris, baru `removeStoredFile(lama)` (`purgeStoredFile` mengecek semua FK dari katalog Postgres, jadi aman dari pola bug Maskot). Tidak memakai transaksi. Hapus baris Daftar Informasi Publik kini ikut menghapus berkasnya (setelah baris terhapus).
- **Tanpa `fileId` = berkas tidak berubah.** Belum ada cara melepas berkas dari Dasar Hukum/Daftar (UI `PdfDropzoneField` tidak punya tombol hapus berkas tersimpan). Profil lembaga mendukung `gambarAlurId: null` untuk melepas gambar.
- **Mutasi lama tidak diberi `guardAdmin`**: `dasarhukumppid/update`, `daftarinformasipublik` create/PUT/DELETE tetap hanya dijaga login (guard global `route.ts`). Hanya endpoint baru yang diberi `guardAdmin`.
- **Profil lembaga: tanpa DELETE.** Mengosongkan semua bagian membuat bagian publiknya hilang (dianggap "belum ada"); baris tidak dihapus.
- **File baru di luar Target (tidak mengubah file lama)**: `_lib/ppid/ppid-file.ts` (validasi `fileId` + select berkas, dipakai dua modul), `(public)/.../ppid/_com/PpidFileLink.tsx` + `ppid-file-link.module.css` (tautan unduh dipakai dua halaman publik).
- Saat Dasar Hukum disimpan, `save()` kini di-`await`: halaman edit hanya kembali ke pratinjau bila simpan berhasil (dulu langsung pindah tanpa menunggu).

## Test (semua lulus)

`ppid_file_handlers` (18), `ppid_profil_lembaga_api` (15), `ppid_file_public_ui` (11), `ppid_profil_lembaga_ui` (11), `ppid_file_admin_state` (9), `ppid_file_admin_ui` (5). Test lama yang berdampak tetap hijau: `ppid_daftar_informasi_ui`, `ppid_visi_misi_dasar_hukum_ui`, `ppid_daftar_ikm_pages_ui`, `profil_ppid_ui`, `no_hover_underline_guard`, `jenna_knowledge_registry`, `dev_system_migrations`, `pdf_dropzone_field`, dll. `tsc`/build tidak dijalankan (batas resource); `bun eslint` pada semua file yang diubah bersih.

## Temuan di luar scope (tidak diperbaiki)

- Admin `dasar-hukum/edit`: bila dibuka langsung lewat URL (tanpa melewati pratinjau), `findById.data` kosong sehingga `initialize()` membuat id `''` dan simpan gagal.
- Publik `dasar-hukum` merender `judul`/`content` lewat `dangerouslySetInnerHTML` tanpa sanitasi; `profil-ppid` perorangan juga (`biodata`, `riwayat`, dst.). `daftar-informasi-publik/[id]` merender `deskripsi` mentah. Sumbernya input admin, tetapi mutasi dasar hukum/daftar hanya dijaga login.
- `daftarinformasipublik` `find-many` tidak membatasi `limit` (bisa diminta sangat besar).
