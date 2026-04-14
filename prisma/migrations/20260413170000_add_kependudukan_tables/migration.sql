-- CreateEnum
CREATE TYPE "JenisMigrasi" AS ENUM ('MASUK', 'KELUAR');

-- CreateTable
CREATE TABLE "DataBanjar" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "penduduk" INTEGER NOT NULL,
    "kk" INTEGER NOT NULL,
    "miskin" INTEGER NOT NULL,
    "tahun" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DataBanjar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DistribusiAgama" (
    "id" TEXT NOT NULL,
    "agama" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "tahun" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DistribusiAgama_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DistribusiUmur" (
    "id" TEXT NOT NULL,
    "rentangUmur" TEXT NOT NULL,
    "jumlah" INTEGER NOT NULL,
    "tahun" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DistribusiUmur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MigrasiPenduduk" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jenis" "JenisMigrasi" NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "asal" TEXT,
    "tujuan" TEXT,
    "alasan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "MigrasiPenduduk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DinamikaPenduduk" (
    "id" TEXT NOT NULL,
    "tahun" INTEGER NOT NULL,
    "kelahiran" INTEGER NOT NULL,
    "kematian" INTEGER NOT NULL,
    "masuk" INTEGER NOT NULL,
    "keluar" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "DinamikaPenduduk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DataBanjar_tahun_idx" ON "DataBanjar"("tahun");

-- CreateIndex
CREATE INDEX "DataBanjar_isActive_idx" ON "DataBanjar"("isActive");

-- CreateIndex
CREATE INDEX "DistribusiAgama_tahun_idx" ON "DistribusiAgama"("tahun");

-- CreateIndex
CREATE INDEX "DistribusiAgama_isActive_idx" ON "DistribusiAgama"("isActive");

-- CreateIndex
CREATE INDEX "DistribusiUmur_tahun_idx" ON "DistribusiUmur"("tahun");

-- CreateIndex
CREATE INDEX "DistribusiUmur_isActive_idx" ON "DistribusiUmur"("isActive");

-- CreateIndex
CREATE INDEX "MigrasiPenduduk_tanggal_idx" ON "MigrasiPenduduk"("tanggal");

-- CreateIndex
CREATE INDEX "MigrasiPenduduk_isActive_idx" ON "MigrasiPenduduk"("isActive");

-- CreateIndex
CREATE INDEX "DinamikaPenduduk_tahun_idx" ON "DinamikaPenduduk"("tahun");

-- CreateIndex
CREATE INDEX "DinamikaPenduduk_isActive_idx" ON "DinamikaPenduduk"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "DinamikaPenduduk_tahun_key" ON "DinamikaPenduduk"("tahun");
