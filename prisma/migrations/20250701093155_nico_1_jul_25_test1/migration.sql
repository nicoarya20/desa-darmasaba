/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `KontakDarurat` table. All the data in the column will be lost.
  - You are about to drop the column `deskripsi` on the `KontakDarurat` table. All the data in the column will be lost.
  - You are about to drop the column `imageId` on the `KontakDarurat` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `KontakDarurat` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `KontakDarurat` table. All the data in the column will be lost.
  - Added the required column `nama` to the `KontakDarurat` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "KontakDarurat" DROP CONSTRAINT "KontakDarurat_imageId_fkey";

-- AlterTable
ALTER TABLE "KontakDarurat" DROP COLUMN "deletedAt",
DROP COLUMN "deskripsi",
DROP COLUMN "imageId",
DROP COLUMN "isActive",
DROP COLUMN "name",
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "nama" TEXT NOT NULL,
ADD COLUMN     "urutan" INTEGER;

-- CreateTable
CREATE TABLE "KontakItem" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "nomorTelepon" TEXT NOT NULL,
    "icon" TEXT,
    "kategoriId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KontakItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasarDesa" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "harga" INTEGER NOT NULL,
    "satuan" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "kategoriId" TEXT NOT NULL,

    CONSTRAINT "PasarDesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KategoriMakanan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "KategoriMakanan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "KontakItem" ADD CONSTRAINT "KontakItem_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "KontakDarurat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasarDesa" ADD CONSTRAINT "PasarDesa_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasarDesa" ADD CONSTRAINT "PasarDesa_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "KategoriMakanan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
