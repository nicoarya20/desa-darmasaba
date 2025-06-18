/*
  Warnings:

  - You are about to drop the column `nomor` on the `DaftarInformasiPublik` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `GalleryFoto` table. All the data in the column will be lost.
  - You are about to drop the column `video` on the `GalleryVideo` table. All the data in the column will be lost.
  - You are about to drop the column `videosId` on the `GalleryVideo` table. All the data in the column will be lost.
  - The primary key for the `IndeksKepuasanMasyarakat` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `profilPerbekelId` on the `ProfileDesa` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `ProfilePPID` table. All the data in the column will be lost.
  - You are about to drop the `Images` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Videos` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `deskripsi` to the `GalleryFoto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deskripsi` to the `GalleryVideo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `linkVideo` to the `GalleryVideo` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "GalleryFoto" DROP CONSTRAINT "GalleryFoto_imagesId_fkey";

-- DropForeignKey
ALTER TABLE "GalleryVideo" DROP CONSTRAINT "GalleryVideo_videosId_fkey";

-- DropForeignKey
ALTER TABLE "ProfileDesa" DROP CONSTRAINT "ProfileDesa_profilPerbekelId_fkey";

-- DropIndex
DROP INDEX "GalleryVideo_videosId_key";

-- AlterTable
ALTER TABLE "DaftarInformasiPublik" DROP COLUMN "nomor";

-- AlterTable
ALTER TABLE "GalleryFoto" DROP COLUMN "image",
ADD COLUMN     "deskripsi" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "GalleryVideo" DROP COLUMN "video",
DROP COLUMN "videosId",
ADD COLUMN     "deskripsi" TEXT NOT NULL,
ADD COLUMN     "linkVideo" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "IndeksKepuasanMasyarakat" DROP CONSTRAINT "IndeksKepuasanMasyarakat_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "IndeksKepuasanMasyarakat_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "IndeksKepuasanMasyarakat_id_seq";

-- AlterTable
ALTER TABLE "ProfileDesa" DROP COLUMN "profilPerbekelId";

-- AlterTable
ALTER TABLE "ProfilePPID" DROP COLUMN "imageUrl",
ADD COLUMN     "imageId" TEXT;

-- DropTable
DROP TABLE "Images";

-- DropTable
DROP TABLE "Videos";

-- CreateTable
CREATE TABLE "StrukturPPID" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "StrukturPPID_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileDesaImage" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "profileDesaId" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,

    CONSTRAINT "ProfileDesaImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PelayananSuratKeterangan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PelayananSuratKeterangan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PelayananTelunjukSaktiDesa" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PelayananTelunjukSaktiDesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PelayananPerizinanBerusaha" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PelayananPerizinanBerusaha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PelayananPendudukNonPermanen" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PelayananPendudukNonPermanen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Penghargaan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "juara" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Penghargaan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Posyandu" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nomor" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Posyandu_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "StrukturPPID" ADD CONSTRAINT "StrukturPPID_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfilePPID" ADD CONSTRAINT "ProfilePPID_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileDesaImage" ADD CONSTRAINT "ProfileDesaImage_profileDesaId_fkey" FOREIGN KEY ("profileDesaId") REFERENCES "ProfileDesa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileDesaImage" ADD CONSTRAINT "ProfileDesaImage_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryFoto" ADD CONSTRAINT "GalleryFoto_imagesId_fkey" FOREIGN KEY ("imagesId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PelayananSuratKeterangan" ADD CONSTRAINT "PelayananSuratKeterangan_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Penghargaan" ADD CONSTRAINT "Penghargaan_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Posyandu" ADD CONSTRAINT "Posyandu_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
