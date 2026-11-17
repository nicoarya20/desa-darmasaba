/** Label UI halaman daftar & detail Program Inovasi (Inovasi › Program Inovasi). */
export const PROGRAM_INOVASI_TEXT = {
  title: "Program Inovasi",
  lead: "Program inovasi Desa Darmasaba untuk pelayanan, ekonomi, budaya, dan lingkungan.",
  searchLabel: "Cari program inovasi",
  searchPlaceholder: "Cari program inovasi",
  /** Wajib diisi KabarListHeader; pil tidak dirender karena program tidak berkategori. */
  kategoriLabel: "Kategori program inovasi",
  listLabel: "Daftar program inovasi",
  selengkapnya: "Selengkapnya",
  loading: "Memuat program inovasi",
  paginationLabel: "Halaman daftar program inovasi",
  empty: "Belum ada program inovasi.",
  emptySearch: (query: string) => `Tidak ada program inovasi yang cocok dengan “${query}”.`,
  error: "Program inovasi gagal dimuat. Coba muat ulang halaman.",
} as const;

export const PROGRAM_INOVASI_DETAIL_TEXT = {
  kembali: "Program Inovasi",
  kategori: "Program Inovasi Desa",
  logoAlt: (name: string) => `Logo ${name}`,
  emptyDescription: "Belum ada deskripsi.",
  galleryTitle: "Dokumentasi",
  galleryAlt: (name: string) => `Dokumentasi ${name}`,
  notFoundTitle: "Program inovasi tidak ditemukan",
} as const;
