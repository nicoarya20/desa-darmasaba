-- CreateEnum
CREATE TYPE "StatusLaporan" AS ENUM ('SELESAI', 'PROSES', 'GAGAL');

-- AlterTable
ALTER TABLE "DataKematian_Kelahiran" ADD CONSTRAINT "DataKematian_Kelahiran_pkey" PRIMARY KEY ("id");

-- DropIndex
DROP INDEX "DataKematian_Kelahiran_id_key";

-- AlterTable
ALTER TABLE "GrafikKepuasan" ADD CONSTRAINT "GrafikKepuasan_pkey" PRIMARY KEY ("id");

-- DropIndex
DROP INDEX "GrafikKepuasan_id_key";

-- CreateTable
CREATE TABLE "KeamananLingkungan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "imageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "KeamananLingkungan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PolsekTerdekat" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jarakKeDesa" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "nomorTelepon" TEXT NOT NULL,
    "jamOperasional" TEXT NOT NULL,
    "embedMapUrl" TEXT NOT NULL,
    "namaTempatMaps" TEXT NOT NULL,
    "alamatMaps" TEXT NOT NULL,
    "linkPetunjukArah" TEXT NOT NULL,
    "layananPolsekId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PolsekTerdekat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LayananPolsek" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "LayananPolsek_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KontakDaruratKeamanan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kontak" TEXT NOT NULL,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "KontakDaruratKeamanan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PencegahanKriminalitas" (
    "id" TEXT NOT NULL,
    "programKeamananId" TEXT NOT NULL,
    "tipsKeamananId" TEXT NOT NULL,
    "videoKeamananId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PencegahanKriminalitas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramKeamanan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgramKeamanan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipsKeamanan" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "konten" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TipsKeamanan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoKeamanan" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT,
    "videoUrl" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoKeamanan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaporanPublik" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "tanggalWaktu" TIMESTAMP(3) NOT NULL,
    "status" "StatusLaporan" NOT NULL,
    "kronologi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LaporanPublik_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PenangananLaporanPublik" (
    "id" TEXT NOT NULL,
    "laporanId" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,

    CONSTRAINT "PenangananLaporanPublik_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pelapor" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "nomorTelepon" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,

    CONSTRAINT "Pelapor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuTipsKeamanan" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "imageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MenuTipsKeamanan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProgramKeamanan_slug_key" ON "ProgramKeamanan"("slug");

-- AddForeignKey
ALTER TABLE "KeamananLingkungan" ADD CONSTRAINT "KeamananLingkungan_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PolsekTerdekat" ADD CONSTRAINT "PolsekTerdekat_layananPolsekId_fkey" FOREIGN KEY ("layananPolsekId") REFERENCES "LayananPolsek"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PencegahanKriminalitas" ADD CONSTRAINT "PencegahanKriminalitas_programKeamananId_fkey" FOREIGN KEY ("programKeamananId") REFERENCES "ProgramKeamanan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PencegahanKriminalitas" ADD CONSTRAINT "PencegahanKriminalitas_tipsKeamananId_fkey" FOREIGN KEY ("tipsKeamananId") REFERENCES "TipsKeamanan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PencegahanKriminalitas" ADD CONSTRAINT "PencegahanKriminalitas_videoKeamananId_fkey" FOREIGN KEY ("videoKeamananId") REFERENCES "VideoKeamanan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PenangananLaporanPublik" ADD CONSTRAINT "PenangananLaporanPublik_laporanId_fkey" FOREIGN KEY ("laporanId") REFERENCES "LaporanPublik"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pelapor" ADD CONSTRAINT "Pelapor_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuTipsKeamanan" ADD CONSTRAINT "MenuTipsKeamanan_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
