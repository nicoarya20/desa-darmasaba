# Diskusi: Login Google — Fase 2 (Implementasi + Deploy STG)

**Tanggal:** 30 Juni 2026
**Lanjutan dari:** [login-google-dan-guard-role-admin.md](./login-google-dan-guard-role-admin.md) (Fase 1)
**Branch kerja:** `feature/login-google-oauth` (dari `feature/login-google-ui`)
**Status:** ✅ Selesai, di-merge ke `stg`, deploy STG berhasil (v0.1.80).

---

## 1. Keputusan yang Diambil (mengubah/mempertajam rencana Fase 1)

| Topik | Keputusan Final |
|-------|-----------------|
| Metode login | **Hanya Google** — OTP dibuang dari UI (`SHOW_OTP_LOGIN` tetap `false`). Backend OTP **tidak dihapus**, hanya tidak dipakai di UI. |
| Register | Tidak ada flow register manual — user baru **auto-create** saat login Google pertama. |
| Bootstrap admin | **Seeder admin by email**: entry `SuperAdmin-Nico` ditambah `email: nicoarya20@gmail.com` (role 0). Saat Nico login Google → callback match by email → link `googleId`, **role 0 dipertahankan**. Tanpa ini admin akan terkunci (semua login Google = role 5). |
| Schema | `nomor` jadi `String?` (user Google tak punya nomor); tambah `email`/`googleId`/`avatarUrl` (semua `String? @unique` nullable). |
| Role baru | `"5" = USER` (publik, non-admin). |
| Library OAuth | **Manual tanpa dependency** (redirect + `fetch` token + userinfo), pakai `sessionCreate`/`jose` yang sudah ada. |
| Halaman profile | **Standalone `/profile`** (BUKAN `/darmasaba/profile`) — tanpa navbar & footer, full-screen, hanya kartu profil + tombol Keluar. Awalnya sempat di `/darmasaba/profile` tapi ikut terbungkus layout publik (navbar+footer), lalu dipindah. |
| Landmine | **Ditunda** (mapping nav konflik, `roleId` String-vs-number) — di luar scope, jaga diff kecil. |

---

## 2. Temuan Penting Saat Eksplorasi

- **Auth bukan Elysia** — semua route auth = Next.js route handler di `src/app/api/auth/*/route.ts`. Jadi `/api/auth/google` + `/callback` dibuat sebagai route handler baru.
- `sessionCreate` (`_lib/session_create.ts`) reusable: bikin JWT HS256 payload `{user}`, set cookie `BASE_SESSION_KEY`, simpan `UserSession`. Callback OAuth tinggal panggil ini → otomatis lolos middleware.
- `safeSeedUnique` = upsert generic, `where` bisa field unique apapun (termasuk email).
- **Catatan deploy:** Next.js route file **tidak boleh export** apa pun selain HTTP handler. Sempat error build karena export `OAUTH_STATE_COOKIE` dari `route.ts` → dipindah ke helper `oauth_client.ts`.

---

## 3. File yang Dikerjakan

**Dibuat:**
- `src/app/api/auth/_lib/google/oauth_client.ts` — `buildConsentUrl` (murni), `exchangeCodeForToken`, `fetchUserInfo`, konstanta `OAUTH_STATE_COOKIE`.
- `src/app/api/auth/_lib/google/user_resolver.ts` — `mapUserInfoToUser` (murni), `resolveOrCreateUser` (googleId → email → create role 5).
- `src/app/api/auth/_lib/google/redirect_by_role.ts` — `redirectByRole` (murni), `PROFILE_PATH = "/profile"`.
- `src/app/api/auth/google/route.ts` — GET: state CSRF cookie httpOnly + redirect consent.
- `src/app/api/auth/google/callback/route.ts` — GET: validasi state → exchange → userinfo → resolve user → sessionCreate → redirect by role.
- `src/app/profile/page.tsx` — halaman profil standalone.
- `prisma/migrations/20260630000000_add_google_oauth_fields/migration.sql` — idempotent (`IF NOT EXISTS`).
- `__tests__/api/google_oauth.test.ts` — 8 unit test fungsi murni.
- `CHANGELOG.md` — entry 0.1.79.

