-- Gotong Royong menjadi SATU kategori di Kegiatan Desa (bukan menu admin terpisah).
-- Migrasi data saja (tanpa perubahan kolom); aman dijalankan ulang.
-- Keputusan: docs/decisions/2026-11-16-gotong-royong-kategori-kegiatan.md

-- 1) Kategori tetap "Gotong Royong".
-- Kenapa: halaman publik /lingkungan/gotong-royong menyaring kegiatan lewat id tetap
-- 'katgotongroyong01' (KATEGORI_GOTONG_ROYONG_ID), bukan pencocokan nama — pola sama
-- dengan kategori Pembangunan (20261103100300_add_pembangunan_fields_kegiatan_desa).
--  * Id itu sudah ada -> tidak melakukan apa pun.
--  * Admin sudah punya SATU kategori aktif bernama "Gotong Royong" dengan id lain ->
--    id-nya dipindah ke id tetap (FK KegiatanDesa ber-ON UPDATE CASCADE, kegiatan ikut).
--  * Belum ada -> dibuat baru ("updatedAt" wajib diisi: @updatedAt tanpa DEFAULT di DB).
--  * Lebih dari satu kategori "Gotong Royong" aktif -> tidak diubah (ambigu, operator memilih).
DO $$
DECLARE
  jumlah_sama_nama INTEGER;
BEGIN
  IF EXISTS (SELECT 1 FROM "KategoriKegiatan" WHERE "id" = 'katgotongroyong01') THEN
    RETURN;
  END IF;

  SELECT COUNT(*) INTO jumlah_sama_nama
  FROM "KategoriKegiatan"
  WHERE lower(btrim("nama")) = 'gotong royong' AND "isActive" = true;

  IF jumlah_sama_nama = 0 THEN
    INSERT INTO "KategoriKegiatan" ("id", "nama", "updatedAt")
    VALUES ('katgotongroyong01', 'Gotong Royong', CURRENT_TIMESTAMP)
    ON CONFLICT ("id") DO NOTHING;
  ELSIF jumlah_sama_nama = 1 THEN
    UPDATE "KategoriKegiatan"
    SET "id" = 'katgotongroyong01'
    WHERE lower(btrim("nama")) = 'gotong royong' AND "isActive" = true;
  ELSE
    RAISE NOTICE 'Lebih dari satu kategori "Gotong Royong" aktif; id katgotongroyong01 tidak dibuat otomatis.';
  END IF;
END $$;

-- 2) Menu Access: submenu admin 'lingkungan.gotong-royong' dihapus dari sidebar.
-- Kenapa: menu itu mengelola tabel KegiatanDesa yang sama dengan 'desa.kegiatan-desa'.
-- Pemegang aksesnya dipindah ke 'desa.kegiatan-desa' supaya tidak kehilangan akses —
-- dan supaya user yang SATU-SATUNYA barisnya 'lingkungan.gotong-royong' tidak berubah
-- jadi "tanpa Menu Access" (= fallback role, yang bisa memberi akses LEBIH luas).
-- Pemegang ID section 'Lingkungan' (= semua submenu Lingkungan, termasuk Gotong Royong)
-- juga diberi 'desa.kegiatan-desa'. Yang sudah punya section 'Desa' atau
-- 'desa.kegiatan-desa' dilewati. ID dicocokkan trim + lowercase seperti normalizeMenuId.
INSERT INTO "UserMenuAccess" ("id", "userId", "menuId", "createdAt", "updatedAt")
SELECT
  md5('menu-gotong-royong:' || pemegang."userId" || ':' || clock_timestamp()::text),
  pemegang."userId",
  'desa.kegiatan-desa',
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM (
  SELECT DISTINCT uma."userId"
  FROM "UserMenuAccess" uma
  WHERE lower(btrim(uma."menuId")) IN ('lingkungan.gotong-royong', 'lingkungan')
) pemegang
WHERE NOT EXISTS (
  SELECT 1 FROM "UserMenuAccess" sudah
  WHERE sudah."userId" = pemegang."userId"
    AND lower(btrim(sudah."menuId")) IN ('desa.kegiatan-desa', 'desa')
)
ON CONFLICT ("userId", "menuId") DO NOTHING;

-- Baris lama tidak lagi dikenali sidebar (ID tidak ada di domains.ts) -> dibersihkan.
DELETE FROM "UserMenuAccess"
WHERE lower(btrim("menuId")) = 'lingkungan.gotong-royong';
