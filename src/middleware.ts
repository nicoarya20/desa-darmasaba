import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCookieCache } from "better-auth/cookies";
import { isAdminRole, isAccountActive } from "./lib/auth-policy";

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

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const loginUrl = new URL("/login", request.url);

  // Rute sisa alur OTP (dihapus di Google-only) → arahkan ke login.
  if (path.startsWith("/validasi") || path.startsWith("/waiting-room")) {
    return NextResponse.redirect(loginUrl);
  }

  // /admin/*: butuh sesi Better Auth valid + aktif + role admin (roleId <= 4).
  // Gagal decode cookie → perlakukan sebagai tidak-terautentikasi (redirect login,
  // bukan 500). Validasi penuh sesi tetap terjadi di server (getSession/requireAuth).
  let user: CachedUser | null = null;
  try {
    user = await getCachedUser(request);
  } catch {
    return NextResponse.redirect(loginUrl);
  }
  if (!user || !isAccountActive(user.isActive)) {
    return NextResponse.redirect(loginUrl);
  }

  // roleId 0-4 = admin; user biasa (5+, login Google) diarahkan ke profil.
  if (!isAdminRole(user.roleId)) {
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/validasi", "/waiting-room"],
};
