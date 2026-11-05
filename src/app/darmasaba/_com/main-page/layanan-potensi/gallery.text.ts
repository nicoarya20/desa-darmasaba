/** Label UI galeri Layanan & Potensi Desa di beranda. */
export const GALLERY_TEXT = {
  title: "Layanan dan Potensi Desa",
  rowLayanan: "Layanan",
  rowPotensi: "Potensi Desa",
  ctaLayanan: "Lihat layanan",
  ctaPotensi: "Lihat",
  empty: "Belum ada layanan dan potensi untuk ditampilkan.",
  pause: "Jeda putar otomatis",
  play: "Lanjutkan putar otomatis",
  dots: "Pilih layanan",
  dot: (n: number, total: number) => `Layanan ${n} dari ${total}`,
} as const;
