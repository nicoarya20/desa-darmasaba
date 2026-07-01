import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Handler Better Auth untuk semua endpoint /api/auth/* (Next.js App Router).
// Terpisah dari Elysia catch-all di /api/[[...slugs]] — route.ts Elysia tak disentuh.
export const { GET, POST } = toNextJsHandler(auth.handler);
