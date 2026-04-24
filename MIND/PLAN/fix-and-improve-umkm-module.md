# Plan: Fix and Improve UMKM Module

## Objectives
- Implement delete confirmation modal for UMKM sales histori.
- Improve data handling (null safety) in UMKM and Produk forms.
- Fix field mapping in Produk edit page.
- Enhance UMKM Dashboard KPI calculation.
- Implement stock validation for new sales.
- Fix WhatsApp link formatting across the application.
- Add product ordering functionality for public users.
- Translate and simplify CLAUDE.md.

## Proposed Changes
1. **Admin State**: Update `umkmState` to include `del` for sales and refine form schemas.
2. **Admin UI**: 
   - Add `ModalKonfirmasiHapus` to Penjualan page.
   - Fix card height in Dashboard.
   - Refine Edit/Create pages for UMKM and Produk.
3. **API**:
   - Refactor `kpi.ts` for more accurate reporting.
   - Add stock check in `create.ts` for sales.
4. **Public UI**:
   - Update Produk detail page with order modal and WhatsApp integration.
   - Fix WhatsApp links in various pages.
5. **Documentation**: Update `CLAUDE.md`.
6. **Maintenance**: Increment version in `package.json`.

## Verification Plan
- Run `bun run build` to ensure no compile errors.
- Manual verification of delete functionality.
- Manual verification of ordering flow.
