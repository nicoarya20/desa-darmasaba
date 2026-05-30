-- AlterTable
ALTER TABLE "GrafikKepuasan" ADD COLUMN     "banjarId" TEXT;

-- AddForeignKey
ALTER TABLE "GrafikKepuasan" ADD CONSTRAINT "GrafikKepuasan_banjarId_fkey" FOREIGN KEY ("banjarId") REFERENCES "Banjar"("id") ON DELETE SET NULL ON UPDATE CASCADE;
