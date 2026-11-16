/** Label UI halaman Data Lingkungan Desa. */
export const DATA_LINGKUNGAN_TEXT = {
  title: "Data Lingkungan Desa",
  lead: "Desa Darmasaba menjaga dan mengembangkan lingkungan demi kesejahteraan warganya, dengan fokus pada penghijauan, pengelolaan sampah, dan perlindungan kawasan hijau.",
  searchLabel: "Cari data lingkungan",
  searchPlaceholder: "Cari data lingkungan",
  /** Wajib diisi KabarListHeader; pil tidak dirender karena data tidak berkategori. */
  kategoriLabel: "Kategori data lingkungan",
  listLabel: "Daftar data lingkungan desa",
  loading: "Memuat data lingkungan",
  paginationLabel: "Halaman daftar data lingkungan",
  empty: "Belum ada data lingkungan desa.",
  emptySearch: (query: string) => `Tidak ada data lingkungan yang cocok dengan “${query}”.`,
  error: "Data lingkungan gagal dimuat. Coba muat ulang halaman.",
} as const;
