/** Label UI halaman daftar & detail Pencegahan Kriminalitas (termasuk bagian tips sejak menu Tips Keamanan dilebur). */
export const PENCEGAHAN_TEXT = {
  title: "Pencegahan Kriminalitas",
  lead: "Program keamanan komunitas dan tips praktis untuk mencegah kriminalitas di Desa Darmasaba.",
  searchLabel: "Cari program atau tips pencegahan kriminalitas",
  searchPlaceholder: "Cari program atau tips",
  /** Wajib diisi KabarListHeader; pil tidak dirender karena program tidak berkategori. */
  kategoriLabel: "Kategori program pencegahan kriminalitas",
  sorotan: "Sorotan",
  selengkapnya: "Baca selengkapnya",
  listLabel: "Program lainnya",
  searchListLabel: "Hasil pencarian",
  cardsLabel: "Daftar program pencegahan kriminalitas",
  loading: "Memuat program pencegahan kriminalitas",
  paginationLabel: "Halaman daftar program pencegahan kriminalitas",
  empty: "Belum ada program pencegahan kriminalitas.",
  emptySearch: (query: string) => `Tidak ada program yang cocok dengan “${query}”.`,
  /** Kata kunci tidak cocok dengan program maupun tips: satu pesan, bukan dua kotak kosong. */
  emptySearchAll: (query: string) => `Tidak ada program atau tips yang cocok dengan “${query}”.`,
  error: "Program pencegahan kriminalitas gagal dimuat. Coba muat ulang halaman.",
  adaVideo: "berisi video",
  putar: (judul: string) => `Putar video: ${judul}`,
  videoTidakTersedia: "Video tidak tersedia",
} as const;

export const PENCEGAHAN_DETAIL_TEXT = {
  /** Nama daftar di tautan kembali "‹ …" (sama dengan judul menu). */
  backLink: "Pencegahan Kriminalitas",
  kategori: "Pencegahan Kriminalitas",
  loading: "Memuat program pencegahan kriminalitas",
  notFound: "Program pencegahan kriminalitas tidak ditemukan atau sudah tidak ditampilkan.",
  error: "Program pencegahan kriminalitas gagal dimuat. Coba muat ulang halaman.",
  backToList: "Lihat semua program pencegahan kriminalitas",
  bukaVideo: "Buka video di tab baru",
} as const;
