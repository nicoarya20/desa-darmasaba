# Plan: Refactor UMKM and Pasar Desa Model

## Objective
Unify `ProdukUmkm` and `PasarDesa` into a single `PasarDesa` model to avoid data redundancy and simplify management.

## Changes:
1. **Schema Refactor**:
   - Merge fields from `ProdukUmkm` (`stok`, `umkmId`) into `PasarDesa`.
   - Update `PenjualanProduk` to relate directly to `PasarDesa`.
   - Remove `ProdukUmkm` model.
   - Update `FileStorage` relations.
2. **Backend/API Refactor**:
   - Update Pasar Desa `findMany` to only show products where `umkmId` is null.
   - Update UMKM Produk APIs (`create`, `updt`, `findMany`, `del`) to use the `PasarDesa` model with `umkmId` filter.
   - Update Penjualan logic to adjust `stok` in `PasarDesa`.
   - Update UMKM Dashboard analytics to query `PasarDesa`.
3. **Admin UI Refactor**:
   - Update `umkmState` to handle `kategoriId` for products.
   - Create "Tambah UMKM" form for business profile management.
   - Create "Tambah Produk UMKM" form for product management with `umkmId` binding.
   - Update list views to link to the new forms.
   - Implement logical separation between "Pasar Desa Admin" and "UMKM Admin" contexts.

## Verification:
- Successful build (`bun run build`).
- Verify API responses for both Pasar Desa and UMKM Produk filters.
