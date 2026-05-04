-- AlterTable
ALTER TABLE "RingkasanKesehatanDesa"
ADD COLUMN "imunisasiLengkapPct" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "pemeriksaanRutinPct" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "giziBaikPct"         INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "targetStuntingPct"   INTEGER NOT NULL DEFAULT 0;
