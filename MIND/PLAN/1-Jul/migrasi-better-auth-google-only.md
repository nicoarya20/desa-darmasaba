# Plan Migrasi Auth → Better Auth (Google-only, TANPA Redis)

> Turunan dari analisa `auth-method-base-template2.md`.
> Tanggal: 2026-07-01 · Status: **PLAN — belum eksekusi kode**
>
> **Keputusan user (final):**
> - Login **Google OAuth saja**.
> - **Tanpa Redis** — session store Postgres saja (standar tim: Better Auth, storage fleksibel).
> - **Standarisasi tim** — Better Auth sudah jalan di project lain; desa-darmasaba menyusul ikut standar.
> - **Rujukan pola**: `bipprojectbali/base-template2`, **role di-map** ke sistem `roleId "0".."5"` desa-darmasaba (bukan enum `USER/ADMIN` base-template2).
> - **Approval `isActive` DIPERTAHANKAN** (admin ACC user).

---

## 0. Keputusan: MIGRASI (bukan sekadar rapikan)

Alasan teknis "tidak worth it" (desa-darmasaba sudah punya Google OAuth manual) **dikalahkan oleh konteks organisasi**: standarisasi tim ke Better Auth sudah berjalan di project lain. Mempertahankan JWT-manual di sini = menyisakan satu-satunya project yang menyimpang dari standar → beban jangka panjang. Maka jalur = **migrasi**, meniru pola base-template2 (minus Redis, role disesuaikan).

---

## 1. Sasaran & Ruang Lingkup

**Sasaran:** Ganti sesi custom (JWT `jose` + iron-session) → **Better Auth**, login **hanya Google**, session store **Postgres (tanpa Redis)**, pola meniru base-template2.

**Tanpa Redis — penyesuaian dari base-template2:**
- **Skip `secondaryStorage`** (blok Redis di `auth.ts`) sepenuhnya.
- `session.storeSessionInDatabase: true` → session full di tabel `session` (Postgres, via prismaAdapter).
- `rateLimit.storage: 'database'` (bukan `'secondary-storage'`) → butuh tabel `rateLimit`.
- Konsekuensi: tiap `getSession` = query DB. Skala desa: tidak signifikan.

**Dibuang:** semua login OTP WhatsApp, iron-session.

---

## 2. Kondisi Existing (ringkas — detail di audit agent)

| Komponen | Lokasi | Nasib |
|---|---|---|
| Sesi JWT HS256 (`jose`) | cookie `BASE_SESSION_KEY`; `session_create/verify/delete.ts` | **Ganti** → Better Auth |
| iron-session | `src/lib/session.ts` (cookie `desa-session`, dead code) | **Hapus** |
| Guard API | `src/lib/api-auth.ts` (`requireAuth`) dipakai `[[...slugs]]/route.ts:104` | **Ganti** validasi Better Auth (jaga bentuk return) |
| Guard route | `src/middleware.ts` (matcher `/admin/*`, `/validasi`, `/waiting-room`) | **Ganti** cek sesi Better Auth |
| Google OAuth manual | `src/app/api/auth/google/*`, `_lib/google/*` | **Ganti** provider Better Auth |
| OTP WhatsApp | `src/app/api/auth/{login,register,verify-otp-*,resend,...}` + `_lib/*otp*` | **Hapus** |
| Duplikat auth | `src/app/api/[[...slugs]]/_lib/auth/**` | Verifikasi dead → **hapus** |
| `User` (roleId String "0".."5") | `prisma/schema.prisma:2284` | **Pertahankan + additionalFields** |
| `UserSession`, `KodeOtp` | schema | **Drop setelah cutover** |
| `Account`/`Session`/`Verification`/`rateLimit` | — | **Buat** (Better Auth) |

**Role existing (dipertahankan):** relasi tabel `Role` id string `"0".."5"` — 0 DEV, 1 SUPER ADMIN, 2 ADMIN DESA, 3 KESEHATAN, 4 PENDIDIKAN, 5 USER (Google). Gate admin = `Number(roleId) <= 4`. Default Google user baru = `"5"`.

---

## 3. Desain Target (adaptasi base-template2)

### 3.1 `src/lib/auth.ts` — beda dari base-template2

Meniru struktur base-template2 dengan **3 perubahan**:

```ts
// (A) HAPUS blok secondaryStorage (Redis) sepenuhnya.
// (B) emailAndPassword: { enabled: false }   // base-template2 = true; kita Google-only
// (C) rateLimit.storage: 'database'          // base-template2 = 'secondary-storage'
```

