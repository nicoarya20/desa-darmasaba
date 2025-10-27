-- CreateTable
CREATE TABLE "Layanan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Layanan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Potensi" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Potensi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LandingPage_Layanan" (
    "id" TEXT NOT NULL,
    "deksripsi" TEXT NOT NULL,

    CONSTRAINT "LandingPage_Layanan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppMenu" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AppMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppMenuChild" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "appMenuId" TEXT,

    CONSTRAINT "AppMenuChild_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Berita" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "katagoryBeritaId" TEXT,

    CONSTRAINT "Berita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KatagoryBerita" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "KatagoryBerita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pengumuman" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "categoryPengumumanId" TEXT,

    CONSTRAINT "Pengumuman_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CategoryPengumuman" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CategoryPengumuman_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Images" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "label" TEXT NOT NULL DEFAULT 'null',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Videos" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "label" TEXT NOT NULL DEFAULT 'null',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryFoto" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "imagesId" TEXT,

    CONSTRAINT "GalleryFoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalleryVideo" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "video" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "videosId" TEXT,

    CONSTRAINT "GalleryVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataKematian_Kelahiran" (
    "id" SERIAL NOT NULL,
    "tahun" TEXT NOT NULL,
    "kematianKasar" TEXT NOT NULL,
    "kematianBayi" TEXT NOT NULL,
    "kelahiranKasar" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataKematian_Kelahiran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FasilitasKesehatan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "FasilitasKesehatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InformasiUmum" (
    "id" TEXT NOT NULL,
    "fasilitas" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "jamOperasional" TEXT NOT NULL,
    "fasilitasKesehatanId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "InformasiUmum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LayananUnggulan" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "LayananUnggulan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DokterdanTenagaMedis" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DokterdanTenagaMedis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FasilitasPendukung" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "FasilitasPendukung_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProsedurPendaftaran" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ProsedurPendaftaran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_FasilitasKesehatanToLayananUnggulan" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FasilitasKesehatanToLayananUnggulan_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_FasilitasKesehatanToFasilitasPendukung" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FasilitasKesehatanToFasilitasPendukung_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_FasilitasKesehatanToProsedurPendaftaran" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FasilitasKesehatanToProsedurPendaftaran_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_DokterdanTenagaMedisToFasilitasKesehatan" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DokterdanTenagaMedisToFasilitasKesehatan_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Layanan_name_key" ON "Layanan"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Potensi_name_key" ON "Potensi"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AppMenu_name_key" ON "AppMenu"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AppMenuChild_name_key" ON "AppMenuChild"("name");

-- CreateIndex
CREATE UNIQUE INDEX "KatagoryBerita_name_key" ON "KatagoryBerita"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryPengumuman_name_key" ON "CategoryPengumuman"("name");

-- CreateIndex
CREATE UNIQUE INDEX "GalleryFoto_imagesId_key" ON "GalleryFoto"("imagesId");

-- CreateIndex
CREATE UNIQUE INDEX "GalleryVideo_videosId_key" ON "GalleryVideo"("videosId");

-- CreateIndex
CREATE INDEX "_FasilitasKesehatanToLayananUnggulan_B_index" ON "_FasilitasKesehatanToLayananUnggulan"("B");

-- CreateIndex
CREATE INDEX "_FasilitasKesehatanToFasilitasPendukung_B_index" ON "_FasilitasKesehatanToFasilitasPendukung"("B");

-- CreateIndex
CREATE INDEX "_FasilitasKesehatanToProsedurPendaftaran_B_index" ON "_FasilitasKesehatanToProsedurPendaftaran"("B");

-- CreateIndex
CREATE INDEX "_DokterdanTenagaMedisToFasilitasKesehatan_B_index" ON "_DokterdanTenagaMedisToFasilitasKesehatan"("B");

-- AddForeignKey
ALTER TABLE "AppMenuChild" ADD CONSTRAINT "AppMenuChild_appMenuId_fkey" FOREIGN KEY ("appMenuId") REFERENCES "AppMenu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Berita" ADD CONSTRAINT "Berita_katagoryBeritaId_fkey" FOREIGN KEY ("katagoryBeritaId") REFERENCES "KatagoryBerita"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pengumuman" ADD CONSTRAINT "Pengumuman_categoryPengumumanId_fkey" FOREIGN KEY ("categoryPengumumanId") REFERENCES "CategoryPengumuman"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryFoto" ADD CONSTRAINT "GalleryFoto_imagesId_fkey" FOREIGN KEY ("imagesId") REFERENCES "Images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryVideo" ADD CONSTRAINT "GalleryVideo_videosId_fkey" FOREIGN KEY ("videosId") REFERENCES "Videos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InformasiUmum" ADD CONSTRAINT "InformasiUmum_fasilitasKesehatanId_fkey" FOREIGN KEY ("fasilitasKesehatanId") REFERENCES "FasilitasKesehatan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FasilitasKesehatanToLayananUnggulan" ADD CONSTRAINT "_FasilitasKesehatanToLayananUnggulan_A_fkey" FOREIGN KEY ("A") REFERENCES "FasilitasKesehatan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FasilitasKesehatanToLayananUnggulan" ADD CONSTRAINT "_FasilitasKesehatanToLayananUnggulan_B_fkey" FOREIGN KEY ("B") REFERENCES "LayananUnggulan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FasilitasKesehatanToFasilitasPendukung" ADD CONSTRAINT "_FasilitasKesehatanToFasilitasPendukung_A_fkey" FOREIGN KEY ("A") REFERENCES "FasilitasKesehatan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FasilitasKesehatanToFasilitasPendukung" ADD CONSTRAINT "_FasilitasKesehatanToFasilitasPendukung_B_fkey" FOREIGN KEY ("B") REFERENCES "FasilitasPendukung"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FasilitasKesehatanToProsedurPendaftaran" ADD CONSTRAINT "_FasilitasKesehatanToProsedurPendaftaran_A_fkey" FOREIGN KEY ("A") REFERENCES "FasilitasKesehatan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FasilitasKesehatanToProsedurPendaftaran" ADD CONSTRAINT "_FasilitasKesehatanToProsedurPendaftaran_B_fkey" FOREIGN KEY ("B") REFERENCES "ProsedurPendaftaran"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DokterdanTenagaMedisToFasilitasKesehatan" ADD CONSTRAINT "_DokterdanTenagaMedisToFasilitasKesehatan_A_fkey" FOREIGN KEY ("A") REFERENCES "DokterdanTenagaMedis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DokterdanTenagaMedisToFasilitasKesehatan" ADD CONSTRAINT "_DokterdanTenagaMedisToFasilitasKesehatan_B_fkey" FOREIGN KEY ("B") REFERENCES "FasilitasKesehatan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
