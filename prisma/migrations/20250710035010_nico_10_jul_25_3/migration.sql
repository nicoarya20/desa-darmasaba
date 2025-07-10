/*
  Warnings:

  - You are about to drop the column `total` on the `Belanja` table. All the data in the column will be lost.
  - You are about to drop the column `total` on the `Pendapatan` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Belanja" DROP COLUMN "total";

-- AlterTable
ALTER TABLE "Pendapatan" DROP COLUMN "total";
