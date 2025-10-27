-- CreateTable
CREATE TABLE "posisi_organisasi" (
    "id" VARCHAR(50) NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "deskripsi" TEXT,
    "hierarki" INTEGER NOT NULL,

    CONSTRAINT "posisi_organisasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pegawai" (
    "id" UUID NOT NULL,
    "namaLengkap" VARCHAR(255) NOT NULL,
    "gelarAkademik" VARCHAR(100),
    "imageId" TEXT,
    "tanggalMasuk" DATE,
    "email" VARCHAR(255),
    "telepon" VARCHAR(20),
    "alamat" TEXT,
    "posisiId" VARCHAR(50) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pegawai_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hubungan_organisasi" (
    "id" UUID NOT NULL,
    "atasanId" UUID NOT NULL,
    "bawahanId" UUID NOT NULL,
    "tipe" VARCHAR(50),

    CONSTRAINT "hubungan_organisasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "struktur_organisasi" (
    "id" TEXT NOT NULL,
    "posisiOrganisasiId" VARCHAR(50) NOT NULL,
    "pegawaiId" UUID NOT NULL,
    "hubunganOrganisasiId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "struktur_organisasi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pegawai_email_key" ON "pegawai"("email");

-- CreateIndex
CREATE UNIQUE INDEX "hubungan_organisasi_atasanId_bawahanId_key" ON "hubungan_organisasi"("atasanId", "bawahanId");

-- AddForeignKey
ALTER TABLE "pegawai" ADD CONSTRAINT "pegawai_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pegawai" ADD CONSTRAINT "pegawai_posisiId_fkey" FOREIGN KEY ("posisiId") REFERENCES "posisi_organisasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hubungan_organisasi" ADD CONSTRAINT "hubungan_organisasi_atasanId_fkey" FOREIGN KEY ("atasanId") REFERENCES "pegawai"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hubungan_organisasi" ADD CONSTRAINT "hubungan_organisasi_bawahanId_fkey" FOREIGN KEY ("bawahanId") REFERENCES "pegawai"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "struktur_organisasi" ADD CONSTRAINT "struktur_organisasi_posisiOrganisasiId_fkey" FOREIGN KEY ("posisiOrganisasiId") REFERENCES "posisi_organisasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "struktur_organisasi" ADD CONSTRAINT "struktur_organisasi_pegawaiId_fkey" FOREIGN KEY ("pegawaiId") REFERENCES "pegawai"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "struktur_organisasi" ADD CONSTRAINT "struktur_organisasi_hubunganOrganisasiId_fkey" FOREIGN KEY ("hubunganOrganisasiId") REFERENCES "hubungan_organisasi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