**Diubah:**
- `prisma/schema.prisma` — User: email/googleId/avatarUrl + nomor nullable.
- `prisma/data/user/roles.json` — role 5 USER.
- `prisma/data/user/users.json` — email Nico.
- `prisma/seed.ts` — `where` dinamis (email/nomor) + field email.
- `src/middleware.ts` — guard `Number(roleId) > 4` → redirect `/profile`.
- `src/app/admin/(dashboard)/auth/login-admin/page.tsx` — `onGoogleLogin` → `window.location.href = '/api/auth/google'`.
- `src/app/api/auth/me/route.ts` — tambah `email` & `avatar` di response.

---

## 4. Verifikasi

- `bun run tsc --noEmit` ✅
- `bunx vitest run __tests__/api/google_oauth.test.ts` ✅ 8/8 (pakai pragma `@vitest-environment node`)
- `bun run build` ✅ (392 pages)
- Tes manual user: login Google `nico gojek` (role 5) → benar masuk `/profile`. ✅

> ⚠️ Masalah pre-existing: runner test default (`bun run test:api`) gagal karena jsdom/cssstyle ESM vs Node 22 — test lama `fileStorage` juga kena. Bukan dari fitur ini. Diakali dengan pragma `@vitest-environment node` di test OAuth (fungsi murni, tak butuh DOM).

---

## 5. Deploy STG

| Langkah | Hasil |
|---------|-------|
| Merge `feature/login-google-oauth` → `stg` | ✅ no conflict |
| Push `stg` → origin (2 URL GitHub) | ✅ |
| Push `stg` → remote `deploy` (wibugit) | ❌ "Unknown subdomain / repo not found" — remote mati, tidak memblok (deploy jalan dari GitHub) |
| Bump version 0.1.79 → **0.1.80** | ✅ |
| `publish.yml` (build image `stg-0.1.80` → GHCR) | ✅ success (~15 menit) |
| `re-pull.yml` (1×) | ⚠️ HTTP 524 — timeout gateway Cloudflare, **redeploy tetap jalan** di Portainer |
| `re-pull.yml` (2× / ulang) | ✅ success |
| `/api/version` STG = 0.1.80 | ✅ match |

**Pelajaran:** HTTP 524 di re-pull = timeout gateway, **bukan** kegagalan deploy. Redeploy Portainer (pull image + `migrate deploy` + seed) lanjut di background. Verifikasi sebenarnya = bandingkan `/api/version`.

---

## 6. Yang BELUM Dilakukan (perlu aksi manual di luar kode)

Login Google di STG baru berfungsi setelah:
1. **Env `GOOGLE_*` di stack Portainer STG** — `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI=https://desa-darmasaba-stg.wibudev.com/api/auth/google/callback`.
2. **Redirect URI STG di Google Cloud Console** — tambahkan `https://desa-darmasaba-stg.wibudev.com/api/auth/google/callback` ke Authorized redirect URIs.

Tanpa keduanya: halaman publik/profile/guard tetap normal, hanya tombol "Login dengan Google" yang error (`?error=oauth_config` / `redirect_uri_mismatch`).

---

## 7. Catatan untuk Sesi Berikutnya

- **Landmine belum dibereskan** (lihat Fase 1 §3.4): `roleId` String-vs-number, 2 mapping nav konflik (`navigationByRole.ts` vs `dynamicNavbar.ts`), route orphan `[[...slugs]]/_lib/auth/me/route.ts` (baca cookie `hipmi_user_id`). Layak jadi task chore terpisah.
- Belum ada PR resmi ke `main`/`prod` — masih sebatas `stg`.
- Test runner default perlu diperbaiki (jsdom/Node 22) agar `bun run test:api` hijau lagi.
