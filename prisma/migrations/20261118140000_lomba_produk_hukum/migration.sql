-- Lomba Website Desa 2027, permintaan TIM BIP: submenu publik "Pemerintahan > Produk Hukum" (Perdes, Peraturan Perbekel,
-- SK Perbekel, dll). Tiap produk hukum satu baris, jadi butuh tabel baru; "DokumenDasarHukumPPID" khusus kanal PPID dan
-- wajib berkas, sedangkan di sini entri boleh dicatat sebelum PDF-nya ada ("fileId" nullable).
-- Murni aditif dan idempoten: hanya membuat tabel baru + indeks + FK; tidak menyentuh tabel/kolom lain. Isi tabel diisi
-- admin lewat CMS, bukan migrasi ini. "kategori" berupa TEXT (nilai dijaga API), bukan enum Postgres, supaya kategori
-- baru tidak memerlukan migrasi.

CREATE TABLE IF NOT EXISTS "ProdukHukum" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "nomor" TEXT,
    "tahun" INTEGER,
    "kategori" TEXT NOT NULL,
    "urutan" INTEGER NOT NULL DEFAULT 0,
    "fileId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ProdukHukum_pkey" PRIMARY KEY ("id")
);

-- Daftar publik: aktif saja, disaring per kategori, diurutkan urutan.
CREATE INDEX IF NOT EXISTS "ProdukHukum_isActive_kategori_urutan_idx" ON "ProdukHukum"("isActive", "kategori", "urutan");

-- Pemeriksaan rujukan berkas saat penghapusan (lihat fileReferences.ts).
CREATE INDEX IF NOT EXISTS "ProdukHukum_fileId_idx" ON "ProdukHukum"("fileId");

-- FK dijaga pg_constraint karena ADD CONSTRAINT tidak punya IF NOT EXISTS. ON DELETE SET NULL: menghapus berkas lewat
-- /api/fileStorage/delete tidak boleh gagal ataupun ikut menghapus entri produk hukum; entri tetap tercatat tanpa berkas.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProdukHukum_fileId_fkey') THEN
        ALTER TABLE "ProdukHukum" ADD CONSTRAINT "ProdukHukum_fileId_fkey"
            FOREIGN KEY ("fileId") REFERENCES "FileStorage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
