/** Label UI section beranda & halaman Prestasi dan Penghargaan Desa. */
export const PRESTASI_TEXT = {
  title: "Prestasi dan Penghargaan Desa",
  subtitle:
    "Kami bangga dengan pencapaian desa hingga saat ini. Semoga prestasi ini menjadi inspirasi untuk terus berkarya dan berinovasi demi kemajuan bersama.",
  cta: "Selengkapnya",
  gridLabel: "Prestasi dan penghargaan terbaru",
  loading: "Memuat prestasi dan penghargaan",
  playVideo: "Putar video",
  pauseVideo: "Jeda video",
  searchLabel: "Cari prestasi atau penghargaan",
  searchPlaceholder: "Cari prestasi atau penghargaan…",
  empty: "Belum ada prestasi atau penghargaan yang ditampilkan.",
  notFound: (q: string) => `Tidak ada prestasi atau penghargaan yang cocok dengan “${q}”.`,
  error: "Prestasi dan penghargaan gagal dimuat. Coba muat ulang halaman.",
} as const;