**additionalFields — map role base-template2 → sistem desa-darmasaba:**
```ts
user: {
  additionalFields: {
    roleId:   { type: 'string',  required: false, defaultValue: '5',   input: false },
    isActive: { type: 'boolean', required: false, defaultValue: true,  input: false },  // Google user baru LANGSUNG aktif → /profile (keputusan user)
  },
},
```
> base-template2 pakai `role` (enum) + `blocked` (bool). Kita ganti jadi `roleId` (string, cocok FK `Role`) + `isActive` (kebalikan makna `blocked`). `input:false` → tak bisa di-set dari client (AI-CONTRACT §10, keamanan).

**databaseHooks.user.create.before** (meniru pola super-admin base-template2):
```ts
// user BARU yang email-nya ∈ SUPER_ADMIN_EMAILS → roleId '1' (SUPER ADMIN) sejak sesi pertama
if (SUPER_ADMIN_EMAILS.includes(email)) return { data: { ...userData, roleId: '1' } }
```

**hooks.after** (meniru pola blocked base-template2, disesuaikan `isActive`, tanpa patch Redis):
```ts
// tolak login jika isActive === false (hapus session yang barusan dibuat) → APIError FORBIDDEN
// auto-promote existing user ∈ SUPER_ADMIN_EMAILS → roleId '1'
// (tanpa blok patch Redis — kita tak pakai Redis)
```

Sisanya **sama** base-template2: `prismaAdapter('postgresql')`, `socialProviders.google`, `session` 7d/updateAge 24h/`storeSessionInDatabase:true`/`cookieCache.enabled:false`, `advanced.useSecureCookies` prod + `ipAddressHeaders`, `trustedOrigins` dari `BETTER_AUTH_URL`+localhost.

### 3.2 `src/lib/auth-client.ts` — sama base-template2
`createAuthClient` + `inferAdditionalFields<Auth>()` (biar `roleId`/`isActive` ke-infer di client).

### 3.3 Mount handler — **Next.js `toNextJsHandler` (BUKAN Elysia `.mount`)**

> **Keputusan (final):** desa-darmasaba = **Next.js + Elysia catch-all**, arsitektur beda dari base-template2 (Elysia-native). Meniru `.mount(auth.handler).derive` base-template2 = **rombak besar** `route.ts` (240 baris) + ubah semua guard dari `requireAuth()` ke `authUser` context. Tidak sepadan.
>
> Keseragaman standar tim ada di **library + `auth.ts` config + schema + role mapping** — *bukan* cara mount (mount wajib beda karena framework beda). Jadi pakai handler resmi Better Auth untuk Next.js:

- **File baru** `src/app/api/auth/[...all]/route.ts`:
  ```ts
  import { auth } from '@/lib/auth'
  import { toNextJsHandler } from 'better-auth/next-js'
  export const { GET, POST } = toNextJsHandler(auth.handler)
  ```
- **`src/app/api/[[...slugs]]/route.ts` TIDAK disentuh** — Elysia catch-all utuh. Better Auth punya route sendiri di `/api/auth/*` (Next handler), terpisah dari `/api/*` Elysia.
- **Guard tetap `requireAuth()`** (§3.5) — hanya internalnya diganti ke `auth.api.getSession()`. Pola `.onBeforeHandle` di `route.ts` tak berubah.
- **Tidak perlu** `auth-middleware.ts` ala base-template2.

> Dampak rombakan: **kecil** — `route.ts` Elysia + semua endpoint bisnis tak berubah. Hanya `api-auth.ts` (isi `requireAuth`), `middleware.ts`, frontend login, + file auth baru.

### 3.4 Env (`.env` + `.env.example`)
```env
BETTER_AUTH_SECRET=...      # wajib
BETTER_AUTH_URL=...         # base URL publik
GOOGLE_CLIENT_ID=...        # sudah ada
GOOGLE_CLIENT_SECRET=...    # sudah ada
SUPER_ADMIN_EMAIL=...       # opsional, comma-sep → auto roleId '1'
# TANPA REDIS_URL.
```
`src/lib/env.ts` desa-darmasaba: tambah field ini, **tanpa** `REDIS_URL`.

### 3.5 Ganti guard (jaga kontrak internal — AI-CONTRACT §10)
- `src/lib/api-auth.ts`: `requireAuth` baca `auth.api.getSession({ headers })`; **pertahankan bentuk return** `{ authenticated, user:{ id, roleId, isActive } }` + gate `isActive===false → 403`. Konsumer Elysia (`route.ts:104`) tak berubah.
- `src/middleware.ts`: cek cookie sesi Better Auth; **pertahankan** matcher & logika `Number(roleId) > 4 → /profile` + `isActive` gating.
- `redirect_by_role.ts`: dipakai ulang (mapping roleId→route tak berubah).

