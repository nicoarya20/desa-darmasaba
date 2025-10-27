/*
  Warnings:

  - The primary key for the `GrafikKepuasan` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "GrafikKepuasan" DROP CONSTRAINT "GrafikKepuasan_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "GrafikKepuasan_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "GrafikKepuasan_id_seq";
