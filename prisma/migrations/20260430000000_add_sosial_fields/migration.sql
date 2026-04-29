-- Add persentase field to ProgramKesehatan (untuk Statistik Kesehatan bar chart)
ALTER TABLE "ProgramKesehatan" ADD COLUMN "persentase" INTEGER NOT NULL DEFAULT 0;

-- Create BeasiswaConfig (untuk dana tersalurkan + tahun ajaran beasiswa desa)
CREATE TABLE "BeasiswaConfig" (
    "id" TEXT NOT NULL,
    "tahunAjaran" TEXT NOT NULL,
    "danaTersalurkan" BIGINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "BeasiswaConfig_pkey" PRIMARY KEY ("id")
);

-- Create RingkasanKesehatanDesa (untuk stat cards: ibu hamil, balita, stunting)
CREATE TABLE "RingkasanKesehatanDesa" (
    "id" TEXT NOT NULL,
    "ibuHamilAkh" INTEGER NOT NULL DEFAULT 0,
    "balitaTerdaftar" INTEGER NOT NULL DEFAULT 0,
    "alertStunting" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "RingkasanKesehatanDesa_pkey" PRIMARY KEY ("id")
);
