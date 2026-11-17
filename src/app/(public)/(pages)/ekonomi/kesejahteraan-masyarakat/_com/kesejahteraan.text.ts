/** Label UI halaman daftar & detail Kesejahteraan Masyarakat. */
export const KESEJAHTERAAN_TEXT = {
  title: "Kesejahteraan Masyarakat",
  lead: "Kabar program bantuan sosial dan kesejahteraan bagi warga Desa Darmasaba.",
  searchLabel: "Cari program kesejahteraan",
  searchPlaceholder: "Cari program",
  /** Wajib diisi KabarListHeader; pil tidak dirender karena entri tidak berkategori. */
  kategoriLabel: "Kategori program kesejahteraan",
  sorotan: "Terbaru",
  selengkapnya: "Baca selengkapnya",
  listLabel: "Program lainnya",
  searchListLabel: "Hasil pencarian",
  cardsLabel: "Daftar program kesejahteraan",
  loading: "Memuat program kesejahteraan",
  paginationLabel: "Halaman daftar program kesejahteraan",
  empty: "Kabar program kesejahteraan masyarakat akan tampil di sini.",
  emptySearch: (query: string) => `Tidak ada program kesejahteraan yang cocok dengan “${query}”.`,
  error: "Program kesejahteraan gagal dimuat. Coba muat ulang halaman.",
  terkaitTitle: "Program Pengentasan Kemiskinan",
  terkaitText: "Program penanggulangan kemiskinan Desa Darmasaba beserta capaiannya.",
  terkaitAksi: "Lihat program",
} as const;

export const KESEJAHTERAAN_DETAIL_TEXT = {
  kembali: "Kesejahteraan Masyarakat",
  kategori: "Kesejahteraan Masyarakat",
  loading: "Memuat program kesejahteraan",
  notFound: "Program kesejahteraan tidak ditemukan atau sudah tidak ditampilkan.",
  error: "Program kesejahteraan gagal dimuat. Coba muat ulang halaman.",
  backToList: "Lihat semua program kesejahteraan",
  fotoLabel: "Lihat foto ukuran penuh",
  galeri: "Galeri foto",
  galeriAlt: "Foto program kesejahteraan",
  bukaVideo: "Buka video di tab baru",
} as const;
