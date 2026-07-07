import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCookieCache, getSessionCookie } from "better-auth/cookies";
import { decideAdminAccess } from "./lib/auth-policy";

// User dari cookie cache Better Auth (additionalFields roleId/isActive ikut).
type CachedUser = { id: string; roleId?: string; isActive?: boolean };

// Baca sesi dari COOKIE CACHE — decode lokal di middleware, TANPA fetch/DB.
// Sebelumnya middleware fetch get-session (loopback/proxy) → hang/timeout di
// container. getCookieCache membaca & memverifikasi cookie signed langsung.
// Cache TTL 60 dtk (lihat session.cookieCache di auth.ts) → role tetap fresh.
async function getCachedUser(request: NextRequest): Promise<CachedUser | null> {
  const cache = await getCookieCache(request, {
    secret: process.env.BETTER_AUTH_SECRET,
    isSecure: process.env.NODE_ENV === "production",
  });
  return (cache?.user as CachedUser | undefined) ?? null;
}

// Apakah masih ada session token Better Auth (masa hidup 7 hari) di cookie?
// Dipakai sebagai FALLBACK saat cookie cache (TTL 60 dtk) sudah kedaluwarsa:
// token ada = sesi kemungkinan masih valid → jangan paksa logout, biarkan
// server (getSession/requireAuth) memvalidasi penuh & me-refresh cache.
function hasSessionToken(request: NextRequest): boolean {
  return Boolean(getSessionCookie(request));
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const loginUrl = new URL("/login", request.url);

  // Rute sisa alur OTP (dihapus di Google-only) → arahkan ke login.
  if (path.startsWith("/validasi") || path.startsWith("/waiting-room")) {
    return NextResponse.redirect(loginUrl);
  }

  // /admin/*: butuh sesi Better Auth valid + aktif + role admin (roleId <= 4).
  // Gagal decode cookie → anggap cache miss (user=null); keputusan tetap lewat
  // decideAdminAccess dgn fallback token. Validasi penuh sesi tetap di server.
  let user: CachedUser | null = null;
  try {
    user = await getCachedUser(request);
  } catch {
    user = null;
  }

  switch (decideAdminAccess(user, hasSessionToken(request))) {
    case "login":
      return NextResponse.redirect(loginUrl);
    case "profile":
      return NextResponse.redirect(new URL("/profile", request.url));
    default:
      return NextResponse.next();
  }
}

export const config = {
  matcher: ["/admin/:path*", "/validasi", "/waiting-room"],
};
