/**
 * Authentication helper untuk API endpoints
 * 
 * Usage:
 * import { requireAuth } from "@/lib/api-auth";
 * 
 * export default async function myEndpoint(context: Context) {
 *   const authResult = await requireAuth(context);
 *   if (!authResult.authenticated) {
 *     return authResult.response;
 *   }
 *   // Lanjut proses dengan authResult.user
 * }
 */

import { getSession } from "@/lib/session";

export type AuthResult = 
  | { authenticated: true; user: any }
  | { authenticated: false; response: Response };

export async function requireAuth(context: any): Promise<AuthResult> {
  try {
    // Cek session dari cookies
    const session = await getSession();
    
    if (!session || !session.user) {
      return {
        authenticated: false,
        response: new Response(JSON.stringify({
          success: false,
          message: "Unauthorized - Silakan login terlebih dahulu"
        }), { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        })
      };
    }

    // Check jika user masih aktif
    if (!session.user.isActive) {
      return {
        authenticated: false,
        response: new Response(JSON.stringify({
          success: false,
          message: "Akun Anda tidak aktif. Hubungi administrator."
        }), { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        })
      };
    }

    return {
      authenticated: true,
      user: session.user
    };
  } catch (error) {
    console.error("Auth error:", error);
    return {
      authenticated: false,
      response: new Response(JSON.stringify({
        success: false,
        message: "Authentication error"
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    };
  }
}

/**
 * Optional auth - tidak error jika tidak authenticated
 * Berguna untuk endpoint yang bisa diakses public atau private
 */
export async function optionalAuth(context: any): Promise<any> {
  try {
    const session = await getSession();
    return session?.user || null;
  } catch (error) {
    return null;
  }
}
