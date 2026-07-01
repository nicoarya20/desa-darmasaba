import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { betterFetch } from "@better-fetch/fetch";

// Bentuk minimal sesi Better Auth yang dibutuhkan guard (roleId/isActive
// dari additionalFields). cookieCache dimatikan → wajib fetch get-session.
type SessionResponse = {
  user: { id: string; roleId?: string; isActive?: boolean };
} | null;

async function getSession(request: NextRequest): Promise<SessionResponse> {
  const { data } = await betterFetch<SessionResponse>(
    "/api/auth/get-session",
    {
      baseURL: request.nextUrl.origin,
      headers: { cookie: request.headers.get("cookie") ?? "" },
    },
  );
  return data;
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const loginUrl = new URL("/login", request.url);

  // Rute sisa alur OTP (dihapus di Google-only) → arahkan ke login.
  if (path.startsWith("/validasi") || path.startsWith("/waiting-room")) {
    return NextResponse.redirect(loginUrl);
  }

  // /admin/*: butuh sesi Better Auth valid + isActive + role admin (roleId <= 4).
  const session = await getSession(request);
  if (!session?.user || session.user.isActive === false) {
    return NextResponse.redirect(loginUrl);
  }

  // roleId 0-4 = admin; user biasa (5+, login Google) diarahkan ke profil.
  if (Number(session.user.roleId ?? "5") > 4) {
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/validasi", "/waiting-room"],
};
