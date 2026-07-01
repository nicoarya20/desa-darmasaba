# Changelog

## [0.1.86] - 2026-07-01
### Fixed
- **`/admin/*` timeout intermiten (HTTP 524/hang) di STG**: setelah fix TLS 0.1.85, middleware memanggil `get-session` via `X-Forwarded-Host` (domain publik) sehingga container memanggil dirinya sendiri lewat Cloudflare (round-trip eksternal) → kadang hang >25s. Diganti ke loopback internal `http://127.0.0.1:PORT` — validasi sesi tetap jalan, tanpa keluar ke proxy, tanpa masalah TLS localhost.

## [0.1.85] - 2026-07-01
### Fixed
- **500 Internal Server Error di `/admin/*` pada STG**: middleware memanggil `get-session` memakai `request.nextUrl.origin` yang di dalam container ter-resolve ke `https://localhost:3000` → fetch HTTPS ke localhost gagal validasi TLS (`ERR_TLS_CERT_ALTNAME_INVALID`) → guard melempar 500 di tiap akses admin. Origin kini diambil dari header `X-Forwarded-*` proxy (`publicOriginFromHeaders`), dan `getSession` yang gagal me-redirect ke `/login` alih-alih 500.

## [0.1.84] - 2026-07-01
### Fixed
- Login Google user lama (`account_not_linked`): user yang dibuat sistem manual (`emailVerified=false`) kini bisa login — `accountLinking` dengan `trustedProviders: ["google"]` + `requireLocalEmailVerified: false`.
- Redirect setelah login mengikuti role lagi: gateway `/auth/callback` membaca sesi server-side lalu mengarahkan admin ke dashboard sesuai role, user Google ke `/profile` (sebelumnya semua ke `/`).

### Changed
- Untrack file junk/generated dari repo (MIND/, QC/, test-results/, dll) + perluas `.gitignore`.

## [0.1.83] - 2026-07-01
### Added
- Migrasi autentikasi ke **Better Auth** (Google OAuth saja), menyelaraskan dengan standar tim (`base-template2`). Session store di PostgreSQL, **tanpa Redis** (rate-limit storage `database`). Handler di `/api/auth/*` via `toNextJsHandler` — Elysia catch-all `/api/[[...slugs]]` tak berubah.
- Model Better Auth: `session`, `account`, `verification`, `rate_limit`, plus kolom `emailVerified` pada `users`. Field `name`/`image` dipetakan ke `username`/`avatarUrl` existing; `roleId`/`isActive` sebagai custom field (tak bisa di-set dari client).
- `src/lib/auth-policy.ts`: kebijakan role murni (user Google baru → `roleId "5"`, email di `SUPER_ADMIN_EMAIL` → `roleId "1"`, gate admin `roleId <= 4`), dengan unit + contract test.

### Changed
- Login admin: tombol Google memakai `authClient.signIn.social` (Better Auth), form OTP dihapus dari tampilan.
- Guard: `requireAuth` (API), `middleware.ts` (route), `/api/auth/me` & `/api/auth/logout` kini memakai sesi Better Auth. Bentuk return `requireAuth` dipertahankan (kontrak internal).
- User Google baru langsung `isActive: true` → diarahkan ke `/profile` tanpa perlu approval admin.

### Notes
- **Env baru wajib**: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (lihat `.env.example`). Redirect URI Google console: `<BETTER_AUTH_URL>/api/auth/callback/google`.
- **Cutover**: cookie sesi berganti → semua user perlu login ulang sekali (Google, 1 klik).
- Kode OTP/iron-session/manual-Google lama masih ada (dorman) — penghapusan & drop tabel legacy (`user_sessions`, `KodeOtp`, kolom `googleId`) ditunda ke pekerjaan terpisah karena masih dipakai modul non-auth (user management, health check).

## [0.1.82] - 2026-06-30
### Fixed
- Login Google: setelah memilih akun, user tidak lagi dilempar ke `https://localhost:3000/...`. Semua redirect callback (termasuk jalur sukses) kini memakai origin publik dari header `X-Forwarded-Proto`/`X-Forwarded-Host` yang di-set proxy (Cloudflare → Portainer), bukan `req.url` yang ter-resolve ke host internal container.
- Login Google `oauth_failed`: role `USER` (id `5`) di-seed lewat migration idempotent, karena entrypoint produksi hanya menjalankan `prisma migrate deploy` tanpa `db seed` sehingga role bisa absen di STG/prod dan membuat pembuatan user Google kena FK violation.

### Changed
- Bootstrap admin via Google: email `SuperAdmin-Nico` diisi lewat migration (hanya bila masih kosong) agar login Google ter-match by email dan role admin (0) dipertahankan.

## [0.1.81] - 2026-06-30
### Fixed
- `GET /api/auth/google` tidak lagi mengembalikan 500 buram saat env `GOOGLE_*` belum di-set. Base URL redirect fallback kini diambil dari origin request (`req.url`), bukan `NEXT_PUBLIC_BASE_URL` yang bernilai `/` (membuat `new URL()` melempar `TypeError`). Saat config kurang, user diarahkan rapi ke `/login?error=oauth_config`.

## [0.1.79] - 2026-06-30
### Added
- Login dengan Google (OAuth Authorization Code Flow, manual tanpa library) — route `GET /api/auth/google` & `GET /api/auth/google/callback`.
- Halaman profil publik `/darmasaba/profile` untuk user non-admin, dengan tombol keluar.
- Role baru `USER` (id `5`) untuk user publik hasil login Google.
- Field `email`, `googleId`, `avatarUrl` pada user; admin bootstrap via seeder (cocokkan akun Google by email, role admin dipertahankan).

### Changed
- Tombol "Login dengan Google" di halaman login kini mengarah ke alur OAuth (sebelumnya placeholder).
- Middleware `/admin/*` kini menolak user non-admin (roleId > 4) dan mengalihkan ke halaman profil.
- `/api/auth/me` ikut mengembalikan `email` dan `avatar`.
- Kolom `nomor` pada user jadi opsional (user Google tidak punya nomor HP).
