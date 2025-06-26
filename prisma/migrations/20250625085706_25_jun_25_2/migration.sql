/*
  Warnings:

  - The primary key for the `DataKematian_Kelahiran` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `DataKematian_Kelahiran` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `GrafikKepuasan` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `GrafikKepuasan` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[uuid]` on the table `DataKematian_Kelahiran` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[uuid]` on the table `GrafikKepuasan` will be added. If there are existing duplicate values, this will fail.
  - The required column `uuid` was added to the `DataKematian_Kelahiran` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - The required column `uuid` was added to the `GrafikKepuasan` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "DataKematian_Kelahiran" DROP CONSTRAINT "DataKematian_Kelahiran_pkey",
ADD COLUMN     "uuid" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "DataKematian_Kelahiran_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "GrafikKepuasan" DROP CONSTRAINT "GrafikKepuasan_pkey",
ADD COLUMN     "uuid" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "GrafikKepuasan_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "DataKematian_Kelahiran_uuid_key" ON "DataKematian_Kelahiran"("uuid");

-- CreateIndex
CREATE UNIQUE INDEX "GrafikKepuasan_uuid_key" ON "GrafikKepuasan"("uuid");
