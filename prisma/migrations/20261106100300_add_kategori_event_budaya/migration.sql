-- Kenapa: halaman "Kalender Event Budaya" digabung menjadi "Agenda & Kalender
-- Desa" (agenda tahunan + jadwal musyawarah), sehingga event perlu kategori dan
-- tanggal selesai untuk acara multi-hari.
-- kategori NOT NULL dengan DEFAULT 'BUDAYA' => baris lama otomatis BUDAYA tanpa
-- backfill. tanggalSelesai nullable (event satu hari tidak berubah).
-- Nilai kategori sengaja hanya divalidasi di API (src/lib/agenda-desa.ts) agar
-- penambahan kategori tidak butuh migrasi. Idempoten: aman dijalankan ulang.

-- AlterTable
ALTER TABLE "EventBudaya"
  ADD COLUMN IF NOT EXISTS "tanggalSelesai" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "kategori" TEXT NOT NULL DEFAULT 'BUDAYA';

-- Kenapa: list publik selalu diurut dan difilter per rentang tanggal
-- (tahun/bulan/mendatang).
-- CreateIndex
CREATE INDEX IF NOT EXISTS "EventBudaya_tanggal_idx" ON "EventBudaya"("tanggal");
