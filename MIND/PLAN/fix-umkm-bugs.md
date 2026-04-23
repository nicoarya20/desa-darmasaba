# Plan: Fix 3 Bugs in UMKM Module

## 1. TypeError: Cannot set properties of undefined (setting 'loading')
- **File**: `src/app/darmasaba/(pages)/ekonomi/pasar-desa/page.tsx`
- **Root Cause**: `load` method is destructured from Valtio proxy, causing `this` binding to be lost.
- **Fix**: Remove `load` from destructuring and call it directly via `umkmState.produk.findMany.load` or `umkmState.umkm.findMany.load`.

## 2. 404 Not Found - Category Product API
- **File**: `src/app/admin/(dashboard)/_state/ekonomi/umkm/umkm.ts`
- **Root Cause**: Incorrect API URL for fetching category products.
- **Fix**: Update URL from `/api/ekonomi/pasar-desa/kategori-produk/find-many-all` to `/api/ekonomi/kategoriproduk/find-many-all`.

## 3. Recharts Warning: width(-1) height(-1)
- **Location**: UMKM Admin Dashboard.
- **Root Cause**: Missing explicit height on chart container.
- **Fix**: Add `style={{ height: 300 }}` to the container and wrap charts with `ResponsiveContainer`.

## Steps:
1. Fix `src/app/darmasaba/(pages)/ekonomi/pasar-desa/page.tsx`.
2. Fix `src/app/admin/(dashboard)/_state/ekonomi/umkm/umkm.ts`.
3. Locate and fix chart containers in UMKM admin dashboard.
4. Verify changes locally.
5. Run build to ensure no compile errors.
6. Commit and deploy.
