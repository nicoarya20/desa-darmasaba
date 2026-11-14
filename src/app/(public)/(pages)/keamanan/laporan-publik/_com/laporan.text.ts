/** Teks UI halaman Laporan Publik (daftar + formulir). */
export const LAPORAN_TEXT = {
  title: "Laporan Keamanan Lingkungan",
  lead: "Laporan warga tentang keamanan dan ketertiban lingkungan desa, beserta perkembangan penanganannya.",
  searchLabel: "Cari laporan publik",
  searchPlaceholder: "Cari judul atau lokasi",
  kategoriLabel: "Kategori laporan",
  listTitle: "Laporan terbaru",
  listLabel: "Daftar laporan publik",
  loading: "Memuat laporan publik",
  paginationLabel: "Halaman daftar laporan publik",
  addButton: "Tambah Laporan",
  empty: "Belum ada laporan publik.",
  emptySearch: (q: string) => `Tidak ada laporan yang cocok dengan “${q}”.`,
  error: "Laporan publik gagal dimuat. Coba muat ulang halaman.",
  noLokasi: "Lokasi belum diisi",
} as const;

/** Teks formulir Tambah Laporan. */
export const LAPORAN_FORM_TEXT = {
  title: "Tambah Laporan Publik",
  note: "Laporan tampil untuk umum di halaman ini setelah diverifikasi admin desa. Jangan cantumkan data pribadi seperti NIK atau nomor telepon.",
  judul: "Judul laporan",
  judulPlaceholder: "Contoh: Lampu jalan padam di Banjar Teba",
  lokasi: "Lokasi kejadian",
  lokasiPlaceholder: "Nama jalan, banjar, atau patokan",
  tanggal: "Tanggal dan waktu kejadian",
  tanggalPlaceholder: "Pilih tanggal dan waktu",
  kronologi: "Kronologi",
  kronologiHint: "Ceritakan urutan kejadian secara singkat.",
  submit: "Kirim Laporan",
  cancel: "Batal",
  errJudul: "Judul minimal 3 karakter.",
  errLokasi: "Lokasi minimal 3 karakter.",
  errTanggal: "Tanggal dan waktu kejadian wajib diisi.",
  errTanggalMasaDepan: "Waktu kejadian tidak boleh melewati waktu sekarang.",
} as const;
