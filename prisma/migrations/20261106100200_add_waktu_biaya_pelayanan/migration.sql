-- Standar pelayanan desa lain menampilkan Jangka Waktu dan Biaya/Tarif per layanan.
-- Kedua kolom sengaja nullable tanpa DEFAULT: NULL = belum diisi (badge disembunyikan di publik),
-- biaya 0 = Gratis. Baris lama tidak butuh backfill dan tidak berubah perilakunya.
-- Idempoten (ADD COLUMN IF NOT EXISTS) supaya aman dijalankan ulang.

ALTER TABLE "PelayananSuratKeterangan"
  ADD COLUMN IF NOT EXISTS "estimasiWaktu" TEXT,
  ADD COLUMN IF NOT EXISTS "biaya" INTEGER;

ALTER TABLE "PelayananTelunjukSaktiDesa"
  ADD COLUMN IF NOT EXISTS "estimasiWaktu" TEXT,
  ADD COLUMN IF NOT EXISTS "biaya" INTEGER;

ALTER TABLE "PelayananPerizinanBerusaha"
  ADD COLUMN IF NOT EXISTS "estimasiWaktu" TEXT,
  ADD COLUMN IF NOT EXISTS "biaya" INTEGER;

ALTER TABLE "PelayananPendudukNonPermanen"
  ADD COLUMN IF NOT EXISTS "estimasiWaktu" TEXT,
  ADD COLUMN IF NOT EXISTS "biaya" INTEGER;
