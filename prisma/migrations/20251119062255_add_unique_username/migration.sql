/*
  Warnings:

  - You are about to drop the column `kelahiranKasar` on the `DataKematian_Kelahiran` table. All the data in the column will be lost.
  - You are about to drop the column `kematianBayi` on the `DataKematian_Kelahiran` table. All the data in the column will be lost.
  - You are about to drop the column `kematianKasar` on the `DataKematian_Kelahiran` table. All the data in the column will be lost.
  - You are about to drop the column `tahun` on the `DataKematian_Kelahiran` table. All the data in the column will be lost.
  - You are about to drop the column `jumlah` on the `GrafikKepuasan` table. All the data in the column will be lost.
  - You are about to drop the column `label` on the `GrafikKepuasan` table. All the data in the column will be lost.
  - You are about to drop the column `imageId` on the `KolaborasiInovasi` table. All the data in the column will be lost.
  - You are about to drop the column `imageId` on the `KontakDaruratKeamanan` table. All the data in the column will be lost.
  - You are about to drop the column `imageId` on the `KontakItem` table. All the data in the column will be lost.
  - You are about to drop the column `kategoriId` on the `KontakItem` table. All the data in the column will be lost.
  - You are about to drop the column `programKeamananId` on the `PencegahanKriminalitas` table. All the data in the column will be lost.
  - You are about to drop the column `tipsKeamananId` on the `PencegahanKriminalitas` table. All the data in the column will be lost.
  - You are about to drop the column `videoKeamananId` on the `PencegahanKriminalitas` table. All the data in the column will be lost.
  - You are about to drop the column `kategori` on the `PotensiDesa` table. All the data in the column will be lost.
  - You are about to drop the column `ikonUrl` on the `ProgramKemiskinan` table. All the data in the column will be lost.
  - You are about to drop the `ProgramKeamanan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TipsKeamanan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VideoKeamanan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `hubungan_organisasi` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pegawai` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `posisi_organisasi` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `struktur_organisasi` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `kelahiranId` to the `DataKematian_Kelahiran` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kematianId` to the `DataKematian_Kelahiran` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `FileStorage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `alamat` to the `GrafikKepuasan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jenisKelamin` to the `GrafikKepuasan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nama` to the `GrafikKepuasan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `penyakit` to the `GrafikKepuasan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tanggal` to the `GrafikKepuasan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `whatsapp` to the `KontakDarurat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `icon` to the `KontakDaruratKeamanan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kategoriId` to the `KontakDaruratKeamanan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `icon` to the `KontakItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `notelp` to the `LowonganPekerjaan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `MediaSosial` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kontak` to the `PasarDesa` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deskripsi` to the `PencegahanKriminalitas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deskripsiSingkat` to the `PencegahanKriminalitas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `judul` to the `PencegahanKriminalitas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `linkVideo` to the `PencegahanKriminalitas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `jadwalPelayanan` to the `Posyandu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `icon` to the `ProgramKemiskinan` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "JenisKelamin" AS ENUM ('LAKI_LAKI', 'PEREMPUAN');

-- CreateEnum
CREATE TYPE "Agama" AS ENUM ('ISLAM', 'KRISTEN_PROTESTAN', 'KRISTEN_KATOLIK', 'HINDU', 'BUDDHA', 'KONGHUCU', 'LAINNYA');

-- CreateEnum
CREATE TYPE "StatusPernikahan" AS ENUM ('BELUM_MENIKAH', 'MENIKAH', 'JANDA_DUDA');

-- CreateEnum
CREATE TYPE "UkuranBaju" AS ENUM ('S', 'M', 'L', 'XL', 'XXL', 'LAINNYA');

-- CreateEnum
CREATE TYPE "StatusPeminjaman" AS ENUM ('Dipinjam', 'Dikembalikan', 'Terlambat', 'Dibatalkan');

-- DropForeignKey
ALTER TABLE "JadwalKegiatan" DROP CONSTRAINT "JadwalKegiatan_pendaftaranJadwalKegiatanId_fkey";

-- DropForeignKey
ALTER TABLE "KolaborasiInovasi" DROP CONSTRAINT "KolaborasiInovasi_imageId_fkey";

-- DropForeignKey
ALTER TABLE "KontakDaruratKeamanan" DROP CONSTRAINT "KontakDaruratKeamanan_imageId_fkey";

-- DropForeignKey
ALTER TABLE "KontakItem" DROP CONSTRAINT "KontakItem_imageId_fkey";

-- DropForeignKey
ALTER TABLE "KontakItem" DROP CONSTRAINT "KontakItem_kategoriId_fkey";

-- DropForeignKey
ALTER TABLE "MediaSosial" DROP CONSTRAINT "MediaSosial_imageId_fkey";

-- DropForeignKey
ALTER TABLE "PelayananSuratKeterangan" DROP CONSTRAINT "PelayananSuratKeterangan_imageId_fkey";

-- DropForeignKey
ALTER TABLE "PencegahanKriminalitas" DROP CONSTRAINT "PencegahanKriminalitas_programKeamananId_fkey";

-- DropForeignKey
ALTER TABLE "PencegahanKriminalitas" DROP CONSTRAINT "PencegahanKriminalitas_tipsKeamananId_fkey";

-- DropForeignKey
ALTER TABLE "PencegahanKriminalitas" DROP CONSTRAINT "PencegahanKriminalitas_videoKeamananId_fkey";

-- DropForeignKey
ALTER TABLE "Penghargaan" DROP CONSTRAINT "Penghargaan_imageId_fkey";

-- DropForeignKey
ALTER TABLE "PotensiDesa" DROP CONSTRAINT "PotensiDesa_imageId_fkey";

-- DropForeignKey
ALTER TABLE "hubungan_organisasi" DROP CONSTRAINT "hubungan_organisasi_atasanId_fkey";

-- DropForeignKey
ALTER TABLE "hubungan_organisasi" DROP CONSTRAINT "hubungan_organisasi_bawahanId_fkey";

-- DropForeignKey
ALTER TABLE "pegawai" DROP CONSTRAINT "pegawai_imageId_fkey";

-- DropForeignKey
ALTER TABLE "pegawai" DROP CONSTRAINT "pegawai_posisiId_fkey";

-- DropForeignKey
ALTER TABLE "struktur_organisasi" DROP CONSTRAINT "struktur_organisasi_hubunganOrganisasiId_fkey";

-- DropForeignKey
ALTER TABLE "struktur_organisasi" DROP CONSTRAINT "struktur_organisasi_pegawaiId_fkey";

-- DropForeignKey
ALTER TABLE "struktur_organisasi" DROP CONSTRAINT "struktur_organisasi_posisiOrganisasiId_fkey";

-- AlterTable
ALTER TABLE "ArtikelKesehatan" ADD COLUMN     "imageId" TEXT;

-- AlterTable
ALTER TABLE "DataKematian_Kelahiran" DROP COLUMN "kelahiranKasar",
DROP COLUMN "kematianBayi",
DROP COLUMN "kematianKasar",
DROP COLUMN "tahun",
ADD COLUMN     "kelahiranId" TEXT NOT NULL,
ADD COLUMN     "kematianId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FileStorage" ADD COLUMN     "category" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "GrafikKepuasan" DROP COLUMN "jumlah",
DROP COLUMN "label",
ADD COLUMN     "alamat" TEXT NOT NULL,
ADD COLUMN     "jenisKelamin" TEXT NOT NULL,
ADD COLUMN     "nama" TEXT NOT NULL,
ADD COLUMN     "penyakit" TEXT NOT NULL,
ADD COLUMN     "tanggal" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "JadwalKegiatan" ALTER COLUMN "pendaftaranJadwalKegiatanId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "KolaborasiInovasi" DROP COLUMN "imageId";

-- AlterTable
ALTER TABLE "KontakDarurat" ADD COLUMN     "whatsapp" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "KontakDaruratKeamanan" DROP COLUMN "imageId",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "icon" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "kategoriId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "KontakItem" DROP COLUMN "imageId",
DROP COLUMN "kategoriId",
ADD COLUMN     "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "icon" TEXT NOT NULL,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "LaporanPublik" ADD COLUMN     "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "status" SET DEFAULT 'Proses';

-- AlterTable
ALTER TABLE "LowonganPekerjaan" ADD COLUMN     "notelp" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "MediaSosial" ADD COLUMN     "name" TEXT NOT NULL,
ALTER COLUMN "imageId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PasarDesa" ADD COLUMN     "kontak" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PelayananSuratKeterangan" ADD COLUMN     "image2Id" TEXT,
ALTER COLUMN "imageId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "PencegahanKriminalitas" DROP COLUMN "programKeamananId",
DROP COLUMN "tipsKeamananId",
DROP COLUMN "videoKeamananId",
ADD COLUMN     "deskripsi" TEXT NOT NULL,
ADD COLUMN     "deskripsiSingkat" TEXT NOT NULL,
ADD COLUMN     "judul" TEXT NOT NULL,
ADD COLUMN     "linkVideo" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Penghargaan" ALTER COLUMN "imageId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Posyandu" ADD COLUMN     "jadwalPelayanan" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PotensiDesa" DROP COLUMN "kategori",
ADD COLUMN     "kategoriId" TEXT,
ALTER COLUMN "imageId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ProgramKemiskinan" DROP COLUMN "ikonUrl",
ADD COLUMN     "icon" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "StrukturPPID" ADD COLUMN     "pegawaiPPIDId" TEXT,
ADD COLUMN     "posisiOrganisasiPPIDId" TEXT;

-- DropTable
DROP TABLE "ProgramKeamanan";

-- DropTable
DROP TABLE "TipsKeamanan";

-- DropTable
DROP TABLE "VideoKeamanan";

-- DropTable
DROP TABLE "hubungan_organisasi";

-- DropTable
DROP TABLE "pegawai";

-- DropTable
DROP TABLE "posisi_organisasi";

-- DropTable
DROP TABLE "struktur_organisasi";

-- CreateTable
CREATE TABLE "DesaAntiKorupsi" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "kategoriId" TEXT NOT NULL,
    "fileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DesaAntiKorupsi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KategoriDesaAntiKorupsi" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "KategoriDesaAntiKorupsi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SdgsDesa" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "jumlah" TEXT NOT NULL,
    "imageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SdgsDesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "APBDes" (
    "id" TEXT NOT NULL,
    "tahun" INTEGER,
    "name" TEXT,
    "deskripsi" TEXT,
    "jumlah" TEXT,
    "imageId" TEXT,
    "fileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "APBDes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "APBDesItem" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "uraian" TEXT NOT NULL,
    "anggaran" DOUBLE PRECISION NOT NULL,
    "realisasi" DOUBLE PRECISION NOT NULL,
    "selisih" DOUBLE PRECISION NOT NULL,
    "persentase" DOUBLE PRECISION NOT NULL,
    "tipe" TEXT,
    "level" INTEGER NOT NULL,
    "parentId" TEXT,
    "apbdesId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "APBDesItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrestasiDesa" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "kategoriId" TEXT NOT NULL,
    "imageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PrestasiDesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KategoriPrestasiDesa" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "KategoriPrestasiDesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Responden" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tanggal" DATE NOT NULL,
    "jenisKelaminId" TEXT NOT NULL,
    "ratingId" TEXT NOT NULL,
    "kelompokUmurId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Responden_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JenisKelaminResponden" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "JenisKelaminResponden_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PilihanRatingResponden" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PilihanRatingResponden_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UmurResponden" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UmurResponden_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PosisiOrganisasiPPID" (
    "id" TEXT NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "deskripsi" TEXT,
    "hierarki" INTEGER NOT NULL,
    "parentId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PosisiOrganisasiPPID_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PegawaiPPID" (
    "id" TEXT NOT NULL,
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

    CONSTRAINT "PegawaiPPID_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrukturOrganisasiPPID" (
    "id" TEXT NOT NULL,
    "posisiOrganisasiId" VARCHAR(50) NOT NULL,
    "pegawaiId" TEXT NOT NULL,
    "hubunganOrganisasiId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "StrukturOrganisasiPPID_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PerbekelDariMasaKeMasa" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "periode" TEXT NOT NULL,
    "imageId" TEXT,
    "daerah" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PerbekelDariMasaKeMasa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KategoriPotensi" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "KategoriPotensi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AjukanPermohonan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "nomorKk" TEXT NOT NULL,
    "kategoriId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AjukanPermohonan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kelahiran" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "jenisKelamin" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Kelahiran_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kematian" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "jenisKelamin" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "penyebab" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Kematian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KontakDaruratToItem" (
    "id" TEXT NOT NULL,
    "kontakDaruratId" TEXT NOT NULL,
    "kontakItemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KontakDaruratToItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrukturBumDes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "posisiOrganisasiBumDesId" TEXT,
    "pegawaiBumDesId" TEXT,

    CONSTRAINT "StrukturBumDes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PosisiOrganisasiBumDes" (
    "id" TEXT NOT NULL,
    "nama" VARCHAR(100) NOT NULL,
    "deskripsi" TEXT,
    "hierarki" INTEGER NOT NULL,
    "parentId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PosisiOrganisasiBumDes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PegawaiBumDes" (
    "id" TEXT NOT NULL,
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

    CONSTRAINT "PegawaiBumDes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StrukturOrganisasiBumDes" (
    "id" TEXT NOT NULL,
    "posisiOrganisasiId" VARCHAR(50) NOT NULL,
    "pegawaiId" TEXT NOT NULL,
    "hubunganOrganisasiId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "StrukturOrganisasiBumDes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MitraKolaborasi" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MitraKolaborasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JenjangPendidikan" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "JenjangPendidikan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lembaga" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jenjangId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Lembaga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Siswa" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "lembagaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Siswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pengajar" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "lembagaId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Pengajar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeunggulanProgram" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "KeunggulanProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeasiswaPendaftar" (
    "id" TEXT NOT NULL,
    "namaLengkap" TEXT NOT NULL,
    "nis" TEXT,
    "kelas" TEXT,
    "jenisKelamin" "JenisKelamin" NOT NULL,
    "alamatDomisili" TEXT,
    "tempatLahir" TEXT NOT NULL,
    "tanggalLahir" TIMESTAMP(3) NOT NULL,
    "namaOrtu" TEXT,
    "nik" TEXT NOT NULL,
    "pekerjaanOrtu" TEXT,
    "penghasilan" TEXT,
    "noHp" TEXT NOT NULL,
    "kewarganegaraan" TEXT,
    "agama" "Agama",
    "alamatKTP" TEXT,
    "email" TEXT,
    "statusPernikahan" "StatusPernikahan",
    "ukuranBaju" "UkuranBaju",
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BeasiswaPendaftar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TujuanProgram" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TujuanProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramUnggulan" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ProgramUnggulan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TujuanBimbinganBelajarDesa" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TujuanBimbinganBelajarDesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LokasiJadwalBimbinganBelajarDesa" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "LokasiJadwalBimbinganBelajarDesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FasilitasBimbinganBelajarDesa" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "FasilitasBimbinganBelajarDesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TujuanPendidikanNonFormal" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TujuanPendidikanNonFormal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TempatKegiatan" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "TempatKegiatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JenisProgramYangDiselenggarakan" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "JenisProgramYangDiselenggarakan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataPerpustakaan" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "kategoriId" TEXT NOT NULL,
    "imageId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DataPerpustakaan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KategoriBuku" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "KategoriBuku_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PeminjamanBuku" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "noTelp" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "bukuId" TEXT NOT NULL,
    "tanggalPinjam" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "batasKembali" TIMESTAMP(3) NOT NULL,
    "tanggalKembali" TIMESTAMP(3),
    "status" "StatusPeminjaman" NOT NULL DEFAULT 'Dipinjam',
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PeminjamanBuku_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "nomor" TEXT NOT NULL,
    "roleId" TEXT NOT NULL DEFAULT '1',
    "instansi" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "permissions" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KodeOtp" (
    "id" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nomor" TEXT NOT NULL,
    "otp" INTEGER NOT NULL,

    CONSTRAINT "KodeOtp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataPendidikan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "jumlah" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DataPendidikan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DesaAntiKorupsi_name_key" ON "DesaAntiKorupsi"("name");

-- CreateIndex
CREATE UNIQUE INDEX "KategoriDesaAntiKorupsi_name_key" ON "KategoriDesaAntiKorupsi"("name");

-- CreateIndex
CREATE INDEX "APBDesItem_kode_idx" ON "APBDesItem"("kode");

-- CreateIndex
CREATE INDEX "APBDesItem_level_idx" ON "APBDesItem"("level");

-- CreateIndex
CREATE INDEX "APBDesItem_apbdesId_idx" ON "APBDesItem"("apbdesId");

-- CreateIndex
CREATE UNIQUE INDEX "KategoriPrestasiDesa_name_key" ON "KategoriPrestasiDesa"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Responden_name_key" ON "Responden"("name");

-- CreateIndex
CREATE UNIQUE INDEX "JenisKelaminResponden_name_key" ON "JenisKelaminResponden"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PilihanRatingResponden_name_key" ON "PilihanRatingResponden"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UmurResponden_name_key" ON "UmurResponden"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PegawaiPPID_email_key" ON "PegawaiPPID"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PegawaiBumDes_email_key" ON "PegawaiBumDes"("email");

-- CreateIndex
CREATE UNIQUE INDEX "BeasiswaPendaftar_nik_key" ON "BeasiswaPendaftar"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "BeasiswaPendaftar_email_key" ON "BeasiswaPendaftar"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_nomor_key" ON "User"("nomor");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "permissions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserSession_userId_key" ON "UserSession"("userId");

-- AddForeignKey
ALTER TABLE "MediaSosial" ADD CONSTRAINT "MediaSosial_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesaAntiKorupsi" ADD CONSTRAINT "DesaAntiKorupsi_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "KategoriDesaAntiKorupsi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesaAntiKorupsi" ADD CONSTRAINT "DesaAntiKorupsi_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SdgsDesa" ADD CONSTRAINT "SdgsDesa_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "APBDes" ADD CONSTRAINT "APBDes_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "APBDes" ADD CONSTRAINT "APBDes_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "APBDesItem" ADD CONSTRAINT "APBDesItem_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "APBDesItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "APBDesItem" ADD CONSTRAINT "APBDesItem_apbdesId_fkey" FOREIGN KEY ("apbdesId") REFERENCES "APBDes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrestasiDesa" ADD CONSTRAINT "PrestasiDesa_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "KategoriPrestasiDesa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrestasiDesa" ADD CONSTRAINT "PrestasiDesa_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Responden" ADD CONSTRAINT "Responden_jenisKelaminId_fkey" FOREIGN KEY ("jenisKelaminId") REFERENCES "JenisKelaminResponden"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Responden" ADD CONSTRAINT "Responden_ratingId_fkey" FOREIGN KEY ("ratingId") REFERENCES "PilihanRatingResponden"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Responden" ADD CONSTRAINT "Responden_kelompokUmurId_fkey" FOREIGN KEY ("kelompokUmurId") REFERENCES "UmurResponden"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrukturPPID" ADD CONSTRAINT "StrukturPPID_posisiOrganisasiPPIDId_fkey" FOREIGN KEY ("posisiOrganisasiPPIDId") REFERENCES "PosisiOrganisasiPPID"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrukturPPID" ADD CONSTRAINT "StrukturPPID_pegawaiPPIDId_fkey" FOREIGN KEY ("pegawaiPPIDId") REFERENCES "PegawaiPPID"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosisiOrganisasiPPID" ADD CONSTRAINT "PosisiOrganisasiPPID_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "PosisiOrganisasiPPID"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PegawaiPPID" ADD CONSTRAINT "PegawaiPPID_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PegawaiPPID" ADD CONSTRAINT "PegawaiPPID_posisiId_fkey" FOREIGN KEY ("posisiId") REFERENCES "PosisiOrganisasiPPID"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrukturOrganisasiPPID" ADD CONSTRAINT "StrukturOrganisasiPPID_posisiOrganisasiId_fkey" FOREIGN KEY ("posisiOrganisasiId") REFERENCES "PosisiOrganisasiPPID"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrukturOrganisasiPPID" ADD CONSTRAINT "StrukturOrganisasiPPID_pegawaiId_fkey" FOREIGN KEY ("pegawaiId") REFERENCES "PegawaiPPID"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PerbekelDariMasaKeMasa" ADD CONSTRAINT "PerbekelDariMasaKeMasa_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PotensiDesa" ADD CONSTRAINT "PotensiDesa_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "KategoriPotensi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PotensiDesa" ADD CONSTRAINT "PotensiDesa_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PelayananSuratKeterangan" ADD CONSTRAINT "PelayananSuratKeterangan_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PelayananSuratKeterangan" ADD CONSTRAINT "PelayananSuratKeterangan_image2Id_fkey" FOREIGN KEY ("image2Id") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AjukanPermohonan" ADD CONSTRAINT "AjukanPermohonan_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "PelayananSuratKeterangan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Penghargaan" ADD CONSTRAINT "Penghargaan_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JadwalKegiatan" ADD CONSTRAINT "JadwalKegiatan_pendaftaranJadwalKegiatanId_fkey" FOREIGN KEY ("pendaftaranJadwalKegiatanId") REFERENCES "PendaftaranJadwalKegiatan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataKematian_Kelahiran" ADD CONSTRAINT "DataKematian_Kelahiran_kematianId_fkey" FOREIGN KEY ("kematianId") REFERENCES "Kematian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataKematian_Kelahiran" ADD CONSTRAINT "DataKematian_Kelahiran_kelahiranId_fkey" FOREIGN KEY ("kelahiranId") REFERENCES "Kelahiran"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtikelKesehatan" ADD CONSTRAINT "ArtikelKesehatan_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KontakDaruratKeamanan" ADD CONSTRAINT "KontakDaruratKeamanan_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "KontakItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KontakDaruratToItem" ADD CONSTRAINT "KontakDaruratToItem_kontakDaruratId_fkey" FOREIGN KEY ("kontakDaruratId") REFERENCES "KontakDaruratKeamanan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KontakDaruratToItem" ADD CONSTRAINT "KontakDaruratToItem_kontakItemId_fkey" FOREIGN KEY ("kontakItemId") REFERENCES "KontakItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrukturBumDes" ADD CONSTRAINT "StrukturBumDes_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrukturBumDes" ADD CONSTRAINT "StrukturBumDes_posisiOrganisasiBumDesId_fkey" FOREIGN KEY ("posisiOrganisasiBumDesId") REFERENCES "PosisiOrganisasiBumDes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrukturBumDes" ADD CONSTRAINT "StrukturBumDes_pegawaiBumDesId_fkey" FOREIGN KEY ("pegawaiBumDesId") REFERENCES "PegawaiBumDes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PosisiOrganisasiBumDes" ADD CONSTRAINT "PosisiOrganisasiBumDes_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "PosisiOrganisasiBumDes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PegawaiBumDes" ADD CONSTRAINT "PegawaiBumDes_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PegawaiBumDes" ADD CONSTRAINT "PegawaiBumDes_posisiId_fkey" FOREIGN KEY ("posisiId") REFERENCES "PosisiOrganisasiBumDes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrukturOrganisasiBumDes" ADD CONSTRAINT "StrukturOrganisasiBumDes_posisiOrganisasiId_fkey" FOREIGN KEY ("posisiOrganisasiId") REFERENCES "PosisiOrganisasiBumDes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StrukturOrganisasiBumDes" ADD CONSTRAINT "StrukturOrganisasiBumDes_pegawaiId_fkey" FOREIGN KEY ("pegawaiId") REFERENCES "PegawaiBumDes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MitraKolaborasi" ADD CONSTRAINT "MitraKolaborasi_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lembaga" ADD CONSTRAINT "Lembaga_jenjangId_fkey" FOREIGN KEY ("jenjangId") REFERENCES "JenjangPendidikan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Siswa" ADD CONSTRAINT "Siswa_lembagaId_fkey" FOREIGN KEY ("lembagaId") REFERENCES "Lembaga"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pengajar" ADD CONSTRAINT "Pengajar_lembagaId_fkey" FOREIGN KEY ("lembagaId") REFERENCES "Lembaga"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataPerpustakaan" ADD CONSTRAINT "DataPerpustakaan_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "KategoriBuku"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataPerpustakaan" ADD CONSTRAINT "DataPerpustakaan_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeminjamanBuku" ADD CONSTRAINT "PeminjamanBuku_bukuId_fkey" FOREIGN KEY ("bukuId") REFERENCES "DataPerpustakaan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
