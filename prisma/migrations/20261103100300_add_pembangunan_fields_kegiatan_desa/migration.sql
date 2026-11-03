-- Kenapa: Kegiatan Desa perlu memuat kegiatan Pembangunan (anggaran, progres,
-- status, sumber dana) agar halaman Monev & Pembangunan punya data sendiri.
-- Semua kolom nullable supaya baris lama (kegiatan sosial/budaya) tidak berubah
-- dan tidak perlu backfill. Idempoten: aman dijalankan ulang.

-- AlterTable
ALTER TABLE "KegiatanDesa"
  ADD COLUMN IF NOT EXISTS "anggaran" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "progres" INTEGER,
  ADD COLUMN IF NOT EXISTS "statusPembangunan" TEXT,
  ADD COLUMN IF NOT EXISTS "sumberDana" TEXT;

-- Kenapa: progres adalah persentase; DB ikut menjaga rentang 0-100 selain
-- validasi di API. Nilai status ("rencana" | "berjalan" | "selesai") sengaja
-- hanya divalidasi di API agar penambahan status tidak butuh migrasi.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'KegiatanDesa_progres_range_check'
      AND conrelid = '"KegiatanDesa"'::regclass
  ) THEN
    ALTER TABLE "KegiatanDesa"
      ADD CONSTRAINT "KegiatanDesa_progres_range_check"
      CHECK ("progres" IS NULL OR ("progres" >= 0 AND "progres" <= 100));
  END IF;
END $$;

-- Kenapa: endpoint Monev memfilter kegiatan per kategori Pembangunan.
-- CreateIndex
CREATE INDEX IF NOT EXISTS "KegiatanDesa_kategoriKegiatanId_idx"
  ON "KegiatanDesa"("kategoriKegiatanId");

-- Kenapa: kode mengenali kategori Pembangunan lewat id tetap
-- 'katpembangunan01' (KATEGORI_PEMBANGUNAN_ID), bukan pencocokan nama.
--  * Jika id itu sudah ada -> tidak melakukan apa pun.
--  * Jika admin sudah punya SATU kategori aktif bernama "Pembangunan" dengan id
--    lain -> id-nya dipindahkan ke id tetap. FK KegiatanDesa_kategoriKegiatanId_fkey
--    ber-ON UPDATE CASCADE, jadi kegiatan lama ikut terhubung.
--  * Jika belum ada -> dibuat baru. "updatedAt" wajib diisi karena @updatedAt
--    tidak punya DEFAULT di DB. "deletedAt" dibiarkan DEFAULT (kolom ini NOT NULL
--    DEFAULT now() pada KategoriKegiatan — jebakan lama; yang dipakai kode untuk
--    soft-delete adalah "isActive", bukan "deletedAt").
--  * Jika ada lebih dari satu kategori "Pembangunan" aktif -> tidak diubah
--    (ambigu); parent/operator harus menentukan mana yang dipakai.
DO $$
DECLARE
  jumlah_sama_nama INTEGER;
BEGIN
  IF EXISTS (SELECT 1 FROM "KategoriKegiatan" WHERE "id" = 'katpembangunan01') THEN
    RETURN;
  END IF;

  SELECT COUNT(*) INTO jumlah_sama_nama
  FROM "KategoriKegiatan"
  WHERE lower(btrim("nama")) = 'pembangunan' AND "isActive" = true;

  IF jumlah_sama_nama = 0 THEN
    INSERT INTO "KategoriKegiatan" ("id", "nama", "updatedAt")
    VALUES ('katpembangunan01', 'Pembangunan', CURRENT_TIMESTAMP)
    ON CONFLICT ("id") DO NOTHING;
  ELSIF jumlah_sama_nama = 1 THEN
    UPDATE "KategoriKegiatan"
    SET "id" = 'katpembangunan01'
    WHERE lower(btrim("nama")) = 'pembangunan' AND "isActive" = true;
  ELSE
    RAISE NOTICE 'Lebih dari satu kategori "Pembangunan" aktif; id katpembangunan01 tidak dibuat otomatis.';
  END IF;
END $$;
