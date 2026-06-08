# Summary: Fix CORS — Hapus Wildcard Headers

**Tanggal**: 8 Juni 2026  
**Versi**: 0.1.70  
**Branch**: tasks/cors/fix-cors-wildcard-headers/20260608

---

## Perubahan

### File: `src/app/api/[[...slugs]]/route.ts`

Menghapus konfigurasi wildcard `*` dari CORS yang berpotensi jadi celah keamanan:

| Field | Sebelum | Sesudah |
|-------|---------|---------|
| `origin` | `["*", "http://localhost:3000", ...]` | `["http://localhost:3000", ...]` |
| `allowedHeaders` | `["Content-Type", "Authorization", "Accept", "*"]` | `["Content-Type", "Authorization", "Accept"]` |
| `exposedHeaders` | `["Content-Range", "X-Content-Range", "*"]` | `["Content-Range", "X-Content-Range"]` |

---

## Alasan

- Wildcard `*` di `origin` memungkinkan **semua domain** mengakses API — ini tidak aman untuk endpoint yang menggunakan `credentials: true`
- Wildcard `*` di `allowedHeaders` dan `exposedHeaders` membuka header arbitrary dari request/response
- Konfigurasi sekarang menggunakan domain eksplisit: `localhost:3000`, `localhost:3001`, dan domain production/stg

---

## Dampak

- Tidak ada perubahan fungsional untuk request dari domain yang terdaftar
- Request dari domain lain akan ditolak CORS (sebelumnya lolos karena `*`)
- Tidak perlu migrasi DB atau restart khusus
