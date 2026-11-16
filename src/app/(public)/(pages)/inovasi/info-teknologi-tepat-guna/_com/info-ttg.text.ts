/** Label UI halaman Info Teknologi Tepat Guna. */
export const INFO_TTG_TEXT = {
  title: "Info Teknologi Tepat Guna",
  lead: "Teknologi tepat guna yang dikembangkan Desa Darmasaba sesuai kebutuhan warga, untuk pembangunan berkelanjutan dan kualitas hidup yang lebih baik.",
  searchLabel: "Cari teknologi tepat guna",
  searchPlaceholder: "Cari teknologi tepat guna",
  /** Wajib diisi KabarListHeader; pil tidak dirender karena entri tidak berkategori. */
  kategoriLabel: "Kategori teknologi tepat guna",
  listLabel: "Daftar teknologi tepat guna",
  loading: "Memuat teknologi tepat guna",
  paginationLabel: "Halaman daftar teknologi tepat guna",
  empty: "Belum ada info teknologi tepat guna.",
  emptySearch: (query: string) => `Tidak ada teknologi tepat guna yang cocok dengan “${query}”.`,
  error: "Info teknologi tepat guna gagal dimuat. Coba muat ulang halaman.",
} as const;
