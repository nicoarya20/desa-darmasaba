-- Lomba Website Desa 2027, juknis 2.5 (kanal PPID): desa punya banyak PDF dasar hukum (peraturan desa/perbekel, SK, SOP)
-- yang harus bisa dilihat dan diunduh. "DasarHukumPPID" hanya satu baris (singleton), jadi satu kolom fileId di sana
-- tidak cukup; tabel baru ini menyimpan satu dokumen per baris, daftar FLAT tanpa folder (keputusan user). Folder bisa
-- ditambah kemudian lewat kolom nullable tanpa mengubah baris yang ada.
-- Idempoten: tabel baru + indeks + FK, lalu pembersihan kolom "DasarHukumPPID"."fileId" (bagian 2). FK ke "FileStorage" memakai
-- ON DELETE CASCADE (pola "DokumenAPBDes") karena /api/fileStorage/delete menghapus berkas permanen dan RESTRICT
-- akan membuatnya gagal.

CREATE TABLE IF NOT EXISTS "DokumenDasarHukumPPID" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "fileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DokumenDasarHukumPPID_pkey" PRIMARY KEY ("id")
);

-- Daftar publik: hanya yang aktif, urut `urutan`.
CREATE INDEX IF NOT EXISTS "DokumenDasarHukumPPID_isActive_urutan_idx" ON "DokumenDasarHukumPPID"("isActive", "urutan");

-- Pemeriksaan rujukan berkas saat penghapusan (lihat fileReferences.ts).
CREATE INDEX IF NOT EXISTS "DokumenDasarHukumPPID_fileId_idx" ON "DokumenDasarHukumPPID"("fileId");

-- FK dijaga pg_constraint karena ADD CONSTRAINT tidak punya IF NOT EXISTS.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DokumenDasarHukumPPID_fileId_fkey') THEN
        ALTER TABLE "DokumenDasarHukumPPID" ADD CONSTRAINT "DokumenDasarHukumPPID_fileId_fkey"
            FOREIGN KEY ("fileId") REFERENCES "FileStorage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- 2) Buang kolom "DasarHukumPPID"."fileId" (satu PDF per baris singleton) yang ditambahkan migration 20261118100000.
-- Kenapa: digantikan tabel di atas. Migration 20261118100000 TIDAK diedit karena sudah terpasang di DB lokal (checksum
-- berubah akan memicu drift/reset di `prisma migrate dev`), jadi pembersihan dilakukan di sini. Kolom baru sehari lahir
-- dan nullable, tapi bila ada baris yang sudah memakainya, PDF-nya dipindah dulu jadi satu dokumen supaya tidak hilang.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = current_schema() AND table_name = 'DasarHukumPPID' AND column_name = 'fileId'
    ) THEN
        INSERT INTO "DokumenDasarHukumPPID" ("id", "judul", "urutan", "fileId", "createdAt", "updatedAt")
        SELECT md5('dasar-hukum-file:' || d."id" || ':' || d."fileId"), d."judul", 0, d."fileId", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        FROM "DasarHukumPPID" d
        WHERE d."fileId" IS NOT NULL
          AND NOT EXISTS (SELECT 1 FROM "DokumenDasarHukumPPID" x WHERE x."fileId" = d."fileId");

        ALTER TABLE "DasarHukumPPID" DROP CONSTRAINT IF EXISTS "DasarHukumPPID_fileId_fkey";
        ALTER TABLE "DasarHukumPPID" DROP COLUMN "fileId";
    END IF;
END $$;
