-- Seed KategoriProdukUmkm with any KategoriProduk entries referenced by PasarDesa
-- that are not yet in KategoriProdukUmkm
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
