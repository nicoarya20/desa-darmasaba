/** Label UI halaman daftar & detail Program Penghijauan. */
export const PENGHIJAUAN_TEXT = {
  title: "Program Penghijauan",
  lead: "Mari berpartisipasi menanam dan merawat pohon untuk menciptakan lingkungan hijau, sehat, dan seimbang bagi seluruh warga desa.",
  searchLabel: "Cari program penghijauan",
  searchPlaceholder: "Cari program penghijauan",
  /** Wajib diisi KabarListHeader; pil tidak dirender karena program tidak berkategori. */
  kategoriLabel: "Kategori program penghijauan",
  listLabel: "Daftar program penghijauan",
  selengkapnya: "Selengkapnya",
  loading: "Memuat program penghijauan",
  paginationLabel: "Halaman daftar program penghijauan",
  empty: "Belum ada program penghijauan.",
  emptySearch: (query: string) => `Tidak ada program penghijauan yang cocok dengan “${query}”.`,
  error: "Program penghijauan gagal dimuat. Coba muat ulang halaman.",
} as const;

export const PENGHIJAUAN_DETAIL_TEXT = {
  kembali: "Program Penghijauan",
  kategori: "Program Penghijauan",
  loading: "Memuat program penghijauan",
  notFound: "Program penghijauan tidak ditemukan atau sudah tidak ditampilkan.",
  error: "Program penghijauan gagal dimuat. Coba muat ulang halaman.",
  backToList: "Lihat semua program penghijauan",
} as const;
