# Summary: Refactor UMKM and Pasar Desa (Consolidation)

## Objective
Successfully consolidated "Pasar Desa" into the UMKM module. Pasar Desa is now strictly a part of the UMKM ecosystem, where every product must belong to an UMKM entity.

## Changes Made:
1.  **Backend & API**:
    -   Removed redundant `pasar-desa` API endpoints from `src/app/api/[[...slugs]]/_lib/ekonomi/index.ts`.
    -   Removed invalid `not: null` filters for `umkmId` in UMKM dashboard and product findMany APIs (since `umkmId` is now mandatory).
    -   Updated `umkmState` to include `findUnique` for products.
2.  **Admin UI**:
    -   Removed "Pasar Desa" menu items from `src/app/admin/_com/list_PageAdmin.tsx` for all roles.
    -   Cleaned up unused state management for `pasar-desa`.
3.  **Public UI**:
    -   Replaced "Pasar Desa" with "UMKM" in the public navbar (`src/con/navbar-list-menu.ts`).
    -   Unified the public hub at `/darmasaba/ekonomi/umkm`.
    -   Refactored the hub page to remove the "Produk Pasar Desa" tab and rename other tabs to "Katalog Produk" and "Direktori Bisnis".
    -   Updated product detail routing to `/darmasaba/ekonomi/umkm/produk/[id]`.
    -   Updated UMKM profile routing to `/darmasaba/ekonomi/umkm/[id]`.
4.  **Database & Seeding**:
    -   Created a new UMKM seeder (`prisma/_seeder_list/ekonomi/seed_umkm.ts`).
    -   Updated `seedPasarDesa` to link products to UMKM entities, satisfying the mandatory `umkmId` constraint.
    -   Integrated `seedUmkm` into the main `seed.ts`.
5.  **Code Cleanup**:
    -   Fixed missing imports (e.g., `IconUser`).
    -   Removed unused imports across several files.
    -   Fixed copy-pasted toast messages in unrelated modules.

## Verification**:
-   Build successful (`bun run build`).
-   No "Pasar Desa" menu in Admin.
-   "UMKM" menu in Public Navbar points to unified hub.
-   Unified hub shows products linked to UMKM.
-   Product detail pages correctly show seller information.
