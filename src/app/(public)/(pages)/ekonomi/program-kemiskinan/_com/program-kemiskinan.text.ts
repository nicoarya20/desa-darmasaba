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
  kolomNo: 'No',
  kolomNama: 'Nama',
  kolomAlamat: 'Alamat',
  jumlahPenerima: (tahun: number, n: number) => `${n.toLocaleString('id-ID')} penerima pada tahun ${tahun}`,
  orang: (n: number) => `${n.toLocaleString('id-ID')} penerima`,
} as const;

/** Teks kartu program di halaman daftar Program Kemiskinan. */
export const PROGRAM_KARTU_TEXT = { lihatPenerima: 'Lihat penerima bantuan →' } as const;
