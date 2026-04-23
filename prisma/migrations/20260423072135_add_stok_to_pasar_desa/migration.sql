/*
  Warnings:

  - You are about to drop the `ProdukUmkm` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `umkmId` to the `PasarDesa` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PenjualanProduk" DROP CONSTRAINT "PenjualanProduk_produkId_fkey";

-- DropForeignKey
ALTER TABLE "ProdukUmkm" DROP CONSTRAINT "ProdukUmkm_imageId_fkey";

-- DropForeignKey
ALTER TABLE "ProdukUmkm" DROP CONSTRAINT "ProdukUmkm_umkmId_fkey";

-- AlterTable
ALTER TABLE "KategoriProduk" ALTER COLUMN "deletedAt" DROP NOT NULL,
ALTER COLUMN "deletedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "PasarDesa" ADD COLUMN     "stok" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "umkmId" TEXT NOT NULL,
ALTER COLUMN "rating" SET DEFAULT 0,
ALTER COLUMN "alamatUsaha" DROP NOT NULL,
ALTER COLUMN "deletedAt" DROP NOT NULL,
ALTER COLUMN "deletedAt" DROP DEFAULT,
ALTER COLUMN "kontak" DROP NOT NULL;

-- DropTable
DROP TABLE "ProdukUmkm";

-- AddForeignKey
ALTER TABLE "PasarDesa" ADD CONSTRAINT "PasarDesa_umkmId_fkey" FOREIGN KEY ("umkmId") REFERENCES "Umkm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PenjualanProduk" ADD CONSTRAINT "PenjualanProduk_produkId_fkey" FOREIGN KEY ("produkId") REFERENCES "PasarDesa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
