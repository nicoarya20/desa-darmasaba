-- Kenapa: Berita hanya punya createdAt (= waktu klik Simpan), sehingga berita kegiatan lama yang
-- diinput belakangan tampil bertanggal hari ini dan naik ke urutan teratas, dan 22 berita hasil impor
-- website lama kehilangan tanggal aslinya. Admin kini mengisi tanggal terbit sendiri (pola sama dengan
-- Pengumuman.tanggalTerbit, migrasi 20261111090000_pengumuman_lampiran).
-- Murni additive; tampilan data lama tidak berubah karena tanggal terbit diisi dari createdAt.
-- Idempoten: aman dijalankan ulang (IF NOT EXISTS, UPDATE hanya baris NULL).

-- AlterTable: dibuat nullable dulu, di-backfill dari createdAt (tanggal terbaik yang dimiliki baris
-- lama), baru dikunci DEFAULT now() + NOT NULL supaya list bisa diurutkan tanpa menangani NULL.
ALTER TABLE "Berita" ADD COLUMN IF NOT EXISTS "tanggalTerbit" TIMESTAMP(3);
UPDATE "Berita" SET "tanggalTerbit" = "createdAt" WHERE "tanggalTerbit" IS NULL;
ALTER TABLE "Berita" ALTER COLUMN "tanggalTerbit" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Berita" ALTER COLUMN "tanggalTerbit" SET NOT NULL;

-- Kenapa: semua list berita (publik, admin, beranda, pencarian) kini diurutkan
-- tanggalTerbit desc, createdAt desc.
-- CreateIndex
CREATE INDEX IF NOT EXISTS "Berita_tanggalTerbit_createdAt_idx" ON "Berita"("tanggalTerbit", "createdAt");
