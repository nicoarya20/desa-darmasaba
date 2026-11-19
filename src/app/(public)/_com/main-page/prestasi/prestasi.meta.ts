/** Konstanta section & halaman Prestasi dan Penghargaan Desa: batas kartu, rute, video hero. */
export const PRESTASI_BERANDA_LIMIT = 4;

/** Kartu per halaman di halaman gabungan (genap → grid 2 kolom penuh). */
export const PRESTASI_PAGE_SIZE = 8;

/** Halaman gabungan; juga basis rute detail prestasi (`/prestasi-desa/{id}`). */
export const PRESTASI_LIST_HREF = "/prestasi-desa";

/** Nama kategori prestasi yang menampung entri eks-Penghargaan (sama dengan migrasi & seed). */
export const PENGHARGAAN_KATEGORI_NAME = "Penghargaan";

/**
 * Video latar hero (sama dengan section Penghargaan lama) + poster saat video belum/tidak diputar.
 * Poster = WebP dari mangupuraaward.jpeg pada resolusi asli 1024px (182 KB → 72 KB): browser memintanya sebelum
 * hydrate, dan hero selebar layar butuh seluruh resolusinya, jadi hanya formatnya yang diganti.
 */
export const PRESTASI_HERO_VIDEO = {
  src: "/assets/videos/award.mp4",
  poster: "/assets/images/prestasi-hero-poster-1024.webp",
} as const;
