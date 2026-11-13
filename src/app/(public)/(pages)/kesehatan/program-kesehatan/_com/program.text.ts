/** Label UI halaman daftar & detail Program Kesehatan. */
export const PROGRAM_TEXT = {
  title: "Program Kesehatan Desa",
  lead: "Temukan berbagai program kesehatan untuk mendukung kualitas hidup masyarakat Darmasaba.",
  searchLabel: "Cari program kesehatan",
  searchPlaceholder: "Cari program kesehatan",
  /** Wajib diisi KabarListHeader; pil tidak dirender karena program kesehatan tidak berkategori. */
  kategoriLabel: "Kategori program kesehatan",
  listLabel: "Program dan kegiatan",
  cardsLabel: "Program kesehatan lainnya",
  loading: "Memuat program kesehatan",
  paginationLabel: "Halaman daftar program kesehatan",
  empty: "Belum ada program kesehatan.",
  emptySearch: (query: string) => `Tidak ada program atau kegiatan yang cocok dengan “${query}”.`,
  error: "Program kesehatan gagal dimuat. Coba muat ulang halaman.",
} as const;

/** Bagian "Manfaat Program Kesehatan" (isi sama dengan halaman lama, dipertahankan atas permintaan user). */
export const MANFAAT_TEXT = {
  title: "Manfaat Program Kesehatan",
  lead: "Program kesehatan Desa Darmasaba berperan penting dalam meningkatkan kesejahteraan dan kualitas hidup warganya.",
  items: [
    {
      key: "bugar",
      title: "Menjaga Tubuh Bugar",
      desc: "Meningkatkan kesehatan fisik masyarakat melalui olahraga rutin, pemeriksaan berkala, dan edukasi gaya hidup sehat.",
    },
    {
      key: "kebersamaan",
      title: "Menguatkan Kebersamaan",
      desc: "Menciptakan interaksi sosial sehat, mempererat solidaritas, dan memperkuat budaya gotong royong antar warga.",
    },
    {
      key: "lansia",
      title: "Dukungan untuk Lansia",
      desc: "Membantu lansia tetap aktif, sehat, dan bahagia melalui kegiatan komunitas yang aman dan menyenangkan.",
    },
  ],
} as const;

export const PROGRAM_DETAIL_TEXT = {
  loading: "Memuat program kesehatan",
  notFound: "Program kesehatan tidak ditemukan atau sudah tidak ditampilkan.",
  error: "Program kesehatan gagal dimuat. Coba muat ulang halaman.",
  backToList: "Lihat semua program kesehatan",
  indikator: "Indikator kesehatan",
  diperbarui: (tanggal: string) => `Data diperbarui ${tanggal}`,
  fotoLabel: "Lihat foto ukuran penuh",
} as const;
