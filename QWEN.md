# Desa Darmasaba - Village Management System

## Project Overview

Desa Darmasaba is a comprehensive Next.js 15 application designed for village management services in Darmasaba, Badung, Bali. The application serves as a digital platform for government services, public information, and community engagement. It features multiple sections including PPID (Public Information Disclosure), health services, security, education, environment, economy, innovation, and more.

### Key Technologies
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Mantine UI components with custom CSS
- **Backend**: Elysia.js API server integrated with Next.js
- **Database**: PostgreSQL with Prisma ORM
- **State Management**: Valtio for global state
- **Authentication**: JWT with iron-session

### Architecture
The application follows a modular architecture with:
- A main frontend built with Next.js and Mantine UI
- An integrated Elysia.js API server for backend operations
- Prisma ORM for database interactions
- File storage integration with Seafile
- Multiple domain-specific modules (PPID, health, security, education, etc.)

## Building and Running

### Prerequisites
- Node.js (with Bun runtime)
- PostgreSQL database
- Seafile server for file storage

### Setup Instructions
1. Install dependencies:
   ```bash
   bun install
   ```

2. Set up environment variables in `.env.local`:
   ```
   DATABASE_URL=your_postgresql_connection_string
   SEAFILE_TOKEN=your_seafile_token
   SEAFILE_REPO_ID=your_seafile_repo_id
   SEAFILE_BASE_URL=your_seafile_base_url
   SEAFILE_PUBLIC_SHARE_TOKEN=your_seafile_public_share_token
   SEAFILE_URL=your_seafile_api_url
   WIBU_UPLOAD_DIR=your_upload_directory
   ```

3. Generate Prisma client:
   ```bash
   bunx prisma generate
   ```

4. Push database schema:
   ```bash
   bunx prisma db push
   ```

5. Seed the database:
   ```bash
   bun run prisma/seed.ts
   ```

6. Run the development server:
   ```bash
   bun run dev
   ```

### Available Scripts
- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run prisma/seed.ts` - Run database seeding
- `bunx prisma generate` - Generate Prisma client
- `bunx prisma db push` - Push schema changes to database
- `bunx prisma studio` - Open Prisma Studio GUI

## Development Conventions

### Code Structure
```
src/
├── app/                 # Next.js app router pages
│   ├── admin/           # Admin dashboard pages
│   ├── api/             # API routes with Elysia.js
│   ├── darmasaba/       # Public-facing village pages
│   └── ...
├── con/                 # Constants and configuration
├── hooks/               # React hooks
├── lib/                 # Utility functions and configurations
├── middlewares/         # Next.js middleware
├── state/               # Global state management
├── store/               # Additional state management
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

### Import Conventions
- Use absolute imports with `@/` alias (configured in tsconfig.json)
- Group imports: external libraries first, then internal modules
- Keep import statements organized and remove unused imports

```typescript
// External libraries
import { useState } from 'react'
import { Button, Stack } from '@mantine/core'

// Internal modules
import ApiFetch from '@/lib/api-fetch'
import { MyComponent } from '@/components/my-component'
```

### TypeScript Configuration
- Strict mode enabled (`"strict": true`)
- Target: ES2017
- Module resolution: bundler
- Path alias: `@/*` maps to `./src/*`

### Naming Conventions
- **Components**: PascalCase (e.g., `UploadImage.tsx`)
- **Files**: kebab-case for utilities (e.g., `api-fetch.ts`)
- **Variables/Functions**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Database Models**: PascalCase (Prisma convention)

### Error Handling
- Use try-catch blocks for async operations
- Implement proper error boundaries in React components
- Log errors appropriately without exposing sensitive data
- Use Zod for runtime validation and type safety

### API Structure
- Backend uses Elysia.js with TypeScript
- API routes are in `src/app/api/[[...slugs]]/` directory
- Use treaty client for type-safe API calls
- Follow RESTful conventions for endpoints
- Include proper HTTP status codes and error responses

### Database Operations
- Use Prisma client from `@/lib/prisma.ts`
- Database connection includes graceful shutdown handling
- Use transactions for complex operations
- Implement proper error handling for database queries

### Component Guidelines
- Use functional components with hooks
- Implement proper prop types with TypeScript interfaces
- Use Mantine components for UI consistency
- Follow atomic design principles when possible
- Add loading states and error states for async operations

### State Management
- Use Valtio proxies for global state
- Keep local state in components when possible
- Use SWR for server state caching
- Implement optimistic updates for better UX

### Styling
- Primary: Mantine UI components
- Use Mantine theme system for customization
- Custom CSS should be minimal and scoped
- Follow responsive design principles
- Use semantic HTML5 elements

