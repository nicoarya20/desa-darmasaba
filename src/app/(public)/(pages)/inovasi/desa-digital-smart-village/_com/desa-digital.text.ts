/** Label UI halaman daftar & detail Desa Digital / Smart Village. */
export const DESA_DIGITAL_TEXT = {
  title: "Desa Digital / Smart Village",
  lead: "Layanan dan inovasi digital Desa Darmasaba untuk pemberdayaan masyarakat dan ekonomi berbasis teknologi.",
  searchLabel: "Cari layanan digital",
  searchPlaceholder: "Cari layanan digital",
  /** Wajib diisi KabarListHeader; pil tidak dirender karena entri tidak berkategori. */
  kategoriLabel: "Kategori layanan digital",
  sorotan: "Terbaru",
  selengkapnya: "Baca selengkapnya",
  listLabel: "Layanan digital lainnya",
  searchListLabel: "Hasil pencarian",
  cardsLabel: "Daftar layanan digital",
  loading: "Memuat layanan digital",
  paginationLabel: "Halaman daftar layanan digital",
  empty: "Belum ada layanan digital.",
  emptySearch: (query: string) => `Tidak ada layanan digital yang cocok dengan “${query}”.`,
  error: "Layanan digital gagal dimuat. Coba muat ulang halaman.",
} as const;

export const DESA_DIGITAL_DETAIL_TEXT = {
  kembali: "Desa Digital / Smart Village",
  kategori: "Desa Digital",
  loading: "Memuat layanan digital",
  notFound: "Layanan digital tidak ditemukan atau sudah tidak ditampilkan.",
  error: "Layanan digital gagal dimuat. Coba muat ulang halaman.",
  backToList: "Lihat semua layanan digital",
  fotoLabel: "Lihat foto ukuran penuh",
} as const;
