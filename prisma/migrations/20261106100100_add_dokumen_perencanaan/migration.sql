-- Kenapa: desa belum punya tempat menyimpan dokumen perencanaan (RPJM, RKP, berita
-- acara musyawarah). Satu tabel dipakai untuk ketiganya; "jenis" ("RPJM" | "RKP" |
-- "BERITA_ACARA_MUSYAWARAH") dan "jenisMusyawarah" ("MUSDES" | "MUSRENBANGDES" |
-- "MMD" | "LAINNYA") sengaja hanya divalidasi di API (src/lib/dokumen-perencanaan.ts)
-- agar penambahan jenis tidak butuh migrasi. Tabel baru, tidak menyentuh data lama.
-- Idempoten: aman dijalankan ulang.

-- CreateTable
CREATE TABLE IF NOT EXISTS "DokumenPerencanaan" (
  "id" TEXT NOT NULL,
  "jenis" TEXT NOT NULL,
  "judul" TEXT NOT NULL,
  "tahun" INTEGER,
  "tahunMulai" INTEGER,
  "tahunSelesai" INTEGER,
  "nomorPerdes" TEXT,
  "ringkasan" TEXT,
  "jenisMusyawarah" TEXT,
  "fileId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "deletedAt" TIMESTAMP(3),
  "isActive" BOOLEAN NOT NULL DEFAULT true,

  CONSTRAINT "DokumenPerencanaan_pkey" PRIMARY KEY ("id")
);

-- Kenapa: daftar publik selalu difilter per jenis lalu tahun (tab RPJM/RKP/Berita
-- Acara + filter tahun), dan label "Bersumber dari RKP" mencari RKP per tahun.
-- CreateIndex
CREATE INDEX IF NOT EXISTS "DokumenPerencanaan_jenis_tahun_idx"
  ON "DokumenPerencanaan"("jenis", "tahun");

-- Kenapa: PDF disimpan lewat FileStorage (MinIO). Bila baris FileStorage dihapus,
-- dokumen tetap ada tanpa berkas (SET NULL), sama seperti relasi APBDes.file.
-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'DokumenPerencanaan_fileId_fkey'
      AND conrelid = '"DokumenPerencanaan"'::regclass
  ) THEN
    ALTER TABLE "DokumenPerencanaan"
      ADD CONSTRAINT "DokumenPerencanaan_fileId_fkey"
      FOREIGN KEY ("fileId") REFERENCES "FileStorage"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Kenapa: periode RPJM tidak boleh terbalik; DB ikut menjaga selain validasi di API.
-- Baris non-RPJM (tahunMulai/tahunSelesai NULL) lolos karena perbandingan NULL.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'DokumenPerencanaan_periode_check'
      AND conrelid = '"DokumenPerencanaan"'::regclass
  ) THEN
    ALTER TABLE "DokumenPerencanaan"
      ADD CONSTRAINT "DokumenPerencanaan_periode_check"
      CHECK ("tahunMulai" IS NULL OR "tahunSelesai" IS NULL OR "tahunSelesai" >= "tahunMulai");
  END IF;
END $$;
