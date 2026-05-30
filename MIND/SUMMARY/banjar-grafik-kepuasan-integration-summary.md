# Summary: Banjar Integration untuk Penderita Penyakit (GrafikKepuasan)

**Tanggal:** 2026-05-30  
**Branch:** `tasks/kesehatan/banjar-penderita-penyakit/20260530`

---

## Apa yang Dikerjakan

Menambahkan relasi **Banjar** ke modul Penderita Penyakit (model `GrafikKepuasan`) secara end-to-end: dari schema database, API, state management, hingga UI admin.

---

## Perubahan per Layer

### 1. Database — `prisma/schema.prisma` + Migration
- Tambah field `banjarId String?` (optional) ke model `GrafikKepuasan`
- Tambah relasi ke model `Banjar` dengan `onDelete: SetNull`
- Migration: `20260530025023_add_banjar_to_grafik_kepuasan`

### 2. API Banjar (baru) — `src/app/api/[[...slugs]]/_lib/desa/banjar/`
- CRUD lengkap: `create.ts`, `findMany.ts`, `findUnique.ts`, `updt.ts`, `del.ts`, `index.ts`
- Didaftarkan di `src/app/api/[[...slugs]]/_lib/desa/index.ts`
- Endpoint: `/api/desa/banjar/*`

### 3. API GrafikKepuasan (update)
- `create.ts` — terima `banjarId` opsional, include `banjar` di response
- `find-many.ts` — filter by `banjarId` via query param, include `banjar`
- `findUnique.ts` — include `banjar` di response
- `updt.ts` — terima dan simpan `banjarId`, include `banjar`
- `index.ts` — daftarkan route yang diperlukan

### 4. State — `grafikKepuasan.ts`
- Tambah `banjarId` ke `defaultForm`, schema Zod, `create.form`, `update.form`
- Tambah `banjarList` proxy: fetch dari `/api/desa/banjar/findMany?limit=100`
- `findMany.load()` terima parameter `banjarId` untuk filter
- Type `findMany.data` update ke include `banjar: { id, name }`

### 5. State Banjar (baru) — `src/app/admin/(dashboard)/_state/desa/banjar.ts`
- Proxy Valtio untuk CRUD Banjar (create, findMany, findUnique, update, delete)

### 6. Admin UI Banjar (baru) — `src/app/admin/(dashboard)/desa/banjar/`
- `page.tsx` — tabel list banjar + kartu mobile + pagination
- `create/page.tsx` — form tambah banjar
- `[id]/page.tsx` — detail + hapus + edit

### 7. Admin UI Penderita Penyakit (update)
- `page.tsx` (list) — tambah kolom Banjar di tabel desktop, field Banjar di kartu mobile, filter Select by banjar
- `create/page.tsx` — tambah `Select` banjar (opsional), load `banjarList` on mount
- `[id]/page.tsx` (detail) — tambah baris Banjar
- `[id]/edit/page.tsx` — tambah `banjarId` ke `formData`, load `banjarList`, tambah `Select` banjar

### 8. Sidebar Admin — `list_PageAdmin.tsx`
- Tambah menu "Banjar" di bawah domain Desa

---

## Keputusan Desain
- `banjarId` dibuat **opsional** agar data lama tidak terpengaruh
- Filter banjar di list page menggunakan Select + clear, tidak memerlukan halaman terpisah
- `banjarList` di-load sekali on mount, bukan di-refetch tiap render

---

## Verifikasi
- `bun run build` ✅ sukses tanpa error TypeScript