### 3.6 Frontend
- `login-admin/page.tsx`: tombol Google → `authClient.signIn.social({ provider:'google', callbackURL:'/' })`. Hapus blok OTP (`SHOW_OTP_LOGIN`).
- `me`/`logout`/state auth (`admin/(dashboard)/_state/auth`): arahkan ke `authClient` (`useSession`, `signOut`).

### 3.7 Schema Prisma (migration idempotent — CLAUDE.md §4)
- **Additive dulu**: tambah `Account`, `Session`, `Verification`, `rateLimit` (naming Better Auth) + additionalFields `roleId`/`isActive` di `users` (sudah ada `roleId`/`isActive`! cek: `roleId String @default("2")`, `isActive Boolean @default(false)` — Better Auth pakai kolom ini langsung, tinggal pastikan default sesuai).
- `users` sudah berisi data → `IF NOT EXISTS`, kolom baru NOT NULL wajib `DEFAULT`.
- **Drop terpisah SETELAH cutover**: `UserSession`, `KodeOtp`, kolom `googleId` (Better Auth simpan provider di `account`).

> ⚠️ `User.isActive @default(false)` existing, TAPI Google user baru harus **langsung aktif** (keputusan user → `/profile`). Karena Better Auth set `isActive` via `additionalFields.defaultValue: true` saat create user, ini menimpa default kolom untuk jalur Better Auth. Migration boleh biarkan default kolom `false` (user existing tak berubah); user Google baru dapat `true` dari Better Auth. **Verifikasi di test** (§5).

---

## 4. Urutan Eksekusi (bertahap, aman)

> Branch: `feature/migrasi-better-auth-google` (CLAUDE.md §2). Commit berkala. **Jangan merge tanpa konfirmasi user.**

1. **Setup** — install `better-auth` (pinned). `src/lib/auth.ts` + `auth-client.ts` + `auth-middleware.ts` + env. Belum sentuh guard lama.
2. **Schema** — migration additive (`account/session/verification/rateLimit` + pastikan `roleId/isActive`). Jalankan lokal, verifikasi. **Belum drop.**
3. **Mount + login baru** — pasang handler, ubah tombol Google frontend. Uji login Google end-to-end lokal (user existing ter-link by email).
4. **Cutover guard** — ganti `api-auth.ts` + `middleware.ts` + `me`/`logout`. Uji `/admin/*`, `/profile`, gate `isActive` & role.
5. **Bersihkan** — hapus OTP endpoints+helper WhatsApp, `KodeOtp` usage, iron-session (`session.ts`), duplikat `[[...slugs]]/_lib/auth/**`, `session_create/verify/delete.ts` lama, `google/*` manual.
6. **Drop tabel** — migration terpisah: drop `UserSession`, `KodeOtp`, kolom `googleId`. Hanya setelah 3-5 hijau.
7. **Test + build** — §5. Build manual oleh user (memory: jangan auto `bun run build`).
8. **Housekeeping** — `package.json` version bump, `CHANGELOG.md` (CLAUDE.md §5), update `docs`/CLAUDE auth notes. Hapus dep: `iron-session`, `jsonwebtoken` (cek `jose`/`bcryptjs` pemakaian lain dulu).

---

## 5. Test (WAJIB — Global §3)

Vitest (`test:api`) + Playwright (`test:e2e`) sudah ada. Tambah:
- **Contract test** (AI-CONTRACT §10): `requireAuth` tetap return `{ id, roleId, isActive }`; response `me` bentuk tetap.
- Unit: Google user baru → `roleId "5"`; user existing (by email) pertahankan `roleId` lama; `SUPER_ADMIN_EMAILS` → `roleId "1"`; `isActive=false` → 403; `roleId>4` → tak boleh `/admin`.
- E2E: login Google (stub), redirect by role, logout, akses `/admin` tanpa sesi → `/login`.
- DB test pakai `TEST_DATABASE_URL` (Global §3).

Semua hijau sebelum lapor selesai.

---

## 6. Risiko & Rollback

| Risiko | Mitigasi |
|---|---|
| User existing tak bisa login (link akun gagal) | Better Auth link by `email` (user Google existing punya email). Uji step 3 sebelum cutover. |
| Sesi aktif ke-logout saat cutover | Cookie baru beda nama → user login ulang (Google 1 klik). Deploy low-traffic. |
| Migration merusak `users` berisi data | Additive+idempotent dulu; drop dipisah step 6; **backup DB sebelum deploy**. |
| Kontrak API internal berubah → konsumer rusak | Jaga bentuk return guard (§3.5) + contract test. |
| Role mapping salah (enum→roleId) | Test unit mapping (§5) sebelum cutover. |
| Rollback | Step 1-4 di branch, belum drop → revert branch + `migrate resolve`. Setelah step 6 → restore backup. |

