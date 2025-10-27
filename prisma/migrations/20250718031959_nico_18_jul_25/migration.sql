-- CreateTable
CREATE TABLE "PengaduanMasyarakat" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nomorTelepon" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "judulPengaduan" TEXT NOT NULL,
    "lokasiKejadian" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "deskripsiPengaduan" TEXT NOT NULL,
    "jenisPengaduanId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PengaduanMasyarakat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JenisPengaduan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "JenisPengaduan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PengelolaanSampah" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PengelolaanSampah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeteranganBankSampahTerdekat" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "namaTempatMaps" TEXT NOT NULL,
    "linkPetunjukArah" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "KeteranganBankSampahTerdekat_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PengaduanMasyarakat" ADD CONSTRAINT "PengaduanMasyarakat_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PengaduanMasyarakat" ADD CONSTRAINT "PengaduanMasyarakat_jenisPengaduanId_fkey" FOREIGN KEY ("jenisPengaduanId") REFERENCES "JenisPengaduan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
