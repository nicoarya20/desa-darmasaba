# Changelog

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
