# Plan - Admin UMKM & Produk Edit Pages

## Problem
Admin UMKM module list pages have "Edit" buttons that are not functional, and there are no edit pages or update state logic implemented.

## Strategy
1. Update Valtio state in `src/app/admin/(dashboard)/_state/ekonomi/umkm/umkm.ts` with `update` modules for UMKM and Produk.
2. Add `onClick` handlers to "Edit" buttons in:
   - `src/app/admin/(dashboard)/ekonomi/umkm/data-umkm/page.tsx`
   - `src/app/admin/(dashboard)/ekonomi/umkm/produk/page.tsx`
3. Create new edit pages:
   - `src/app/admin/(dashboard)/ekonomi/umkm/data-umkm/[id]/edit/page.tsx`
   - `src/app/admin/(dashboard)/ekonomi/umkm/produk/[id]/edit/page.tsx`
4. Verify changes with a successful build.
5. Follow deployment workflow (version bump, commit, push).

## Tasks
- [x] Update Valtio state with update modules <!-- id: 0 -->
- [x] Wire edit buttons in list pages <!-- id: 1 -->
- [x] Create UMKM edit page <!-- id: 2 -->
- [x] Create Produk edit page <!-- id: 3 -->
- [x] Run `bun run build` <!-- id: 4 -->
- [ ] Update version in `package.json` <!-- id: 5 -->
- [ ] Commit and push changes <!-- id: 6 -->
