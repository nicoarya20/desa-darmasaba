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
bun run prisma/seed.ts                 # Seed database
bunx prisma studio                     # Interactive DB viewer

# Linting
bun eslint . --fix
```

## Reference Docs

- Architecture, request flow, domain modules, key files: @.claude/ARCHITECTURE.md
- Database conventions, auth flow, file handling: @.claude/DATABASE.md
- Env vars, Docker, CI/CD, releasing: @.claude/DEPLOYMENT.md
