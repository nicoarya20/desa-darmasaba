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

/** Teks halaman detail Program Kemiskinan publik. */
export const PROGRAM_DETAIL_TEXT = {
  kembali: 'Program Pengentasan Kemiskinan',
  memuat: 'Memuat program',
  notFoundTitle: 'Program tidak ditemukan',
  notFoundDesc: 'Program mungkin sudah tidak ditayangkan.',
  errorTitle: 'Gagal memuat data',
  errorDesc: 'Periksa koneksi lalu coba lagi.',
  cobaLagi: 'Coba lagi',
  penerimaJudul: 'Penerima Bantuan',
  pilihTahun: 'Pilih tahun',
  kosongJudul: 'Belum ada data penerima',
  kosongDesc: 'Daftar penerima program ini belum diunggah oleh pemerintah desa.',
  privasi: 'Untuk transparansi penyaluran bantuan, website hanya menampilkan nama dan alamat penerima.',
  rekapJudul: 'Rekap per alamat / banjar',
  lainnya: 'Lainnya',
  daftarJudul: 'Daftar penerima',
  cariLabel: 'Cari nama atau alamat',
  daftarKosong: 'Tidak ada penerima yang cocok',
  daftarPaginationLabel: 'Halaman daftar penerima',
  kolomNo: 'No',
  kolomNama: 'Nama',
  kolomAlamat: 'Alamat',
  jumlahPenerima: (tahun: number, n: number) => `${n.toLocaleString('id-ID')} penerima pada tahun ${tahun}`,
  orang: (n: number) => `${n.toLocaleString('id-ID')} penerima`,
} as const;

/** Teks aksi baris program di halaman daftar (chevron digambar ikon, bukan karakter panah). */
export const PROGRAM_KARTU_TEXT = { lihatPenerima: 'Lihat penerima bantuan' } as const;
