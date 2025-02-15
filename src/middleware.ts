// app/middleware.js
import { NextResponse, NextRequest } from 'next/server';

// Daftar route yang diizinkan tanpa login (public routes)
const publicRoutes = [
    '/*', // Home page
    '/about', // About page
    '/public/*', // Wildcard untuk semua route di bawah /public
    '/login', // Halaman login
];

// Fungsi untuk memeriksa apakah route saat ini adalah route publik
function isPublicRoute(pathname: string) {
    return publicRoutes.some((route) => {
        // Jika route mengandung wildcard (*), gunakan regex untuk mencocokkan
        if (route.endsWith('*')) {
            const baseRoute = route.replace('*', ''); // Hapus wildcard
            return pathname.startsWith(baseRoute); // Cocokkan dengan pathname
        }
        return pathname === route; // Cocokkan exact path
    });
}

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Jika route adalah public, izinkan akses
    if (isPublicRoute(pathname)) {
        return NextResponse.next();
    }

    // Jika bukan public route, periksa apakah pengguna sudah login
    const isLoggedIn = request.cookies.get('darmasaba-auth-token'); // Contoh: cek cookie auth-token
    if (!isLoggedIn) {
        // Redirect ke halaman login jika belum login
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Jika sudah login, izinkan akses
    return NextResponse.next();
}

// Konfigurasi untuk menentukan path mana yang akan dijalankan middleware
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'], // Jalankan middleware untuk semua route kecuali file statis
};