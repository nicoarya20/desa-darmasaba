# Architecture

## Tech Stack
- **Framework**: Next.js 16.4.5 (App Router, Turbopack for dev + build) + React 19.3 — see `docs/decisions/2026-11-04-next-16-upgrade.md`
- **Runtime/Package manager**: Bun (not npm)
- **API server**: Elysia.js (mounted at `/api/[[...slugs]]`)
- **ORM**: Prisma + PostgreSQL
- **UI**: Mantine UI v9 (9.7.4) + Tiptap 3 — lihat `docs/decisions/2026-11-04-mantine-9-upgrade.md` (induk: `docs/decisions/2026-11-04-mantine-8-staged-upgrade.md`)
- **State**: Valtio (proxies) — used almost everywhere (180+ files). SWR used in one file only. Jotai is listed in package.json but has zero usage — do not use it for new code.
- **Auth**: Better Auth (`src/lib/auth.ts`), Google OAuth only, sessions stored in Postgres. `iron-session`/JWT (`src/lib/session.ts`) is legacy and unused — do not build on it.
- **File storage**: MinIO (object storage — see `src/lib/minio.ts`), the sole storage backend. Data was migrated off Seafile to MinIO (`prisma/migrate-seafile-to-minio.ts`); `src/lib/seafile-auth-service.ts` and `WIBU_UPLOAD_DIR` are leftovers from before the migration — do not build on them.
- **Testing**: Vitest (`__tests__/api/`), Playwright (`__tests__/e2e/`), MSW for mocking

## Request Flow

```
Browser → Next.js proxy (src/proxy.ts, runtime nodejs)
       → Public pages: src/app/(public)/
       → Admin pages:  src/app/admin/
       → API:          src/app/api/[[...slugs]]/route.ts (Elysia.js)
                       └── _lib/*.ts  (domain modules)
```

The Elysia server is a single entry point with domain-specific modules: `desa/`, `kesehatan/`, `ekonomi/`, `keamanan/`, `lingkungan/`, `pendidikan/`, `kependudukan/`, `ppid/`, `inovasi/`, `landing_page/`, `search/`, `auth/`, `user/`, `fileStorage/`, `menu_visibility/` (override tampil/sembunyi submenu publik; GET publik, PUT khusus role 0/1), `sampah/` (Sampah per fitur koleksi — dokumen APBDes, galeri BUMDes, dokumen perencanaan; admin; DAK punya endpoint panel sendiri — `docs/decisions/2026-11-12-sampah.md`), `geocode/` (`GET /api/geocode/search?q=` untuk admin role 0–4, alamat → ≤5 kandidat koordinat via Nominatim/OpenStreetMap dari server; `GET /api/geocode/reverse?lat=&lng=` koordinat → `{ alamat, nama }` atau `null`; throttle, cache, dan User-Agent di `src/lib/geocode/nominatim.ts`; dipakai komponen form `TitikPetaInput`). Swagger docs are auto-generated at `/api/docs`. Struktur organisasi (Perangkat Desa, PPID, BUMDes) memakai tabel terpisah per domain dengan kode bersama (`_lib/_struktur-organisasi/`) — lihat `docs/decisions/2026-11-12-struktur-perangkat-desa.md` dan `docs/decisions/2026-11-12-struktur-fleksibel.md`. Galeri foto kegiatan, media sosial, kontak, struktur pengurus sederhana, dan lokasi untuk entri domain (Bank Sampah, PUSTU, Lembaga Sekolah; menyusul Posyandu) memakai fondasi bersama `_konten-bersama/` + `src/lib/konten-bersama/` — lihat `docs/KONTEN-BERSAMA.md`. Penerima Program Kemiskinan (PKH/CPP/BLT Desa per tahun; hanya nama + alamat, halaman & API publik `noindex`) ada di `_lib/ekonomi/program-kemiskinan/{penerima,publik}/` — `docs/decisions/2026-11-16-penerima-program-kemiskinan.md`.

Note: `auth` login/session endpoints are now mostly handled by Better Auth's own catch-all route (`src/app/api/auth/[...all]/route.ts`), outside the Elysia server — the `auth/` module inside `_lib/` only covers the remaining custom auth-adjacent logic. `musik` is not a top-level API module; it's a sub-module nested under `desa/` (`_lib/desa/musik`), even though it has its own top-level admin/public page folders.

## Domain Modules
Each domain (desa, kesehatan, ekonomi, etc.) has:
- API handler in `src/app/api/[[...slugs]]/_lib/<domain>/`
- Admin CMS pages in `src/app/admin/(dashboard)/<domain>/`
- Public pages in `src/app/(public)/(pages)/<domain>/`

Active domains: `desa`, `ekonomi`, `inovasi`, `keamanan`, `kependudukan`, `kesehatan`, `lingkungan`, `musik`, `pendidikan`, `ppid` — plus `landing_page` and `search` (API-only, no public/admin pages).

