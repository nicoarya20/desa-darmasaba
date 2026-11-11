-- Kenapa: Program Inovasi butuh galeri dokumentasi (foto kegiatan sebagai bukti program
-- berjalan), terpisah dari gambar logo/cover tunggal (`imageId`) yang dipakai rel beranda.
-- Relasi implicit many-to-many Prisma `ProgramInovasiImages` (A = FileStorage.id,
-- B = ProgramInovasi.id, urutan alfabetis nama model). Murni additive: tabel penghubung
-- baru, kolom lama (`imageId`, `link`) tidak disentuh sehingga data lama tetap utuh.
-- Idempoten: aman dijalankan ulang (IF NOT EXISTS / duplicate_object diabaikan).

-- CreateTable
CREATE TABLE IF NOT EXISTS "_ProgramInovasiImages" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProgramInovasiImages_AB_pkey" PRIMARY KEY ("A","B")
);

-- Kenapa: galeri selalu diambil per program (sisi B) saat findMany/findUnique.
-- CreateIndex
CREATE INDEX IF NOT EXISTS "_ProgramInovasiImages_B_index" ON "_ProgramInovasiImages"("B");

-- Kenapa CASCADE: baris penghubung tidak bermakna bila file atau programnya terhapus permanen.
-- AddForeignKey
DO $$
BEGIN
  ALTER TABLE "_ProgramInovasiImages" ADD CONSTRAINT "_ProgramInovasiImages_A_fkey"
    FOREIGN KEY ("A") REFERENCES "FileStorage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$
BEGIN
  ALTER TABLE "_ProgramInovasiImages" ADD CONSTRAINT "_ProgramInovasiImages_B_fkey"
    FOREIGN KEY ("B") REFERENCES "ProgramInovasi"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
