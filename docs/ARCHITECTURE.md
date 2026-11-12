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

The Elysia server is a single entry point with domain-specific modules: `desa/`, `kesehatan/`, `ekonomi/`, `keamanan/`, `lingkungan/`, `pendidikan/`, `kependudukan/`, `ppid/`, `inovasi/`, `landing_page/`, `search/`, `auth/`, `user/`, `fileStorage/`, `menu_visibility/` (override tampil/sembunyi submenu publik; GET publik, PUT khusus role 0/1). Swagger docs are auto-generated at `/api/docs`. Struktur organisasi (Perangkat Desa, PPID, BUMDes) memakai tabel terpisah per domain dengan kode bersama — lihat `docs/decisions/2026-11-12-struktur-perangkat-desa.md`.

Note: `auth` login/session endpoints are now mostly handled by Better Auth's own catch-all route (`src/app/api/auth/[...all]/route.ts`), outside the Elysia server — the `auth/` module inside `_lib/` only covers the remaining custom auth-adjacent logic. `musik` is not a top-level API module; it's a sub-module nested under `desa/` (`_lib/desa/musik`), even though it has its own top-level admin/public page folders.

## Domain Modules
Each domain (desa, kesehatan, ekonomi, etc.) has:
- API handler in `src/app/api/[[...slugs]]/_lib/<domain>/`
- Admin CMS pages in `src/app/admin/(dashboard)/<domain>/`
- Public pages in `src/app/(public)/(pages)/<domain>/`

Active domains: `desa`, `ekonomi`, `inovasi`, `keamanan`, `kependudukan`, `kesehatan`, `lingkungan`, `musik`, `pendidikan`, `ppid` — plus `landing_page` and `search` (API-only, no public/admin pages).

Admin also has non-domain sections not covered above: `auth` (login/registrasi/validasi admin pages) and `user&role` (user + role + menu-access management, note the `&` in the folder name). Menu Access semantics (section vs submenu IDs, `basePath`, UI-only page guard) are documented under "Sidebar Admin" in `docs/DESIGN.md`.

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