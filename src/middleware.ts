// // app/middleware.js
// import { NextResponse, NextRequest } from 'next/server';

// // Daftar route yang diizinkan tanpa login (public routes)
// const publicRoutes = [
//     '/*', // Home page
//     '/about', // About page
//     '/public/*', // Wildcard untuk semua route di bawah /public
//     '/login', // Halaman login
// ];

// // Fungsi untuk memeriksa apakah route saat ini adalah route publik
// function isPublicRoute(pathname: string) {
//     return publicRoutes.some((route) => {
//         // Jika route mengandung wildcard (*), gunakan regex untuk mencocokkan
//         if (route.endsWith('*')) {
//             const baseRoute = route.replace('*', ''); // Hapus wildcard
//             return pathname.startsWith(baseRoute); // Cocokkan dengan pathname
//         }
//         return pathname === route; // Cocokkan exact path
//     });
// }

// export function middleware(request: NextRequest) {
//     const { pathname } = request.nextUrl;

//     // Jika route adalah public, izinkan akses
//     if (isPublicRoute(pathname)) {
//         return NextResponse.next();
//     }

//     // Jika bukan public route, periksa apakah pengguna sudah login
//     const isLoggedIn = request.cookies.get('darmasaba-auth-token'); // Contoh: cek cookie auth-token
//     if (!isLoggedIn) {
//         // Redirect ke halaman login jika belum login
//         return NextResponse.redirect(new URL('/login', request.url));
//     }

//     // Jika sudah login, izinkan akses
//     return NextResponse.next();
// }

// // Konfigurasi untuk menentukan path mana yang akan dijalankan middleware
// export const config = {
//     matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'], // Jalankan middleware untuk semua route kecuali file statis
// };

/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/admin/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Route publik di dalam /admin (boleh diakses tanpa login penuh)
const PUBLIC_ADMIN_ROUTES = [
  '/admin/login',
  '/admin/registrasi',
  '/admin/validasi',
  '/admin/waiting-room',
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Izinkan akses ke route publik di /admin
  if (PUBLIC_ADMIN_ROUTES.some(route => path.startsWith(route))) {
    return NextResponse.next();
  }

  // Ambil token dari cookie
  const token = request.cookies.get(process.env.BASE_SESSION_KEY!)?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verifikasi JWT
    const secret = new TextEncoder().encode(process.env.BASE_TOKEN_KEY!);
    const { payload } = await jwtVerify(token, secret);
    const user = (payload as any).user;

    // Cek apakah user aktif
    if (!user || !user.isActive) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // ✅ User valid → izinkan akses
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware auth error:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// Hanya berlaku untuk /admin/*
export const config = {
  matcher: ['/admin/:path*'],
};