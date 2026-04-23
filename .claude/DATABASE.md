# Database & Data Layer

## Prisma Schema
- Schema at `prisma/schema.prisma` (~2400 lines, 100+ models)
- Common model conventions: `@default(cuid())` IDs, `createdAt`/`updatedAt` timestamps, `deletedAt DateTime?` (soft delete), `isActive Boolean @default(true)`
- Seeders per-module in `prisma/_seeder_list/`, orchestrated by `prisma/seed.ts`

## Authentication Flow
1. User submits phone → OTP sent (email/SMS)
2. OTP validated → JWT created + iron-session stored
3. `UserSession` model tracks active sessions
4. `src/middleware.ts` validates on each request
5. `src/lib/api-auth.ts` handles JWT/session checks in API routes

## File Handling
All uploaded files reference the `FileStorage` Prisma model. Uploads land in `WIBU_UPLOAD_DIR` (default: `uploads/`). Seafile is the external storage fallback.
