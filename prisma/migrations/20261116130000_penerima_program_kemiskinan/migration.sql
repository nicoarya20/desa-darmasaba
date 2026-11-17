-- Penerima bantuan (PKH, CPP, BLT Desa, dst.) per program per tahun.
-- Kenapa: desa mengirim daftar penerima (BNBA) tiap tahun dan ingin warga bisa memeriksa siapa
-- penerimanya. Keputusan user 2026-11-16: website hanya menyimpan NAMA + ALAMAT; NIK, tanggal
-- lahir, nomor KK, pekerjaan, dst. sengaja tidak punya kolom supaya tidak pernah tersimpan.
-- Semua langkah idempoten (aman dijalankan ulang).

-- 1) slug opsional untuk URL publik yang terbaca (/ekonomi/program-kemiskinan/pkh).
-- Kenapa nullable: program yang sudah ada tetap bisa dibuka lewat id; tidak perlu backfill.
ALTER TABLE "ProgramKemiskinan" ADD COLUMN IF NOT EXISTS "slug" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "ProgramKemiskinan_slug_key" ON "ProgramKemiskinan"("slug");

-- 2) Tabel penerima. Tabel baru (tanpa data lama), jadi kolom NOT NULL aman.
CREATE TABLE IF NOT EXISTS "PenerimaProgramKemiskinan" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "tahun" INTEGER NOT NULL,
    "nama" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PenerimaProgramKemiskinan_pkey" PRIMARY KEY ("id")
);

-- Kenapa (programId, tahun): semua bacaan (daftar, jumlah, rekap alamat, ganti data satu tahun)
-- selalu menyaring program + tahun.
CREATE INDEX IF NOT EXISTS "PenerimaProgramKemiskinan_programId_tahun_idx"
    ON "PenerimaProgramKemiskinan"("programId", "tahun");

-- Kenapa CASCADE: penerima tidak bermakna tanpa programnya; menghapus program ikut membersihkan
-- data warga (tidak meninggalkan nama/alamat yatim).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'PenerimaProgramKemiskinan_programId_fkey'
  ) THEN
    ALTER TABLE "PenerimaProgramKemiskinan"
      ADD CONSTRAINT "PenerimaProgramKemiskinan_programId_fkey"
      FOREIGN KEY ("programId") REFERENCES "ProgramKemiskinan"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
