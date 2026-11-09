-- Kenapa: program Desa Anti Korupsi butuh "folder" berisi banyak dokumen, padahal
-- relasi lama hanya satu berkas ("DesaAntiKorupsi"."fileId"). Urutan wajib:
--   1) buat tabel "DokumenDesaAntiKorupsi" (+ index & FK),
--   2) salin berkas lama tiap program ke tabel baru (backfill),
--   3) BARU hapus kolom "fileId" + FK-nya, supaya tidak ada berkas yang hilang.
-- Idempoten: aman dijalankan ulang (IF NOT EXISTS / IF EXISTS, ON CONFLICT DO NOTHING).

-- 1) CreateTable
CREATE TABLE IF NOT EXISTS "DokumenDesaAntiKorupsi" (
    "id" TEXT NOT NULL,
    "desaAntiKorupsiId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DokumenDesaAntiKorupsi_pkey" PRIMARY KEY ("id")
);

-- Kenapa: daftar dokumen selalu diambil per program (folder).
-- CreateIndex
CREATE INDEX IF NOT EXISTS "DokumenDesaAntiKorupsi_desaAntiKorupsiId_idx"
    ON "DokumenDesaAntiKorupsi"("desaAntiKorupsiId");

-- Kenapa CASCADE (program): dokumen tidak punya arti tanpa programnya; hapus program
-- (hard delete di API) ikut menghapus isi foldernya.
-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'DokumenDesaAntiKorupsi_desaAntiKorupsiId_fkey'
      AND conrelid = '"DokumenDesaAntiKorupsi"'::regclass
  ) THEN
    ALTER TABLE "DokumenDesaAntiKorupsi"
      ADD CONSTRAINT "DokumenDesaAntiKorupsi_desaAntiKorupsiId_fkey"
      FOREIGN KEY ("desaAntiKorupsiId") REFERENCES "DesaAntiKorupsi"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Kenapa CASCADE (file): FileStorage dihapus permanen (MinIO + baris DB) oleh
-- /api/fileStorage/delete; entri dokumen tanpa berkas tidak berguna, dan RESTRICT
-- akan membuat hapus berkas gagal.
-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'DokumenDesaAntiKorupsi_fileId_fkey'
      AND conrelid = '"DokumenDesaAntiKorupsi"'::regclass
  ) THEN
    ALTER TABLE "DokumenDesaAntiKorupsi"
      ADD CONSTRAINT "DokumenDesaAntiKorupsi_fileId_fkey"
      FOREIGN KEY ("fileId") REFERENCES "FileStorage"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- 2) Backfill: satu dokumen (urutan 0) untuk setiap program yang masih punya fileId.
-- Kenapa id = 'dakdok_' || md5(id program): deterministik (dijalankan ulang tidak
-- menggandakan baris karena ON CONFLICT) dan unik karena tiap program hanya punya
-- satu berkas lama. Judul = nama asli berkas, fallback nama program.
-- Kenapa EXECUTE + cek kolom: saat dijalankan ulang kolom "fileId" sudah tidak ada,
-- jadi backfill dilewati tanpa error.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'DesaAntiKorupsi'
      AND column_name = 'fileId'
  ) THEN
    EXECUTE $sql$
      INSERT INTO "DokumenDesaAntiKorupsi"
        ("id", "desaAntiKorupsiId", "fileId", "judul", "urutan", "createdAt", "updatedAt", "isActive")
      SELECT
        'dakdok_' || md5(d."id"),
        d."id",
        d."fileId",
        COALESCE(NULLIF(TRIM(f."realName"), ''), d."name"),
        0,
        d."createdAt",
        CURRENT_TIMESTAMP,
        true
      FROM "DesaAntiKorupsi" d
      JOIN "FileStorage" f ON f."id" = d."fileId"
      WHERE d."fileId" IS NOT NULL
      ON CONFLICT ("id") DO NOTHING
    $sql$;
  END IF;
END $$;

-- 3) Kolom lama dilepas setelah isinya tersalin ke tabel baru.
-- DropForeignKey
ALTER TABLE "DesaAntiKorupsi" DROP CONSTRAINT IF EXISTS "DesaAntiKorupsi_fileId_fkey";

-- AlterTable
ALTER TABLE "DesaAntiKorupsi" DROP COLUMN IF EXISTS "fileId";