---

## 7. Keputusan User (sudah final)

1. ✅ **Mount**: **Next.js `toNextJsHandler`** (bukan Elysia `.mount`) — rombakan kecil, `route.ts` Elysia tak disentuh. (§3.3)
2. ✅ **Google user baru `isActive: true`** — langsung masuk `/profile`, tanpa ACC admin. Promosi role via tab Warga existing. (§3.1)
3. ⏳ **Timing cutover** (low-traffic?) — semua user login ulang sekali. Tentukan saat mau deploy.

> Belum ada kode diubah. Plan siap dieksekusi (branch `feature/migrasi-better-auth-google`).

---

## 9. STATUS EKSEKUSI (2026-07-01)

Branch `feature/migrasi-better-auth-google`, versi `0.1.83`. **Migrasi inti SELESAI & typecheck bersih (0 error), test 34/34 lulus.**

| Task | Status |
|---|---|
| Setup better-auth (auth.ts, client, handler, env) | ✅ |
| Schema additive (session/account/verification/rate_limit + emailVerified) | ✅ migrated lokal |
| Cutover login + guard (api-auth, middleware, me, logout, login page) | ✅ |
| Test (auth-policy unit + requireAuth contract) | ✅ 16 test baru lulus |
| Cleanup dead code + drop tabel | ⚠️ **DITUNDA — escalation** |

### ⚠️ Kenapa cleanup/drop ditunda (AI-CONTRACT §8 Eskalasi)

Audit sebelum hapus menemukan tabel/kode legacy **masih dipakai modul non-auth**:
- `UserSession` → dipakai `user/delUser.ts` & `user/updt.ts` (manajemen user, bukan auth).
- OTP (`apiFetchRegister`) → dipakai `registrasi-admin/page.tsx`; `sendCodeOtp`/`randomOTP` → dipakai `health/otp/route.ts`.
- `googleId` → resolver manual Google lama.

Menghapus/drop sekarang = **memutus fitur yang bekerja** demi hygiene yang tak wajib untuk fungsi. Sesuai AI-CONTRACT §12 (lebih baik tak memperburuk), legacy dibiarkan **dorman** (tak lagi dipanggil jalur auth utama). Penghapusan tuntas = pekerjaan terpisah dengan scope refactor user-management + health check.

**Keputusan user diperlukan** sebelum destructive cleanup — lihat §10.

## 10. Keputusan Cleanup (menunggu user)

1. Hapus alur OTP + `KodeOtp` — tapi `registrasi-admin` & `health/otp` perlu di-refactor dulu. Lanjut?
2. Drop `user_sessions` — tapi `delUser`/`updt` harus lepas dari `userSession` dulu. Lanjut?
3. Drop kolom `googleId` + hapus `_lib/google/*` manual — aman setelah login Better Auth terverifikasi di STG. Lanjut?

> Rekomendasi: verifikasi login Better Auth jalan di STG dulu, baru cleanup bertahap sebagai PR terpisah.

---

## 8. Referensi Pola base-template2 (sudah diambil)

Config kanonik base-template2 sudah dibaca (`auth.ts`, `auth-middleware.ts`, `auth-client.ts`, `env.ts`). Ringkas yang ditiru vs diubah:

| Elemen base-template2 | desa-darmasaba |
|---|---|
| `prismaAdapter('postgresql')` | ✅ sama |
| `emailAndPassword.enabled: true` | ❌ `false` (Google-only) |
| `socialProviders.google` | ✅ sama |
| `secondaryStorage` (Redis) | ❌ hapus |
| `session` 7d/updateAge 24h/DB/cookieCache off | ✅ sama |
| `additionalFields: role, blocked` | 🔄 `roleId (str "5"), isActive (bool)` |
| `databaseHooks.create.before` super-admin | 🔄 `roleId '1'` |
| `hooks.after` blocked+promote(+Redis patch) | 🔄 `isActive` reject + promote, **tanpa** Redis patch |
| `rateLimit.storage: 'secondary-storage'` | 🔄 `'database'` |
| `advanced.useSecureCookies/ipHeaders` | ✅ sama |
| `auth-middleware` Elysia `.mount`+`.derive` | ❌ **tidak** — Next.js `toNextJsHandler` (framework beda; §3.3) |
| `auth-client` + `inferAdditionalFields` | ✅ sama |
