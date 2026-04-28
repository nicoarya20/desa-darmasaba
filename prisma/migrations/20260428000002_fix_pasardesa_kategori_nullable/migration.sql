-- Step 1: Seed KategoriProdukUmkm from KategoriProduk for any PasarDesa-referenced entries not yet present
INSERT INTO "KategoriProdukUmkm" ("id", "nama", "createdAt", "updatedAt", "deletedAt", "isActive")
SELECT DISTINCT kp.id, kp.nama, kp."createdAt", kp."updatedAt", kp."deletedAt", kp."isActive"
FROM "KategoriProduk" kp
WHERE kp.id IN (
  SELECT DISTINCT "kategoriProdukId" FROM "PasarDesa"
  WHERE "kategoriProdukId" IS NOT NULL
)
AND NOT EXISTS (
  SELECT 1 FROM "KategoriProdukUmkm" WHERE id = kp.id
);

-- Step 2: Make kategoriProdukId nullable to handle orphaned/legacy data
ALTER TABLE "PasarDesa" ALTER COLUMN "kategoriProdukId" DROP NOT NULL;

-- Step 3: Null out any remaining orphaned references (not in KategoriProdukUmkm)
UPDATE "PasarDesa"
SET "kategoriProdukId" = NULL
WHERE "kategoriProdukId" IS NOT NULL
  AND "kategoriProdukId" NOT IN (SELECT id FROM "KategoriProdukUmkm");
