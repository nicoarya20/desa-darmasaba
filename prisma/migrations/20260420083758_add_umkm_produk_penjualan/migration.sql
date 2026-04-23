-- CreateTable
CREATE TABLE "Umkm" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "pemilik" TEXT NOT NULL,
    "deskripsi" TEXT,
    "alamat" TEXT,
    "kontak" TEXT,
    "imageId" TEXT,
    "kategoriId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Umkm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProdukUmkm" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "harga" INTEGER NOT NULL,
    "stok" INTEGER NOT NULL DEFAULT 0,
    "deskripsi" TEXT,
    "imageId" TEXT,
    "umkmId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ProdukUmkm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PenjualanProduk" (
    "id" TEXT NOT NULL,
    "produkId" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "hargaSatuan" INTEGER NOT NULL,
    "totalNilai" INTEGER NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "periode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PenjualanProduk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PenjualanProduk_periode_idx" ON "PenjualanProduk"("periode");

-- CreateIndex
CREATE INDEX "PenjualanProduk_produkId_idx" ON "PenjualanProduk"("produkId");

-- CreateIndex
CREATE INDEX "PenjualanProduk_tanggal_idx" ON "PenjualanProduk"("tanggal");

-- AddForeignKey
ALTER TABLE "Umkm" ADD CONSTRAINT "Umkm_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Umkm" ADD CONSTRAINT "Umkm_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "KategoriProduk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdukUmkm" ADD CONSTRAINT "ProdukUmkm_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProdukUmkm" ADD CONSTRAINT "ProdukUmkm_umkmId_fkey" FOREIGN KEY ("umkmId") REFERENCES "Umkm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PenjualanProduk" ADD CONSTRAINT "PenjualanProduk_produkId_fkey" FOREIGN KEY ("produkId") REFERENCES "ProdukUmkm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
