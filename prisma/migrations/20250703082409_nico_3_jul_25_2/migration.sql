/*
  Warnings:

  - You are about to drop the column `alamat` on the `PasarDesa` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `PasarDesa` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `PasarDesa` table. All the data in the column will be lost.
  - You are about to drop the column `kategoriId` on the `PasarDesa` table. All the data in the column will be lost.
  - You are about to drop the column `satuan` on the `PasarDesa` table. All the data in the column will be lost.
  - You are about to drop the `KategoriMakanan` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `alamatUsaha` to the `PasarDesa` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PasarDesa" DROP CONSTRAINT "PasarDesa_imageId_fkey";

-- DropForeignKey
ALTER TABLE "PasarDesa" DROP CONSTRAINT "PasarDesa_kategoriId_fkey";

-- AlterTable
ALTER TABLE "PasarDesa" DROP COLUMN "alamat",
DROP COLUMN "deletedAt",
DROP COLUMN "isActive",
DROP COLUMN "kategoriId",
DROP COLUMN "satuan",
ADD COLUMN     "alamatUsaha" TEXT NOT NULL,
ALTER COLUMN "imageId" DROP NOT NULL;

-- DropTable
DROP TABLE "KategoriMakanan";

-- CreateTable
CREATE TABLE "KategoriProduk" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KategoriProduk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProdukToKategori" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProdukToKategori_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ProdukToKategori_B_index" ON "_ProdukToKategori"("B");

-- AddForeignKey
ALTER TABLE "PasarDesa" ADD CONSTRAINT "PasarDesa_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProdukToKategori" ADD CONSTRAINT "_ProdukToKategori_A_fkey" FOREIGN KEY ("A") REFERENCES "KategoriProduk"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProdukToKategori" ADD CONSTRAINT "_ProdukToKategori_B_fkey" FOREIGN KEY ("B") REFERENCES "PasarDesa"("id") ON DELETE CASCADE ON UPDATE CASCADE;
