/** Teks UI bagian Ulasan di detail produk UMKM. */
export const ULASAN_TEXT = {
  judul: 'Ulasan',
  nilaiKosong: 'Belum ada nilai',
  nilai: (angka: string) => `Nilai ${angka} dari 5`,
  jumlah: (n: number) => `(${n} Ulasan)`,
  kosong: 'Belum ada ulasan untuk produk ini.',
  tulis: 'Tulis ulasan',
  tulisTertutup: 'Penulisan ulasan belum dibuka.',
  sebaran: 'Sebaran nilai ulasan',
  bintang: 'bintang',
  ulasan: 'ulasan',
} as const;
