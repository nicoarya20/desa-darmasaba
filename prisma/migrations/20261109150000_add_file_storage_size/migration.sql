-- Kenapa: unduh ZIP dokumen Desa Anti Korupsi butuh total ukuran berkas untuk menolak arsip
-- yang terlalu besar (413) tanpa membaca isi MinIO, dan UI dokumen menampilkan/mengurutkan
-- berdasarkan ukuran. Nullable tanpa DEFAULT: FileStorage sudah berisi data dan ukurannya
-- hanya bisa diketahui dari MinIO — diisi bertahap oleh prisma/backfill-file-size.ts;
-- NULL = belum diketahui (endpoint ZIP fallback ke statObject).
-- Idempoten: aman dijalankan ulang.

-- AlterTable
ALTER TABLE "FileStorage" ADD COLUMN IF NOT EXISTS "size" INTEGER;
