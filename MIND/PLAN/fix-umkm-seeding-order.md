# Plan - Fix UMKM Seeding Foreign Key Error

## Problem
Seeding fails with `P2003` foreign key constraint error because `seedUmkm()` is called before `seedPasarDesa()`. `seedUmkm()` depends on `KategoriProduk` records which are created in `seedPasarDesa()`.

## Strategy
1. Swap the execution order of `seedUmkm()` and `seedPasarDesa()` in `prisma/seed.ts`.
2. Verify the fix by running `bun run prisma/seed.ts`.
3. Follow the standard deployment workflow (build, version bump, commit, push).

## Tasks
- [ ] Swap function calls in `prisma/seed.ts` <!-- id: 0 -->
- [ ] Run `bun run prisma/seed.ts` to verify <!-- id: 1 -->
- [ ] Run `bun run build` <!-- id: 2 -->
- [ ] Update version in `package.json` <!-- id: 3 -->
- [ ] Commit and push changes <!-- id: 4 -->
