/** Label UI halaman daftar Kegiatan Desa. */
export const KEGIATAN_TEXT = {
  title: "Kegiatan Desa Darmasaba",
  lead: "Temukan berbagai kegiatan dan program yang dilaksanakan Desa Darmasaba",
  searchLabel: "Cari kegiatan",
  searchPlaceholder: "Cari kegiatan",
  kategoriLabel: "Kategori kegiatan",
  semua: "Semua",
  listLabel: "Daftar kegiatan desa",
  cardsLabel: "Kegiatan lainnya",
  loading: "Memuat kegiatan desa",
  paginationLabel: "Halaman daftar kegiatan",
  empty: "Belum ada kegiatan desa.",
  emptyKategori: (kategori: string) => `Belum ada kegiatan di kategori ${kategori}.`,
  emptySearch: (query: string) => `Tidak ada kegiatan yang cocok dengan “${query}”.`,
  error: "Kegiatan desa gagal dimuat. Coba muat ulang halaman.",
} as const;
