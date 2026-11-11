-- Kenapa: menu "Struktur Organisasi dan SK Pengurus BUMDesa" hanya berisi struktur
-- pemerintahan desa, tidak ada profil BUMDes maupun daftar unit usahanya. Dua tabel
-- baru ini menampung profil BUMDes (singleton, id tetap 'profil-bumdes') dan unit usaha.
-- Murni additive: tidak menyentuh tabel PegawaiBumDes / PosisiOrganisasiBumDes yang sudah ada.
-- Semua statement idempoten supaya aman dijalankan ulang di staging/produksi.

-- CreateTable
CREATE TABLE IF NOT EXISTS "ProfilBumDes" (
    "id" TEXT NOT NULL DEFAULT 'profil-bumdes',
    "nama" VARCHAR(255) NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "alamat" TEXT,
    "kontak" VARCHAR(255),
    "tahunBerdiri" INTEGER,
    "imageId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProfilBumDes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "UnitUsahaBumDes" (
    "id" TEXT NOT NULL,
    "nama" VARCHAR(255) NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "imageId" TEXT,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "UnitUsahaBumDes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: daftar publik selalu memfilter isActive/deletedAt lalu mengurutkan urutan
CREATE INDEX IF NOT EXISTS "UnitUsahaBumDes_isActive_deletedAt_urutan_idx" ON "UnitUsahaBumDes"("isActive", "deletedAt", "urutan");

-- AddForeignKey (PostgreSQL tidak punya IF NOT EXISTS untuk constraint, jadi dicek manual)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProfilBumDes_imageId_fkey') THEN
        ALTER TABLE "ProfilBumDes" ADD CONSTRAINT "ProfilBumDes_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UnitUsahaBumDes_imageId_fkey') THEN
        ALTER TABLE "UnitUsahaBumDes" ADD CONSTRAINT "UnitUsahaBumDes_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
