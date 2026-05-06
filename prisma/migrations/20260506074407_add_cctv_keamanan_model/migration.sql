-- CreateEnum
CREATE TYPE "StatusCctv" AS ENUM ('Online', 'Offline');

-- AlterEnum
ALTER TYPE "StatusLaporan" ADD VALUE 'Baru';

-- CreateTable
CREATE TABLE "CctvKeamanan" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "status" "StatusCctv" NOT NULL DEFAULT 'Online',
    "lastActive" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CctvKeamanan_pkey" PRIMARY KEY ("id")
);
