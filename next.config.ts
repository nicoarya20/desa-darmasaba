import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@elysiajs/static', 'elysia'],
  // AGENTS.md di-track git; cegah next dev menyisipkan blok agent-rules otomatis.
  agentRules: false,
  // Next mencocokkan hostname saja (tanpa skema/port); localhost sudah diizinkan default.
  allowedDevOrigins: ["192.168.1.82"], // akses dev dari HP/device lain di LAN
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
