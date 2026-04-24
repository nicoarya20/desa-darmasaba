# Architecture

## Tech Stack
- **Framework**: Next.js 15 (App Router) + React 19
- **Runtime/Package manager**: Bun (not npm)
- **API server**: Elysia.js (mounted at `/api/[[...slugs]]`)
- **ORM**: Prisma + PostgreSQL
- **UI**: Mantine UI v7-8
- **State**: Jotai (atoms), Valtio (proxies), SWR (data fetching)
- **Auth**: iron-session + JWT
- **File storage**: Local uploads + Seafile (self-hosted)

## Request Flow

```
Browser → Next.js middleware (src/middleware.ts)
       → Public pages: src/app/darmasaba/
       → Admin pages:  src/app/admin/
       → API:          src/app/api/[[...slugs]]/route.ts (Elysia.js)
                       └── _lib/*.ts  (domain modules)
```

The Elysia server is a single entry point with domain-specific modules: `desa.ts`, `kesehatan.ts`, `ekonomi.ts`, `keamanan.ts`, `lingkungan.ts`, `pendidikan.ts`, `kependudukan.ts`, `ppid.ts`, `inovasi.ts`, `auth/`, `user/`, `fileStorage/`. Swagger docs are auto-generated at `/api/docs`.

## Domain Modules
Each domain (desa, kesehatan, ekonomi, etc.) has:
- API handler in `src/app/api/[[...slugs]]/_lib/<domain>.ts`
- Admin CMS pages in `src/app/admin/(dashboard)/<domain>/`
- Public pages in `src/app/darmasaba/(pages)/<domain>/`

## Key Files

| File | Purpose |
|------|---------|
| `src/middleware.ts` | Route guards and auth |
| `src/lib/prisma.ts` | Prisma client singleton |
| `src/lib/api-auth.ts` | JWT/session validation |
| `src/lib/api-fetch.ts` | Typed fetch wrapper used by frontend |
| `src/lib/session.ts` | iron-session config |
| `next.config.ts` | Next.js config (cache headers, allowed origins) |
| `postcss.config.cjs` | Mantine CSS preset and breakpoints |
| `docker-entrypoint.sh` | Runs `prisma migrate deploy` then starts app |