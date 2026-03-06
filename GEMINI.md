# Project: Desa Darmasaba

## Project Overview

The `desa-darmasaba` project is a Next.js (version 15+) application developed with TypeScript. It serves as an official platform for Desa Darmasaba (a village in Badung, Bali), offering various public services, news, and detailed village profiles.

**Key Technologies:**

*   **Frontend Framework:** Next.js (v15+) with React (v19+)
*   **Language:** TypeScript
*   **UI Library:** Mantine UI
*   **Database ORM:** Prisma (v6+)
*   **Database:** PostgreSQL (as configured in `prisma/schema.prisma`)
*   **API Framework:** Elysia (used for API routes, as seen in dependencies)
*   **State Management:** Potentially Jotai and Valtio (listed in dependencies)
*   **Image Processing:** Sharp
*   **Package Manager:** Likely Bun, given `bun.lockb` and the `prisma:seed` script.

The application architecture follows the Next.js App Router structure, with comprehensive data models defined in `prisma/schema.prisma` covering various domains like public information, health, security, economy, innovation, environment, and education. It also includes configurations for image handling and caching.

## Building and Running

This project uses `bun` as the package manager. Ensure Bun is installed to run these commands.

*   **Install Dependencies:**
    ```bash
    bun install
    ```

*   **Development Server:**
    Runs the Next.js development server.
    ```bash
    bun run dev
    ```

*   **Build for Production:**
    Builds the Next.js application for production deployment.
    ```bash
    bun run build
    ```

*   **Start Production Server:**
    Starts the Next.js application in production mode.
    ```bash
    bun run start
    ```

*   **Database Seeding:**
    Executes the Prisma seeding script to populate the database.
    ```bash
    bun run prisma:seed
    ```

## Development Conventions

*   **Coding Language:** TypeScript is strictly enforced.
*   **Frontend Framework:** Next.js App Router for page and component structuring.
*   **UI/UX:** Adherence to Mantine UI component library for consistent styling and user experience.
*   **Database Interaction:** Prisma ORM is used for all database operations, with a PostgreSQL database.
*   **Linting:** ESLint is configured with `next/core-web-vitals` and `next/typescript` to maintain code quality and adherence to Next.js and TypeScript best practices.
*   **Styling:** PostCSS is used, with `postcss-preset-mantine` and `postcss-simple-vars` defining Mantine-specific breakpoints and other CSS variables.
*   **Imports:** Absolute imports are configured using `@/*` which resolves to the `src/` directory.
