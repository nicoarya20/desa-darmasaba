/** Label UI halaman daftar & detail Keamanan Lingkungan (Pecalang / Patwal). */
export const KEAMANAN_LINGKUNGAN_TEXT = {
  title: "Keamanan Lingkungan (Pecalang / Patwal)",
  lead: "Pecalang dan Patwal (Patroli Pengawal) bertugas memastikan desa tetap aman, tertib, dan kondusif bagi seluruh warga.",
  searchLabel: "Cari keamanan lingkungan",
  searchPlaceholder: "Cari keamanan lingkungan",
  /** Wajib diisi KabarListHeader; pil tidak dirender karena entri tidak berkategori. */
  kategoriLabel: "Kategori keamanan lingkungan",
  listLabel: "Daftar kegiatan keamanan lingkungan",
  cardsLabel: "Kegiatan keamanan lingkungan lainnya",
  loading: "Memuat keamanan lingkungan",
  paginationLabel: "Halaman daftar keamanan lingkungan",
  empty: "Belum ada informasi keamanan lingkungan.",
  emptySearch: (query: string) => `Tidak ada informasi keamanan lingkungan yang cocok dengan “${query}”.`,
  error: "Keamanan lingkungan gagal dimuat. Coba muat ulang halaman.",
} as const;

export const KEAMANAN_LINGKUNGAN_DETAIL_TEXT = {
  loading: "Memuat keamanan lingkungan",
  notFound: "Informasi keamanan lingkungan tidak ditemukan atau sudah tidak ditampilkan.",
  error: "Keamanan lingkungan gagal dimuat. Coba muat ulang halaman.",
  backToList: "Lihat semua keamanan lingkungan",
  fotoLabel: "Lihat foto ukuran penuh",
} as const;
