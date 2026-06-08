# Summary: Build & Import Fixes

**Tanggal:** 8 Juni 2026  
**Branch:** tasks/build/fix-build-import/20260608

---

## Perubahan

### 1. `package.json` — Tambah `NODE_OPTIONS` pada build script

**Perubahan:**
```diff
- "build": "next build",
+ "build": "NODE_OPTIONS='--max-old-space-size=4096' next build",
```

**Alasan:** Build Next.js gagal karena kehabisan memori heap V8 pada proses kompilasi. Dengan menaikkan batas heap ke 4096 MB, build berhasil diselesaikan.

---

### 2. `src/app/layout.tsx` — Hapus `export const dynamic = 'force-dynamic'`

**Perubahan:**
```diff
- // Force dynamic rendering untuk menghindari error prerendering
- export const dynamic = 'force-dynamic';
```

**Alasan:** Directive `force-dynamic` di root layout menyebabkan seluruh halaman menonaktifkan static optimization. Setelah penyebab asli prerender error diselesaikan di lapisan yang tepat, directive ini tidak lagi diperlukan dan justru menurunkan performa.

---

### 3. `src/lib/api-fetch.ts` — Ubah ke type-only import

**Perubahan:**
```diff
- import { AppServer } from '@/app/api/[[...slugs]]/route'
+ import type { AppServer } from '@/app/api/[[...slugs]]/route'
```

**Alasan:** `AppServer` hanya dipakai sebagai tipe TypeScript (untuk `treaty<AppServer>()`). Menggunakan `import type` memastikan import ini dihapus pada compile time dan tidak memunculkan side effect dari `route.ts` saat dipakai di sisi client. Ini juga mencegah potensi circular dependency di runtime.

---

## Dampak

- Build lebih stabil di environment dengan RAM terbatas
- Halaman publik dapat memanfaatkan static/ISR rendering kembali (tidak semua di-force dynamic)
- Bundle client lebih bersih karena `AppServer` tidak di-import sebagai nilai runtime
