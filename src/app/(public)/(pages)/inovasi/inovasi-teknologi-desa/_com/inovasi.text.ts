/** Label UI halaman daftar & detail Inovasi Teknologi Desa. */
export const INOVASI_TEXT = {
  title: "Inovasi Teknologi Desa",
  lead: "Inovasi digital dan teknologi tepat guna yang dikembangkan Desa Darmasaba untuk pelayanan publik, pemberdayaan masyarakat, dan kualitas hidup warga.",
  searchLabel: "Cari inovasi teknologi desa",
  searchPlaceholder: "Cari inovasi",
  kategoriLabel: "Kategori inovasi",
  semua: "Semua",
  listLabel: "Daftar inovasi teknologi desa",
  cardsLabel: "Inovasi teknologi desa lainnya",
  loading: "Memuat inovasi teknologi desa",
  paginationLabel: "Halaman daftar inovasi teknologi desa",
  empty: "Belum ada inovasi teknologi desa.",
  emptyKategori: (kategori: string) => `Belum ada inovasi pada kategori ${kategori}.`,
  emptySearch: (query: string) => `Tidak ada inovasi yang cocok dengan “${query}”.`,
  error: "Inovasi teknologi desa gagal dimuat. Coba muat ulang halaman.",
} as const;

export const INOVASI_DETAIL_TEXT = {
  loading: "Memuat inovasi teknologi desa",
  notFound: "Inovasi teknologi desa tidak ditemukan atau sudah tidak ditampilkan.",
  error: "Inovasi teknologi desa gagal dimuat. Coba muat ulang halaman.",
  backToList: "Lihat semua inovasi teknologi desa",
  fotoLabel: "Lihat foto ukuran penuh",
} as const;
