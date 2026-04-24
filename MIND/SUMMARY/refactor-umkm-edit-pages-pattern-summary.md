# Summary - Refactor UMKM Edit Pages Pattern

## Changes
1.  **UMKM Produk Edit Page**: Refactored `src/app/admin/(dashboard)/ekonomi/umkm/produk/[id]/edit/page.tsx` to match the "Berita" edit page pattern. Added Reset ("Batal") functionality, standardized header, paper, and dropzone styling, and used `EditEditor`.
2.  **Data UMKM Edit Page**: Refactored `src/app/admin/(dashboard)/ekonomi/umkm/data-umkm/[id]/edit/page.tsx` with the same pattern and improvements.
3.  **UI Consistency**: Standardized colors and component usage across UMKM edit pages.
4.  **UX Improvement**: Added a "Batal" button that resets the form to its original data state.
5.  **Build Verification**: Confirmed that the project builds successfully with `bun run build`.

## Verification Results
- `bun run build`: Success.
- Pattern Match: Both pages now follow the consistent layout and logic of the Berita edit page.
- Reset Functionality: Implemented and verified via logic review.
