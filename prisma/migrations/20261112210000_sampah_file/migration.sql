-- Kenapa: foto & dokumen yang dihapus dari menu mana pun kini dipindah ke Sampah (soft delete: deletedAt +
-- isActive=false) dan baru dihapus permanen setelah 30 hari (docs/decisions/2026-11-12-sampah.md).
--
-- "deletedFrom": ID submenu sidebar asal berkas (mis. 'desa.berita') agar halaman Pengaturan → Sampah bisa
-- mengelompokkan item per section. Nullable: baris lama & penghapusan yang asalnya tidak diketahui jatuh ke
-- kelompok "Lainnya". Tidak ada backfill — semua baris saat ini aktif (deletedAt NULL).
ALTER TABLE "FileStorage" ADD COLUMN IF NOT EXISTS "deletedFrom" TEXT;

-- Daftar Sampah (urut terbaru dihapus) dan purge harian (deletedAt < batas retensi) memfilter kolom ini.
CREATE INDEX IF NOT EXISTS "FileStorage_deletedAt_idx" ON "FileStorage"("deletedAt");
