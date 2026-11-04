# ADR 2026-11-04 — Tahap 2: Next.js 15.5.14 → 16.4.5

- **Status:** Selesai di lokal (v0.1.204), QA user lolos. Belum masuk `stg`.
- **Branch:** `tasks/next16-upgrade/upgrade-next16/2026-11-04-1617`, stacked di atas tahap 1 (v8 `4d0ee79c`, v0.1.203). Saat masuk `stg`, tahap 1 masuk lebih dulu.
- **Basis tim:** `origin/main` = `origin/stg` = `9f460ed5` (v0.1.202).
- **Lingkup:** framework (Next/React), guard route (`middleware.ts` → `proxy.ts`), config build, base image Docker, `sharp`. Tidak ada perubahan schema/database/API maupun logika bisnis. Perubahan backend diizinkan tim backend khusus untuk upgrade framework.
- **Induk:** [ADR upgrade UI bertahap](2026-11-04-mantine-8-staged-upgrade.md) (§2 tabel tahap).

## 1. Konteks

Mantine 9 (tahap 3) memakai `useEffectEvent`. Next.js App Router memakai React bawaan Next (`node_modules/next/dist/compiled/react`), bukan `node_modules/react`. React bawaan Next 15.5.x (`19.2.0-canary`) belum punya API itu, sedangkan React bawaan Next 16.4.5 (`19.3.0-canary`) sudah punya. Karena itu Next 16 adalah prasyarat tahap 3.

Next 15.5.14 juga terkena 28 advisory (3 critical: RCE di Image Optimization untuk SVG/AVIF dan di server Windows; 12 high, termasuk bypass middleware/proxy). Semuanya tertutup di 16.4.5.

Breaking change Next 16 diverifikasi dari dokumentasi resmi (`nextjs.org/docs/app/guides/upgrading/version-16`). Yang mengenai repo ini: Turbopack default, `middleware` → `proxy` (runtime selalu nodejs), browser minimum naik, `tsconfig` wajib `jsx: react-jsx`, `next lint` dihapus (tidak dipakai), dan `eslint-config-next` 16 menjadi flat config native.

## 2. Keputusan

| ID | Keputusan | Alasan |
|---|---|---|
| D13 | Tahap 2 stacked di atas branch v8, tanpa menunggu v8 masuk `stg` | Paralelkan pekerjaan. Urutan merge ke `stg`: v8 dulu, lalu tahap 2. |
| D15 | `eslint-config-next` **tetap 15.5.12** | Versi 16 membuat config FlatCompat crash (circular JSON di validator eslintrc). Config flat native yang ekuivalen menghasilkan 1001 problem (879 error) vs 111. Mayoritasnya `react-hooks/immutability` +747, dengan 711 di antaranya mutasi proxy Valtio, pola resmi library tersebut. Selain itu `set-state-in-effect` +99, `static-components` +16, `refs` +14, `purity` +2. Upgrade lint menjadi task terpisah. |
| D16 | Terima target browser default Next 16 (Safari/iOS 16.4, Chrome/Edge/Firefox 111) | Default framework. Tidak ada kebutuhan dukungan browser lama yang tercatat. |
| D17 | `agentRules: false` di `next.config.ts` | `next dev` 16.3+ menyisipkan blok ke `AGENTS.md`, padahal file itu di-track git. Opsi diverifikasi di `config-shared.d.ts` (top-level `NextConfig`). |
| D18 | `allowedDevOrigins: ["192.168.1.82"]` | Next mencocokkan hostname saja (`block-cross-site-dev.js`). Format URL lengkap yang lama tidak pernah cocok, dan `localhost` sudah default. |
| D19 | Pin `oven/bun:1.4.4-debian` (Dockerfile builder + runner) | Tag `1-debian` floating. Digest saat ini identik (`sha256:93d5032f…`), jadi image tidak berubah. Pin ini menutup D11. |
| D20 | `sharp` ^0.34.3 → ^0.35.5 | 3 advisory high (GHSA-f88m-g3jw-g9cj, GHSA-rgj7-g3m4-5g8c, GHSA-wq5f-xc86-pv6w). Ini juga mitigasi resmi GHSA-2464-fhr4-w9xw. Next 16 membawa sharp 0.35.5 sendiri, sehingga setelah bump hanya ada satu salinan. |

