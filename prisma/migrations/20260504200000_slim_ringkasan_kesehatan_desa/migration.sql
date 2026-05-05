-- Drop redundant columns from RingkasanKesehatanDesa.
-- These values are auto-derived live from IbuHamil + Balita tables (see stats endpoint).
-- Only targetStuntingPct is a policy config that needs to be stored.
ALTER TABLE "RingkasanKesehatanDesa" DROP COLUMN "ibuHamilAkh";
ALTER TABLE "RingkasanKesehatanDesa" DROP COLUMN "balitaTerdaftar";
ALTER TABLE "RingkasanKesehatanDesa" DROP COLUMN "alertStunting";
ALTER TABLE "RingkasanKesehatanDesa" DROP COLUMN "imunisasiLengkapPct";
ALTER TABLE "RingkasanKesehatanDesa" DROP COLUMN "pemeriksaanRutinPct";
ALTER TABLE "RingkasanKesehatanDesa" DROP COLUMN "giziBaikPct";