Halaman admin yang sengaja disembunyikan sementara (bukan dihapus) beserta cara memunculkannya lagi dicatat sebagai hutang di `docs/debt/` (mis. tab admin UMKM).

Admin also has non-domain sections not covered above: `auth` (login/registrasi/validasi admin pages) and `user&role` (user + role management, note the `&` in the folder name), and `pengaturan` (public menu visibility + admin Menu Access per user). Sampah is not a menu: each collection feature (DAK, APBDes, galeri BUMDes, Dokumen Perencanaan) has its own Sampah panel. Menu Access semantics (section vs submenu IDs, `basePath`, UI-only page guard) are documented under "Sidebar Admin" in `docs/DESIGN.md`.

## Jenna (asisten AI publik)

Widget chat di semua halaman publik, menjawab hanya dari data publik desa. Keputusan, gerbang anti-abuse, dan penanganan PII: `docs/decisions/2026-11-13-jenna-public-chat.md` (pengaturan: `docs/decisions/2026-11-13-developer-menu-jenna.md`).

```
JennaWidget (DarmasabaShell, lazy, Valtio)
  → GET  /api/jenna/status   tampil/tidak
  → POST /api/jenna/chat     Next Route Handler (di luar Elysia, tidak lewat src/proxy.ts)
       origin → body ≤ 8 KB → honeypot → prepareChatTurn (gerbang) → loop provider + tool read-only
       → output guard → persist (tersamar) → SSE
```

| Lokasi | Isi |
|---|---|
| `src/app/api/jenna/{status,chat}/route.ts`, `_lib/http.ts` | Route, cookie `jenna_sid`, cek Origin, body ber-batas |
| `src/lib/jenna/chat/` | `chat.service.ts` (gerbang + giliran, DI), `deps.ts` (wiring produksi), `executor-loop.ts`, `output-guard.ts`, `conversation.repo.ts`, `chat.persist.ts`, `retention.ts` |
| `src/lib/jenna/knowledge/` | Registry allowlist `sources.ts`, `snapshot.ts`, `sitemap.ts` (rute publik terlihat) |
| `src/lib/jenna/tools/` | 4 tool read-only + `executor.ts` |
| `src/lib/jenna/provider/` | Adapter OpenAI-compatible & Anthropic (+ stream), `active.ts` (provider aktif dari setelan) |
| `src/lib/jenna/runtime/` | Deadline, SSE writer & parser |
| `src/lib/jenna/{prompt,pii,limits,chat-types}.ts` | System prompt, masking PII, batas & hash identitas, kontrak wire SSE |
| `src/app/(public)/_com/jenna/` | Widget (FAB, panel/drawer, renderer markdown in-house, state Valtio, klien SSE) |
| `src/lib/rate-limit.ts` | Limiter sliding window in-memory (dipakai juga limiter OTP auth) |

Developer Console (`/dev/jenna/*`, API `/api/developer/jenna/*`, role 0): pengaturan (Umum, Batas Pemakaian, Provider), Pengetahuan (snapshot + sumber + tool, read-only; `src/lib/jenna/knowledge/admin.ts`), Percakapan (daftar tersamar + statistik), Penggunaan dan Log Error (`src/lib/jenna/chat/usage-admin.repo.ts`, sanitasi teks error di `src/lib/jenna/error-detail.ts`).

Developer Console umum (role 0): Ringkasan Sistem `/dev/ringkasan` (API `/api/developer/system`: status DB/MinIO dengan batas 5 detik `developer/with-timeout.ts`, checklist env wajib/opsional `env-checklist.ts`, status migrasi `migration-status.ts`, peringatan "Perlu perhatian" dari fungsi murni `dev/ringkasan/dev-warnings.logic.ts`) dan grup Log: Log Audit `/dev/log/audit` + Log Login `/dev/log/login` (API `/api/developer/audit-log`, `/api/developer/login-log`, baca saja). Aturan tabel di `docs/DATABASE.md` › Log Audit & Log Login.

## Key Files

| File | Purpose |
|------|---------|
| `src/proxy.ts` | Route guards (Next 16 `proxy` convention, formerly `middleware.ts`; always Node.js runtime), reads Better Auth's signed cookie cache (not a custom JWT decode) — see `src/lib/auth-policy.ts` for the whitelist logic it delegates to |
| `src/lib/prisma.ts` | Prisma client singleton |
| `src/lib/auth.ts` | Better Auth server config (Google OAuth, Postgres session store, super-admin allowlist) |
| `src/lib/api-auth.ts` | Better Auth session validation in API routes (`auth.api.getSession()`) |
| `src/lib/api-fetch.ts` | Typed fetch wrapper used by frontend |
| `src/lib/minio.ts` | MinIO client — primary object storage backend |
| `next.config.ts` | Next.js config (cache headers, allowed origins) |
| `postcss.config.cjs` | Mantine CSS preset and breakpoints |
| `docker-entrypoint.sh` | Runs `prisma migrate deploy` then starts app |

`src/lib/session.ts` (iron-session) still exists on disk but is dead code — not imported anywhere. Don't treat it as the auth mechanism.