/** Label UI halaman Kolaborasi Inovasi + bagian Mitra Kolaborasi. */
export const KOLABORASI_TEXT = {
  title: "Kolaborasi Inovasi",
  lead: "Program inovasi yang dijalankan Desa Darmasaba bersama kampus, lembaga, dan komunitas.",
  searchLabel: "Cari kolaborasi inovasi",
  searchPlaceholder: "Cari kolaborasi inovasi",
  kategoriLabel: "Tahun kolaborasi",
  allYears: "Semua",
  noYear: "Tanpa tahun",
  loading: "Memuat kolaborasi inovasi",
  paginationLabel: "Halaman daftar kolaborasi inovasi",
  partnersLabel: "Bersama",
  readMore: "Baca selengkapnya",
  readLess: "Tampilkan lebih sedikit",
  empty: "Belum ada kolaborasi inovasi.",
  emptyYear: (tahun: number) => `Belum ada kolaborasi inovasi pada tahun ${tahun}.`,
  emptySearch: (query: string) => `Tidak ada kolaborasi inovasi yang cocok dengan “${query}”.`,
  emptySearchYear: (query: string, tahun: number) =>
    `Tidak ada kolaborasi inovasi tahun ${tahun} yang cocok dengan “${query}”.`,
  error: "Kolaborasi inovasi gagal dimuat. Coba muat ulang halaman.",
  mitraTitle: "Mitra Kolaborasi",
  mitraLead: "Kami berkolaborasi dengan berbagai mitra dari berbagai sektor untuk mewujudkan visi Smart Village Darmasaba.",
  mitraLoading: "Memuat mitra kolaborasi",
} as const;
