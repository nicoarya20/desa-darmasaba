import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { betterFetch } from "@better-fetch/fetch";
import { isAdminRole, isAccountActive } from "./lib/auth-policy";

// Bentuk minimal sesi Better Auth yang dibutuhkan guard (roleId/isActive
// dari additionalFields). cookieCache dimatikan → wajib fetch get-session.
type SessionResponse = {
  user: { id: string; roleId?: string; isActive?: boolean };
} | null;

// Validasi sesi lewat loopback INTERNAL container (127.0.0.1:PORT), bukan origin
// publik. Memakai X-Forwarded-Host membuat container memanggil dirinya sendiri
// lewat Cloudflare (round-trip eksternal) → lambat/hang (timeout). Sedangkan
// nextUrl.origin ter-resolve ke https://localhost → gagal TLS. Loopback HTTP
// menghindari keduanya. Cookie tetap diteruskan agar get-session bisa verifikasi.
const INTERNAL_BASE_URL = `http://127.0.0.1:${process.env.PORT ?? "3000"}`;

async function getSession(request: NextRequest): Promise<SessionResponse> {
  const { data } = await betterFetch<SessionResponse>(
    "/api/auth/get-session",
    {
      baseURL: INTERNAL_BASE_URL,
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

  // /admin/*: butuh sesi Better Auth valid + aktif + role admin (roleId <= 4).
  // getSession bisa gagal (jaringan/proxy) — perlakukan sebagai tidak-terautentikasi
  // dan redirect ke login, jangan sampai melempar 500 di guard.
  let session: SessionResponse = null;
  try {
    session = await getSession(request);
  } catch {
    return NextResponse.redirect(loginUrl);
  }
  if (!session?.user || !isAccountActive(session.user.isActive)) {
    return NextResponse.redirect(loginUrl);
  }

  // roleId 0-4 = admin; user biasa (5+, login Google) diarahkan ke profil.
  if (!isAdminRole(session.user.roleId)) {
    return NextResponse.redirect(new URL("/profile", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/validasi", "/waiting-room"],
};
