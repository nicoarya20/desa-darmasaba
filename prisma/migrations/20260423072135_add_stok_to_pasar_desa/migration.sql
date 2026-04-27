/*
  Warnings:

  - You are about to drop the `ProdukUmkm` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `umkmId` to the `PasarDesa` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey (idempotent)
ALTER TABLE "PenjualanProduk" DROP CONSTRAINT IF EXISTS "PenjualanProduk_produkId_fkey";
ALTER TABLE "ProdukUmkm" DROP CONSTRAINT IF EXISTS "ProdukUmkm_imageId_fkey";
ALTER TABLE "ProdukUmkm" DROP CONSTRAINT IF EXISTS "ProdukUmkm_umkmId_fkey";

-- AlterTable KategoriProduk (idempotent via DO block)
DO $$
BEGIN
  BEGIN
    ALTER TABLE "KategoriProduk" ALTER COLUMN "deletedAt" DROP NOT NULL;
  EXCEPTION WHEN others THEN NULL;
  END;
  BEGIN
    ALTER TABLE "KategoriProduk" ALTER COLUMN "deletedAt" DROP DEFAULT;
  EXCEPTION WHEN others THEN NULL;
  END;
END $$;

-- AlterTable PasarDesa: add columns if not exists, handle NOT NULL safely
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'PasarDesa' AND column_name = 'stok'
  ) THEN
    ALTER TABLE "PasarDesa" ADD COLUMN "stok" INTEGER NOT NULL DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'PasarDesa' AND column_name = 'umkmId'
  ) THEN
    ALTER TABLE "PasarDesa" ADD COLUMN "umkmId" TEXT;
  END IF;
END $$;

-- Set default value for existing rows before making NOT NULL
UPDATE "PasarDesa" SET "umkmId" = '' WHERE "umkmId" IS NULL;
ALTER TABLE "PasarDesa" ALTER COLUMN "umkmId" SET NOT NULL;

-- Remaining PasarDesa alterations (idempotent)
DO $$
BEGIN
  BEGIN ALTER TABLE "PasarDesa" ALTER COLUMN "rating" SET DEFAULT 0; EXCEPTION WHEN others THEN NULL; END;
  BEGIN ALTER TABLE "PasarDesa" ALTER COLUMN "alamatUsaha" DROP NOT NULL; EXCEPTION WHEN others THEN NULL; END;
  BEGIN ALTER TABLE "PasarDesa" ALTER COLUMN "deletedAt" DROP NOT NULL; EXCEPTION WHEN others THEN NULL; END;
  BEGIN ALTER TABLE "PasarDesa" ALTER COLUMN "deletedAt" DROP DEFAULT; EXCEPTION WHEN others THEN NULL; END;
  BEGIN ALTER TABLE "PasarDesa" ALTER COLUMN "kontak" DROP NOT NULL; EXCEPTION WHEN others THEN NULL; END;
END $$;

-- DropTable (idempotent)
DROP TABLE IF EXISTS "ProdukUmkm";

-- AddForeignKey (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'PasarDesa_umkmId_fkey'
  ) THEN
    ALTER TABLE "PasarDesa" ADD CONSTRAINT "PasarDesa_umkmId_fkey"
      FOREIGN KEY ("umkmId") REFERENCES "Umkm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'PenjualanProduk_produkId_fkey'
  ) THEN
    ALTER TABLE "PenjualanProduk" ADD CONSTRAINT "PenjualanProduk_produkId_fkey"
      FOREIGN KEY ("produkId") REFERENCES "PasarDesa"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;
