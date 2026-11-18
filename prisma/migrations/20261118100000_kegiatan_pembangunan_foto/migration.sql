-- Kenapa: admin perlu mengunggah dokumentasi Pembangunan di Kegiatan Desa — foto sebelum dan foto sesudah
-- (maks 5 per jenis, berurutan). Murni additive: satu tabel baru, data lama utuh.
-- Idempoten: aman dijalankan ulang (IF NOT EXISTS / duplicate_object diabaikan).

-- CreateTable
CREATE TABLE IF NOT EXISTS "KegiatanDesaFoto" (
    "id" TEXT NOT NULL,
    "kegiatanDesaId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "jenis" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KegiatanDesaFoto_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "KegiatanDesaFoto_kegiatanDesaId_jenis_urutan_idx" ON "KegiatanDesaFoto"("kegiatanDesaId", "jenis", "urutan");

-- Kenapa CASCADE di kedua sisi: baris foto tidak bermakna tanpa kegiatan atau berkasnya
-- (sama dengan FotoKegiatanLembaga).
-- AddForeignKey
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
