-- Telemetri giliran Jenna untuk developer console (tab Penggunaan & Log Error).
-- Semua kolom nullable: baris lama tetap valid tanpa backfill.

-- AlterTable
ALTER TABLE "JennaMessage" ADD COLUMN     "latencyMs" INTEGER,
ADD COLUMN     "providerSlot" TEXT,
ADD COLUMN     "model" TEXT,
ADD COLUMN     "errorDetail" TEXT;
