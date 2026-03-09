# AGENTS.md

This file contains essential information for agentic coding agents working in the desa-darmasaba repository.

## Project Overview

Desa Darmasaba is a Next.js 15 application for village management services in Badung, Bali. It uses:
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Mantine UI components with custom CSS
- **Backend**: Elysia.js API server integrated with Next.js
- **Database**: PostgreSQL with Prisma ORM
- **State Management**: Valtio for global state
- **Authentication**: JWT with iron-session

## Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start

# Database seeding
bun run prisma/seed.ts

# Linting (ESLint)
npx eslint .

# Type checking
npx tsc --noEmit

# Prisma operations
npx prisma generate
npx prisma db push
npx prisma studio
```

## Running Tests

Currently no test framework is configured. When adding tests:
- Set up test scripts in package.json
- Consider Jest or Vitest for unit testing
- Use Playwright for E2E testing
- Update this section with specific test commands

## Code Style Guidelines

### Imports
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
- Use Valtio for global state (proxy pattern)
- State dibagi menjadi admin dan public domains
- Keep local state in components when possible
- Use SWR for server state caching
- Implement optimistic updates for better UX

**State Structure:**
```
src/state/
├── admin/              # Admin dashboard state
│   ├── adminNavState.ts
│   ├── adminAuthState.ts
│   ├── adminFormState.ts
│   └── adminModuleState.ts
├── public/             # Public pages state
│   ├── publicNavState.ts
│   └── publicMusicState.ts
├── darkModeStore.ts    # Dark mode state
└── index.ts            # Central exports
```

**Usage Examples:**
```typescript
// Import state
import { adminNavState, useAdminNav } from '@/state';

// In non-React code
adminNavState.mobileOpen = true;

// In React components
const { mobileOpen, toggleMobile } = useAdminNav();
```

### Styling
- Primary: Mantine UI components
- Use Mantine theme system for customization
- Custom CSS should be minimal and scoped
- Follow responsive design principles
- Use semantic HTML5 elements

### Environment Variables
- Use `.env.local` for development
- Prefix public variables with `NEXT_PUBLIC_`
- Never commit environment files to version control
- Use proper typing for environment variables

### File Organization
```
src/
├── app/                 # Next.js app router pages
├── components/          # Reusable React components
├── lib/                # Utility functions and configurations
├── state/              # Valtio state management
│   ├── admin/          # Admin domain state
│   ├── public/         # Public domain state
│   └── index.ts        # Central exports
├── store/              # Legacy store (deprecated)
├── types/              # TypeScript type definitions
└── con/                # Constants and static data
```

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

## Development Workflow

1. Always run type checking before committing: `npx tsc --noEmit`
2. Run linting to catch style issues: `npx eslint .`
3. Test database changes with `npx prisma db push`
4. Use the integrated Swagger docs at `/api/docs` for API testing
5. Check environment variables are properly configured
6. Verify responsive design on different screen sizes

## Important Notes

- The application uses a custom Elysia.js server integrated with Next.js API routes
- Image uploads are handled through `/api/upl-img-single` endpoint
- Database seeding is done with Bun runtime
- The app supports Indonesian locale (id_ID) for SEO and content
- CORS is configured to allow cross-origin requests during development