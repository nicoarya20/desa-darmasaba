/** Label UI halaman Tips Keamanan. */
export const TIPS_KEAMANAN_TEXT = {
  title: "Tips Keamanan",
  lead: "Kumpulan tips praktis untuk menjaga keamanan diri, keluarga, rumah, dan lingkungan di Desa Darmasaba.",
  searchLabel: "Cari tips keamanan",
  searchPlaceholder: "Cari tips keamanan",
  /** Wajib diisi KabarListHeader; pil tidak dirender karena tips tidak berkategori. */
  kategoriLabel: "Kategori tips keamanan",
  listLabel: "Daftar tips keamanan",
  loading: "Memuat tips keamanan",
  paginationLabel: "Halaman daftar tips keamanan",
  empty: "Belum ada tips keamanan.",
  emptySearch: (query: string) => `Tidak ada tips keamanan yang cocok dengan “${query}”.`,
  error: "Tips keamanan gagal dimuat. Coba muat ulang halaman.",
} as const;
