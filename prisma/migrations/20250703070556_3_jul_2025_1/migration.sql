/*
  Warnings:

  - The values [SELESAI,PROSES,GAGAL] on the enum `StatusLaporan` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `icon` on the `KontakDaruratKeamanan` table. All the data in the column will be lost.
  - You are about to drop the column `urutan` on the `KontakDaruratKeamanan` table. All the data in the column will be lost.
  - You are about to drop the column `icon` on the `KontakItem` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StatusLaporan_new" AS ENUM ('Selesai', 'Proses', 'Gagal');
ALTER TABLE "LaporanPublik" ALTER COLUMN "status" TYPE "StatusLaporan_new" USING ("status"::text::"StatusLaporan_new");
ALTER TYPE "StatusLaporan" RENAME TO "StatusLaporan_old";
ALTER TYPE "StatusLaporan_new" RENAME TO "StatusLaporan";
DROP TYPE "StatusLaporan_old";
COMMIT;

-- AlterTable
ALTER TABLE "KontakDaruratKeamanan" DROP COLUMN "icon",
DROP COLUMN "urutan",
ADD COLUMN     "imageId" TEXT;

-- AlterTable
ALTER TABLE "KontakItem" DROP COLUMN "icon",
ADD COLUMN     "imageId" TEXT;

-- CreateTable
CREATE TABLE "LowonganPekerjaan" (
    "id" TEXT NOT NULL,
    "posisi" TEXT NOT NULL,
    "namaPerusahaan" TEXT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "tipePekerjaan" TEXT NOT NULL,
    "gaji" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "kualifikasi" TEXT NOT NULL,
    "tanggalPosting" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LowonganPekerjaan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramKemiskinan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "ikonUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "statistikId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProgramKemiskinan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatistikKemiskinan" (
    "id" TEXT NOT NULL,
    "tahun" INTEGER NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StatistikKemiskinan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProgramKemiskinan_statistikId_key" ON "ProgramKemiskinan"("statistikId");

-- CreateIndex
CREATE UNIQUE INDEX "StatistikKemiskinan_tahun_key" ON "StatistikKemiskinan"("tahun");

-- AddForeignKey
ALTER TABLE "KontakDaruratKeamanan" ADD CONSTRAINT "KontakDaruratKeamanan_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KontakItem" ADD CONSTRAINT "KontakItem_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramKemiskinan" ADD CONSTRAINT "ProgramKemiskinan_statistikId_fkey" FOREIGN KEY ("statistikId") REFERENCES "StatistikKemiskinan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
