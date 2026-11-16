/** Label UI halaman daftar & detail Program Kreatif Desa. */
export const PROGRAM_KREATIF_TEXT = {
  title: "Program Kreatif Desa",
  lead: "Program kreatif warga dan desa untuk lingkungan, ekonomi, dan budaya Darmasaba.",
  searchLabel: "Cari program kreatif",
  searchPlaceholder: "Cari program kreatif",
  /** Wajib diisi KabarListHeader; pil tidak dirender karena program tidak berkategori. */
  kategoriLabel: "Kategori program kreatif",
  listLabel: "Daftar program kreatif",
  selengkapnya: "Selengkapnya",
  loading: "Memuat program kreatif",
  paginationLabel: "Halaman daftar program kreatif",
  empty: "Belum ada program kreatif.",
  emptySearch: (query: string) => `Tidak ada program kreatif yang cocok dengan “${query}”.`,
  error: "Program kreatif gagal dimuat. Coba muat ulang halaman.",
} as const;

export const PROGRAM_KREATIF_DETAIL_TEXT = {
  kembali: "Program Kreatif Desa",
  kategori: "Program Kreatif Desa",
  loading: "Memuat program kreatif",
  notFound: "Program kreatif tidak ditemukan atau sudah tidak ditampilkan.",
  error: "Program kreatif gagal dimuat. Coba muat ulang halaman.",
  backToList: "Lihat semua program kreatif",
} as const;
