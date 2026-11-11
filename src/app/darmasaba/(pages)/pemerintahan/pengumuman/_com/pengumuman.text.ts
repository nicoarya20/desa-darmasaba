/** Label UI halaman Pengumuman publik (`/darmasaba/pemerintahan/pengumuman/*`). */
export const PENGUMUMAN_TEXT = {
  title: "Pengumuman Desa Darmasaba",
  lead: "Informasi dan pengumuman resmi terkait kegiatan dan kebijakan Desa Darmasaba",
  searchLabel: "Cari pengumuman",
  searchPlaceholder: "Cari pengumuman",
  kategoriLabel: "Kategori pengumuman",
  semua: "Semua",
  listLabel: "Daftar pengumuman",
  loading: "Memuat pengumuman",
  paginationLabel: "Halaman daftar pengumuman",
  empty: "Belum ada pengumuman.",
  emptyKategori: (kategori: string) => `Belum ada pengumuman di kategori ${kategori}.`,
  emptySearch: (query: string) => `Tidak ada pengumuman yang cocok dengan “${query}”.`,
  error: "Pengumuman gagal dimuat. Coba muat ulang halaman.",
} as const;
