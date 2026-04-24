# Plan - Admin UMKM & Produk Edit Pages

## Problem
Admin UMKM module list pages have "Edit" buttons that are not functional, and there are no edit pages or update state logic implemented.

## Strategy
1. Update Valtio state in `src/app/admin/(dashboard)/_state/ekonomi/umkm/umkm.ts` with `update` modules for UMKM and Produk.
2. Delete Valtio state in `src/app/admin/(dashboard)/_state/ekonomi/umkm/umkm.ts` with `del` modules for UMKM and Produk.
3. Add `onClick` handlers to "Edit" buttons in list pages.
4. Create new edit pages.
5. Use `ModalKonfirmasiHapus` component for delete actions.
6. Verify changes with a successful build.
7. Follow deployment workflow.

## Progress
- [x] Update Valtio state with update modules
- [x] Update Valtio state with delete modules
- [x] Wire edit and delete buttons in list pages
- [x] Create UMKM edit page
- [x] Create Produk edit page
- [x] Build and fix errors
- [x] Update version in package.json
- [x] Commit and push to branch
- [x] Merge to stg and push to remotes
