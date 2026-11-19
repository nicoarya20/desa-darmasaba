-- Lomba Website Desa 2027, batch 1 (layanan & pengaduan). Seluruhnya aditif dan nullable: baris lama tetap valid
-- tanpa backfill, dan kode lama yang tidak tahu kolom ini tetap jalan.

-- Pengaduan Masyarakat (Juknis 3.3, kanal pengaduan & tindak lanjut): admin perlu mencatat status penanganan dan
-- tanggapan yang tampil di rekap publik. `status` NULL dibaca aplikasi sebagai BARU (data lama & kiriman baru),
-- jadi tidak ada UPDATE massal ke tabel yang berisi data pribadi warga.
ALTER TABLE "PengaduanMasyarakat" ADD COLUMN IF NOT EXISTS "status" TEXT;
ALTER TABLE "PengaduanMasyarakat" ADD COLUMN IF NOT EXISTS "tanggapan" TEXT;
ALTER TABLE "PengaduanMasyarakat" ADD COLUMN IF NOT EXISTS "tanggapanAt" TIMESTAMP(3);

-- SOP layanan (Juknis 3.1, SOP/prosedur layanan): dua layanan mendapat berkas PDF SOP opsional lewat FileStorage.
ALTER TABLE "PelayananSuratKeterangan" ADD COLUMN IF NOT EXISTS "sopFileId" TEXT;
ALTER TABLE "PelayananTelunjukSaktiDesa" ADD COLUMN IF NOT EXISTS "sopFileId" TEXT;

-- Berkas SOP dihapus dari FileStorage → layanan tetap ada, hanya tautan SOP-nya hilang (SET NULL).
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PelayananSuratKeterangan_sopFileId_fkey') THEN
        ALTER TABLE "PelayananSuratKeterangan"
            ADD CONSTRAINT "PelayananSuratKeterangan_sopFileId_fkey"
            FOREIGN KEY ("sopFileId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'PelayananTelunjukSaktiDesa_sopFileId_fkey') THEN
        ALTER TABLE "PelayananTelunjukSaktiDesa"
            ADD CONSTRAINT "PelayananTelunjukSaktiDesa_sopFileId_fkey"
            FOREIGN KEY ("sopFileId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
