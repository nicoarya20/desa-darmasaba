-- Migrate PasarDesa.kategoriProdukId FK from KategoriProduk to KategoriProdukUmkm
ALTER TABLE "PasarDesa" DROP CONSTRAINT "PasarDesa_kategoriProdukId_fkey";

ALTER TABLE "PasarDesa" ADD CONSTRAINT "PasarDesa_kategoriProdukId_fkey" FOREIGN KEY ("kategoriProdukId") REFERENCES "KategoriProdukUmkm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
