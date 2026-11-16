/** Label UI halaman Program Pengentasan Kemiskinan. */
export const PROGRAM_KEMISKINAN_TEXT = {
  title: "Program Pengentasan Kemiskinan",
  lead: "Berbagai program bantuan untuk mengurangi kemiskinan dan meningkatkan kesejahteraan masyarakat.",
  searchLabel: "Cari program",
  searchPlaceholder: "Cari program",
  /** Wajib diisi KabarListHeader; pil tidak dirender karena program tidak berkategori. */
  kategoriLabel: "Kategori program pengentasan kemiskinan",
  listLabel: "Daftar program pengentasan kemiskinan",
  loading: "Memuat program pengentasan kemiskinan",
  paginationLabel: "Halaman daftar program pengentasan kemiskinan",
  empty: "Program pengentasan kemiskinan akan tampil di sini setelah diisi pemerintah desa.",
  emptySearch: (query: string) => `Tidak ada program yang cocok dengan “${query}”.`,
  error: "Program pengentasan kemiskinan gagal dimuat. Coba muat ulang halaman.",
  terkaitListLabel: "Halaman terkait",
  pendudukMiskin: {
    title: "Jumlah Penduduk Miskin",
    text: "Jumlah penduduk miskin desa yang tercatat setiap tahun.",
    aksi: "Lihat data",
  },
  kesejahteraan: {
    title: "Kesejahteraan Masyarakat",
    text: "Program peningkatan kesejahteraan warga Desa Darmasaba.",
    aksi: "Lihat program",
  },
} as const;
