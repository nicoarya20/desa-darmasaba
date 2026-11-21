-- Daftar Informasi Publik: sebagian informasi perlu gambar pendukung, tetapi tidak semua baris punya gambar.
-- Murni aditif dan idempoten: satu kolom nullable tanpa backfill (baris lama tetap valid) dan FK ON DELETE SET NULL
-- supaya penghapusan berkas tidak pernah gagal atau menghapus baris informasi. Tabel/kolom lain tidak disentuh.
ALTER TABLE "DaftarInformasiPublik" ADD COLUMN IF NOT EXISTS "gambarId" TEXT;

-- FK dijaga pg_constraint karena ADD CONSTRAINT tidak punya IF NOT EXISTS.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'DaftarInformasiPublik_gambarId_fkey') THEN
        ALTER TABLE "DaftarInformasiPublik" ADD CONSTRAINT "DaftarInformasiPublik_gambarId_fkey"
            FOREIGN KEY ("gambarId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
