-- DropForeignKey
ALTER TABLE "Berita" DROP CONSTRAINT "Berita_imageId_fkey";

-- DropForeignKey
ALTER TABLE "InfoWabahPenyakit" DROP CONSTRAINT "InfoWabahPenyakit_imageId_fkey";

-- DropForeignKey
ALTER TABLE "KontakDarurat" DROP CONSTRAINT "KontakDarurat_imageId_fkey";

-- DropForeignKey
ALTER TABLE "PenangananDarurat" DROP CONSTRAINT "PenangananDarurat_imageId_fkey";

-- DropForeignKey
ALTER TABLE "Posyandu" DROP CONSTRAINT "Posyandu_imageId_fkey";

-- DropForeignKey
ALTER TABLE "ProgramKesehatan" DROP CONSTRAINT "ProgramKesehatan_imageId_fkey";

-- DropForeignKey
ALTER TABLE "Puskesmas" DROP CONSTRAINT "Puskesmas_imageId_fkey";

-- AlterTable
ALTER TABLE "Berita" ALTER COLUMN "imageId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "InfoWabahPenyakit" ALTER COLUMN "imageId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "KontakDarurat" ALTER COLUMN "imageId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PasarDesa" ADD COLUMN     "deskripsi" TEXT;

-- AlterTable
ALTER TABLE "PenangananDarurat" ALTER COLUMN "imageId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Posyandu" ALTER COLUMN "imageId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ProgramKesehatan" ALTER COLUMN "imageId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Puskesmas" ALTER COLUMN "imageId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "LayananToPolsek" (
    "id" TEXT NOT NULL,
    "layananId" TEXT NOT NULL,
    "polsekTerdekatId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "LayananToPolsek_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Berita" ADD CONSTRAINT "Berita_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Posyandu" ADD CONSTRAINT "Posyandu_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Puskesmas" ADD CONSTRAINT "Puskesmas_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramKesehatan" ADD CONSTRAINT "ProgramKesehatan_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PenangananDarurat" ADD CONSTRAINT "PenangananDarurat_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KontakDarurat" ADD CONSTRAINT "KontakDarurat_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfoWabahPenyakit" ADD CONSTRAINT "InfoWabahPenyakit_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LayananToPolsek" ADD CONSTRAINT "LayananToPolsek_layananId_fkey" FOREIGN KEY ("layananId") REFERENCES "LayananPolsek"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LayananToPolsek" ADD CONSTRAINT "LayananToPolsek_polsekTerdekatId_fkey" FOREIGN KEY ("polsekTerdekatId") REFERENCES "PolsekTerdekat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
