# Plan - Refactor UMKM Edit Pages Pattern

## Problem
The edit pages for UMKM (Data UMKM and Produk) use an older UI pattern. The user wants to align them with the newer pattern used in the Berita edit page.

## Strategy
1. Analyze the pattern in `src/app/admin/(dashboard)/desa/berita/list-berita/[id]/edit/page.tsx`.
2. Refactor `src/app/admin/(dashboard)/ekonomi/umkm/produk/[id]/edit/page.tsx` to match the pattern.
3. Refactor `src/app/admin/(dashboard)/ekonomi/umkm/data-umkm/[id]/edit/page.tsx` to match the pattern.
4. Add "Batal" (Reset) functionality to both pages.
5. Standardize UI components (Header, Paper, Dropzone, Action buttons).
6. Verify with a production build.
7. Follow the versioning and deployment workflow.

## Progress
- [x] Analyze Berita edit page pattern
- [x] Refactor UMKM Produk edit page (with interfaces)
- [x] Refactor Data UMKM edit page (with interfaces)
- [x] Run build and fix any errors
- [ ] Update version in package.json
- [ ] Commit and push to task branch
- [ ] Merge to stg branch
