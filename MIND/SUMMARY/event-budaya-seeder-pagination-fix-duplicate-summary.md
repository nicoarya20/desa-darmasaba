# Summary: Event Budaya — Seeder, Pagination & Fix Duplicate Options

**Tanggal:** 2026-05-21  
**Branch:** `tasks/event-budaya/feat-seeder-pagination-fix-duplicate/20260521`  
**Scope:** Fitur Kalender Event Budaya (admin + public) + fix bug + seeder

---

## Perubahan yang Dilakukan

### 1. Fix Bug: Duplicate Options di Halaman Kegiatan Desa (Public)
**File:** `src/app/darmasaba/(pages)/desa/kegiatan-desa/_lib/layoutTabs.tsx`

- **Masalah:** Mantine `<Select>` error `Duplicate options are not supported` untuk value "Sosial" karena data kategori di DB memiliki nama duplikat.
- **Fix:** Deduplikasi `kategoriOptions` menggunakan `Map` sebelum data masuk ke `<Select>`.
- **Root cause:** Data duplikat di tabel kategori kegiatan desa — perlu dibersihkan dari sisi DB.

### 2. Fitur Kalender Event Budaya (Admin CMS)
**Files:**
- `src/app/admin/(dashboard)/desa/event-budaya/page.tsx` — List event dengan table, aksi edit/hapus/lihat
- `src/app/admin/(dashboard)/desa/event-budaya/[id]/page.tsx` — Detail & edit event
- `src/app/admin/(dashboard)/desa/event-budaya/layout.tsx` — Layout wrapper admin
- `src/app/admin/(dashboard)/_state/desa/eventBudaya.ts` — State Valtio: create, findMany, findUnique, edit, delete, findUpcoming
- `src/app/api/[[...slugs]]/_lib/desa/event-budaya/index.ts` — Elysia router: tambah endpoint `/find-upcoming`
- `src/app/api/[[...slugs]]/_lib/desa/event-budaya/find-upcoming.ts` — Query event mendatang (tanggal >= hari ini, max 20)

### 3. Fitur Kalender Event Budaya (Public)
**File:** `src/app/darmasaba/(pages)/desa/event-budaya/page.tsx`

- Menampilkan list event budaya dengan pagination **5 data per halaman**
- Menggunakan `eventBudayaState.findMany` (bukan `findUpcoming`) agar pagination berjalan
- Komponen `Pagination` dari Mantine di bawah list
- Skeleton loading saat data belum tersedia

### 4. Navigasi Navbar
**File:** `src/con/navbar-list-menu.ts`

- Tambah menu **"Kalender Event Budaya"** (id: 2.9) di bawah "Kegiatan Desa" dengan href `/darmasaba/desa/event-budaya`

### 5. Seeder: Data Event Budaya
**Files:**
- `prisma/data/desa/event-budaya/event-budaya.json` — Diperluas dari **8 → 34 events**
- `prisma/_seeder_list/desa/event-budaya/seed_event_budaya.ts` — Tidak diubah (sudah kompatibel)

**Cakupan seeder (2025–2026):**
- Hari Raya Hindu Bali: Galungan (×5), Kuningan (×5), Nyepi, Melasti, Saraswati, Pagerwesi
- Tumpek: Landep, Uduh, Krulut
- Upacara desa: Ngusaba Desa, Pujawali Pura Puseh, Melaspas
- Event nasional: HUT RI ke-80 & ke-81, Hari Kesaktian Pancasila
- Event budaya: Festival Budaya Desa, Parade Ogoh-Ogoh, Pementasan Wayang Kulit

---

## Arsitektur yang Diikuti

- **State management:** Valtio proxy di `_state/desa/eventBudaya.ts`
- **API:** Elysia.js endpoint di `/api/desa/eventbudaya/*`
- **Pagination:** Server-side via `findMany` (skip/take Prisma), state sudah punya `page`, `totalPages`, `total`
- **Seeder:** JSON data + `upsert` Prisma (aman dijalankan berulang)

---

## Catatan

- `STRUKTUR.md` dihapus (file lama tidak relevan)
- Seeder bisa dijalankan dengan `bun run prisma/seed.ts`
- Bug duplicate kategori di DB belum dibersihkan dari sisi data — hanya di-guard di UI
