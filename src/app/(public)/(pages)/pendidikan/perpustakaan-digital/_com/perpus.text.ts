/** Teks halaman penghubung Perpustakaan Digital (`/pendidikan/perpustakaan-digital`). */
export const PERPUS_TEXT = {
  title: 'Perpustakaan Digital',
  lead: 'Koleksi buku digital Desa Darmasaba dikelola di website perpustakaan desa. Baca ebook kapan saja dan di mana saja.',
  eyebrow: 'Website perpustakaan desa',
  cta: 'Kunjungi Website Perpustakaan',
  /** Keterangan di bawah tombol; juga dibacakan pembaca layar lewat aria-describedby. */
  opensNewTab: (host: string) => `Membuka ${host} di tab baru.`,
  loading: 'Memuat informasi perpustakaan',
  error: 'Informasi perpustakaan gagal dimuat. Coba muat ulang halaman.',
  empty: 'Tautan website perpustakaan belum tersedia.',
} as const;