Keputusan tambahan saat eksekusi:
- `tsconfig.json`: `jsx: react-jsx` + include `.next/dev/types/**/*.ts` ditulis oleh `next build` 16 sebagai perubahan wajib. Di-commit supaya build tidak terus menulis ulang file itu.
- `next` dipin persis `16.4.5`. React `^19.3.1`, `@types/react{,-dom}` `^19.3.0`.

## 3. Apa yang berubah

| Commit | Isi |
|---|---|
| `3cc36f08` | deps: next 16.4.5, react/react-dom 19.3.1, @types/react 19.3 |
| `9ab9997e` | hapus `experimental: {}` kosong |
| `79d673d0` | tsconfig wajib Next 16 |
| `751447cd` | `agentRules: false` (D17) |
| `9825bbf4` | `allowedDevOrigins` hostname (D18) |
| `f81eb695` | pin base image Docker (D19) |
| `557b91ed` | `src/middleware.ts` → `src/proxy.ts`, fungsi `proxy`. Logika dan matcher byte-identik. |
| `aaea44a1` | unit test kontrak matcher proxy (`__tests__/api/proxy_matcher_contract.test.ts`, 13 kasus; uji mutasi matcher → merah) |
| `d2f4910a` | merge `--no-ff` branch proxy |
| `13a6ee73` | sharp 0.35.5 (D20) |

Matcher proxy tetap `/admin/:path*`, `/validasi`, `/waiting-room`. Keputusan akses masih lewat fungsi murni `decideAdminAccess` (`src/lib/auth-policy.ts`), dan cookie cache Better Auth dibaca lewat `getCookieCache`/`getSessionCookie` (WebCrypto, tidak bergantung pada runtime).

## 4. Verifikasi

Pembanding: build v8 (`06c3fa4b`, Next 15.5.14). Semua gate dijalankan di worktree terpisah, bukan di checkout utama.

| Gate | Hasil |
|---|---|
| `bun run tsc --noEmit` | 0 error |
| ESLint (`--ignore-pattern '.next/**' --ignore-pattern 'next-env.d.ts'`) | 111 problems, identik per baris dengan baseline `origin/main` |
| `bun run test:api` | 38 file / 311 tes lulus (+13 tes matcher proxy) |
| `bun run build` (Turbopack) | exit 0, **394** halaman, `ƒ Proxy (Middleware)`, 0 warning (warn/deprecat/jose/edge). Baseline baru 394: Next 16 tidak lagi mem-build `_app`/`_document`/`_error` Pages Router, dan menambah `/_global-error`. Daftar route app identik (○371 / ƒ259). |
| Smoke `next start` vs v8 | identik: `/darmasaba` & `/login` 200, `/admin` 307 → `/login`, 7 endpoint API Elysia (status + bentuk JSON), `/api/docs/json` 586 path, guard Elysia 401, 404 |
| `/api/img` (sharp) | 4 varian (raw, `?size=`, `?format=jpeg`, kombinasi) byte-identik dengan v8 di Node dan Bun. libvips 8.17.3 → 8.18.7, tetapi encoder webp 1.6.0/mozjpeg sama. Pipeline upload (EXIF orientation → webp) juga identik. |
| Matriks guard proxy (10 kasus: tanpa cookie, token saja, cache dirusak, admin, user role 5, admin nonaktif, publik) | 10/10 di `next start` (Node), `bun --bun next start`, dan container |
| Container (stage `builder`, runtime Bun, aarch64) | `prisma migrate deploy` no-op (55 migrasi), smoke identik dengan `next start`, guard 10/10 |
| Peak memori `next build` (host) | Next 16 2373 MiB vs Next 15 2663 MiB |
| Review silang | 0 temuan kritis (N2 oleh C; commit deps/config/Docker oleh B) |
| QA manual user | aman: halaman publik, view transition + back/forward, login/guard, editor admin, upload gambar → tampil di publik. Ada sedikit perubahan tampilan yang diterima user (lihat §5). |

