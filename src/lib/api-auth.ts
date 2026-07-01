/**
 * Authentication helper untuk API endpoints (Elysia di /api/[[...slugs]]).
 *
 * Memvalidasi sesi Better Auth (Google OAuth). Bentuk return DIJAGA sama
 * seperti sebelumnya ({ authenticated, user | response }) supaya konsumer
 * (route.ts onBeforeHandle + endpoint) tak perlu berubah.
 *
 * Usage:
 *   const authResult = await requireAuth();
 *   if (!authResult.authenticated) return authResult.response;
 *   // ... authResult.user
 */

import { headers } from "next/headers";
import { auth } from "./auth";
import { ROLE_USER, isAccountActive } from "./auth-policy";

export type AuthUser = {
  id: string;
  roleId: string | number;
  isActive?: boolean;
  [key: string]: unknown;
};

export type AuthResult =
  | { authenticated: true; user: AuthUser }
  | { authenticated: false; response: Response };

const jsonResponse = (status: number, message: string): Response =>
  new Response(JSON.stringify({ success: false, message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });

/** Ambil user dari sesi Better Auth, atau null jika tak ada sesi valid. */
async function getSessionUser(): Promise<AuthUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return null;
  const u = session.user as {
    id: string;
    roleId?: string;
    isActive?: boolean;
  };
  return {
    id: u.id,
    roleId: u.roleId ?? ROLE_USER,
    isActive: u.isActive ?? true,
  };
}

export async function requireAuth(): Promise<AuthResult> {
  try {
    const user = await getSessionUser();

    if (!user) {
      return {
        authenticated: false,
        response: jsonResponse(401, "Unauthorized - Silakan login terlebih dahulu"),
      };
    }

    // Akun nonaktif (dinonaktifkan admin) tidak boleh akses API admin.
    if (!isAccountActive(user.isActive)) {
      return {
        authenticated: false,
        response: jsonResponse(403, "Akun Anda tidak aktif. Hubungi administrator."),
      };
    }

    return { authenticated: true, user };
  } catch {
    return {
      authenticated: false,
      response: jsonResponse(401, "Unauthorized - Sesi tidak valid"),
    };
  }
}

/**
 * Optional auth - tidak error jika tidak authenticated.
 * Berguna untuk endpoint yang bisa diakses public atau private.
 */
export async function optionalAuth(): Promise<AuthUser | null> {
  try {
    return await getSessionUser();
  } catch {
    return null;
  }
}
