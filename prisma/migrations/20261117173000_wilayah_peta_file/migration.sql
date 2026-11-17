-- Kenapa: admin perlu mengunggah file peta wilayah (gambar atau PDF) di Letak & Batas Wilayah,
-- ditampilkan di atas peta embed. Satu file per baris singleton → kolom FK, bukan tabel penghubung.
-- Murni additive: kolom nullable tanpa backfill; data lama tetap utuh.
-- Idempoten: aman dijalankan ulang (IF NOT EXISTS / duplicate_object diabaikan).

-- AlterTable
ALTER TABLE "WilayahDesa" ADD COLUMN IF NOT EXISTS "petaFileId" TEXT;

-- Kenapa SET NULL: file peta yang terhapus permanen cukup melepas peta file,
-- data wilayah tetap ada (sama dengan Pengumuman_imageId_fkey).
-- AddForeignKey
DO $$
BEGIN
  ALTER TABLE "WilayahDesa" ADD CONSTRAINT "WilayahDesa_petaFileId_fkey"
    FOREIGN KEY ("petaFileId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
