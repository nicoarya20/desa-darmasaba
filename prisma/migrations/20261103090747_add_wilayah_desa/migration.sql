-- Kenapa: Profil Desa belum punya data letak & batas wilayah (utara/selatan/
-- timur/barat, luas, peta). Tabel singleton (satu baris, di-upsert dari admin)
-- agar konten ini bisa diisi lewat CMS tanpa mengarang data di seed.
-- Idempoten: aman dijalankan ulang di staging/produksi. Semua kolom data
-- nullable, jadi tidak perlu backfill/DEFAULT. luasWilayah dalam hektar.

-- CreateTable
CREATE TABLE IF NOT EXISTS "WilayahDesa" (
    "id" TEXT NOT NULL,
    "batasUtara" TEXT,
    "batasSelatan" TEXT,
    "batasTimur" TEXT,
    "batasBarat" TEXT,
    "luasWilayah" DOUBLE PRECISION,
    "keterangan" TEXT,
    "petaEmbedUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "WilayahDesa_pkey" PRIMARY KEY ("id")
);
