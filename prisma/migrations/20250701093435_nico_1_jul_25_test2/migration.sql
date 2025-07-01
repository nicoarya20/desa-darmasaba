/*
  Warnings:

  - You are about to drop the column `icon` on the `KontakDarurat` table. All the data in the column will be lost.
  - You are about to drop the column `nama` on the `KontakDarurat` table. All the data in the column will be lost.
  - You are about to drop the column `urutan` on the `KontakDarurat` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `KontakDaruratKeamanan` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `KontakDaruratKeamanan` table. All the data in the column will be lost.
  - You are about to drop the column `kontak` on the `KontakDaruratKeamanan` table. All the data in the column will be lost.
  - Added the required column `deskripsi` to the `KontakDarurat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageId` to the `KontakDarurat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `KontakDarurat` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "KontakItem" DROP CONSTRAINT "KontakItem_kategoriId_fkey";

-- AlterTable
ALTER TABLE "KontakDarurat" DROP COLUMN "icon",
DROP COLUMN "nama",
DROP COLUMN "urutan",
ADD COLUMN     "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deskripsi" TEXT NOT NULL,
ADD COLUMN     "imageId" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "KontakDaruratKeamanan" DROP COLUMN "deletedAt",
DROP COLUMN "isActive",
DROP COLUMN "kontak",
ADD COLUMN     "urutan" INTEGER;

-- AddForeignKey
ALTER TABLE "KontakDarurat" ADD CONSTRAINT "KontakDarurat_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KontakItem" ADD CONSTRAINT "KontakItem_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "KontakDaruratKeamanan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
