# CLAUDE.md

Desa Darmasaba adalah platform manajemen desa digital untuk Desa Darmasaba, Badung, Bali. Melayani website publik (`/darmasaba/*`) dan admin CMS (`/admin/*`).

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
bunx prisma migrate deploy              # Apply migrations
bunx prisma migrate dev --name <name>  # Create migration
bun run prisma/seed.ts       # Seed database
bunx prisma studio           # Interactive DB viewer

# Linting
bun eslint . --fix
```

## Stack Inti (cold-start — jangan asumsi lain tanpa cek dulu)

- **Auth**: Better Auth (`src/lib/auth.ts`), Google OAuth only, session di Postgres. **Bukan** iron-session/JWT manual — `src/lib/session.ts` itu dead code, jangan dipakai.
- **State**: Valtio (`proxy`/`useSnapshot`) dipakai di ~semua domain. **Bukan** Zustand (tidak pernah ada di project) atau Jotai (di `package.json` tapi 0 usage).
- **File storage**: MinIO (`src/lib/minio.ts`) adalah backend satu-satunya. Seafile sudah **digantikan MinIO** (lihat `prisma/migrate-seafile-to-minio.ts`) — `src/lib/seafile-auth-service.ts` dan `WIBU_UPLOAD_DIR` adalah sisa lama yang sudah tidak dipakai, jangan dipakai untuk fitur baru.
- **Release**: bukan `git tag`, tapi bump versi `package.json` → commit ke `stg`/`prod` → trigger `publish.yml` → `re-pull.yml` (keduanya `workflow_dispatch` manual). Pakai tool MCP `deploy-stg` untuk stg.

Detail lengkap tiap topik ada di `docs/` — baca sesuai kebutuhan task, jangan diasumsikan sudah termuat otomatis:

- Architecture, request flow, domain modules, key files: `docs/ARCHITECTURE.md`
- Database conventions, auth flow, file handling: `docs/DATABASE.md`
- Env vars, Docker, CI/CD, releasing: `docs/DEPLOYMENT.md`
- UI/UX design system, tokens, komponen, pola halaman: `docs/DESIGN.md`
- AI collaboration contract, rules, and guidelines: @AI-CONTRACT.md

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
Both are manual `workflow_dispatch` triggers (not tied to branch `main`) — see `docs/DEPLOYMENT.md` for the full release flow. The `deploy-stg` MCP tool automates this end-to-end for stg deploys.
1.  **publish.yml**: Input `stack_env` (also used as git ref to check out), `tag` (set to match `package.json` version), `stack_name`.
2.  **re-pull.yml**: **Wait for `publish.yml` to complete successfully before running.** Input `stack_env`, `stack_name`.

### After Progress
-   Always give option to continue to GitHub workflows or not