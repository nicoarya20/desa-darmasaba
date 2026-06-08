# Summary - Analisa Kesiapan Production

**Tanggal**: 2026-05-30  
**Status**: Belum siap production — ada 3 isu CRITICAL dan 6 isu HIGH

---

## Hasil Analisa

Project desa-darmasaba (v0.1.67) dianalisa secara menyeluruh dari sisi keamanan, kualitas kode, infrastruktur, dan testing. Total ditemukan **20 temuan** lintas 4 tingkat severity.

---

## CRITICAL (Wajib fix sebelum deploy ke production)

| # | Masalah | File |
|---|---------|------|
| 1 | **CORS wildcard + credentials** — `origin: ["*", ...]` dengan `credentials: true` melanggar spec browser dan membuka akses credentialed dari semua origin | `src/app/api/[[...slugs]]/route.ts:33-45` |
| 2 | **Cookie auth tanpa `httpOnly`** — session token bisa diakses JavaScript, XSS langsung jadi account takeover | `src/app/api/[[...slugs]]/_lib/auth/validasi/route.ts:57` |
| 3 | **`NEXT_PUBLIC_` secret keys** — `NEXT_PUBLIC_BASE_SESSION_KEY` dan `NEXT_PUBLIC_BASE_TOKEN_KEY` di-bundle ke client JS, seluruh visitor bisa lihat JWT signing key | `types/env.d.ts:29-30` |

---

## HIGH

| # | Masalah | File |
|---|---------|------|
| 4 | Raw error message expose ke client (stack trace, nama tabel DB) | Banyak file di `_lib/` |
| 5 | Session fallback ke string literal jika `SESSION_PASSWORD` tidak di-set | `src/lib/session.ts:33` |
| 6 | Tidak ada security headers (CSP, X-Frame-Options, HSTS, Referrer-Policy) | `next.config.ts` |
| 7 | Tidak ada rate limiting di endpoint OTP/auth — rentan brute force | `src/app/api/auth/` |
| 8 | `migrate resolve --rolled-back` hardcoded berjalan setiap container startup | `docker-entrypoint.sh:8` |
| 9 | Hampir tidak ada test — total 3 test, semua pakai mock, bukan real implementation | `__tests__/` |

---

## MEDIUM

| # | Masalah |
|---|---------|
| 10 | Soft delete pakai `deletedAt @default(now())` bukan `DateTime?` — semua record baru otomatis "sudah dihapus" di 163+ model |
| 11 | Missing database indexes di foreign keys dan filter columns (Berita, FileStorage, PermohonanInformasiPublik, dll) |
| 12 | Docker image besar karena `output: 'standalone'` tidak dipakai di `next.config.ts` |
| 13 | `error.tsx` tidak punya tombol retry/reset/kembali ke home |
| 14 | Script `gen:api` kosong tapi dijalankan di Dockerfile |

---

## LOW

| # | Masalah |
|---|---------|
| 15 | File debug di root repo: `xcoba.ts`, `xcoba2.ts`, `xx.ts`, `test.txt`, `xx.txt`, `x.json`, dll |
| 16 | Dependency tidak dipakai: `@cubejs-client/core`, `add`, `parcel`, `zlib`, `@elysiajs/cookie`, `@elysiajs/stream` |
| 17 | CI/CD tidak jalankan test sebelum build & push Docker |
| 18 | `MINIO_USE_SSL=false` sebagai default di `.env.example` |
| 19 | `tsconfig.json` include path non-standard (`.wibu`, `destack/page.js`) |
| 20 | Tidak ada audit logging untuk aksi admin yang sensitif |

---

## Urutan Fix yang Disarankan

```
1. Tambah httpOnly: true pada Elysia auth cookie             → 1 baris
2. Rename NEXT_PUBLIC_BASE_SESSION_KEY & TOKEN_KEY           → env vars + seluruh usage
3. Perbaiki CORS — hapus wildcard dari origin list           → 1 baris
4. Hapus fallback string di SESSION_PASSWORD                 → raise error jika tidak di-set
5. Tambah security headers di next.config.ts                 → headers() block
6. Hapus hardcoded migrate resolve di docker-entrypoint.sh   → 1 baris
7. Sanitasi error response di catch blocks _lib/             → generic message, log server-side
8. Implementasi rate limiting di endpoint auth               → middleware baru
```

---

## Tools yang Digunakan

- Static analysis seluruh codebase via Explore agent
- Review manual: `route.ts`, `session.ts`, `docker-entrypoint.sh`, `prisma/schema.prisma`, `.env.example`, `next.config.ts`, `tsconfig.json`, `package.json`
