-- Kenapa: program Desa Anti Korupsi bisa berisi banyak dokumen; admin perlu memilahnya
-- ke beberapa folder (satu tingkat: Program → Folder → Dokumen). Dokumen tanpa folder
-- tampil di folder virtual "Umum", jadi dokumen yang sudah ada TIDAK di-backfill
-- (folderId tetap NULL). Murni additive: tabel baru + kolom nullable.
-- Idempoten: aman dijalankan ulang (IF NOT EXISTS / cek pg_constraint).

-- CreateTable
CREATE TABLE IF NOT EXISTS "FolderDokumenDesaAntiKorupsi" (
    "id" TEXT NOT NULL,
    "desaAntiKorupsiId" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "FolderDokumenDesaAntiKorupsi_pkey" PRIMARY KEY ("id")
);

-- Kenapa nullable tanpa DEFAULT: tabel dokumen sudah berisi data; NULL berarti "Umum".
-- AlterTable
ALTER TABLE "DokumenDesaAntiKorupsi" ADD COLUMN IF NOT EXISTS "folderId" TEXT;

-- Kenapa: folder selalu diambil per program; dokumen dikelompokkan / di-reset per folder.
-- CreateIndex
CREATE INDEX IF NOT EXISTS "FolderDokumenDesaAntiKorupsi_desaAntiKorupsiId_idx"
    ON "FolderDokumenDesaAntiKorupsi"("desaAntiKorupsiId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "DokumenDesaAntiKorupsi_folderId_idx"
    ON "DokumenDesaAntiKorupsi"("folderId");

-- Kenapa SET NULL: bila baris folder sampai terhapus permanen, dokumennya jatuh ke
-- "Umum" alih-alih ikut hilang (API sendiri memakai soft delete + reset folderId).
-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'DokumenDesaAntiKorupsi_folderId_fkey'
      AND conrelid = '"DokumenDesaAntiKorupsi"'::regclass
  ) THEN
    ALTER TABLE "DokumenDesaAntiKorupsi"
      ADD CONSTRAINT "DokumenDesaAntiKorupsi_folderId_fkey"
      FOREIGN KEY ("folderId") REFERENCES "FolderDokumenDesaAntiKorupsi"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Kenapa CASCADE: folder tidak berarti tanpa programnya; hapus program (hard delete di
-- API) ikut menghapus foldernya, sama seperti tabel dokumen.
-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'FolderDokumenDesaAntiKorupsi_desaAntiKorupsiId_fkey'
      AND conrelid = '"FolderDokumenDesaAntiKorupsi"'::regclass
  ) THEN
    ALTER TABLE "FolderDokumenDesaAntiKorupsi"
      ADD CONSTRAINT "FolderDokumenDesaAntiKorupsi_desaAntiKorupsiId_fkey"
      FOREIGN KEY ("desaAntiKorupsiId") REFERENCES "DesaAntiKorupsi"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
