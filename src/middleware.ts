/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(process.env.BASE_TOKEN_KEY!);
  const { payload } = await jwtVerify(token, secret);
  return (payload as any).user;
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // /validasi: hanya bisa diakses jika auth_flow cookie ada (di-set saat kirim OTP)
  if (path.startsWith('/validasi')) {
    const authFlow = request.cookies.get('auth_flow')?.value;
    if (!authFlow || !['login', 'register'].includes(authFlow)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // /waiting-room: harus punya JWT valid (isActive boleh false — sedang menunggu persetujuan)
  if (path.startsWith('/waiting-room')) {
    const token = request.cookies.get(process.env.BASE_SESSION_KEY!)?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    try {
      const user = await verifyToken(token);
      if (!user) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      // Sudah aktif → tidak perlu di waiting-room, langsung ke admin
      if (user.isActive) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // /admin/*: harus punya JWT valid + isActive
  const token = request.cookies.get(process.env.BASE_SESSION_KEY!)?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const user = await verifyToken(token);
    if (!user || !user.isActive) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware auth error:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/admin/:path*', '/validasi', '/waiting-room'],
};
