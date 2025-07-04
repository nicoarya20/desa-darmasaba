/*
  Warnings:

  - You are about to drop the `_ProdukToKategori` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ProdukToKategori" DROP CONSTRAINT "_ProdukToKategori_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProdukToKategori" DROP CONSTRAINT "_ProdukToKategori_B_fkey";

-- AlterTable
ALTER TABLE "KategoriProduk" ADD COLUMN     "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "PasarDesa" ADD COLUMN     "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- DropTable
DROP TABLE "_ProdukToKategori";

-- CreateTable
CREATE TABLE "KategoriToPasar" (
    "id" TEXT NOT NULL,
    "kategoriId" TEXT NOT NULL,
    "pasarDesaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "KategoriToPasar_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "KategoriToPasar" ADD CONSTRAINT "KategoriToPasar_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "KategoriProduk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KategoriToPasar" ADD CONSTRAINT "KategoriToPasar_pasarDesaId_fkey" FOREIGN KEY ("pasarDesaId") REFERENCES "PasarDesa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
