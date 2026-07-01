# Analisa Metode Autentikasi — `bipprojectbali/base-template2`

> Sumber: https://github.com/bipprojectbali/base-template2 (public, TypeScript, branch `main`)
> Tanggal analisa: 2026-07-01

---

## 1. Ringkasan (TL;DR)

Repo ini memakai **[Better Auth](https://better-auth.com) v1.6.9** — library auth untuk TypeScript.
Model autentikasinya:

- **Session-based** (bukan JWT stateless) — session disimpan di server.
- **Cookie HttpOnly bertanda tangan (signed)** — `better-auth.session_token=<token>.<HMAC-SHA256>`.
- **Dua metode login**: Email/Password + Google OAuth.
- **Dual storage**: Redis (cepat, primary read) + PostgreSQL via Prisma (audit/persist).
- **Role-based access control**: `USER | QC | ADMIN | SUPER_ADMIN`.

Stack: **Elysia.js** (backend) + **React + TanStack (Router/Query)** (frontend) + **Prisma/Postgres** + **Redis**.

---

## 2. File-file Kunci

| File | Peran |
|------|-------|
| `src/lib/auth.ts` | Instance Better Auth — konfigurasi utama (adapter, storage, OAuth, hooks) |
| `src/lib/auth-middleware.ts` | Plugin Elysia — mount handler + inject `authUser` ke tiap request |
| `src/lib/auth-client.ts` | Better Auth React client untuk frontend |
| `src/lib/env.ts` | Wajib: `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID/SECRET` |
| `src/frontend/hooks/useAuth.ts` | Hook `useSession`, `useLogin`, `useLogout`, `getDefaultRoute` |
| `src/frontend/routes/login.tsx` | Halaman login (form email/password + tombol Google) |
| `src/routes/dev-auth.ts` | Dev-only login tanpa password (testing per-role) |
| `src/app.ts` | Route guards (`guardAuth`, `guardSuperAdmin`, dll) |
| `docs/AUTH.md` | Dokumentasi auth resmi repo |
| `prisma/migrations/..._add_better_auth_schema/` | Schema tabel `user`/`session`/`account` |

---

## 3. Alur Autentikasi — Step by Step

### A. Login Email/Password

1. User isi form di `src/frontend/routes/login.tsx`.
2. Frontend panggil `authClient.signIn.email({ email, password })` (dari `auth-client.ts`).
3. Request ke endpoint native Better Auth: **`POST /api/auth/sign-in/email`**.
4. Server (`auth.ts`):
   - Verifikasi password — Better Auth pakai **scrypt** format `salt:hex` (BUKAN bcrypt).
   - Buat session → simpan di **Redis** (`ba:kv:<token>`) + **DB** (`storeSessionInDatabase: true`).
   - Set cookie `better-auth.session_token=<token>.<HMAC-SHA256-b64>` (HttpOnly, signed).
5. **After-hook** (`hooks.after`) jalan:
   - Jika `user.blocked = true` → hapus session + throw `APIError('FORBIDDEN')`.
   - Jika email ∈ `SUPER_ADMIN_EMAILS` tapi role belum `SUPER_ADMIN` → promote + patch Redis.
6. Frontend redirect ke `getDefaultRoute(role)` (`useAuth.ts`).

### B. Login Google OAuth

1. User klik "Login dengan Google" → `authClient.signIn.social({ provider: 'google', callbackURL: '/' })`.
2. Request ke **`POST /api/auth/sign-in/social`** → redirect ke Google consent.
3. Google callback ke **`GET /api/auth/callback/google`**.
4. Better Auth buat/temukan user di tabel `account` + `user`, buat session (sama seperti langkah 4-6 di atas).
5. **Database hook** `user.create.before`: user BARU yang email-nya ∈ `SUPER_ADMIN_EMAILS` langsung dapat role `SUPER_ADMIN` sejak sesi pertama.

### C. Validasi Session per Request

1. `auth-middleware.ts` (`betterAuthPlugin`) — Elysia `.derive({ as: 'global' })`.
2. Tiap request: `auth.api.getSession({ headers })` baca cookie → verifikasi HMAC → lookup Redis/DB.
3. Inject `authUser` (`{ id, email, name, role, blocked }`) ke context, atau `null` jika tidak ada session.
4. **Cookie cache DISABLED** — supaya perubahan `role`/`blocked` langsung berlaku (tidak serve role lama).

### D. Route Guards

Di `src/app.ts`:
```ts
const guard = guardSuperAdmin(authUser)   // atau guardQcOrAdmin / guardAuth
if (guard) return guard                    // return Response (401/403) jika gagal
```

### E. Logout

- `authClient.signOut()` → **`POST /api/auth/sign-out`** → hapus session (Redis + DB) + clear cookie.

### F. Dev Login (development only)

- **`GET /api/dev-auth/login-as/:email?redirect=/path`** (`dev-auth.ts`).
- Return 404 di production. Buat session tanpa cek password — untuk testing tiap role.
- Menandatangani token manual dengan HMAC-SHA256 memakai `BETTER_AUTH_SECRET`, sama seperti Better Auth native.

---

## 4. Endpoint Autentikasi (native Better Auth)

| Method | Path | Fungsi |
|--------|------|--------|
| POST | `/api/auth/sign-in/email` | Login email/password |
| POST | `/api/auth/sign-in/social` | Inisiasi Google OAuth |
| GET | `/api/auth/callback/google` | Callback Google OAuth |
| POST | `/api/auth/sign-out` | Logout |
| GET | `/api/auth/get-session` | Ambil session aktif (body `null` jika tidak ada) |
| GET | `/api/dev-auth/login-as/:email` | Dev-only login tanpa password |

---

## 5. Detail Keamanan

- **Secret**: `BETTER_AUTH_SECRET` — untuk HMAC signature cookie.
- **Secure cookies**: aktif di `NODE_ENV === 'production'`.
- **Rate limit**: aktif di production — window 60s, max 10 req, storage di Redis.
- **CSRF / Trusted origins**: dibatasi ke `BETTER_AUTH_URL` + `localhost:PORT`.
- **Session expiry**: 7 hari, `updateAge` 24 jam (rolling refresh).
- **Blocked users**: ditolak saat sign-in + semua session dihapus saat admin memblokir.
- **Custom fields**: `role` & `blocked` sebagai `additionalFields` di tabel `user`, `input: false` (tidak bisa di-set dari client).

---

## 6. Role & Default Route

| Role | Default Route | Akses |
|------|--------------|-------|
| `SUPER_ADMIN` | `/dev` | `/dev`, `/dashboard`, `/profile` |
| `ADMIN` | `/dashboard` | `/dashboard`, `/profile` |
| `QC` | `/dashboard` | `/dashboard` (QC tickets), `/profile` |
| `USER` | `/profile` | `/profile` |

Blocked users → redirect ke `/blocked`. Logic di `getDefaultRoute()` (`useAuth.ts`).

---

## 7. Perbandingan dengan Auth `desa-darmasaba` (project ini)

| Aspek | base-template2 | desa-darmasaba (sekarang) |
|-------|----------------|---------------------------|
| Library | Better Auth v1.6.9 | iron-session + JWT manual |
| Model | Session-based (server) | JWT + iron-session |
| Login | Email/Password + Google OAuth | OTP (phone) + Google OAuth |
| Session store | Redis + Postgres | `UserSession` (Postgres) |
| Password hash | scrypt (`salt:hex`) | — (OTP based) |
| Cookie | signed HttpOnly (`better-auth.session_token`) | iron-session `BASE_SESSION_KEY` |

> Catatan: kalau tujuannya adopsi pola ini ke desa-darmasaba, itu **migrasi besar** (ganti library auth).
> Perlu keputusan eksplisit dari user sebelum eksekusi — jangan diasumsikan.

---

## 8. Env Vars yang Dibutuhkan (base-template2)

```env
BETTER_AUTH_SECRET=...       # wajib — HMAC signature
BETTER_AUTH_URL=...          # opsional — base URL
GOOGLE_CLIENT_ID=...         # wajib
GOOGLE_CLIENT_SECRET=...     # wajib
SUPER_ADMIN_EMAIL=...        # opsional — auto-promote SUPER_ADMIN
# + DATABASE_URL (Postgres), REDIS (koneksi Redis)
```

---

## 9. Langkah Selanjutnya (jika mau lanjut)

Plan ini **analisa saja** — belum ada perubahan kode. Opsi tindak lanjut:

1. **Dokumentasi saja** — cukup pahami polanya (selesai di sini).
2. **Adopsi Better Auth ke desa-darmasaba** — migrasi besar, butuh:
   - Tambah dependency `better-auth`, setup Redis.
   - Migration schema `user`/`session`/`account`.
   - Ganti `src/lib/api-auth.ts`, `src/lib/session.ts`, `src/middleware.ts`.
   - **STOP & konfirmasi user dulu** — ini breaking change besar (AI-CONTRACT §8 Eskalasi).
3. **Ambil sebagian pola** — mis. hanya cara guard/role atau Google OAuth flow.

> Rekomendasi: tentukan dulu tujuannya (belajar vs migrasi vs ambil sebagian) sebelum lanjut.
