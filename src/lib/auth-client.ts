import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { Auth } from "./auth";

// Client Better Auth untuk frontend. `inferAdditionalFields` membuat
// `roleId`/`isActive` ter-infer di sisi client (session.user).
export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : "",
  plugins: [inferAdditionalFields<Auth>()],
});

export type Session = typeof authClient.$Infer.Session;
export type SessionUser = typeof authClient.$Infer.Session.user;
