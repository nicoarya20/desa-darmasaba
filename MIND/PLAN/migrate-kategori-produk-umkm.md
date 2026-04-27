# Plan: Migrasi KategoriProduk → KategoriProdukUmkm untuk UMKM

## Tujuan
Ganti relasi kategori di model `Umkm` dan seluruh CRUD kategori UMKM agar menggunakan model `KategoriProdukUmkm` (bukan `KategoriProduk`). Model `KategoriProduk` tetap dipertahankan untuk `PasarDesa` dan `KategoriToPasar`.

## Analisis Kondisi Saat Ini

### Schema Prisma
- `Umkm` → `kategori KategoriProduk @relation(...)` + `kategoriId String`
- `KategoriProdukUmkm` punya relasi `Umkm[]` tapi Umkm belum punya FK ke sana (schema tidak konsisten)
- `KategoriProduk` dipakai oleh: `Umkm[]`, `PasarDesa[]`, `KategoriToPasar[]`

### File yang Perlu Diubah
1. `prisma/schema.prisma` — ubah relasi Umkm
2. `src/app/api/[[...slugs]]/_lib/ekonomi/umkm/kategori-produk/kategori-produk.ts` — ganti semua `prisma.kategoriProduk` → `prisma.kategoriProdukUmkm`
3. `src/app/api/[[...slugs]]/_lib/ekonomi/umkm/produk/create.ts` — relasi kategori di PasarDesa tidak berubah (masih `KategoriProduk`)
4. `src/app/api/[[...slugs]]/_lib/ekonomi/umkm/produk/findMany.ts` — include `kategoriProduk` di PasarDesa tidak berubah
5. `src/app/api/[[...slugs]]/_lib/ekonomi/umkm/dashboard/kpi.ts` — groupBy `kategoriId` di Umkm perlu include model baru
6. `src/app/admin/(dashboard)/_state/ekonomi/umkm/umkm.ts` — state/form kategori UMKM
7. Admin pages (list, create, edit) — tidak perlu banyak perubahan (UI tetap sama)

---

## Langkah-Langkah

### Fase 1 — Schema Prisma
**File:** `prisma/schema.prisma`

1. Di model `Umkm` (line ~2435):
   - Ubah `kategori   KategoriProduk @relation(fields: [kategoriId], references: [id])` → `kategori   KategoriProdukUmkm @relation(fields: [kategoriId], references: [id])`
   - Field `kategoriId String` tetap sama (nama field tidak perlu berubah)

2. Di model `KategoriProduk` (line ~1453):
   - Hapus baris `Umkm Umkm[]` (UMKM tidak lagi relasi ke sini)

3. Model `KategoriProdukUmkm` sudah punya `Umkm Umkm[]` — tidak perlu diubah

### Fase 2 — Database Migration
```bash
bunx prisma migrate dev --name migrate-umkm-kategori-to-kategori-produk-umkm
```
- Migration akan: ubah FK constraint di tabel `Umkm` dari `KategoriProduk` → `KategoriProdukUmkm`
- **Perhatian:** Data lama di `kategoriId` merujuk ke `KategoriProduk`. Perlu seed/migrasi data atau set nullable dulu.

> **Strategi migrasi data:**
> - Buat `kategoriId` di `Umkm` menjadi nullable sementara (`String?`)
> - Jalankan migration
> - Seed `KategoriProdukUmkm` dengan data yang sama seperti `KategoriProduk`
> - Update data Umkm yang ada agar `kategoriId` menunjuk ke `KategoriProdukUmkm` yang sesuai
> - Set kembali `kategoriId` menjadi required (`String`)

### Fase 3 — API Handler: CRUD Kategori Produk UMKM
**File:** `src/app/api/[[...slugs]]/_lib/ekonomi/umkm/kategori-produk/kategori-produk.ts`

Ganti semua `prisma.kategoriProduk` → `prisma.kategoriProdukUmkm`:
- `/find-many-all` → `prisma.kategoriProdukUmkm.findMany()`
- `/find-many` → `prisma.kategoriProdukUmkm.findMany()`
- `/create` → `prisma.kategoriProdukUmkm.create()`
- `PUT /:id` → `prisma.kategoriProdukUmkm.update()`
- `DELETE /del/:id` → `prisma.kategoriProdukUmkm.update()`

### Fase 4 — API Handler: Dashboard KPI
**File:** `src/app/api/[[...slugs]]/_lib/ekonomi/umkm/dashboard/kpi.ts`

- Bagian `groupBy kategoriId` untuk Umkm: ubah include/join agar ambil nama dari `KategoriProdukUmkm` bukan `KategoriProduk`

### Fase 5 — State Management
**File:** `src/app/admin/(dashboard)/_state/ekonomi/umkm/umkm.ts`

- Pastikan tipe data / form state kategori UMKM masih sesuai (field name tidak berubah, hanya model di backend)

### Fase 6 — Build & Verify
```bash
bun run tsc --noEmit   # Type check
bun run build          # Full build
```

---

## Yang TIDAK Berubah
- `KategoriProduk` model tetap ada (masih digunakan `PasarDesa` dan `KategoriToPasar`)
- Relasi `PasarDesa.kategoriProdukId → KategoriProduk` tidak berubah
- Admin UI pages (kategori-produk/page.tsx, create, edit) — logika UI tidak berubah, hanya backend model berbeda
- API route path tetap sama (`/api/ekonomi/kategoriproduk/*`)

---

## Risiko
- **Data migration:** Umkm yang ada punya `kategoriId` yang merujuk ke `KategoriProduk`. Perlu migrasi data atau data akan hilang relasi.
- **Solusi:** Buat `KategoriProdukUmkm` dengan data yang sama, lalu update `Umkm.kategoriId` via SQL migration script.
