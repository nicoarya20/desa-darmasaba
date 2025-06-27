/*
  Warnings:

  - The primary key for the `DataKematian_Kelahiran` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `uuid` on the `DataKematian_Kelahiran` table. All the data in the column will be lost.
  - The primary key for the `GrafikKepuasan` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `uuid` on the `GrafikKepuasan` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `DataKematian_Kelahiran` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `GrafikKepuasan` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `doctorSignId` to the `ArtikelKesehatan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstAidId` to the `ArtikelKesehatan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `introductionId` to the `ArtikelKesehatan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mythVsFactId` to the `ArtikelKesehatan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `preventionId` to the `ArtikelKesehatan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `symptomId` to the `ArtikelKesehatan` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "DataKematian_Kelahiran_uuid_key";

-- DropIndex
DROP INDEX "GrafikKepuasan_uuid_key";

-- AlterTable
ALTER TABLE "ArtikelKesehatan" ADD COLUMN     "doctorSignId" TEXT NOT NULL,
ADD COLUMN     "firstAidId" TEXT NOT NULL,
ADD COLUMN     "introductionId" TEXT NOT NULL,
ADD COLUMN     "mythVsFactId" TEXT NOT NULL,
ADD COLUMN     "preventionId" TEXT NOT NULL,
ADD COLUMN     "symptomId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "DataKematian_Kelahiran" DROP CONSTRAINT "DataKematian_Kelahiran_pkey",
DROP COLUMN "uuid",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT;
DROP SEQUENCE "DataKematian_Kelahiran_id_seq";

-- AlterTable
ALTER TABLE "GrafikKepuasan" DROP CONSTRAINT "GrafikKepuasan_pkey",
DROP COLUMN "uuid",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT;
DROP SEQUENCE "GrafikKepuasan_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "DataKematian_Kelahiran_id_key" ON "DataKematian_Kelahiran"("id");

-- CreateIndex
CREATE UNIQUE INDEX "GrafikKepuasan_id_key" ON "GrafikKepuasan"("id");

-- AddForeignKey
ALTER TABLE "ArtikelKesehatan" ADD CONSTRAINT "ArtikelKesehatan_introductionId_fkey" FOREIGN KEY ("introductionId") REFERENCES "Introduction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtikelKesehatan" ADD CONSTRAINT "ArtikelKesehatan_symptomId_fkey" FOREIGN KEY ("symptomId") REFERENCES "Symptom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtikelKesehatan" ADD CONSTRAINT "ArtikelKesehatan_preventionId_fkey" FOREIGN KEY ("preventionId") REFERENCES "Prevention"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtikelKesehatan" ADD CONSTRAINT "ArtikelKesehatan_firstAidId_fkey" FOREIGN KEY ("firstAidId") REFERENCES "FirstAid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtikelKesehatan" ADD CONSTRAINT "ArtikelKesehatan_mythVsFactId_fkey" FOREIGN KEY ("mythVsFactId") REFERENCES "MythVsFact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtikelKesehatan" ADD CONSTRAINT "ArtikelKesehatan_doctorSignId_fkey" FOREIGN KEY ("doctorSignId") REFERENCES "DoctorSign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
