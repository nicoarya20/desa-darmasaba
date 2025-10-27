/*
  Warnings:

  - You are about to drop the column `belanjaId` on the `ApbDesa` table. All the data in the column will be lost.
  - You are about to drop the column `pembiayaanId` on the `ApbDesa` table. All the data in the column will be lost.
  - You are about to drop the column `pendapatanId` on the `ApbDesa` table. All the data in the column will be lost.
  - You are about to drop the `KegiatanSubak` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `KlasifikasiBelanja` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RincianBelanja` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ApbDesaToKegiatanSubak` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_BelanjaToKlasifikasiBelanja` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_KlasifikasiBelanjaToRincianBelanja` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `tanggal` on the `DaftarInformasiPublik` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updatedAt` to the `Pembiayaan` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ApbDesa" DROP CONSTRAINT "ApbDesa_belanjaId_fkey";

-- DropForeignKey
ALTER TABLE "ApbDesa" DROP CONSTRAINT "ApbDesa_pembiayaanId_fkey";

-- DropForeignKey
ALTER TABLE "ApbDesa" DROP CONSTRAINT "ApbDesa_pendapatanId_fkey";

-- DropForeignKey
ALTER TABLE "_ApbDesaToKegiatanSubak" DROP CONSTRAINT "_ApbDesaToKegiatanSubak_A_fkey";

-- DropForeignKey
ALTER TABLE "_ApbDesaToKegiatanSubak" DROP CONSTRAINT "_ApbDesaToKegiatanSubak_B_fkey";

-- DropForeignKey
ALTER TABLE "_BelanjaToKlasifikasiBelanja" DROP CONSTRAINT "_BelanjaToKlasifikasiBelanja_A_fkey";

-- DropForeignKey
ALTER TABLE "_BelanjaToKlasifikasiBelanja" DROP CONSTRAINT "_BelanjaToKlasifikasiBelanja_B_fkey";

-- DropForeignKey
ALTER TABLE "_KlasifikasiBelanjaToRincianBelanja" DROP CONSTRAINT "_KlasifikasiBelanjaToRincianBelanja_A_fkey";

-- DropForeignKey
ALTER TABLE "_KlasifikasiBelanjaToRincianBelanja" DROP CONSTRAINT "_KlasifikasiBelanjaToRincianBelanja_B_fkey";

-- AlterTable
ALTER TABLE "ApbDesa" DROP COLUMN "belanjaId",
DROP COLUMN "pembiayaanId",
DROP COLUMN "pendapatanId",
ADD COLUMN     "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "DaftarInformasiPublik" DROP COLUMN "tanggal",
ADD COLUMN     "tanggal" DATE NOT NULL;

-- AlterTable
ALTER TABLE "Pembiayaan" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "KegiatanSubak";

-- DropTable
DROP TABLE "KlasifikasiBelanja";

-- DropTable
DROP TABLE "RincianBelanja";

-- DropTable
DROP TABLE "_ApbDesaToKegiatanSubak";

-- DropTable
DROP TABLE "_BelanjaToKlasifikasiBelanja";

-- DropTable
DROP TABLE "_KlasifikasiBelanjaToRincianBelanja";

-- CreateTable
CREATE TABLE "DesaDigital" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DesaDigital_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramKreatif" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ProgramKreatif_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KolaborasiInovasi" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tahun" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "kolaborator" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "KolaborasiInovasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InfoTekno" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "InfoTekno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AjukanIdeInovatif" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "namaIde" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "masalah" TEXT NOT NULL,
    "benefit" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AjukanIdeInovatif_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdministrasiOnline" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "nomorTelepon" TEXT NOT NULL,
    "jenisLayananId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AdministrasiOnline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JenisLayanan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "JenisLayanan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ApbDesaPembiayaan" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ApbDesaPembiayaan_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ApbDesaBelanja" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ApbDesaBelanja_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ApbDesaPendapatan" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ApbDesaPendapatan_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ApbDesaPembiayaan_B_index" ON "_ApbDesaPembiayaan"("B");

-- CreateIndex
CREATE INDEX "_ApbDesaBelanja_B_index" ON "_ApbDesaBelanja"("B");

-- CreateIndex
CREATE INDEX "_ApbDesaPendapatan_B_index" ON "_ApbDesaPendapatan"("B");

-- AddForeignKey
ALTER TABLE "DesaDigital" ADD CONSTRAINT "DesaDigital_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KolaborasiInovasi" ADD CONSTRAINT "KolaborasiInovasi_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfoTekno" ADD CONSTRAINT "InfoTekno_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdministrasiOnline" ADD CONSTRAINT "AdministrasiOnline_jenisLayananId_fkey" FOREIGN KEY ("jenisLayananId") REFERENCES "JenisLayanan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApbDesaPembiayaan" ADD CONSTRAINT "_ApbDesaPembiayaan_A_fkey" FOREIGN KEY ("A") REFERENCES "ApbDesa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApbDesaPembiayaan" ADD CONSTRAINT "_ApbDesaPembiayaan_B_fkey" FOREIGN KEY ("B") REFERENCES "Pembiayaan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApbDesaBelanja" ADD CONSTRAINT "_ApbDesaBelanja_A_fkey" FOREIGN KEY ("A") REFERENCES "ApbDesa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApbDesaBelanja" ADD CONSTRAINT "_ApbDesaBelanja_B_fkey" FOREIGN KEY ("B") REFERENCES "Belanja"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApbDesaPendapatan" ADD CONSTRAINT "_ApbDesaPendapatan_A_fkey" FOREIGN KEY ("A") REFERENCES "ApbDesa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ApbDesaPendapatan" ADD CONSTRAINT "_ApbDesaPendapatan_B_fkey" FOREIGN KEY ("B") REFERENCES "Pendapatan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
