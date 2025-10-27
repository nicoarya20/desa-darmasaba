/*
  Warnings:

  - You are about to drop the column `pelaksanaanPembangunan` on the `Belanja` table. All the data in the column will be lost.
  - You are about to drop the column `pemberdayaanMasyarakat` on the `Belanja` table. All the data in the column will be lost.
  - You are about to drop the column `pembinaanMasyarakat` on the `Belanja` table. All the data in the column will be lost.
  - You are about to drop the column `penanggulanganBencana` on the `Belanja` table. All the data in the column will be lost.
  - You are about to drop the column `penyelenggaraan` on the `Belanja` table. All the data in the column will be lost.
  - Added the required column `name` to the `Belanja` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Belanja` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `Belanja` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total` to the `Pendapatan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Pendapatan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Belanja" DROP COLUMN "pelaksanaanPembangunan",
DROP COLUMN "pemberdayaanMasyarakat",
DROP COLUMN "pembinaanMasyarakat",
DROP COLUMN "penanggulanganBencana",
DROP COLUMN "penyelenggaraan",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "value" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Pendapatan" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "total" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;
