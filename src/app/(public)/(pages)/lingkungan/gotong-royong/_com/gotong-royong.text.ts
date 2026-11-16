import type { KegiatanText } from "@/app/(public)/(pages)/pemerintahan/kegiatan-desa/_com/kegiatan.text";

/** Label UI halaman daftar Gotong Royong (kegiatan desa berkategori Gotong Royong). */
export const GOTONG_ROYONG_TEXT: KegiatanText = {
  title: "Gotong Royong Desa Darmasaba",
  lead: "Kegiatan gotong royong warga Desa Darmasaba untuk menjaga lingkungan dan kebersamaan",
  searchLabel: "Cari gotong royong",
  searchPlaceholder: "Cari gotong royong",
  kategoriLabel: "Kategori kegiatan",
  semua: "Semua",
  listLabel: "Daftar kegiatan gotong royong",
  cardsLabel: "Gotong royong lainnya",
  loading: "Memuat kegiatan gotong royong",
  paginationLabel: "Halaman daftar gotong royong",
  empty: "Belum ada kegiatan gotong royong.",
  emptyKategori: () => "Belum ada kegiatan gotong royong.",
  emptySearch: (query: string) => `Tidak ada gotong royong yang cocok dengan “${query}”.`,
  error: "Kegiatan gotong royong gagal dimuat. Coba muat ulang halaman.",
};
