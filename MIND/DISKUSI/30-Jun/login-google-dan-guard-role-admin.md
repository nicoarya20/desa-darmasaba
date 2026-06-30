# Diskusi: Login Google & Guard Role Admin

**Tanggal:** 30 Juni 2026
**Branch:** `feature/login-google-ui` (dari `stg`)
**Status:** Fase 1 (UI) selesai & di-commit. Fase 2 (OAuth + DB) ditunda sampai database baru siap.

---

## 1. Latar Belakang & Masalah

User ingin:
1. Menambah metode **login lewat Google**.
2. Memahami **step-by-step alur Google OAuth**.
3. Memperbaiki masalah: **setiap user yang login otomatis bisa mengakses halaman admin**.
   Tujuan: setiap login diarahkan ke **halaman profile** dulu. Hanya setelah
   superadmin mengganti role user menjadi admin, user baru bisa mengakses tampilan admin.

---

## 2. Cara Kerja Login Google (Authorization Code Flow)

```
1. User klik "Login dengan Google"
2. App redirect ke accounts.google.com (kirim client_id + redirect_uri + scope email/profile)
3. User pilih akun & setujui di halaman Google
4. Google redirect balik ke app: /api/auth/google/callback?code=xxx
5. App tukar `code` ke Google (server-to-server) → dapat access_token + info user (email, nama, foto)
6. App cari user di DB berdasarkan email/googleId:
   - belum ada → buat User baru (role default, isActive sesuai kebijakan)
   - sudah ada → pakai yang ada
7. App bikin sesi sendiri (di project ini = JWT cookie BASE_SESSION_KEY) → set cookie
8. Redirect user ke halaman tujuan
```

**Poin kunci:** Google hanya membuktikan "ini benar email X". Soal user boleh akses
apa (role, admin/bukan) adalah 100% urusan aplikasi, bukan Google. Jadi masalah role
terpisah total dari Google.

---

## 3. Temuan Investigasi Codebase (Kondisi Saat Ini)

### 3.1 Login saat ini
- Login = **phone + OTP via WhatsApp**. Tanpa password. Tanpa Google/OAuth/NextAuth.
- Ada **2 sistem sesi** yang berdampingan:
  - **Custom JWT** (`src/app/api/auth/_lib/session_create.ts`) — cookie `BASE_SESSION_KEY`,
    secret `BASE_TOKEN_KEY`. **Ini yang dipakai middleware untuk gate `/admin`.**
  - **iron-session** (`src/lib/session.ts`) — cookie `desa-session`. Dipakai helper API
    (`requireAuth`/`optionalAuth`). Tidak sinkron dengan JWT.

### 3.2 Akar masalah "semua bisa akses admin"
- **Redirect after login** (`validasi-admin/page.tsx:186`, `getRedirectPath()`):
  roleId `0,1,2` semua diarahkan ke `/admin/...`.
- **Middleware (`src/middleware.ts`) hanya cek login + `isActive`, TIDAK cek role.**
  ```
  46  const token = request.cookies.get(process.env.BASE_SESSION_KEY!)?.value;
  51  const user = await verifyToken(token);
  53  if (!user || !user.isActive) → redirect /login
  56  return NextResponse.next();   // ← tidak ada cek roleId
  ```
  Role hanya dipakai untuk filter menu sidebar (`getNavbar`). Artinya user aktif
  manapun bisa mengetik URL `/admin/apapun` langsung dan tetap masuk.

### 3.3 Data Role (dari `prisma/data/user/roles.json` — otoritatif)

| roleId | name           | kategori            |
|--------|----------------|---------------------|
| `"0"`  | DEVELOPER      | admin penuh (super) |
| `"1"`  | SUPER ADMIN    | admin               |
| `"2"`  | ADMIN DESA     | admin               |
| `"3"`  | ADMIN KESEHATAN| admin               |
| `"4"`  | ADMIN PENDIDIKAN| admin              |

- Satu-satunya user terseed: `SuperAdmin-Nico` (nomor `6289647037426`, roleId `0`).
- **Semua role `0`–`4` adalah admin.** Belum ada role "user biasa".
  → Untuk alur user (Google → non-admin → profile) perlu **role baru, misal `"5" = USER`**.

### 3.4 Landmine yang ditemukan (harus dibereskan saat ganti DB)
1. **`User.roleId` tipe `String`** (`@default("2")`) di schema, tapi seluruh kode app
   memperlakukannya sebagai **number** (`Number(roleId)`, switch `0/1/2/3/4`).
2. **Dua mapping roleId→nav yang konflik:**
   - `navigationByRole.ts:4-9`: `0→navBar, 1→role1, 2→role2, 3→role3`
   - `dynamicNavbar.ts:28-33`: `0→devBar, 1→navBar, 2→role1, 3→role2, 4→role3`
3. **Belum ada halaman profile** (yang ada hanya "Profil Desa", beda hal).
4. Route `/api/auth/me` rusak (baca cookie `hipmi_user_id`, sisa copy-paste project lain).

---

## 4. Keputusan yang Diambil

