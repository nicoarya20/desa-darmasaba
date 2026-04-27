-- Create KategoriProdukUmkm table if it doesn't exist
-- (renames existing kategori_produk_umkm if present, otherwise creates fresh)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'kategori_produk_umkm'
  ) THEN
    ALTER TABLE "kategori_produk_umkm" RENAME TO "KategoriProdukUmkm";
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'KategoriProdukUmkm'
  ) THEN
    CREATE TABLE "KategoriProdukUmkm" (
      "id"        TEXT NOT NULL,
      "nama"      TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "deletedAt" TIMESTAMP(3),
      "isActive"  BOOLEAN NOT NULL DEFAULT true,
      CONSTRAINT "KategoriProdukUmkm_pkey" PRIMARY KEY ("id")
    );
  END IF;
END $$;

-- Seed KategoriProdukUmkm: copy from KategoriProduk where referenced by Umkm
-- This ensures existing Umkm.kategoriId values exist in the new table
INSERT INTO "KategoriProdukUmkm" ("id", "nama", "createdAt", "updatedAt", "deletedAt", "isActive")
SELECT DISTINCT kp.id, kp.nama, kp."createdAt", kp."updatedAt", kp."deletedAt", kp."isActive"
FROM "KategoriProduk" kp
WHERE kp.id IN (SELECT DISTINCT "kategoriId" FROM "Umkm")
  AND NOT EXISTS (SELECT 1 FROM "KategoriProdukUmkm" WHERE id = kp.id);

-- Update Umkm FK: drop old FK pointing to KategoriProduk, add new one to KategoriProdukUmkm
DO $$
DECLARE
  fk_target TEXT;
BEGIN
  SELECT ccu.table_name INTO fk_target
  FROM information_schema.table_constraints tc
  JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
  WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    AND tc.table_name = 'Umkm'
    AND kcu.column_name = 'kategoriId'
  LIMIT 1;

  IF fk_target = 'KategoriProduk' THEN
    ALTER TABLE "Umkm" DROP CONSTRAINT "Umkm_kategoriId_fkey";
    ALTER TABLE "Umkm" ADD CONSTRAINT "Umkm_kategoriId_fkey"
      FOREIGN KEY ("kategoriId") REFERENCES "KategoriProdukUmkm"("id")
      ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
