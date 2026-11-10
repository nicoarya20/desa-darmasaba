-- Kenapa: hampir semua pengumuman resmi desa (lelang, daftar KPM BLT, dll) berupa gambar
-- dokumen + lampiran PDF, sedangkan model Pengumuman hanya menyimpan teks. Pengumuman juga
-- tidak punya tanggal terbit sendiri, sehingga tanggal asli hilang saat data lama diimpor
-- (createdAt = waktu impor). Mengikuti pola Berita: gambar utama + galeri, ditambah dokumen.
-- Murni additive: kolom/tabel baru, semua lampiran opsional; data lama tetap utuh.
-- Idempoten: aman dijalankan ulang (IF NOT EXISTS / duplicate_object diabaikan).
-- Implicit m2m Prisma: A = FileStorage.id, B = Pengumuman.id (urutan alfabetis nama model).

-- AlterTable: gambar/poster utama (thumbnail kartu), opsional.
ALTER TABLE "Pengumuman" ADD COLUMN IF NOT EXISTS "imageId" TEXT;

-- AlterTable: tanggal terbit. Dibuat nullable dulu, di-backfill dari createdAt (tanggal
-- terbaik yang dimiliki baris lama), baru dikunci NOT NULL + DEFAULT now() supaya list bisa
-- diurutkan tanpa menangani NULL.
ALTER TABLE "Pengumuman" ADD COLUMN IF NOT EXISTS "tanggalTerbit" TIMESTAMP(3);
UPDATE "Pengumuman" SET "tanggalTerbit" = "createdAt" WHERE "tanggalTerbit" IS NULL;
ALTER TABLE "Pengumuman" ALTER COLUMN "tanggalTerbit" SET DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Pengumuman" ALTER COLUMN "tanggalTerbit" SET NOT NULL;

-- CreateTable: galeri gambar tambahan.
CREATE TABLE IF NOT EXISTS "_PengumumanImages" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PengumumanImages_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable: lampiran dokumen (PDF).
CREATE TABLE IF NOT EXISTS "_PengumumanDokumen" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PengumumanDokumen_AB_pkey" PRIMARY KEY ("A","B")
);

-- Kenapa: filter list per kategori (`/pemerintahan/pengumuman/[kategori]`) memakai kolom ini.
-- CreateIndex
CREATE INDEX IF NOT EXISTS "Pengumuman_categoryPengumumanId_idx" ON "Pengumuman"("categoryPengumumanId");

-- Kenapa: galeri & dokumen selalu diambil per pengumuman (sisi B) di halaman detail.
-- CreateIndex
CREATE INDEX IF NOT EXISTS "_PengumumanImages_B_index" ON "_PengumumanImages"("B");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "_PengumumanDokumen_B_index" ON "_PengumumanDokumen"("B");

-- Kenapa SET NULL: berkas gambar utama yang terhapus permanen cukup melepas thumbnail,
-- pengumumannya tetap ada (sama dengan Berita_imageId_fkey).
-- AddForeignKey
DO $$
BEGIN
  ALTER TABLE "Pengumuman" ADD CONSTRAINT "Pengumuman_imageId_fkey"
    FOREIGN KEY ("imageId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Kenapa CASCADE: baris penghubung tidak bermakna bila berkas atau pengumumannya terhapus permanen.
-- AddForeignKey
DO $$
BEGIN
  ALTER TABLE "_PengumumanImages" ADD CONSTRAINT "_PengumumanImages_A_fkey"
    FOREIGN KEY ("A") REFERENCES "FileStorage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$
BEGIN
  ALTER TABLE "_PengumumanImages" ADD CONSTRAINT "_PengumumanImages_B_fkey"
    FOREIGN KEY ("B") REFERENCES "Pengumuman"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$
BEGIN
  ALTER TABLE "_PengumumanDokumen" ADD CONSTRAINT "_PengumumanDokumen_A_fkey"
    FOREIGN KEY ("A") REFERENCES "FileStorage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$
BEGIN
  ALTER TABLE "_PengumumanDokumen" ADD CONSTRAINT "_PengumumanDokumen_B_fkey"
    FOREIGN KEY ("B") REFERENCES "Pengumuman"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
