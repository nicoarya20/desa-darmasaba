/** Label UI halaman daftar kegiatan (bentuk sama untuk Kegiatan Desa & Gotong Royong). */
export type KegiatanText = {
  title: string;
  lead: string;
  searchLabel: string;
  searchPlaceholder: string;
  kategoriLabel: string;
  semua: string;
  listLabel: string;
  cardsLabel: string;
  loading: string;
  paginationLabel: string;
  empty: string;
  emptyKategori: (kategori: string) => string;
  emptySearch: (query: string) => string;
  error: string;
};

/** Label UI halaman daftar Kegiatan Desa. */
export const KEGIATAN_TEXT: KegiatanText = {
  title: "Kegiatan Desa Darmasaba",
  lead: "Temukan berbagai kegiatan dan program yang dilaksanakan Desa Darmasaba",
  searchLabel: "Cari kegiatan",
  searchPlaceholder: "Cari kegiatan",
  kategoriLabel: "Kategori kegiatan",
  semua: "Semua",
  listLabel: "Daftar kegiatan desa",
  cardsLabel: "Kegiatan lainnya",
  loading: "Memuat kegiatan desa",
  paginationLabel: "Halaman daftar kegiatan",
  empty: "Belum ada kegiatan desa.",
  emptyKategori: (kategori: string) => `Belum ada kegiatan di kategori ${kategori}.`,
  emptySearch: (query: string) => `Tidak ada kegiatan yang cocok dengan “${query}”.`,
  error: "Kegiatan desa gagal dimuat. Coba muat ulang halaman.",
};