| Topik | Keputusan |
|-------|-----------|
| Default role user Google baru | **User biasa, non-admin** → langsung aktif → redirect `/darmasaba/profile` |
| Cakupan login | **OTP backend tetap ada** (nanti ganti DB), **UI OTP disembunyikan**, ganti tombol Google saja |
| Lokasi halaman profile | **`/darmasaba/profile`** (sisi publik) |
| Definisi admin untuk guard | roleId `0`–`4` = admin (boleh `/admin`); role user biasa (`5`) → profile |
| Timing | **Fase 1 UI dulu sekarang**; Fase 2 (OAuth + schema) menyusul setelah DB baru |
| Tombol Google di Fase 1 | **Disabled + toast "segera hadir"** (backend belum ada) |
| Branch | **Branch baru** `feature/login-google-ui` |

### Catatan penting soal "Google saja"
User awalnya minta hapus OTP total. Di-flag risiko: admin existing login pakai phone,
banyak yang belum tentu punya email → kalau OTP dihapus, **superadmin sendiri bisa
terkunci**. Disepakati: **backend OTP tetap utuh** (karena toh DB mau diganti), hanya
**UI** yang diganti jadi tombol Google.

---

## 5. Yang Sudah Dikerjakan (Fase 1 — UI)

**File:** `src/app/admin/(dashboard)/auth/login-admin/page.tsx`
**Commit:** `c2532f0b feat(auth): tampilkan tombol Login Google, sembunyikan UI OTP`

- Form phone + tombol "Masuk" disembunyikan via flag `SHOW_OTP_LOGIN = false`
  (bukan dihapus — set `true` untuk munculkan lagi). Backend OTP tidak disentuh.
- Tombol "Login dengan Google" muncul → klik menampilkan toast "segera hadir".
- Typecheck (`bun run tsc --noEmit`) lolos.
- **Belum di-merge** — menunggu approve user.

---

## 6. Rencana Fase 2 — Step-by-step Google OAuth (untuk nanti)

### A. Google Cloud Console (setup manual sekali)
1. Buka https://console.cloud.google.com → buat/pilih project.
2. **APIs & Services → OAuth consent screen** → isi nama app, support email, scope `email` + `profile`. Publish (atau tambah test users).
3. **Credentials → Create Credentials → OAuth client ID** → tipe **Web application**.
4. **Authorized redirect URIs:**
   - Lokal: `http://localhost:3000/api/auth/google/callback`
   - Prod/stg: `https://<domain>/api/auth/google/callback`
5. Salin **Client ID** + **Client Secret**.

### B. Env vars (tambah ke `.env` + `.env.example`)
```env
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"
```
⚠️ JANGAN pakai prefix `NEXT_PUBLIC_` untuk secret (ada preseden bocor `NEXT_PUBLIC_BASE_TOKEN_KEY` — jangan diulang).

### C. Schema (saat DB baru)
- Tambah ke `User`: `email String? @unique`, `googleId String? @unique`, `avatarUrl String?`.
- Tambah role baru `"5" = USER` di `roles.json`.
- Ubah `User.roleId` default → `"5"` dan `isActive` default → `true` untuk user umum.
- Sekalian beresin landmine: `roleId` String-vs-number, 2 mapping nav konflik.

### D. Route OAuth baru
1. `GET /api/auth/google` → redirect ke `https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=...&response_type=code&scope=openid email profile&state=<csrf>`.
2. `GET /api/auth/google/callback?code=...` →
   - Tukar `code` di `https://oauth2.googleapis.com/token` (POST server-side) → `access_token`/`id_token`.
   - Ambil profil dari `https://www.googleapis.com/oauth2/v2/userinfo` (email, name, picture).
   - Cari `User` by `googleId` → fallback `email` → kalau tidak ada, buat baru (roleId `"5"`, isActive `true`).
   - Mint JWT pakai `sessionCreate` yang **sudah ada**, set cookie `BASE_SESSION_KEY` (supaya lolos middleware).
   - Redirect: roleId `0`–`4` → dashboard admin; roleId `5` → `/darmasaba/profile`.

### E. Guard role di middleware (`src/middleware.ts`)
Tambah cek role untuk `/admin/*`: jika `Number(user.roleId) > 4` (user biasa) →
redirect `/darmasaba/profile`. **Tanpa ini, user Google tetap bisa mengetik URL admin
langsung — ini akar masalah utama.**

### F. Halaman `/darmasaba/profile`
Halaman tujuan redirect user biasa setelah login.

---

## 7. Pertanyaan Terbuka (belum diputuskan)

- Tombol Google: tetap disabled sampai Fase 2, atau arahkan ke `/api/auth/google` sekarang?
- Lanjut ke workflow GitHub (deploy stg) atau cukup di branch dulu?

---

## 8. File Referensi Kunci

| File | Peran |
|------|-------|
| `src/app/admin/(dashboard)/auth/login-admin/page.tsx` | Komponen login (diubah Fase 1) |
| `src/app/login/page.tsx` | Wrapper `/login` |
| `src/middleware.ts` | Gate `/admin` (perlu tambah guard role di Fase 2) |
| `src/app/api/auth/_lib/session_create.ts` | Mint JWT cookie `BASE_SESSION_KEY` (dipakai ulang OAuth) |
| `src/app/api/auth/verify-otp-login/route.ts` | Verify OTP + buat sesi (backend OTP, jangan disentuh) |
| `src/app/admin/(dashboard)/auth/validasi-admin/page.tsx` | `getRedirectPath()` redirect after login |
| `prisma/schema.prisma:2284-2314` | Model User + Role |
| `prisma/data/user/roles.json` | Seed role 0–4 |
| `src/app/admin/(dashboard)/user&role/_com/dynamicNavbar.ts` | `getNavbar()` runtime nav selector |
