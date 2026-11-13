-- Kenapa: desa mengirim beberapa foto BUMDes, sedangkan "ProfilBumDes"."imageId" hanya satu
-- (tetap dipakai sebagai logo/cover). Galeri butuh tabel sendiri supaya tiap foto punya
-- keterangan dan urutan tampil. Murni aditif: tidak ada kolom/tabel lama yang diubah.
-- Idempoten: aman dijalankan ulang (IF NOT EXISTS / cek pg_constraint).

-- CreateTable
CREATE TABLE IF NOT EXISTS "FotoProfilBumDes" (
    "id" TEXT NOT NULL,
    "profilId" TEXT NOT NULL DEFAULT 'profil-bumdes',
    "imageId" TEXT NOT NULL,
    "keterangan" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "FotoProfilBumDes_pkey" PRIMARY KEY ("id")
);

-- Kenapa: galeri selalu dibaca per profil dan diurutkan menurut "urutan".
-- CreateIndex
CREATE INDEX IF NOT EXISTS "FotoProfilBumDes_profilId_urutan_idx"
    ON "FotoProfilBumDes"("profilId", "urutan");

-- Kenapa CASCADE: foto galeri tidak berarti tanpa profil BUMDes-nya.
-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'FotoProfilBumDes_profilId_fkey'
      AND conrelid = '"FotoProfilBumDes"'::regclass
  ) THEN
    ALTER TABLE "FotoProfilBumDes"
      ADD CONSTRAINT "FotoProfilBumDes_profilId_fkey"
      FOREIGN KEY ("profilId") REFERENCES "ProfilBumDes"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- Kenapa CASCADE (file): /api/fileStorage/delete menghapus berkas permanen; entri galeri
-- tanpa berkas tidak berguna, dan RESTRICT akan membuat hapus berkas gagal (pola bug Maskot).
-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'FotoProfilBumDes_imageId_fkey'
      AND conrelid = '"FotoProfilBumDes"'::regclass
  ) THEN
    ALTER TABLE "FotoProfilBumDes"
      ADD CONSTRAINT "FotoProfilBumDes_imageId_fkey"
      FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
