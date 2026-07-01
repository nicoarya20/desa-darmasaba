/**
 * Authentication helper untuk API endpoints
 *
 * Memvalidasi JWT dari cookie BASE_SESSION_KEY — sistem session yang sama
 * dipakai middleware.ts, login OTP (validasi), dan login Google (callback).
 * (Sebelumnya helper ini keliru membaca iron-session "desa-session" yang tak
 * pernah di-set, sehingga semua endpoint admin selalu 401.)
 *
 * Usage:
 * import { requireAuth } from "@/lib/api-auth";
 *
 * export default async function myEndpoint() {
 *   const authResult = await requireAuth();
 *   if (!authResult.authenticated) {
 *     return authResult.response;
 *   }
 *   // Lanjut proses dengan authResult.user
 * }
 */

import { cookies } from "next/headers";
import { jwtVerify } from "jose";

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

/** Verifikasi JWT dari cookie sesi. Mengembalikan payload user atau null. */
async function verifySessionToken(token: string): Promise<AuthUser | null> {
  const secret = new TextEncoder().encode(process.env.BASE_TOKEN_KEY!);
  const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
  const user = (payload as { user?: AuthUser }).user;
  if (!user || typeof user !== "object" || !user.id) return null;
  return user;
}

export async function requireAuth(): Promise<AuthResult> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(process.env.BASE_SESSION_KEY!)?.value;

    if (!token) {
      return {
        authenticated: false,
        response: jsonResponse(401, "Unauthorized - Silakan login terlebih dahulu"),
      };
    }

    const user = await verifySessionToken(token);
    if (!user) {
      return {
        authenticated: false,
        response: jsonResponse(401, "Unauthorized - Sesi tidak valid"),
      };
    }

    // Akun nonaktif (mis. menunggu persetujuan admin) tidak boleh akses API admin.
    if (user.isActive === false) {
      return {
        authenticated: false,
        response: jsonResponse(403, "Akun Anda tidak aktif. Hubungi administrator."),
      };
    }

    return { authenticated: true, user };
  } catch {
    // jwtVerify melempar untuk token kadaluarsa/rusak → perlakukan sebagai unauthorized
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
    const cookieStore = await cookies();
    const token = cookieStore.get(process.env.BASE_SESSION_KEY!)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}
