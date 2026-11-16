/** Label UI halaman Gotong Royong (daftar + tautan kembali detail). */
export const GOTONG_ROYONG_TEXT = {
  title: "Gotong Royong",
  lead: "Kegiatan bersama warga menjaga lingkungan dan kebersihan Desa Darmasaba",
  searchLabel: "Cari kegiatan gotong royong",
  searchPlaceholder: "Cari kegiatan",
  kategoriLabel: "Kategori kegiatan",
  listLabel: "Daftar kegiatan gotong royong",
  cardsLabel: "Kegiatan gotong royong lainnya",
  loading: "Memuat kegiatan gotong royong",
  paginationLabel: "Halaman daftar gotong royong",
  empty: "Belum ada kegiatan gotong royong.",
  emptySearch: (query: string) => `Tidak ada kegiatan gotong royong yang cocok dengan “${query}”.`,
  error: "Kegiatan gotong royong gagal dimuat. Coba muat ulang halaman.",
  /** Teks tautan kembali di halaman detail ("‹ Gotong Royong"). */
  backToList: "Gotong Royong",
} as const;
