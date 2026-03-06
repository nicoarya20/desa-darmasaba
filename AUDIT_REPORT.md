# Engineering Audit Report: Desa Darmasaba
**Status:** Production Readiness Review (Critical)
**Auditor:** Staff Technical Architect

---

## 📊 Executive Summary & Scores

| Category | Score | Status |
| :--- | :---: | :--- |
| **Project Architecture** | 3/10 | 🔴 Critical Failure |
| **Code Quality** | 4/10 | 🟠 Poor |
| **Performance** | 5/10 | 🟡 Mediocre |
| **Security** | 5/10 | 🟠 Risk Detected |
| **Production Readiness** | 2/10 | 🔴 Not Ready |

---

## 🏗️ 1. Project Architecture
The project suffers from a **"Frankenstein Architecture"**. It attempts to run a full Elysia.js instance inside a Next.js Catch-All route.
- **Fractured Backend:** Logic is split between standard Next.js routes (`/api/auth`) and embedded Elysia modules.
- **Stateful Dependency:** Reliance on local filesystem (`WIBU_UPLOAD_DIR`) makes the application impossible to deploy on modern serverless platforms like Vercel.
- **Polluted Namespace:** Routing tree contains "test/coba" folders (`src/app/coba`, `src/app/percobaan`) that would be accessible in production.

## ⚛️ 2. Frontend Engineering (React / Next.js)
- **State Management Chaos:** Simultaneous use of `Valtio`, `Jotai`, `React Context`, and `localStorage`.
- **Tight Coupling:** Public pages (`/darmasaba`) import state directly from Admin internal states (`/admin/(dashboard)/_state`).
- **Heavy Client-Side Logic:** Logic that belongs in Server Actions or Hooks is embedded in presentational components (e.g., `Footer.tsx`).

## 📡 3. Backend / API Design
- **Framework Overhead:** Running Elysia inside Next.js adds unnecessary cold-boot overhead and complexity.
- **Weak Validation:** Widespread use of `as Type` casting in API handlers instead of runtime validation (Zod/Schema).
- **Service Integration:** OTP codes are sent via external `GET` requests with sensitive data in the query string—a major logging risk.

## 🗄️ 4. Database & Data Modeling (Prisma)
- **Schema Over-Normalization:** ~2000 lines of schema. Every minor content type (e.g., `LambangDesa`) is a separate table instead of a unified CMS model.
- **Polymorphic Monolith:** `FileStorage` is a "god table" with optional relations to ~40 other tables, creating a massive bottleneck and data integrity risk.
- **Connection Mismanagement:** Manual `prisma.$disconnect()` in API routes kills connection pooling performance.

## 🚀 5. Performance Engineering
- **Bypassing Optimization:** Custom `/api/utils/img` endpoint bypasses `next/image` optimization, serving uncompressed assets.
- **Aggressive Polling:** Client-side 30s polling for notifications is battery-draining and inefficient compared to SSE or SWR.

## 🔒 6. Security Audit
- **Insecure OTP Delivery:** Credentials passed as URL parameters to the WhatsApp service.
- **File Upload Risks:** Potential for Arbitrary File Upload due to direct local filesystem writes without rigorous sanitization.

## 🧹 7. Code Quality
- **Inconsistency:** Mixed English/Indonesian naming (e.g., `nomor` vs `createdAt`).
- **Artifacts:** Root directory is littered with scratch files: `xcoba.ts`, `xx.ts`, `test.txt`.

---

## 🚩 Top 10 Critical Problems
1. **Architectural Fracture:** Embedding Elysia inside Next.js creates a "split-brain" system.
2. **Serverless Incompatibility:** Dependency on local disk storage for uploads.
3. **Database Bloat:** Over-complicated schema with a fragile `FileStorage` monolith.
4. **State Fragmentation:** Mixed usage of Jotai and Valtio without a clear standard.
5. **Credential Leakage:** OTP codes sent via GET query parameters.
6. **Poor Cleanup:** Trial/Test folders and files committed to the production source.
7. **Asset Performance:** Bypassing Next.js image optimization.
8. **Coupling:** High dependency between public UI and internal Admin state.
9. **Type Safety:** Manual casting in APIs instead of runtime validation.
10. **Connection Pooling:** Inefficient Prisma connection management.

---

## 🛠️ Tech Lead Refactoring Priorities
1. **Unify the API:** Decommission the Elysia wrapper. Port all logic to standard Next.js Route Handlers with Zod validation.
2. **Stateless Storage:** Implement an S3-compatible adapter for all file uploads. Remove `fs` usage.
3. **Schema Consolidation:** Refactor the schema to use generic content models where possible.
4. **Standardize State:** Choose one global state manager and migrate all components.
5. **Project Sanitization:** Delete all `coba`, `percobaan`, and scratch files (`xcoba.ts`, etc.).
