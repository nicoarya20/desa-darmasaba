import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@elysiajs/static', 'elysia'],
  // AGENTS.md di-track git; cegah next dev menyisipkan blok agent-rules otomatis.
  agentRules: false,
  // Next mencocokkan hostname saja (tanpa skema/port); localhost sudah diizinkan default.
  allowedDevOrigins: ["192.168.1.82"], // akses dev dari HP/device lain di LAN
  // Menu "Desa" diganti "Pemerintahan": URL lama (bookmark, link eksternal, indeks
  // mesin pencari) wajib tetap jalan. Source per-segmen, jadi /darmasaba/desa-anti-korupsi
  // tidak ikut ter-redirect.
  async redirects() {
    return [
      { source: '/darmasaba/desa', destination: '/darmasaba/pemerintahan', permanent: true },
      { source: '/darmasaba/desa/:path*', destination: '/darmasaba/pemerintahan/:path*', permanent: true },
      { source: '/admin/desa', destination: '/admin/pemerintahan', permanent: true },
      { source: '/admin/desa/:path*', destination: '/admin/pemerintahan/:path*', permanent: true },
      // Penghargaan digabung ke Prestasi Desa (tabel PrestasiDesa, id sama): link lama tetap jalan.
      { source: '/darmasaba/penghargaan', destination: '/darmasaba/prestasi-desa', permanent: true },
      { source: '/darmasaba/penghargaan/:id', destination: '/darmasaba/prestasi-desa/:id', permanent: true },
      { source: '/admin/pemerintahan/penghargaan', destination: '/admin/landing-page/prestasi-desa/list-prestasi-desa', permanent: true },
      { source: '/admin/pemerintahan/penghargaan/:path*', destination: '/admin/landing-page/prestasi-desa/list-prestasi-desa', permanent: true },
    ];
  },
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
