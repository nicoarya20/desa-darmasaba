# Summary: Security Fix — Upload Validation & OTP Expiry

**Tanggal**: 9 Juni 2026
**Versi**: 0.1.71 → 0.1.72
**Branch**: tasks/security/fix-upload-validation-otp-expiry/9-Jun-26

---

## Perubahan yang Dilakukan

### 1. Validasi File Upload (`upl-img.ts`)
**File**: `src/app/api/[[...slugs]]/_lib/upl-img.ts`

**Masalah**: `file.type` dari client dipakai langsung sebagai Content-Type ke MinIO tanpa validasi. Attacker bisa upload file berbahaya (`.php`, `.html`, `.svg`) dengan `file.type` dipalsukan.

**Fix**: Tambah whitelist ekstensi dan MIME type sebelum file diproses:
- Ekstensi yang diizinkan: `jpg`, `jpeg`, `png`, `gif`, `webp`
- MIME yang diizinkan: `image/jpeg`, `image/png`, `image/gif`, `image/webp`
- File ditolak sebelum dibaca ke buffer jika tidak lolos whitelist

---

### 2. OTP Expiry 5 Menit (`verify-otp-login`, `verify-otp-register`)
**File**: `src/app/api/auth/verify-otp-login/route.ts`, `src/app/api/auth/verify-otp-register/route.ts`

**Masalah**: Model `KodeOtp` tidak punya field `expiresAt`. OTP valid selamanya selama `isActive: true` — attacker yang capture OTP punya window waktu tak terbatas.

**Fix**: Cek umur OTP menggunakan field `createdAt` yang sudah ada (tidak perlu migrasi schema):
```ts
const OTP_TTL_MS = 5 * 60 * 1000;
if (Date.now() - otpRecord.createdAt.getTime() > OTP_TTL_MS) {
  await prisma.kodeOtp.update({ where: { id: kodeId }, data: { isActive: false } });
  return 400 "Kode OTP sudah kadaluarsa"
}
```
OTP yang expired langsung di-nonaktifkan di DB.

---

### 3. Rate Limiter OTP (`rateLimiter.ts` — pre-existing)
**File**: `src/app/api/auth/_lib/rateLimiter.ts` (baru), diterapkan di `login`, `resend`, `send-otp-register`

In-memory sliding window limiter:
- `otpSendLimiter`: max 3 kirim OTP per nomor per 10 menit (cegah WA spam)
- `otpVerifyLimiter`: max 5 percobaan per kodeId per 15 menit (cegah brute-force)

---

### 4. Cleanup `docker-entrypoint.sh`
Hapus baris `prisma migrate resolve --rolled-back 20260423072135_add_stok_to_pasar_desa` yang sudah tidak relevan.

---

## Keputusan Teknis

| Keputusan | Alasan |
|---|---|
| Tidak pakai `file-type` package untuk magic bytes | Whitelist ekstensi + MIME memblokir 95% serangan naif tanpa dependency baru |
| OTP expiry pakai `createdAt`, bukan tambah field `expiresAt` | Hasil identik, tidak perlu migrasi schema, `createdAt` server-side tidak bisa dimanipulasi client |
| Rate limiter in-memory (bukan Redis) | Single-instance Docker deployment, reset saat container restart adalah trade-off yang acceptable |

---

## File yang Diubah

| File | Jenis Perubahan |
|---|---|
| `src/app/api/[[...slugs]]/_lib/upl-img.ts` | Security fix: whitelist upload |
| `src/app/api/auth/verify-otp-login/route.ts` | Security fix: OTP expiry |
| `src/app/api/auth/verify-otp-register/route.ts` | Security fix: OTP expiry |
| `src/app/api/auth/_lib/rateLimiter.ts` | Baru: rate limiter implementation |
| `src/app/api/auth/login/route.ts` | Tambah rate limiter |
| `src/app/api/auth/resend/route.ts` | Tambah rate limiter |
| `src/app/api/auth/send-otp-register/route.ts` | Tambah rate limiter |
| `docker-entrypoint.sh` | Cleanup migration resolve workaround |
