-- Kenapa: admin perlu mengunggah dokumentasi Pembangunan di Kegiatan Desa — foto sebelum, foto sesudah,
-- dan galeri foto progres (maks 10, berurutan). Murni additive: kolom nullable + tabel baru, data lama utuh.
-- Idempoten: aman dijalankan ulang (IF NOT EXISTS / duplicate_object diabaikan).

-- AlterTable
ALTER TABLE "KegiatanDesa" ADD COLUMN IF NOT EXISTS "fotoSebelumId" TEXT;
ALTER TABLE "KegiatanDesa" ADD COLUMN IF NOT EXISTS "fotoSesudahId" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "KegiatanDesaFoto" (
    "id" TEXT NOT NULL,
    "kegiatanDesaId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KegiatanDesaFoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "KegiatanDesaFoto_kegiatanDesaId_urutan_idx" ON "KegiatanDesaFoto"("kegiatanDesaId", "urutan");

-- Kenapa SET NULL: foto sebelum/sesudah yang terhapus permanen cukup melepas fotonya, kegiatan tetap ada
-- (sama dengan WilayahDesa_petaFileId_fkey).
-- AddForeignKey
DO $$
BEGIN
  ALTER TABLE "KegiatanDesa" ADD CONSTRAINT "KegiatanDesa_fotoSebelumId_fkey"
    FOREIGN KEY ("fotoSebelumId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "KegiatanDesa" ADD CONSTRAINT "KegiatanDesa_fotoSesudahId_fkey"
    FOREIGN KEY ("fotoSesudahId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Kenapa CASCADE di kedua sisi: baris galeri tidak bermakna tanpa kegiatan atau berkasnya
-- (sama dengan FotoKegiatanLembaga).
DO $$
BEGIN
  ALTER TABLE "KegiatanDesaFoto" ADD CONSTRAINT "KegiatanDesaFoto_kegiatanDesaId_fkey"
    FOREIGN KEY ("kegiatanDesaId") REFERENCES "KegiatanDesa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "KegiatanDesaFoto" ADD CONSTRAINT "KegiatanDesaFoto_fileId_fkey"
    FOREIGN KEY ("fileId") REFERENCES "FileStorage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
