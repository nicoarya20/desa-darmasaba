/*
  Warnings:

  - You are about to drop the column `silpa` on the `Pembiayaan` table. All the data in the column will be lost.
  - Added the required column `name` to the `Pembiayaan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `Pembiayaan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pembiayaan" DROP COLUMN "silpa",
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "value" INTEGER NOT NULL;
