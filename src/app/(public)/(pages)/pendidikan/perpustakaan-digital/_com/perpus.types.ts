/** Kategori buku yang ditampilkan publik; `slug` = segmen URL (`/pendidikan/perpustakaan-digital/{slug}`). */
export type BukuKategori = { id: string; nama: string; slug: string };

/** Satu buku di katalog/detail publik, sudah dibersihkan dari bentuk API. */
export type Buku = {
  id: string;
  judul: string;
  /** Deskripsi HTML editor admin yang sudah disanitasi; "" bila kosong. */
  deskripsiHtml: string;
  /** Deskripsi sebagai teks polos (pencarian, cuplikan). */
  ringkasan: string;
  kategori: BukuKategori | null;
  /** URL sampul; null → ikon pengganti. */
  sampul: string | null;
  /** Waktu dibuat (ms) untuk urutan Terbaru; 0 bila tak terbaca. */
  dibuat: number;
};

/** Status muat detail buku. */
export type BukuDetailState =
  | { status: 'loading' }
  | { status: 'ready'; data: Buku }
  | { status: 'notFound' }
  | { status: 'error' };
