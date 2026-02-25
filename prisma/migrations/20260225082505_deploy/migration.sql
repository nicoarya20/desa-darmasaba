/*
  Warnings:

  - You are about to alter the column `nama` on the `KategoriPotensi` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `name` on the `PotensiDesa` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `kategoriId` on the `PotensiDesa` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(36)`.
  - A unique constraint covering the columns `[nama]` on the table `KategoriPotensi` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `PotensiDesa` will be added. If there are existing duplicate values, this will fail.
  - Made the column `kategoriId` on table `PotensiDesa` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "DataPerpustakaan" DROP CONSTRAINT "DataPerpustakaan_imageId_fkey";

-- DropForeignKey
ALTER TABLE "DesaDigital" DROP CONSTRAINT "DesaDigital_imageId_fkey";

-- DropForeignKey
ALTER TABLE "InfoTekno" DROP CONSTRAINT "InfoTekno_imageId_fkey";

-- DropForeignKey
ALTER TABLE "KegiatanDesa" DROP CONSTRAINT "KegiatanDesa_imageId_fkey";

-- DropForeignKey
ALTER TABLE "PengaduanMasyarakat" DROP CONSTRAINT "PengaduanMasyarakat_imageId_fkey";

-- DropForeignKey
ALTER TABLE "PotensiDesa" DROP CONSTRAINT "PotensiDesa_kategoriId_fkey";

-- DropForeignKey
ALTER TABLE "ProfileDesaImage" DROP CONSTRAINT "ProfileDesaImage_imageId_fkey";

-- AlterTable
ALTER TABLE "CaraMemperolehInformasi" ALTER COLUMN "deletedAt" DROP NOT NULL,
ALTER COLUMN "deletedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "CaraMemperolehSalinanInformasi" ALTER COLUMN "deletedAt" DROP NOT NULL,
ALTER COLUMN "deletedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "DaftarInformasiPublik" ALTER COLUMN "deletedAt" DROP NOT NULL,
ALTER COLUMN "deletedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "DasarHukumPPID" ALTER COLUMN "deletedAt" DROP NOT NULL,
ALTER COLUMN "deletedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "DataPerpustakaan" ALTER COLUMN "imageId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "DesaDigital" ALTER COLUMN "imageId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "FormulirPermohonanKeberatan" ALTER COLUMN "deletedAt" DROP NOT NULL,
ALTER COLUMN "deletedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "InfoTekno" ALTER COLUMN "imageId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "JenisInformasiDiminta" ALTER COLUMN "deletedAt" DROP NOT NULL,
ALTER COLUMN "deletedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "JenisKelaminResponden" ALTER COLUMN "deletedAt" DROP NOT NULL,
ALTER COLUMN "deletedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "KategoriPotensi" ALTER COLUMN "nama" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "deletedAt" DROP NOT NULL,
ALTER COLUMN "deletedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "KategoriPrestasiDesa" ALTER COLUMN "deletedAt" DROP NOT NULL,
ALTER COLUMN "deletedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "KegiatanDesa" ALTER COLUMN "imageId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "LambangDesa" ALTER COLUMN "deletedAt" DROP NOT NULL,
ALTER COLUMN "deletedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "MaskotDesa" ALTER COLUMN "deletedAt" DROP NOT NULL,
ALTER COLUMN "deletedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "PegawaiPPID" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "PengaduanMasyarakat" ALTER COLUMN "imageId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PermohonanInformasiPublik" ALTER COLUMN "deletedAt" DROP NOT NULL,
ALTER COLUMN "deletedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "PilihanRatingResponden" ALTER COLUMN "deletedAt" DROP NOT NULL,
ALTER COLUMN "deletedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "PosisiOrganisasiPPID" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "PotensiDesa" ALTER COLUMN "name" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "deletedAt" DROP NOT NULL,
ALTER COLUMN "deletedAt" DROP DEFAULT,
ALTER COLUMN "kategoriId" SET NOT NULL,
ALTER COLUMN "kategoriId" SET DATA TYPE VARCHAR(36);

-- AlterTable
ALTER TABLE "PrestasiDesa" ALTER COLUMN "deletedAt" DROP NOT NULL,
ALTER COLUMN "deletedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "ProfileDesaImage" ALTER COLUMN "imageId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ProfilePPID" ALTER COLUMN "deletedAt" DROP NOT NULL,
ALTER COLUMN "deletedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Responden" ALTER COLUMN "deletedAt" DROP NOT NULL,
ALTER COLUMN "deletedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "SejarahDesa" ALTER COLUMN "deletedAt" DROP NOT NULL,
ALTER COLUMN "deletedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "UmurResponden" ALTER COLUMN "deletedAt" DROP NOT NULL,
ALTER COLUMN "deletedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "VisiMisiDesa" ALTER COLUMN "deletedAt" DROP NOT NULL,
ALTER COLUMN "deletedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "VisiMisiPPID" ALTER COLUMN "deletedAt" DROP NOT NULL,
ALTER COLUMN "deletedAt" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "KategoriPotensi_nama_key" ON "KategoriPotensi"("nama");

-- CreateIndex
CREATE UNIQUE INDEX "PotensiDesa_name_key" ON "PotensiDesa"("name");

-- AddForeignKey
ALTER TABLE "ProfileDesaImage" ADD CONSTRAINT "ProfileDesaImage_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PotensiDesa" ADD CONSTRAINT "PotensiDesa_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "KategoriPotensi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesaDigital" ADD CONSTRAINT "DesaDigital_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfoTekno" ADD CONSTRAINT "InfoTekno_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengaduanMasyarakat" ADD CONSTRAINT "PengaduanMasyarakat_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KegiatanDesa" ADD CONSTRAINT "KegiatanDesa_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataPerpustakaan" ADD CONSTRAINT "DataPerpustakaan_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
