Sudah cukup konteks. Ini analisis lengkapnya:
     
  ---
  Apa Maksud Temuan Ini
     
  Dua Serangan yang Dimungkinkan
     
  1. Brute-force OTP di /api/auth/verify-otp-login
  
  OTP-nya hanya 4 digit (randomInt(1000, 10000) = 9.000 kemungkinan). Tidak ada pembatas percobaan, jadi penyerang bisa:

  POST /api/auth/verify-otp-login
  { nomor: "08123456789", otp: 1000, kodeId: "xxx" }  → salah
  { nomor: "08123456789", otp: 1001, kodeId: "xxx" }  → salah
  { nomor: "08123456789", otp: 1002, kodeId: "xxx" }  → salah
  ... (9000 request, selesai dalam hitungan detik)
  { nomor: "08123456789", otp: 3847, kodeId: "xxx" }  → ✅ MASUK

  Penyerang bisa login ke akun siapapun tanpa tahu OTP-nya, cukup tahu nomor HP dan kodeId milik mereka.

  2. Spam WA di /api/auth/send-otp-register

  Tidak ada pembatas, penyerang bisa kirim ribuan request → ribuan pesan WA terkirim ke nomor target (harassment) + abuse kuota WA gateway (wa.wibudev.com).

  ---
  Seberapa Serius?
  
  Untuk brute-force verify-otp: sangat serius — kalau kodeId bisa ditebak atau bocor, akun bisa diambil alih tanpa password. Tapi ada satu mitigasi natural yang sudah ada: kodeId adalah CUID yang random,
  jadi penyerang harus punya kodeId milik korban (misalnya dari intercept network atau kebocoran lain). Ini menurunkan risiko, tapi tidak menghilangkannya.

  ---
  Opsi Implementasi
  
  Endpoint ini adalah Next.js Route Handlers (/api/auth/*), bukan Elysia. Jadi Elysia plugin tidak bisa langsung dipakai di sini.

  ┌────────────────────┬───────────────────────────────────┬───────────────────────────────────────────────────────────────────────────────────┐
  │        Opsi        │               Cara                │                                     Tradeoff                                      │
  ├────────────────────┼───────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────┤
  │ In-memory Map      │ Map per IP/nomor di memori proses │ Gratis, cepat, tapi reset saat container restart, tidak bekerja di multi-instance │
  ├────────────────────┼───────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────┤
  │ Prisma/DB counter  │ Tabel RateLimitLog di PostgreSQL  │ Persistent, sudah ada DB-nya, tapi tambah load DB                                 │
  ├────────────────────┼───────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────┤
  │ Upstash Redis      │ Service Redis external            │ Robust, distributed, tapi butuh dependency + akun baru                            │
  ├────────────────────┼───────────────────────────────────┼───────────────────────────────────────────────────────────────────────────────────┤
  │ Next.js middleware │ Intercept di src/middleware.ts    │ Satu tempat untuk semua route auth                                                │
  └────────────────────┴───────────────────────────────────┴───────────────────────────────────────────────────────────────────────────────────┘

  Untuk deployment Docker single-instance seperti sekarang, in-memory Map sudah cukup dan paling simple — tidak perlu dependency baru, tidak ada biaya tambahan.

  ---
  Mau saya implementasikan? Kalau iya, saya rekomendasikan in-memory sliding window di masing-masing route handler (paling minimal, tidak ada dependency baru).

---
## ✅ DONE — 2026-06-09

Implementasi in-memory sliding window rate limiter:

**File baru**: `src/app/api/auth/_lib/rateLimiter.ts`
- `otpSendLimiter`: max 3 per nomor per 10 menit
- `otpVerifyLimiter`: max 5 per kodeId per 15 menit

**Route yang diupdate**:
- `verify-otp-login` — rate limit per kodeId + invalidate DB saat percobaan terakhir habis
- `verify-otp-register` — idem
- `send-otp-register` — rate limit per nomor
- `login` — rate limit per nomor
- `resend` — rate limit per nomor

HTTP 429 dikembalikan dengan header `Retry-After` dan pesan detik tersisa.