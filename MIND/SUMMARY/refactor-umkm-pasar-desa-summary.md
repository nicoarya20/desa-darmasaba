# Summary: Unified UMKM and Pasar Desa Model

## Changes Made:
1. **Model Unification**:
   - `ProdukUmkm` has been removed.
   - `PasarDesa` now includes `stok` and an optional `umkmId`.
   - `PenjualanProduk` is now directly related to `PasarDesa`.
   - Admin context is separated: "Pasar Desa" manages products where `umkmId` is null, while "UMKM" manages products where `umkmId` is not null.
2. **API & Logic Updates**:
   - All UMKM product APIs (CRUD) now target the `PasarDesa` model.
   - Sales transactions correctly decrement `stok` in the `PasarDesa` table.
   - Dashboard analytics correctly query sales data based on the updated model.
3. **UI Enhancements**:
   - Added `src/app/admin/(dashboard)/ekonomi/umkm/data-umkm/create/page.tsx` for UMKM business profiles.
   - Added `src/app/admin/(dashboard)/ekonomi/umkm/produk/create/page.tsx` for UMKM products with category support.
   - Updated list views to separate "Pasar Murni" and "UMKM Produk" logically.

## Verification:
- Database schema synchronized with `prisma db push`.
- API logic updated and tested for consistency.
