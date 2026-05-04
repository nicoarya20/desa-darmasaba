-- CreateEnum
CREATE TYPE "IbuHamilStatus" AS ENUM ('AKTIF', 'MELAHIRKAN', 'KEGUGURAN', 'NONAKTIF');

-- CreateEnum
CREATE TYPE "JenisKelaminBalita" AS ENUM ('L', 'P');

-- CreateEnum
CREATE TYPE "StatusStunting" AS ENUM ('NORMAL', 'ALERT', 'STUNTING');

-- CreateTable
CREATE TABLE "IbuHamil" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "nik" TEXT,
    "usiaKehamilan" INTEGER NOT NULL DEFAULT 0,
    "hpht" TIMESTAMP(3),
    "taksiranLahir" TIMESTAMP(3),
    "alamat" TEXT,
    "noHp" TEXT,
    "catatan" TEXT,
    "posyanduId" TEXT,
    "status" "IbuHamilStatus" NOT NULL DEFAULT 'AKTIF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "IbuHamil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Balita" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "nik" TEXT,
    "tanggalLahir" TIMESTAMP(3) NOT NULL,
    "jenisKelamin" "JenisKelaminBalita" NOT NULL,
    "beratBadanKg" DOUBLE PRECISION,
    "tinggiBadanCm" DOUBLE PRECISION,
    "namaOrtu" TEXT,
    "alamat" TEXT,
    "noHpOrtu" TEXT,
    "posyanduId" TEXT,
    "imunisasiLengkap" BOOLEAN NOT NULL DEFAULT false,
    "giziBaik" BOOLEAN NOT NULL DEFAULT true,
    "pemeriksaanRutin" BOOLEAN NOT NULL DEFAULT true,
    "statusStunting" "StatusStunting" NOT NULL DEFAULT 'NORMAL',
    "catatan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Balita_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "IbuHamil" ADD CONSTRAINT "IbuHamil_posyanduId_fkey" FOREIGN KEY ("posyanduId") REFERENCES "Posyandu"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Balita" ADD CONSTRAINT "Balita_posyanduId_fkey" FOREIGN KEY ("posyanduId") REFERENCES "Posyandu"("id") ON DELETE SET NULL ON UPDATE CASCADE;
