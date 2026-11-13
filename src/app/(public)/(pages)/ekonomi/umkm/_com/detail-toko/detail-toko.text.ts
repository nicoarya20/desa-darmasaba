/** Teks UI halaman detail toko UMKM publik (tanpa em dash). */
export const DETAIL_TOKO_TEXT = {
  backToList: 'Katalog UMKM',
  memuat: 'Memuat toko',
  notFoundTitle: 'Toko tidak ditemukan',
  notFoundDesc: 'Toko ini sudah tidak ditampilkan atau alamatnya salah.',
  errorTitle: 'Toko gagal dimuat',
  errorDesc: 'Periksa koneksi internet lalu coba lagi.',
  retry: 'Coba lagi',
  pemilik: 'Pemilik',
  alamat: 'Alamat',
  jumlahProduk: (n: number) => `${n} produk`,
} as const;
