/*
  Warnings:

  - You are about to drop the column `realisasi` on the `APBDesItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "APBDesItem" DROP COLUMN "realisasi",
ADD COLUMN     "totalRealisasi" DOUBLE PRECISION NOT NULL DEFAULT 0,
ALTER COLUMN "selisih" SET DEFAULT 0,
ALTER COLUMN "persentase" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Berita" ADD COLUMN     "linkVideo" VARCHAR(500);

-- CreateTable
CREATE TABLE "RealisasiItem" (
    "id" TEXT NOT NULL,
    "kode" TEXT,
    "apbdesItemId" TEXT NOT NULL,
    "jumlah" DOUBLE PRECISION NOT NULL,
    "tanggal" DATE NOT NULL,
    "keterangan" TEXT,
    "buktiFileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "RealisasiItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MusikDesa" (
    "id" TEXT NOT NULL,
    "judul" VARCHAR(255) NOT NULL,
    "artis" VARCHAR(255) NOT NULL,
    "deskripsi" TEXT,
    "durasi" VARCHAR(20) NOT NULL,
    "audioFileId" TEXT,
    "coverImageId" TEXT,
    "genre" VARCHAR(100),
    "tahunRilis" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MusikDesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_BeritaImages" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_BeritaImages_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "RealisasiItem_kode_idx" ON "RealisasiItem"("kode");

-- CreateIndex
CREATE INDEX "RealisasiItem_apbdesItemId_idx" ON "RealisasiItem"("apbdesItemId");

-- CreateIndex
CREATE INDEX "RealisasiItem_tanggal_idx" ON "RealisasiItem"("tanggal");

-- CreateIndex
CREATE INDEX "MusikDesa_judul_idx" ON "MusikDesa"("judul");

-- CreateIndex
CREATE INDEX "MusikDesa_artis_idx" ON "MusikDesa"("artis");

-- CreateIndex
CREATE INDEX "_BeritaImages_B_index" ON "_BeritaImages"("B");

-- CreateIndex
CREATE INDEX "Berita_kategoriBeritaId_idx" ON "Berita"("kategoriBeritaId");

-- AddForeignKey
ALTER TABLE "RealisasiItem" ADD CONSTRAINT "RealisasiItem_apbdesItemId_fkey" FOREIGN KEY ("apbdesItemId") REFERENCES "APBDesItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusikDesa" ADD CONSTRAINT "MusikDesa_audioFileId_fkey" FOREIGN KEY ("audioFileId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusikDesa" ADD CONSTRAINT "MusikDesa_coverImageId_fkey" FOREIGN KEY ("coverImageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BeritaImages" ADD CONSTRAINT "_BeritaImages_A_fkey" FOREIGN KEY ("A") REFERENCES "Berita"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BeritaImages" ADD CONSTRAINT "_BeritaImages_B_fkey" FOREIGN KEY ("B") REFERENCES "FileStorage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
