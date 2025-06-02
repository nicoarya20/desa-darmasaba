/*
  Warnings:

  - You are about to drop the column `image` on the `Berita` table. All the data in the column will be lost.
  - You are about to drop the column `katagoryBeritaId` on the `Berita` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `FasilitasPendukung` table. All the data in the column will be lost.
  - You are about to drop the column `fasilitasKesehatanId` on the `InformasiUmum` table. All the data in the column will be lost.
  - You are about to drop the `KatagoryBerita` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `imageId` to the `Berita` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jadwal` to the `DokterdanTenagaMedis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `specialist` to the `DokterdanTenagaMedis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `FasilitasPendukung` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Berita" DROP CONSTRAINT "Berita_katagoryBeritaId_fkey";

-- DropForeignKey
ALTER TABLE "InformasiUmum" DROP CONSTRAINT "InformasiUmum_fasilitasKesehatanId_fkey";

-- AlterTable
ALTER TABLE "Berita" DROP COLUMN "image",
DROP COLUMN "katagoryBeritaId",
ADD COLUMN     "imageId" TEXT NOT NULL,
ADD COLUMN     "kategoriBeritaId" TEXT;

-- AlterTable
ALTER TABLE "DataKematian_Kelahiran" ADD COLUMN     "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "DokterdanTenagaMedis" ADD COLUMN     "jadwal" TEXT NOT NULL,
ADD COLUMN     "specialist" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FasilitasPendukung" DROP COLUMN "name",
ADD COLUMN     "content" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "InformasiUmum" DROP COLUMN "fasilitasKesehatanId";

-- DropTable
DROP TABLE "KatagoryBerita";

-- CreateTable
CREATE TABLE "FileStorage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "realName" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "link" TEXT NOT NULL,

    CONSTRAINT "FileStorage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisiMisiPPID" (
    "id" TEXT NOT NULL,
    "visi" TEXT NOT NULL,
    "misi" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "VisiMisiPPID_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DasarHukumPPID" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DasarHukumPPID_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfilePPID" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "biodata" TEXT NOT NULL,
    "riwayat" TEXT NOT NULL,
    "pengalaman" TEXT NOT NULL,
    "unggulan" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ProfilePPID_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DaftarInformasiPublik" (
    "id" TEXT NOT NULL,
    "nomor" SERIAL NOT NULL,
    "jenisInformasi" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "tanggal" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DaftarInformasiPublik_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PermohonanInformasiPublik" (
    "id" TEXT NOT NULL,
    "nomor" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "notelp" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "jenisInformasiDimintaId" TEXT,
    "caraMemperolehInformasiId" TEXT,
    "caraMemperolehSalinanInformasiId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PermohonanInformasiPublik_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JenisInformasiDiminta" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "JenisInformasiDiminta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaraMemperolehInformasi" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CaraMemperolehInformasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaraMemperolehSalinanInformasi" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CaraMemperolehSalinanInformasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormulirPermohonanKeberatan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "notelp" TEXT NOT NULL,
    "alasan" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "FormulirPermohonanKeberatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndeksKepuasanMasyarakat" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "kepuasan" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "IndeksKepuasanMasyarakat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrafikBerdasarkanJenisKelamin" (
    "id" TEXT NOT NULL,
    "perempuan" TEXT NOT NULL,
    "laki" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "GrafikBerdasarkanJenisKelamin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrafikBerdasarkanResponden" (
    "id" TEXT NOT NULL,
    "sangatbaik" TEXT NOT NULL,
    "baik" TEXT NOT NULL,
    "kurangbaik" TEXT NOT NULL,
    "tidakbaik" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "GrafikBerdasarkanResponden_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrafikBerdasarkanUmur" (
    "id" TEXT NOT NULL,
    "remaja" TEXT NOT NULL,
    "dewasa" TEXT NOT NULL,
    "orangtua" TEXT NOT NULL,
    "lansia" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "GrafikBerdasarkanUmur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileDesa" (
    "id" TEXT NOT NULL,
    "sejarah" TEXT NOT NULL,
    "visi" TEXT NOT NULL,
    "misi" TEXT NOT NULL,
    "lambang" TEXT NOT NULL,
    "maskot" TEXT NOT NULL,
    "profilPerbekelId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ProfileDesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfilPerbekel" (
    "id" TEXT NOT NULL,
    "biodata" TEXT NOT NULL,
    "pengalaman" TEXT NOT NULL,
    "pengalamanOrganisasi" TEXT NOT NULL,
    "programUnggulan" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ProfilPerbekel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KategoriBerita" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "KategoriBerita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PotensiDesa" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PotensiDesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TarifDanLayanan" (
    "id" TEXT NOT NULL,
    "layanan" TEXT NOT NULL,
    "tarif" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TarifDanLayanan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JadwalKegiatan" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "JadwalKegiatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InformasiJadwalKegiatan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tanggal" TEXT NOT NULL,
    "waktu" TEXT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "InformasiJadwalKegiatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeskripsiJadwalKegiatan" (
    "id" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DeskripsiJadwalKegiatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LayananJadwalKegiatan" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "LayananJadwalKegiatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyaratKetentuanJadwalKegiatan" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SyaratKetentuanJadwalKegiatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DokumenJadwalKegiatan" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DokumenJadwalKegiatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PendaftaranJadwalKegiatan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tanggal" TEXT NOT NULL,
    "namaOrangtua" TEXT NOT NULL,
    "nomor" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "catatan" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PendaftaranJadwalKegiatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GrafikKepuasan" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "jumlah" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "GrafikKepuasan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtikelKesehatan" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ArtikelKesehatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Introduction" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Introduction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Symptom" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Symptom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prevention" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Prevention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FirstAid" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "FirstAid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MythVsFact" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "mitos" TEXT NOT NULL,
    "fakta" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MythVsFact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoctorSign" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DoctorSign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_FasilitasKesehatanToInformasiUmum" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FasilitasKesehatanToInformasiUmum_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_FasilitasKesehatanToTarifDanLayanan" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_FasilitasKesehatanToTarifDanLayanan_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "FileStorage_name_key" ON "FileStorage"("name");

-- CreateIndex
CREATE UNIQUE INDEX "JenisInformasiDiminta_name_key" ON "JenisInformasiDiminta"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CaraMemperolehInformasi_name_key" ON "CaraMemperolehInformasi"("name");

-- CreateIndex
CREATE UNIQUE INDEX "CaraMemperolehSalinanInformasi_name_key" ON "CaraMemperolehSalinanInformasi"("name");

-- CreateIndex
CREATE UNIQUE INDEX "KategoriBerita_name_key" ON "KategoriBerita"("name");

-- CreateIndex
CREATE INDEX "_FasilitasKesehatanToInformasiUmum_B_index" ON "_FasilitasKesehatanToInformasiUmum"("B");

-- CreateIndex
CREATE INDEX "_FasilitasKesehatanToTarifDanLayanan_B_index" ON "_FasilitasKesehatanToTarifDanLayanan"("B");

-- AddForeignKey
ALTER TABLE "PermohonanInformasiPublik" ADD CONSTRAINT "PermohonanInformasiPublik_jenisInformasiDimintaId_fkey" FOREIGN KEY ("jenisInformasiDimintaId") REFERENCES "JenisInformasiDiminta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermohonanInformasiPublik" ADD CONSTRAINT "PermohonanInformasiPublik_caraMemperolehInformasiId_fkey" FOREIGN KEY ("caraMemperolehInformasiId") REFERENCES "CaraMemperolehInformasi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PermohonanInformasiPublik" ADD CONSTRAINT "PermohonanInformasiPublik_caraMemperolehSalinanInformasiId_fkey" FOREIGN KEY ("caraMemperolehSalinanInformasiId") REFERENCES "CaraMemperolehSalinanInformasi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileDesa" ADD CONSTRAINT "ProfileDesa_profilPerbekelId_fkey" FOREIGN KEY ("profilPerbekelId") REFERENCES "ProfilPerbekel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Berita" ADD CONSTRAINT "Berita_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Berita" ADD CONSTRAINT "Berita_kategoriBeritaId_fkey" FOREIGN KEY ("kategoriBeritaId") REFERENCES "KategoriBerita"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PotensiDesa" ADD CONSTRAINT "PotensiDesa_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FasilitasKesehatanToInformasiUmum" ADD CONSTRAINT "_FasilitasKesehatanToInformasiUmum_A_fkey" FOREIGN KEY ("A") REFERENCES "FasilitasKesehatan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FasilitasKesehatanToInformasiUmum" ADD CONSTRAINT "_FasilitasKesehatanToInformasiUmum_B_fkey" FOREIGN KEY ("B") REFERENCES "InformasiUmum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FasilitasKesehatanToTarifDanLayanan" ADD CONSTRAINT "_FasilitasKesehatanToTarifDanLayanan_A_fkey" FOREIGN KEY ("A") REFERENCES "FasilitasKesehatan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_FasilitasKesehatanToTarifDanLayanan" ADD CONSTRAINT "_FasilitasKesehatanToTarifDanLayanan_B_fkey" FOREIGN KEY ("B") REFERENCES "TarifDanLayanan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
