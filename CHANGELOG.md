# Changelog

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
