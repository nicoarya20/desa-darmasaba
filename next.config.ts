import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@elysiajs/static', 'elysia'],
  // AGENTS.md di-track git; cegah next dev menyisipkan blok agent-rules otomatis.
  agentRules: false,
  // Type check build pakai compiler API (in-process), bukan subprocess `tsc --showConfig`: di image Docker
  // oven/bun (tanpa Node) Bun memotong stdout besar saat proses keluar (~128 KB, output kita ~247 KB), sehingga
  // `next build` gagal "Could not parse output from TypeScript's --showConfig". Bawaan Next 16.4: true.
  experimental: { useTypeScriptCli: false },
  // Next mencocokkan hostname saja (tanpa skema/port); localhost sudah diizinkan default.
  allowedDevOrigins: ["192.168.1.82"], // akses dev dari HP/device lain di LAN
  // Website publik pindah dari /darmasaba/* ke root (route group src/app/(public)). URL lama
  // berprefix (dibagikan warga, terindeks mesin pencari, tersimpan di konten DB) wajib tetap
  // jalan. Next memakai redirect PERTAMA yang cocok: entri spesifik di atas wildcard, dan URL
  // lama berprefix langsung ke tujuan final supaya tidak terjadi redirect berantai.
  // Menu "Desa" diganti "Pemerintahan", Penghargaan digabung ke Prestasi Desa (tabel
  // PrestasiDesa, id sama). Source per-segmen, jadi /desa-anti-korupsi tidak ikut ter-redirect.
  async redirects() {
    return [
      { source: '/darmasaba/desa', destination: '/pemerintahan', permanent: true },
      { source: '/darmasaba/desa/:path*', destination: '/pemerintahan/:path*', permanent: true },
      { source: '/darmasaba/penghargaan', destination: '/prestasi-desa', permanent: true },
      { source: '/darmasaba/penghargaan/:id', destination: '/prestasi-desa/:id', permanent: true },
      { source: '/darmasaba', destination: '/', permanent: true },
      { source: '/darmasaba/:path*', destination: '/:path*', permanent: true },
      { source: '/desa', destination: '/pemerintahan', permanent: true },
      { source: '/desa/:path*', destination: '/pemerintahan/:path*', permanent: true },
      { source: '/penghargaan', destination: '/prestasi-desa', permanent: true },
      { source: '/penghargaan/:id', destination: '/prestasi-desa/:id', permanent: true },
      // Info Sekolah: ringkasan per jenjang dihapus, jenjang jadi filter di tabel (?jenjang=). `semua` lebih dulu
      // supaya tidak jadi ?jenjang=semua. Ringkasan satu segmen (/info-sekolah/{jenjang}) ditangani page [jenjangPendidikan].
      { source: '/pendidikan/info-sekolah/semua/:tabel(lembaga|siswa|pengajar)', destination: '/pendidikan/info-sekolah/:tabel', permanent: true },
      { source: '/pendidikan/info-sekolah/:jenjang/:tabel(lembaga|siswa|pengajar)', destination: '/pendidikan/info-sekolah/:tabel?jenjang=:jenjang', permanent: true },
      // Desa Digital + Info Teknologi Tepat Guna digabung jadi Inovasi Teknologi Desa (id entri sama; info-tekno tak punya
      // detail publik). docs/decisions/2026-11-16-inovasi-teknologi-desa.md
      { source: '/inovasi/desa-digital-smart-village', destination: '/inovasi/inovasi-teknologi-desa?kategori=digital', permanent: true },
      { source: '/inovasi/desa-digital-smart-village/:id', destination: '/inovasi/inovasi-teknologi-desa/:id', permanent: true },
      { source: '/inovasi/info-teknologi-tepat-guna', destination: '/inovasi/inovasi-teknologi-desa?kategori=tepat-guna', permanent: true },
      { source: '/admin/inovasi/desa-digital-smart-village/:path*', destination: '/admin/inovasi/inovasi-teknologi-desa/:path*', permanent: true },
      { source: '/admin/inovasi/info-teknologi-tepat-guna/:path*', destination: '/admin/inovasi/inovasi-teknologi-desa/:path*', permanent: true },
      // Katalog & form pinjam diganti halaman penghubung ke website perpustakaan desa (Pustaka Ananta Loka);
      // tautan lama /semua, /{kategori}, /{kategori}/{id} tetap sampai. docs/decisions/2026-11-17-perpustakaan-link-eksternal.md
      { source: '/pendidikan/perpustakaan-digital/:path+', destination: '/pendidikan/perpustakaan-digital', permanent: true },
      { source: '/admin/desa', destination: '/admin/pemerintahan', permanent: true },
      { source: '/admin/desa/:path*', destination: '/admin/pemerintahan/:path*', permanent: true },
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
