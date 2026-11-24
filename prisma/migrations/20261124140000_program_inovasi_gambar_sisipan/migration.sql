-- Kenapa: deskripsi Program Inovasi kini bisa memuat gambar di tengah teks (seperti dokumen program dari desa).
-- Berkasnya dicatat lewat relasi implicit many-to-many `ProgramInovasiGambarSisipan` (A = FileStorage.id,
-- B = ProgramInovasi.id, urutan alfabetis nama model) supaya terlindung cek rujukan berkas dan bisa dibersihkan
-- saat gambar dihapus dari teks. Murni additive: tabel penghubung baru, kolom/tabel lama tidak disentuh.
-- Idempoten: aman dijalankan ulang (IF NOT EXISTS / duplicate_object diabaikan).

-- CreateTable
CREATE TABLE IF NOT EXISTS "_ProgramInovasiGambarSisipan" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProgramInovasiGambarSisipan_AB_pkey" PRIMARY KEY ("A","B")
);

-- Kenapa: gambar sisipan selalu diambil per program (sisi B).
-- CreateIndex
CREATE INDEX IF NOT EXISTS "_ProgramInovasiGambarSisipan_B_index" ON "_ProgramInovasiGambarSisipan"("B");

-- Kenapa CASCADE: baris penghubung tidak bermakna bila file atau programnya terhapus permanen.
-- AddForeignKey
DO $$
BEGIN
  ALTER TABLE "_ProgramInovasiGambarSisipan" ADD CONSTRAINT "_ProgramInovasiGambarSisipan_A_fkey"
    FOREIGN KEY ("A") REFERENCES "FileStorage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$
BEGIN
  ALTER TABLE "_ProgramInovasiGambarSisipan" ADD CONSTRAINT "_ProgramInovasiGambarSisipan_B_fkey"
    FOREIGN KEY ("B") REFERENCES "ProgramInovasi"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
