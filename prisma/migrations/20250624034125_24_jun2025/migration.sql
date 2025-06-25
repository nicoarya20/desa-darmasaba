/*
  Warnings:

  - The primary key for the `DataKematian_Kelahiran` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "DataKematian_Kelahiran" DROP CONSTRAINT "DataKematian_Kelahiran_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "DataKematian_Kelahiran_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "DataKematian_Kelahiran_id_seq";

-- AlterTable
ALTER TABLE "ProfilePPID" ADD COLUMN     "imageUrl" TEXT;

-- CreateTable
CREATE TABLE "Puskesmas" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "jamId" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "kontakId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Puskesmas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JamOperasional" (
    "id" TEXT NOT NULL,
    "workDays" TEXT NOT NULL,
    "weekDays" TEXT NOT NULL,
    "holiday" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "JamOperasional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KontakPuskesmas" (
    "id" TEXT NOT NULL,
    "kontakPuskesmas" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "facebook" TEXT NOT NULL,
    "kontakUGD" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "KontakPuskesmas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramKesehatan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deskripsiSingkat" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ProgramKesehatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PenangananDarurat" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PenangananDarurat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KontakDarurat" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "KontakDarurat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InfoWabahPenyakit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deskripsiSingkat" TEXT NOT NULL,
    "deskripsiLengkap" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "InfoWabahPenyakit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Puskesmas" ADD CONSTRAINT "Puskesmas_jamId_fkey" FOREIGN KEY ("jamId") REFERENCES "JamOperasional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Puskesmas" ADD CONSTRAINT "Puskesmas_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Puskesmas" ADD CONSTRAINT "Puskesmas_kontakId_fkey" FOREIGN KEY ("kontakId") REFERENCES "KontakPuskesmas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramKesehatan" ADD CONSTRAINT "ProgramKesehatan_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PenangananDarurat" ADD CONSTRAINT "PenangananDarurat_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KontakDarurat" ADD CONSTRAINT "KontakDarurat_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfoWabahPenyakit" ADD CONSTRAINT "InfoWabahPenyakit_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
