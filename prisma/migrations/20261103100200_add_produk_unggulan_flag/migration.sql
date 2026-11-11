-- Kenapa: katalog UMKM (PasarDesa) belum punya penanda "Produk Unggulan Desa",
-- sehingga halaman publik tidak bisa menyaring/menandai produk unggulan.
-- Kolom NOT NULL dengan DEFAULT false: baris lama otomatis non-unggulan tanpa
-- backfill; admin menandai produk unggulan lewat form produk.
-- Idempoten (IF NOT EXISTS) agar aman dijalankan ulang di produksi.
ALTER TABLE "PasarDesa" ADD COLUMN IF NOT EXISTS "isUnggulan" BOOLEAN NOT NULL DEFAULT false;
