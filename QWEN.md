# Desa Darmasaba - Village Management System

## Project Overview

Desa Darmasaba is a comprehensive Next.js 15 application designed for village management services in Badung, Bali. The platform serves as a digital hub for government services, public information, news, and community engagement for the residents of Darmasaba village.

### Key Technologies
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Mantine UI components with custom CSS
- **Backend**: Elysia.js API server integrated with Next.js
- **Database**: PostgreSQL with Prisma ORM
- **State Management**: Jotai for global state
- **Authentication**: JWT with iron-session
- **Runtime**: Bun (instead of Node.js)

### Architecture
The application follows a modern full-stack architecture with:
- Frontend built with Next.js 15 and TypeScript
- Backend API endpoints using Elysia.js
- PostgreSQL database managed with Prisma ORM
- Mantine UI library for consistent design components
- File storage system for managing images and documents
- Comprehensive user authentication and authorization system

## Features

The application provides extensive functionality across multiple domains:

### Government Services
- Public service information and requests
- Administrative online services
- Community announcements and news
- Village profile and governance information

### Health Services
- Healthcare facility information
- Health programs and initiatives
- Emergency health contacts
- Health articles and education
- Posyandu (community health posts) information

### Economic Development
- Local market information
- Job listings and employment opportunities
- Village economic statistics
- Business registration and support

### Innovation & Technology
- Digital village initiatives
- Technology adoption programs
- Innovation proposal system
- Smart village features

### Education
- School information and statistics
- Scholarship programs
- Educational support services
- Library and learning resources

### Environmental Management
- Waste management systems
- Green initiatives
- Environmental conservation programs
- Community participation activities

### Security & Safety
- Emergency contacts
- Police station information
- Crime prevention measures
- Community safety programs

## Building and Running

### Prerequisites
- Bun runtime (version specified in package.json)
- PostgreSQL database
- Environment variables configured

### Setup Commands
```bash
# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Database setup
bunx prisma db push
bunx prisma generate

# Seed database (optional)
bun run prisma/seed.ts

# Development mode
bun run dev

# Production build
bun run build

# Start production server
bun run start
```

### Additional Commands
```bash
# Linting (ESLint)
bunx eslint .

# Type checking
bunx tsc --noEmit

# Prisma operations
bunx prisma generate
bunx prisma db push
bunx prisma studio
```

## Project Structure

```
src/
├── app/                 # Next.js app router pages
│   ├── _com/           # Common components
│   ├── admin/          # Admin panel routes
│   ├── api/            # API routes
│   ├── darmasaba/      # Main application pages
│   ├── login/          # Authentication pages
│   └── ...             # Other feature pages
├── con/                # Constants and static data
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and configurations
├── middlewares/        # Middleware functions
├── state/              # Global state management
├── store/              # Additional state management
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
├── middleware.ts       # Application middleware
└── schema.ts           # Schema definitions
```

## Development Guidelines

### Code Style
- Use absolute imports with `@/` alias (configured in tsconfig.json)
- Group imports: external libraries first, then internal modules
- Follow consistent naming conventions:
  - Components: PascalCase (e.g., `UploadImage.tsx`)
  - Files: kebab-case for utilities (e.g., `api-fetch.ts`)
  - Variables/Functions: camelCase
  - Constants: UPPER_SNAKE_CASE

### TypeScript Configuration
- Strict mode enabled (`"strict": true`)
- Target: ES2017
- Module resolution: bundler
- Path alias: `@/*` maps to `./src/*`

### Error Handling
- Use try-catch blocks for async operations
- Implement proper error boundaries in React components
- Log errors appropriately without exposing sensitive data
- Use Zod for runtime validation and type safety

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

## Database Schema

The application uses a comprehensive PostgreSQL database schema with Prisma ORM, featuring:

- **User Management**: Complete user authentication system with roles and permissions
- **Content Management**: News, announcements, and various content types
- **Service Management**: Various government and community services
- **File Storage**: Centralized file management system
- **Health Information**: Healthcare facilities and programs
- **Economic Data**: Market information and employment data
- **Educational Resources**: Schools, scholarships, and educational programs
- **Environmental Data**: Sustainability and environmental management
- **Security Information**: Emergency contacts and safety measures

## API Structure

- Backend uses Elysia.js with TypeScript
- API routes are in `src/app/api/[[...slugs]]/` directory
- Use treaty client for type-safe API calls
- Follow RESTful conventions for endpoints
- Include proper HTTP status codes and error responses

## Deployment

The application includes deployment scripts for staging environments, with:
- Automated builds using Bun
- Database migration handling
- Environment-specific configurations
- PM2 process management for production

## Important Notes

- The application uses a custom Elysia.js server integrated with Next.js API routes
- Image uploads are handled through `/api/upl-img-single` endpoint
- Database seeding is done with Bun runtime
- The app supports Indonesian locale (id_ID) for SEO and content
- CORS is configured to allow cross-origin requests during development
- Authentication is implemented with JWT tokens and iron-session
- The application has both public-facing and admin sections with different access controls