# Summary: Security Fix — Proteksi Middleware /validasi dan /waiting-room

**Tanggal:** 10 Juni 2026  
**Versi:** 0.1.75  
**Branch:** tasks/middleware-security/fix-validasi-waiting-room-protection/10-Jun-26

---

## Konteks

Analisis route tree menemukan dua celah keamanan kritis pada alur autentikasi:

| Route | Masalah |
|---|---|
| `/validasi` | Hanya dijaga `localStorage.getItem('auth_kodeId')` — client-side, bisa di-bypass via DevTools |
| `/waiting-room` | Tidak ada proteksi apapun — bisa dibuka siapa saja termasuk visitor tidak terautentikasi |

Middleware sebelumnya (`matcher: ['/admin/:path*']`) tidak meng-cover kedua route ini sama sekali.

Ditemukan juga `PUBLIC_ADMIN_ROUTES` yang berisi 4 entri (`/admin/login`, `/admin/registrasi`, `/admin/validasi`, `/admin/waiting-room`) yang tidak pernah cocok dengan URL nyata — dead code.

---

## Perubahan

### `src/middleware.ts`

**1. Proteksi `/validasi` (auth_flow cookie check)**

- Tambah handler untuk `path.startsWith('/validasi')`
- Cek cookie `auth_flow` yang di-set oleh `/api/auth/set-flow` saat OTP dikirim
- Cookie hanya valid 5 menit (`maxAge: 60 * 5`) dan di-clear setelah verifikasi berhasil via `/api/auth/clear-flow`
- Jika tidak ada atau nilai bukan `'login'`/`'register'` → redirect ke `/login`

**2. Proteksi `/waiting-room` (JWT valid check)**

- Tambah handler untuk `path.startsWith('/waiting-room')`
- Cek JWT token (di-set oleh `verify-otp-login` untuk login flow, atau `finalize-registration` untuk register flow)
- Jika tidak ada token → redirect ke `/login`
- Jika token valid dan `isActive=true` → redirect ke `/admin` (tidak perlu menunggu)
- Jika token valid dan `isActive=false` → allow (kondisi normal menunggu persetujuan)

**3. Refactor `verifyToken` helper**

- Extract logika `jwtVerify` yang duplikat menjadi satu fungsi `verifyToken(token)`
- Dipakai oleh handler `/waiting-room` dan handler `/admin/*`

**4. Hapus `PUBLIC_ADMIN_ROUTES` (dead code)**

- 4 entri whitelist (`/admin/login`, `/admin/registrasi`, `/admin/validasi`, `/admin/waiting-room`) tidak pernah match URL nyata di app
- URL aktual ada di top-level (`/login`, dll) atau `/admin/auth/...`

**5. Hapus block komentar lama (90 baris)**

- Sisa implementasi middleware lama yang di-comment-out sejak awal project

**6. Update `matcher`**

```ts
// Sebelum
matcher: ['/admin/:path*']

// Sesudah
matcher: ['/admin/:path*', '/validasi', '/waiting-room']
```

---

## Alur yang Terjaga Sekarang

```
/registrasi  →  kirim OTP  →  auth_flow cookie di-set (5 menit)
                                        ↓
/validasi  ← middleware cek auth_flow  →  redirect /login jika tidak ada
                                        ↓  (OTP verified → JWT di-set, auth_flow di-clear)
/waiting-room  ← middleware cek JWT    →  redirect /login jika tidak ada JWT
                                        ↓  (isActive=true)
/admin  ← middleware cek JWT + isActive  →  redirect /login jika tidak valid
```

---

## Yang Tidak Diubah

- Logika `/admin/*` tidak berubah
- Halaman client-side `/validasi` dan `/waiting-room` tidak disentuh
- API auth endpoints tidak disentuh
- Tidak ada dependency baru

---

## Dampak

- Visitor random tidak bisa lagi membuka `/validasi` secara langsung
- Visitor random tidak bisa lagi membuka `/waiting-room` tanpa sesi valid
- Admin yang sudah aktif dan tersesat ke `/waiting-room` akan di-redirect otomatis ke `/admin`
- Tidak ada breaking change pada alur normal registrasi/login