**Batasan gate container.** Image penuh (stage runner) tidak bisa di-build lokal karena `COPY --chmod` butuh BuildKit dan buildx tidak terpasang, sedangkan CI memakai buildx. Gate runtime memakai `docker build --target builder` dan menjalankan `prisma migrate deploy && bun start`, sehingga:
- container jalan sebagai root, bukan `nextjs` uid 1001;
- seluruh source ikut, bukan hanya artefak runner;
- arsitekturnya aarch64, bukan linux/amd64 seperti prod;
- izin tulis `/app/uploads` belum diuji.

## 5. Hutang teknis & follow-up

- **ESLint:** `eslint-config-next` 15.5.12 dipakai bersama Next 16 (D15). Upgrade ke 16 butuh `eslint.config.mjs` flat native dan keputusan soal `react-hooks/immutability` vs Valtio (matikan/warn untuk mutasi proxy), lalu perbaiki sekitar 30 temuan nyata (`static-components`, `refs`, `purity`).
- **`next-view-transitions` 0.3.5:** library pihak ketiga, rilis terakhir 0.3.5 (2025-12-05), tidak ada rilis sejak itu. Dipakai `<ViewTransitions>` di `src/app/layout.tsx` (38 file). React 19.3 tidak lagi menggabungkan (entangle) transition, sehingga animasi bisa hilang tanpa error. QA manual N6 lolos, tetapi belum ada test otomatis. Ganti dengan view transition bawaan sebagai task terpisah.
- **`unstable_doesProxyMatch`:** test matcher memakai `unstable_doesMiddlewareMatch` karena Next 16.4.5 belum mengekspor versi `Proxy` (sudah ada `TODO(next16)` di test).
- **`docker run --env-file` tidak membuang tanda kutip.** `.env` memakai nilai berkutip (6 variabel, termasuk `DATABASE_URL` dan `BETTER_AUTH_SECRET`). Kalau stack prod mengisi env dari file berformat sama lewat `env_file`, kutipnya ikut terbawa. Belum dicek di stack prod (domain rekan).
- **Dockerfile `COPY --chmod` butuh BuildKit.** Build lokal tanpa buildx gagal di stage runner. CI tidak terdampak.
- **Polish tampilan:** sedikit perubahan tampilan yang dicatat QA N6 dipoles setelah semua tahap selesai.
- **Temuan review (bawaan, bukan regresi):**
  - `src/proxy.ts`: catch tanpa log saat membaca cookie cache;
  - `startsWith("/validasi")` vs matcher persis;
  - matcher ikut `/_next/data`;
  - belum ada test wiring `proxy()` → redirect;
  - `GEMINI.md`/`QWEN.md`/`STRUKTUR-PROJEK.md` menyebut `src/middlewares/` yang sudah tidak ada;
  - `package.json` `packageManager: yarn@1.22.22` padahal project memakai Bun.
- **Advisory lama di luar lingkup** (lapor ke backend): `better-auth` <1.7.7 critical (tidak tereksploitasi karena tidak memakai `better-auth/plugins`), `elysia` <1.4.29 high, `proxy-addr` <2.0.8, `happy-dom` <20 (devDependency).

## 6. Rollback

Tahap 2 tidak menyentuh data maupun schema, jadi rollback cukup di level kode/image:
- **Sebelum masuk `stg`:** kembali ke branch tahap 1 (`4d0ee79c`, v0.1.203).
- **Setelah masuk `stg`:** revert merge tahap 2 (v8 tetap), atau deploy ulang image 0.1.203. Kalau v8 juga perlu mundur, pakai 0.1.202.

Setelah rollback, jalankan `bun install` supaya `node_modules` kembali ke Next 15 / sharp 0.34. Dev server harus di-restart dan `.next` dihapus, karena output dev Next 16 ada di `.next/dev`.
