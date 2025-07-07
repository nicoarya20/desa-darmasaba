/*
  Warnings:

  - Added the required column `kategoriProdukId` to the `PasarDesa` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PasarDesa" ADD COLUMN     "kategoriProdukId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "PasarDesa" ADD CONSTRAINT "PasarDesa_kategoriProdukId_fkey" FOREIGN KEY ("kategoriProdukId") REFERENCES "KategoriProduk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
