/*
  Warnings:

  - You are about to drop the column `profileDesaId` on the `ProfileDesaImage` table. All the data in the column will be lost.
  - You are about to drop the `ProfileDesa` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `maskotDesaId` to the `ProfileDesaImage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ProfileDesaImage" DROP CONSTRAINT "ProfileDesaImage_profileDesaId_fkey";

-- AlterTable
ALTER TABLE "ProfilPerbekel" ADD COLUMN     "imageId" TEXT;

-- AlterTable
ALTER TABLE "ProfileDesaImage" DROP COLUMN "profileDesaId",
ADD COLUMN     "maskotDesaId" TEXT NOT NULL;

-- DropTable
DROP TABLE "ProfileDesa";

-- CreateTable
CREATE TABLE "SejarahDesa" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SejarahDesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisiMisiDesa" (
    "id" TEXT NOT NULL,
    "visi" TEXT NOT NULL,
    "misi" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "VisiMisiDesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LambangDesa" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "LambangDesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaskotDesa" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MaskotDesa_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProfileDesaImage" ADD CONSTRAINT "ProfileDesaImage_maskotDesaId_fkey" FOREIGN KEY ("maskotDesaId") REFERENCES "MaskotDesa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfilPerbekel" ADD CONSTRAINT "ProfilPerbekel_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
