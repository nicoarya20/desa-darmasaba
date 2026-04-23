# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Desa Darmasaba is a full-stack digital village management platform for a village in Badung, Bali. It serves both a public-facing website (`/darmasaba/*`) and an admin CMS (`/admin/*`).

## Commands

```bash
# Development
bun run dev          # Start dev server (port 3000)
bun run build        # Production build
bun run tsc --noEmit # Type-check only

# Testing
bun run test         # All tests
bun run test:api     # Unit tests (Vitest)
bun run test:e2e     # E2E tests (Playwright)

# Database
bunx prisma migrate deploy   # Apply migrations
bunx prisma migrate dev --name <name>  # Create migration
bun run prisma/seed.ts       # Seed database
bunx prisma studio           # Interactive DB viewer

# Linting
bun eslint . --fix
```

## Architecture

### Tech Stack
- **Framework**: Next.js 15 (App Router) + React 19
- **Runtime/Package manager**: Bun (not npm)
- **API server**: Elysia.js (mounted at `/api/[[...slugs]]`)
- **ORM**: Prisma + PostgreSQL
- **UI**: Mantine UI v7-8
- **State**: Jotai (atoms), Valtio (proxies), SWR (data fetching)
- **Auth**: iron-session + JWT
- **File storage**: Local uploads + Seafile (self-hosted)

### Request Flow

```
Browser → Next.js middleware (src/middleware.ts)
       → Public pages: src/app/darmasaba/
       → Admin pages:  src/app/admin/
       → API:          src/app/api/[[...slugs]]/route.ts (Elysia.js)
                       └── _lib/*.ts  (domain modules)
```

The Elysia server is a single entry point with domain-specific modules: `desa.ts`, `kesehatan.ts`, `ekonomi.ts`, `keamanan.ts`, `lingkungan.ts`, `pendidikan.ts`, `kependudukan.ts`, `ppid.ts`, `inovasi.ts`, `auth/`, `user/`, `fileStorage/`. Swagger docs are auto-generated at `/api/docs`.

### Domain Modules
Each domain (desa, kesehatan, ekonomi, etc.) has:
- API handler in `src/app/api/[[...slugs]]/_lib/<domain>.ts`
- Admin CMS pages in `src/app/admin/(dashboard)/<domain>/`
- Public pages in `src/app/darmasaba/(pages)/<domain>/`

### Database (Prisma)
- Schema at `prisma/schema.prisma` (~2400 lines, 100+ models)
- Common model conventions: `@default(cuid())` IDs, `createdAt`/`updatedAt` timestamps, `deletedAt DateTime?` (soft delete), `isActive Boolean @default(true)`
- Seeders per-module in `prisma/_seeder_list/`, orchestrated by `prisma/seed.ts`

### Authentication Flow
1. User submits phone → OTP sent (email/SMS)
2. OTP validated → JWT created + iron-session stored
3. `UserSession` model tracks active sessions
4. `src/middleware.ts` validates on each request
5. `src/lib/api-auth.ts` handles JWT/session checks in API routes

### File Handling
All uploaded files reference the `FileStorage` Prisma model. Uploads land in `WIBU_UPLOAD_DIR` (default: `uploads/`). Seafile is the external storage fallback.

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

## Environment Variables

Copy `.env.example` to `.env`. Required variables:

```env
DATABASE_URL="postgresql://..."
NEXT_PUBLIC_BASE_URL="/"
BASE_SESSION_KEY="..."      # random string
BASE_TOKEN_KEY="..."        # random string
SESSION_PASSWORD="..."      # min 32 chars
SEAFILE_TOKEN="..."
SEAFILE_REPO_ID="..."
SEAFILE_URL="..."
```

## Docker

Multi-stage build: `oven/bun:1-debian` → builder → runner. The runner creates a `nextjs` user (UID 1001), exposes port 3000, and mounts `/app/uploads` as a volume. Entrypoint runs migrations automatically.

## CI/CD

GitHub Actions workflows in `.github/workflows/`:
- `docker-publish.yml` — triggers on `v*` tags, pushes to GHCR
- `publish.yml` — manual build & push
- `re-pull.yml` — triggers Portainer to redeploy latest image

To release: tag with `git tag -a v0.1.x -m "..."` and push the tag.

### Workflow for Code Changes
1.  **Commit** existing changes before starting new work
2.  **Create plan** at `MIND/PLAN/[plan-name].md`
3.  **Create task** at `MIND/PLAN/[task-name].md`
4.  **Execute the task** and update task progress
5.  **Create summary** at `MIND/SUMMARY/[summary-name].md` when done
6.  **Run build** (`bun run build`) to ensure no compile errors
7.  **Fix any build errors** if they occur
8.  **Commit** all changes AFTER successful build
9.  **Update version** in `package.json` for every change
10. **Push** to new branch with format: `tasks/[task-name]/[what-is-being-done]/[date-time]`
11. **Push ke 2 Remote** - Push ke 2 remote origin dan deploy
12. **Merge ke Branch** - Merge ke branch target (biasanya `stg` untuk staging atau `prod` untuk production) ke 2 remote origin dan deploy

### GitHub Workflows
1.  **publish.yml**: Uses branch `main`, stack env and image tag matching version from `package.json`.
2.  **re-pull.yml**: **Wait for `publish.yml` to complete successfully before running.** Uses branch `main`, stack env and stack name `desa-darmasaba`.

### After Progress
-   Always give option to continue to GitHub workflows or not
