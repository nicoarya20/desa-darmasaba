import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {},
  allowedDevOrigins: [
    "http://192.168.1.82:3000", // buat akses dari HP/device lain
    "http://localhost:3000",   // akses lokal
  ],
  async headers() {
    return [
      {
        source: '/assets/:path*', // Path ke folder gambar
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, stale-while-revalidate=600', // Cache selama 1 jam, validasi ulang setelah 10 menit
          },
        ],
      },
    ];
  },
};

export default nextConfig;
