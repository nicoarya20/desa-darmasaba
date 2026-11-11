-- Penghargaan & Prestasi Desa ditampilkan sebagai SATU daftar "Prestasi dan Penghargaan"
-- (beranda + /darmasaba/prestasi-desa). Menyimpannya di dua tabel memaksa frontend
-- menggabungkan dua endpoint dan admin mengelola dua halaman, jadi data Penghargaan
-- dipindah ke PrestasiDesa (kategori "Penghargaan") lalu tabel lamanya dihapus.
-- Semua langkah idempotent supaya aman bila migrasi diulang / DB sudah sebagian berubah.

-- 1) Kolom capaian/peringkat. Opsional (nullable): prestasi lama tidak punya nilai juara,
--    jadi tidak perlu DEFAULT/backfill.
ALTER TABLE "PrestasiDesa" ADD COLUMN IF NOT EXISTS "juara" TEXT;

-- 2) Kategori penampung data eks-Penghargaan. Id deterministik agar sama dengan seeder
--    (prisma/data/landing-page/prestasi-desa/kategori-prestasi.json). Bila kategori
--    bernama "Penghargaan" sudah ada (dibuat admin), baris itu yang dipakai. ON CONFLICT tanpa
--    target: bentrok di name maupun id (migrasi diulang) sama-sama dilewati.
INSERT INTO "KategoriPrestasiDesa" ("id", "name", "createdAt", "updatedAt", "isActive")
VALUES ('kategori-prestasi-penghargaan', 'Penghargaan', NOW(), NOW(), true)
ON CONFLICT DO NOTHING;

-- 3) Pindahkan baris Penghargaan. Beberapa entri sudah tercatat juga sebagai prestasi
--    (judul sama), dan tujuan penggabungan adalah SATU entri per capaian, jadi:
--    a) Penghargaan yang judulnya (trim, case-insensitive) sama dengan PrestasiDesa AKTIF
--       tidak disalin; cukup lengkapi baris prestasi itu: juara & imageId diisi dari
--       penghargaan hanya bila masih NULL (data prestasi yang sudah ada tidak ditimpa).
--       Bila ada >1 penghargaan berjudul sama, yang paling lama (createdAt) dipakai.
--    b) Sisanya disalin dengan id YANG SAMA supaya link lama /darmasaba/penghargaan/{id}
--       bisa di-redirect ke /darmasaba/prestasi-desa/{id}.
--    Penghargaan.deletedAt bernilai default now() (bukan penanda hapus), jadi status hapus
--    diambil dari isActive: aktif → deletedAt NULL, nonaktif → pakai deletedAt lama.
--    Langkah (a) jalan sebelum (b) agar hanya mencocokkan prestasi yang sudah ada.
--    Dibungkus cek tabel: setelah tabel Penghargaan di-drop, migrasi ulang tidak berbuat apa-apa;
--    ON CONFLICT (id) menjaga baris yang sudah tersalin tidak ditimpa.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = current_schema() AND table_name = 'Penghargaan'
  ) THEN
    -- 3a) Lengkapi prestasi aktif yang judulnya kembar dengan penghargaan.
    UPDATE "PrestasiDesa" pr
    SET
      "juara" = COALESCE(pr."juara", m."juara"),
      "imageId" = COALESCE(pr."imageId", m."imageId")
    FROM (
      SELECT DISTINCT ON (LOWER(BTRIM(p."name")))
        LOWER(BTRIM(p."name")) AS "nameKey",
        NULLIF(BTRIM(p."juara"), '') AS "juara",
        p."imageId"
      FROM "Penghargaan" p
      ORDER BY LOWER(BTRIM(p."name")), p."createdAt", p."id"
    ) m
    WHERE LOWER(BTRIM(pr."name")) = m."nameKey"
      AND pr."isActive" = true
      AND pr."deletedAt" IS NULL;

    -- 3b) Salin penghargaan yang tidak punya kembaran prestasi aktif.
    INSERT INTO "PrestasiDesa"
      ("id", "name", "deskripsi", "juara", "kategoriId", "imageId", "createdAt", "updatedAt", "deletedAt", "isActive")
    SELECT
      p."id",
      p."name",
      p."deskripsi",
      NULLIF(BTRIM(p."juara"), ''),
      (SELECT k."id" FROM "KategoriPrestasiDesa" k WHERE k."name" = 'Penghargaan'),
      p."imageId",
      p."createdAt",
      p."updatedAt",
      CASE WHEN p."isActive" THEN NULL ELSE p."deletedAt" END,
      p."isActive"
    FROM "Penghargaan" p
    WHERE NOT EXISTS (
      SELECT 1 FROM "PrestasiDesa" pr
      WHERE LOWER(BTRIM(pr."name")) = LOWER(BTRIM(p."name"))
        AND pr."isActive" = true
        AND pr."deletedAt" IS NULL
    )
    ON CONFLICT ("id") DO NOTHING;
  END IF;
END $$;

-- 4) Data sudah pindah: hapus FK + tabel lama (relasi balik FileStorage.Penghargaan
--    hanya ada di schema Prisma, tidak punya kolom di FileStorage).
ALTER TABLE IF EXISTS "Penghargaan" DROP CONSTRAINT IF EXISTS "Penghargaan_imageId_fkey";
DROP TABLE IF EXISTS "Penghargaan";
