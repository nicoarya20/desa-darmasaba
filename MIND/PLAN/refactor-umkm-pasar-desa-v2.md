# Plan: Refactor UMKM and Pasar Desa (Consolidation)

## Objective
Consolidate "Pasar Desa" into the UMKM module. Pasar Desa is no longer a separate entity; it is now strictly a collection of products belonging to UMKM entities.

## Steps:
1. **Cleanup API**: Remove `PasarDesa` and `KategoriProduk` (from `pasar-desa` folder) imports from `src/app/api/[[...slugs]]/_lib/ekonomi/index.ts`.
2. **Admin UI**: 
   - Remove "Pasar Desa" menu from `src/app/admin/_com/list_PageAdmin.tsx`.
   - Ensure "UMKM" menu handles all product management.
3. **Public UI**:
   - Remove "Pasar Desa" from `src/con/navbar-list-menu.ts`.
   - Refactor `src/app/darmasaba/(pages)/ekonomi/pasar-desa/page.tsx` to remove the "Produk Pasar Desa" tab.
   - Rename the page or adjust its purpose to be the unified UMKM/Product hub.
4. **Prisma Schema**:
   - Ensure `umkmId` is mandatory in `PasarDesa` model (already seems to be).
   - (Optional) Rename `PasarDesa` to `ProdukUmkm` if requested, but user said it's optional. For now, keep it as `PasarDesa` to minimize breaking changes.
5. **Build & Verify**: Run `bun run build` and check for any broken references.

## Verification:
- No "Pasar Desa" menu in Admin.
- No "Pasar Desa" menu in Public Navbar.
- Public page `/darmasaba/ekonomi/pasar-desa` (or new path) shows UMKM products only.
- Successful build.
