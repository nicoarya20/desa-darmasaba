-- Kenapa: satu APBDes (per tahun) perlu banyak dokumen (Perdes, laporan semester, dst.)
-- yang dipilah ke folder satu tingkat, padahal relasi lama hanya satu berkas
-- ("APBDes"."fileId"). Pola sama dengan Desa Anti Korupsi. Urutan:
--   1) buat tabel "FolderDokumenAPBDes" + "DokumenAPBDes" (+ index & FK),
--   2) salin berkas lama tiap APBDes menjadi satu dokumen di "Umum" (backfill).
-- Kolom "APBDes"."fileId" SENGAJA TIDAK dihapus di rilis ini: rollback ke versi lama
-- dan klien admin lama masih membacanya. Hapus kolom + FK-nya di rilis berikut.
-- Idempoten: aman dijalankan ulang (IF NOT EXISTS / cek pg_constraint / ON CONFLICT).

-- CreateTable
CREATE TABLE IF NOT EXISTS "FolderDokumenAPBDes" (
    "id" TEXT NOT NULL,
    "apbdesId" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "FolderDokumenAPBDes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "DokumenAPBDes" (
    "id" TEXT NOT NULL,
    "apbdesId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "folderId" TEXT,
    "judul" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DokumenAPBDes_pkey" PRIMARY KEY ("id")
);

-- Kenapa: folder & dokumen selalu diambil per APBDes; dokumen dilepas ke "Umum" per folder.
-- CreateIndex
CREATE INDEX IF NOT EXISTS "FolderDokumenAPBDes_apbdesId_idx"
    ON "FolderDokumenAPBDes"("apbdesId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "DokumenAPBDes_apbdesId_idx"
    ON "DokumenAPBDes"("apbdesId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "DokumenAPBDes_folderId_idx"
    ON "DokumenAPBDes"("folderId");

-- Kenapa CASCADE: folder tidak berarti tanpa APBDes-nya.
-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'FolderDokumenAPBDes_apbdesId_fkey'
      AND conrelid = '"FolderDokumenAPBDes"'::regclass
  ) THEN
    ALTER TABLE "FolderDokumenAPBDes"
      ADD CONSTRAINT "FolderDokumenAPBDes_apbdesId_fkey"
      FOREIGN KEY ("apbdesId") REFERENCES "APBDes"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Kenapa CASCADE: dokumen tidak berarti tanpa APBDes-nya (API sendiri memakai soft delete).
-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'DokumenAPBDes_apbdesId_fkey'
      AND conrelid = '"DokumenAPBDes"'::regclass
  ) THEN
    ALTER TABLE "DokumenAPBDes"
      ADD CONSTRAINT "DokumenAPBDes_apbdesId_fkey"
      FOREIGN KEY ("apbdesId") REFERENCES "APBDes"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Kenapa CASCADE (file): /api/fileStorage/delete menghapus berkas permanen; entri dokumen
-- tanpa berkas tidak berguna, dan RESTRICT akan membuat hapus berkas gagal.
-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'DokumenAPBDes_fileId_fkey'
      AND conrelid = '"DokumenAPBDes"'::regclass
  ) THEN
    ALTER TABLE "DokumenAPBDes"
      ADD CONSTRAINT "DokumenAPBDes_fileId_fkey"
      FOREIGN KEY ("fileId") REFERENCES "FileStorage"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Kenapa SET NULL: bila baris folder sampai terhapus permanen, dokumennya jatuh ke "Umum"
-- alih-alih ikut hilang (API memakai soft delete + reset folderId).
-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'DokumenAPBDes_folderId_fkey'
      AND conrelid = '"DokumenAPBDes"'::regclass
  ) THEN
    ALTER TABLE "DokumenAPBDes"
      ADD CONSTRAINT "DokumenAPBDes_folderId_fkey"
      FOREIGN KEY ("folderId") REFERENCES "FolderDokumenAPBDes"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- Backfill: satu dokumen (folder "Umum", urutan 0) untuk setiap APBDes yang punya fileId
-- tapi belum punya dokumen, supaya berkas lama tetap tampil setelah UI beralih ke daftar dokumen.
-- Kenapa id = 'apbdok_' || md5(id APBDes): deterministik, jadi dijalankan ulang tidak
-- menggandakan baris (ON CONFLICT + NOT EXISTS). Judul = nama asli berkas, fallback nama
-- APBDes, lalu 'Dokumen APBDes'.
INSERT INTO "DokumenAPBDes"
  ("id", "apbdesId", "fileId", "folderId", "judul", "urutan", "createdAt", "updatedAt", "isActive")
SELECT
  'apbdok_' || md5(a."id"),
  a."id",
  a."fileId",
  NULL,
  COALESCE(NULLIF(TRIM(f."realName"), ''), NULLIF(TRIM(a."name"), ''), 'Dokumen APBDes'),
  0,
  a."createdAt",
  CURRENT_TIMESTAMP,
  true
FROM "APBDes" a
JOIN "FileStorage" f ON f."id" = a."fileId"
WHERE a."fileId" IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM "DokumenAPBDes" d WHERE d."apbdesId" = a."id")
ON CONFLICT ("id") DO NOTHING;
