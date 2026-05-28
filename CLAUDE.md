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

## Reference Docs

- Architecture, request flow, domain modules, key files: @.claude/ARCHITECTURE.md
- Database conventions, auth flow, file handling: @.claude/DATABASE.md
- Env vars, Docker, CI/CD, releasing: @.claude/DEPLOYMENT.md
- UI/UX design system, tokens, komponen, pola halaman: @.claude/DESIGN.md
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
1.  **publish.yml**: Uses branch `main`, stack env and image tag matching version from `package.json`.
2.  **re-pull.yml**: **Wait for `publish.yml` to complete successfully before running.** Uses branch `main`, stack env and stack name `desa-darmasaba`.

### After Progress
-   Always give option to continue to GitHub workflows or not