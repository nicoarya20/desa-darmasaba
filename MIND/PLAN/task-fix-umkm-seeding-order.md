# Task - Fix UMKM Seeding Foreign Key Error

Fix P2003 foreign key constraint error when seeding UMKM due to wrong execution order in `prisma/seed.ts`.

## Progress
- [ ] Swap `seedUmkm()` and `seedPasarDesa()` calls in `prisma/seed.ts` <!-- id: 0 -->
- [ ] Verify seeding success <!-- id: 1 -->
- [ ] Build and bump version <!-- id: 2 -->
