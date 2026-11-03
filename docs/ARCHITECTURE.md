# Architecture

## Tech Stack
- **Framework**: Next.js 15 (App Router) + React 19
- **Runtime/Package manager**: Bun (not npm)
- **API server**: Elysia.js (mounted at `/api/[[...slugs]]`)
- **ORM**: Prisma + PostgreSQL
- **UI**: Mantine UI v7-8
- **State**: Valtio (proxies) — used almost everywhere (180+ files). SWR used in one file only. Jotai is listed in package.json but has zero usage — do not use it for new code.
- **Auth**: Better Auth (`src/lib/auth.ts`), Google OAuth only, sessions stored in Postgres. `iron-session`/JWT (`src/lib/session.ts`) is legacy and unused — do not build on it.
- **File storage**: MinIO (object storage — see `src/lib/minio.ts`), the sole storage backend. Data was migrated off Seafile to MinIO (`prisma/migrate-seafile-to-minio.ts`); `src/lib/seafile-auth-service.ts` and `WIBU_UPLOAD_DIR` are leftovers from before the migration — do not build on them.
- **Testing**: Vitest (`__tests__/api/`), Playwright (`__tests__/e2e/`), MSW for mocking

## Request Flow

```
Browser → Next.js middleware (src/middleware.ts)
       → Public pages: src/app/darmasaba/
       → Admin pages:  src/app/admin/
       → API:          src/app/api/[[...slugs]]/route.ts (Elysia.js)
                       └── _lib/*.ts  (domain modules)
```

The Elysia server is a single entry point with domain-specific modules: `desa/`, `kesehatan/`, `ekonomi/`, `keamanan/`, `lingkungan/`, `pendidikan/`, `kependudukan/`, `ppid/`, `inovasi/`, `landing_page/`, `search/`, `auth/`, `user/`, `fileStorage/`. Swagger docs are auto-generated at `/api/docs`.

Note: `auth` login/session endpoints are now mostly handled by Better Auth's own catch-all route (`src/app/api/auth/[...all]/route.ts`), outside the Elysia server — the `auth/` module inside `_lib/` only covers the remaining custom auth-adjacent logic. `musik` is not a top-level API module; it's a sub-module nested under `desa/` (`_lib/desa/musik`), even though it has its own top-level admin/public page folders.

## Domain Modules
Each domain (desa, kesehatan, ekonomi, etc.) has:
- API handler in `src/app/api/[[...slugs]]/_lib/<domain>/`
- Admin CMS pages in `src/app/admin/(dashboard)/<domain>/`
- Public pages in `src/app/darmasaba/(pages)/<domain>/`

Active domains: `desa`, `ekonomi`, `inovasi`, `keamanan`, `kependudukan`, `kesehatan`, `lingkungan`, `musik`, `pendidikan`, `ppid` — plus `landing_page` and `search` (API-only, no public/admin pages).

Admin also has non-domain sections not covered above: `auth` (login/registrasi/validasi admin pages) and `user&role` (user + role + menu-access management, note the `&` in the folder name).

## Key Files

| File | Purpose |
|------|---------|
| `src/middleware.ts` | Route guards, reads Better Auth's signed cookie cache (not a custom JWT decode) — see `src/lib/auth-policy.ts` for the whitelist logic it delegates to |
| `src/lib/prisma.ts` | Prisma client singleton |
| `src/lib/auth.ts` | Better Auth server config (Google OAuth, Postgres session store, super-admin allowlist) |
| `src/lib/api-auth.ts` | Better Auth session validation in API routes (`auth.api.getSession()`) |
| `src/lib/api-fetch.ts` | Typed fetch wrapper used by frontend |
| `src/lib/minio.ts` | MinIO client — primary object storage backend |
| `next.config.ts` | Next.js config (cache headers, allowed origins) |
| `postcss.config.cjs` | Mantine CSS preset and breakpoints |
| `docker-entrypoint.sh` | Runs `prisma migrate deploy` then starts app |

`src/lib/session.ts` (iron-session) still exists on disk but is dead code — not imported anywhere. Don't treat it as the auth mechanism.