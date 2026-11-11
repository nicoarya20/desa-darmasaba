/** Label UI halaman daftar berita (`/darmasaba/pemerintahan/berita/*`). */
export const BERITA_TEXT = {
  title: "Portal Berita Darmasaba",
  lead: "Temukan berbagai potensi dan keunggulan yang dimiliki Desa Darmasaba",
  searchLabel: "Cari berita",
  searchPlaceholder: "Cari berita",
  kategoriLabel: "Kategori berita",
  semua: "Semua",
  listLabel: "Daftar berita",
  paginationLabel: "Halaman daftar berita",
  empty: "Belum ada berita.",
  emptyKategori: (kategori: string) => `Belum ada berita di kategori ${kategori}.`,
  emptySearch: (query: string) => `Tidak ada berita yang cocok dengan “${query}”.`,
  error: "Berita gagal dimuat. Coba muat ulang halaman.",
} as const;