### Security Practices
- Validate all user inputs with Zod schemas
- Use JWT tokens for authentication
- Implement proper CORS configuration
- Never expose database credentials or API keys
- Use HTTPS in production
- Implement rate limiting for sensitive endpoints

### Performance Considerations
- Use Next.js Image optimization
- Implement proper caching strategies
- Use React.memo for expensive components
- Optimize bundle size with dynamic imports
- Use Prisma query optimization

## Domain Modules

The application is organized into several domain modules:

1. **PPID (Public Information Disclosure)**: Profile, structure, information requests, legal basis
2. **Health**: Health facilities, programs, emergency response, disease information
3. **Security**: Community security, emergency contacts, crime prevention
4. **Education**: Schools, scholarships, educational programs
5. **Economy**: Local markets, BUMDes, employment data
6. **Environment**: Environmental data, conservation, waste management
7. **Innovation**: Digital services, innovation programs
8. **Culture**: Village traditions, music, cultural preservation

Each module has its own section in both the admin panel and public-facing areas.

## File Storage Integration

The application integrates with Seafile for file storage, with specific handling for:
- Images and documents
- Public sharing capabilities
- CDN URL generation
- Batch processing of assets

## Testing

Currently no formal test framework is configured. When adding tests:
- Consider Jest or Vitest for unit testing
- Use Playwright for E2E testing
- Update this section with specific test commands

## Deployment

The application includes deployment scripts in the `NOTE.md` file that outline:
- Automated deployment with GitHub API integration
- Environment-specific configurations
- PM2 process management
- Release management with versioning

## Troubleshooting

Common issues and solutions:
- **API endpoints returning 404**: Check that environment variables are properly configured
- **Database connection errors**: Verify DATABASE_URL in environment variables
- **File upload issues**: Ensure Seafile integration is properly configured
- **Build failures**: Run `bunx prisma generate` before building

## Development Workflow

1. Always run type checking before committing: `bunx tsc --noEmit`
2. Run linting to catch style issues: `bun run eslint .`
3. Test database changes with `bunx prisma db push`
4. Use the integrated Swagger docs at `/api/docs` for API testing
5. Check environment variables are properly configured
6. Verify responsive design on different screen sizes

## Qwen Added Memories
- **GitHub Workflow Execution**: Project ini memiliki 3 workflow GitHub Action:
1. `publish.yml` - Build & push Docker image ke GHCR (manual trigger, butuh input: stack_env + tag)
2. `re-pull.yml` - Re-pull Docker image di Portainer (manual trigger, butuh input: stack_name + stack_env)
3. `docker-publish.yml` - Auto build & push saat ada tag versi v*

Workflow bisa dijalankan via GitHub CLI: `gh workflow run <nama.yml> -f param=value --ref branch`

Setelah commit ke branch deployment (dev/stg/prod), otomatis trigger workflow publish + re-pull untuk deploy ke server.

- **Deployment Workflow Sistematis**:
1. **Version Bump** - Update `version` di `package.json` sebelum deploy (ikuti semver: major.minor.patch)
2. **Commit** - Commit perubahan + version bump dengan pesan yang jelas
3. **Buat Branch dan Push ke Branch yang baru dibuat** - Untuk branchnya buat sesuai dengan apa yang dikerjakan dengan format [apa-yang-dikerjakan]-[date-time]
4. **Push ke 2 Remote** - Push ke 2 remote origin dan deploy
5. **Merge ke Branch** - Merge ke branch target (biasanya `stg` untuk staging atau `prod` untuk production) ke 2 remote origin dan deploy
6. **Trigger publish.yml** - Gunakan GitHub API atau CLI dengan: `ref: main`, `stack_env: stg`, `tag: <versi-dari-package.json>`
7. **Tunggu publish selesai** - Workflow harus completed baru lanjut ke re-pull
8. **Trigger re-pull.yml** - Gunakan GitHub API atau CLI dengan: `ref: main`, `stack_name: desa-darmasaba`, `stack_env: stg`

Branch deployment: `stg` (staging) atau `prod` (production)
Version format di package.json: `"version": "major.minor.patch"`

- **Deployment Workflow HARUS Sequential (Berurutan)**:

Saat deploy ke stg atau prod, workflow TIDAK BOLEH dijalankan bersamaan. Harus menunggu yang pertama SELESAI total baru trigger yang kedua.

**Urutan yang BENAR:**
1. ✅ **publish.yml** - Tunggu sampai SELESAI (status: ✓ success)
2. ✅ **Setelah publish selesai**, baru trigger **re-pull.yml**

**JANGAN trigger keduanya bersamaan!** Ini akan menyebabkan race condition karena re-pull akan menarik image yang belum selesai di-build.

**Cara cek workflow selesai via GitHub CLI:**
```bash
gh run watch <publish_run_id>
# Tunggu sampai ada checkmark ✓
```
