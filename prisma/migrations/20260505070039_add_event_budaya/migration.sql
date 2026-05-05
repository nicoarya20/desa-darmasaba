-- DropForeignKey
ALTER TABLE "PasarDesa" DROP CONSTRAINT "PasarDesa_kategoriProdukId_fkey";

-- AlterTable
ALTER TABLE "KategoriProdukUmkm" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "EventBudaya" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "lokasi" TEXT NOT NULL,
    "deskripsi" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "EventBudaya_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PasarDesa" ADD CONSTRAINT "PasarDesa_kategoriProdukId_fkey" FOREIGN KEY ("kategoriProdukId") REFERENCES "KategoriProdukUmkm"("id") ON DELETE SET NULL ON UPDATE CASCADE;
