# Summary - Fix UMKM Seeding Foreign Key Error

## What was done
- Fixed a circular dependency in the database seeding process between `Umkm` and `PasarDesa` models.
- Refactored `prisma/_seeder_list/ekonomi/seed_pasar_desa.ts` to export `seedKategoriProduk` separately.
- Updated `prisma/seed.ts` to execute seeding in the correct order:
  1. `seedKategoriProduk()` (required by `Umkm`)
  2. `seedUmkm()` (required by `PasarDesa`)
  3. `seedPasarDesa()` (requires `Umkm`)
- Verified the fix by running `bun run prisma/seed.ts`, which now completes without foreign key constraint errors.

## Verification Results
- `bun run prisma/seed.ts` output:
  - `✅ Kategori Produk seeded successfully`
  - `✅ UMKM seeded successfully`
  - `✅ Pasar desa seeded: ...`
  - `🎉 Pasar desa seed selesai`
- All other seeding steps also completed successfully.
