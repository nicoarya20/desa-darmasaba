# Pengumuman: lampiran gambar & dokumen + tanggal terbit

Tanggal: 2026-11-10 · Migrasi: `20261111090000_pengumuman_lampiran`

## Konteks
105 pengumuman dari website lama (desadarmasaba.badungkab.go.id/pengumuman) akan diimpor. Hampir semuanya berupa
gambar dokumen + lampiran PDF (lelang, daftar KPM BLT, dll) dengan teks kosong. Model `Pengumuman` hanya punya
judul/deskripsi/content/kategori dan tidak punya tanggal terbit, sehingga tanggal asli hilang saat impor.

## Keputusan (Opsi A — ikuti pola `Berita`)
- **Relasi FileStorage**, semuanya opsional: `image`/`imageId` (gambar utama, thumbnail kartu, FK `SET NULL`),
  `images` (galeri, implicit m2m `_PengumumanImages`) dan `dokumen` (lampiran PDF, implicit m2m `_PengumumanDokumen`).
  Tabel penghubung CASCADE di kedua sisi. Tidak memakai tabel anak seperti Desa Anti Korupsi karena pengumuman
  tidak butuh judul/urutan/folder per dokumen — nama berkas asli (`realName`) cukup sebagai label.
- **`tanggalTerbit DateTime @default(now())`, NOT NULL.** Baris lama di-backfill = `createdAt` di migrasi (kolom dibuat
  nullable → `UPDATE` → `SET DEFAULT` → `SET NOT NULL`), supaya list diurutkan `tanggalTerbit desc, createdAt desc`
  tanpa menangani NULL. `createdAt` jadi pemecah seri untuk pengumuman bertanggal sama.
- **Tanggal = tanggal saja, zona WITA.** Input `YYYY-MM-DD` disimpan sebagai pukul 00:00 WITA (`+08:00`, tanpa DST);
  ISO lengkap juga diterima (untuk impor). Tampilan publik/admin hanya tanggal (jam dihapus dari kartu list), diformat
  di zona `Asia/Makassar` (`src/lib/pengumuman-tanggal.ts`). Form edit hanya mengirim `tanggalTerbit` bila diubah,
  supaya jam hasil backfill tidak tertimpa 00:00.
- **Dokumen hanya PDF.** Endpoint upload menyimpan non-PDF ter-gzip sehingga tidak bisa dipratinjau; API menolak
  `dokumenIds` yang bukan `application/pdf` dan `imageId`/`imageIds` yang bukan `image/*`. Semua berkas yang dirujuk
  harus `FileStorage` aktif — dicek dengan **satu** query (`findMany id in [...]`), error 400.
- **Batas**: galeri maks 10 (`MAX_GALERI_PENGUMUMAN`, sama dengan Berita), dokumen maks 20 (`MAX_DOKUMEN_PENGUMUMAN`).
  Asumsi: ukuran PDF di form admin maks 10 MB (`DOKUMEN_PDF_MAX_BYTES`) karena scan pengumuman bisa multi-halaman;
  gambar 5 MB seperti dropzone lain.
- **Upload saat Simpan**, bukan saat dipilih (pola Desa Anti Korupsi) lewat `POST /api/fileStorage/create`, agar
  batal/reset tidak meninggalkan berkas yatim.
- **Berkas yang dilepas** (gambar utama/galeri/dokumen saat update, semuanya saat delete) dihapus permanen setelah
  operasi DB sukses — berkas yang masih dirujuk data lain dibiarkan (lihat `docs/decisions/2026-11-12-sampah.md`,
  berlaku sejak 2026-11-13). Bila create/update gagal setelah upload, berkas yang sudah terunggah tetap tertinggal.
- **List tetap ringan**: `find-many`, `find-first`, `find-recent` hanya membawa `image` (thumbnail) + `tanggalTerbit`;
  galeri & dokumen hanya di `GET /:id`.
- Logika murni (normalisasi, batas, cek jenis berkas, data Prisma) di `src/lib/pengumuman-lampiran.ts`; handler
  hanya memanggilnya (`_lib/desa/pengumuman/lampiran-check.ts` untuk query FileStorage).

## Kontrak `/api/desa/pengumuman` (additive)
`File` = `{ id, link, realName, mimeType, size }` (`size` byte, null = berkas lama belum di-backfill).

| Method | Path | Perubahan |
|---|---|---|
| POST | `/create` | body lama + opsional `imageId?: string \| null`, `imageIds?: string[]`, `dokumenIds?: string[]`, `tanggalTerbit?: string \| null` (`YYYY-MM-DD` WITA / ISO; kosong = sekarang). Respons `data` = body + `id` baru. 400 `{ success: false, message }` bila lampiran/tanggal tidak valid. |
| PUT | `/:id` | body sama. Field lampiran **tidak dikirim = tidak diubah**; `imageId: null`/`""` = hapus gambar utama; `imageIds`/`dokumenIds` array = set final (`[]` = kosongkan); `tanggalTerbit` kosong = tidak diubah. Respons `data` kini membawa `image`, `images`, `dokumen`, `CategoryPengumuman`. 400 sama seperti create. |
| GET | `/:id` | tambah `tanggalTerbit`, `imageId`, `image: File \| null`, `images: File[]`, `dokumen: File[]`. |
| GET | `/find-many`, `/find-first`, `/find-recent` | tambah `tanggalTerbit`, `imageId`, `image: File \| null`; urutan kini `tanggalTerbit desc, createdAt desc` (sebelumnya `createdAt desc`). |

## Di luar lingkup
`tanggalTerbit` untuk Berita, bug `Pengumuman.deletedAt @default(now())`, `find-recent` yang tidak memfilter
`isActive`, `/api/news/latest` yang masih mengurutkan `createdAt`, dan modul search (tidak diubah).
