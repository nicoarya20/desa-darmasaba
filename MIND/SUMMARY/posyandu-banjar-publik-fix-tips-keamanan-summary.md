# Summary: Posyandu Banjar + Halaman Publik + Fix Tips Keamanan

**Tanggal:** 2026-05-28  
**Branch:** tasks/kesehatan/posyandu-banjar-publik-fix-tips-keamanan/20260528

---

## Apa yang Berubah

### 1. Fitur Banjar pada Posyandu

**Problem:** Posyandu tidak memiliki relasi ke wilayah banjar, sehingga tidak bisa dikelompokkan per banjar.

**Perubahan:**
- `prisma/schema.prisma` — Tambah model `Banjar` baru dan field `banjarId` (optional FK) pada model `Posyandu`
- `prisma/migrations/20260528100000_add_banjar_to_posyandu/migration.sql` — Migration: CREATE TABLE `Banjar`, ALTER TABLE `Posyandu` ADD COLUMN `banjarId`
- `prisma/_seeder_list/kesehatan/seed_banjar.ts` — Seeder baru untuk data banjar
- `prisma/data/kesehatan/banjar/banjar.json` — Data seed 16 banjar Desa Darmasaba
- `prisma/seed.ts` — Tambah `seedBanjar()` sebelum `seedTipsKeamanan()`

**API changes:**
- `src/app/api/[[...slugs]]/_lib/kesehatan/posyandu/create.ts` — Terima `banjarId` optional saat create
- `src/app/api/[[...slugs]]/_lib/kesehatan/posyandu/updt.ts` — Terima `banjarId` optional saat update
- `src/app/api/[[...slugs]]/_lib/kesehatan/posyandu/find-by-id.ts` — Include relasi `banjar`
- `src/app/api/[[...slugs]]/_lib/kesehatan/posyandu/find-many.ts` — Include relasi `banjar`
- `src/app/api/[[...slugs]]/_lib/kesehatan/posyandu/index.ts` — Tambah endpoint banjar
- `src/app/api/[[...slugs]]/_lib/kesehatan/index.ts` — Daftarkan endpoint banjar baru
- `src/app/api/[[...slugs]]/_lib/kesehatan/banjar/` — Module API baru untuk list banjar
- `src/app/api/[[...slugs]]/_lib/kesehatan/balita/find-many.ts` — Support filter per posyandu
- `src/app/api/[[...slugs]]/_lib/kesehatan/ibu-hamil/find-many.ts` — Support filter per posyandu

**Admin CMS changes:**
- `src/app/admin/(dashboard)/kesehatan/posyandu/list-posyandu/page.tsx` — Tampilkan info banjar di tabel
- `src/app/admin/(dashboard)/kesehatan/posyandu/list-posyandu/create/page.tsx` — Tambah Select banjar
- `src/app/admin/(dashboard)/kesehatan/posyandu/list-posyandu/[id]/edit/page.tsx` — Tambah Select banjar
- `src/app/admin/(dashboard)/kesehatan/posyandu/list-posyandu/[id]/page.tsx` — Tampilkan nama banjar di detail
- `src/app/admin/(dashboard)/_state/kesehatan/posyandu/posyandu.ts` — Include `banjar` di state

---

### 2. Redesign Halaman Publik Posyandu

**Problem:** Halaman publik `/darmasaba/kesehatan/posyandu` hanya menampilkan daftar posyandu saja, belum menampilkan data balita, ibu hamil, dan ringkasan statistik.

**Perubahan:**
- `src/app/darmasaba/(pages)/kesehatan/posyandu/page.tsx` — Redesign total dengan sistem Tab:
  - **Tab Ringkasan** — Statistik kesehatan (total posyandu, balita, ibu hamil, angka stunting)
  - **Tab Data Posyandu** — List posyandu dengan filter search dan info banjar
  - **Tab Data Balita** — Tabel data balita dengan filter search + filter status stunting
  - **Tab Ibu Hamil** — Tabel data ibu hamil dengan filter search + filter status
- `src/app/darmasaba/(pages)/kesehatan/posyandu/[id]/page.tsx` — Halaman detail posyandu dengan tampilan tab balita & ibu hamil per posyandu
- `src/app/admin/(dashboard)/_state/kesehatan/balita/balita.ts` — Tambah state `findMany` untuk halaman publik
- `src/app/admin/(dashboard)/_state/kesehatan/ibu-hamil/ibuHamil.ts` — Tambah state `findMany` untuk halaman publik
- `src/app/admin/(dashboard)/_state/kesehatan/ringkasan-kesehatan/ringkasanKesehatan.ts` — Refactor state ringkasan
- `src/app/admin/(dashboard)/kesehatan/posyandu/balita/page.tsx` — Update admin balita page
- `src/app/admin/(dashboard)/kesehatan/posyandu/ibu-hamil/page.tsx` — Update admin ibu hamil page
- `src/app/admin/(dashboard)/kesehatan/posyandu/ringkasan-kesehatan/page.tsx` — Update admin ringkasan
- `src/app/api/[[...slugs]]/_lib/kesehatan/ringkasan-kesehatan/stats.ts` — Perbaiki kalkulasi statistik
- `src/app/api/[[...slugs]]/_lib/kesehatan/ringkasan-kesehatan/index.ts` — Update endpoint

---

### 3. Fix Image Tips Keamanan (Ketuker)

**Problem:** Gambar pada data Tips Keamanan tertukar antara "Keamanan Rumah" dan "Keamanan Lingkungan Tanggungjawab Bersama".

**Root cause:** Nilai `imageName` di `tips-keamanan.json` salah assign — nama file gambar di-swap antara 2 record.

**Perubahan:**
- `prisma/data/keamanan/tips-keamanan/tips-keamanan.json` — Tukar nilai `imageName`:
  - "Keamanan Rumah" → `vwZsaxcoFWDlxG1PW7FC0-mobile.webp` (sebelumnya `dSe0xyvNLkP2t2f6iq-Hk-mobile.webp`)
  - "Keamanan Lingkungan..." → `dSe0xyvNLkP2t2f6iq-Hk-mobile.webp` (sebelumnya `vwZsaxcoFWDlxG1PW7FC0-mobile.webp`)

**Catatan:** `imageId` akan null di lokal karena MinIO lokal tidak punya file tersebut. Di STG, MinIO sudah punya kedua file — seed akan resolve dengan benar setelah deploy.

---

### 4. Cleanup Seed Core

- `prisma/_seeder_list/core/seed_app_menu.ts` — Dihapus (sudah tidak dipakai)
- `prisma/_seeder_list/core/seed_core.ts` — Dihapus (sudah tidak dipakai)
- `prisma/seed.ts` — Hapus import + call ke seed core, tambah `seedBanjar` dan `seedTipsKeamanan`

---

### 5. Update Seed PPID & Data

- `prisma/data/ppid/struktur-organisasi-ppid/struktur-organisasi-ppid.json` — Update data struktur organisasi PPID
- `prisma/_seeder_list/kesehatan/posyandu/seed_posyandu.ts` — Update seeder posyandu untuk include `banjarId`
- `prisma/data/kesehatan/posyandu/posyandu.json` — Update data seed posyandu dengan `banjarId`

---

## Catatan Penting

- **Migration wajib dijalankan** saat deploy: `prisma migrate deploy` sudah otomatis via `docker-entrypoint.sh`
- **Seed harus dijalankan ulang** di STG setelah deploy agar data banjar terisi dan imageId tips keamanan terkoreksi
- Gambar tips keamanan akan tetap null di lokal (MinIO lokal tidak punya file), tapi akan resolve di STG
