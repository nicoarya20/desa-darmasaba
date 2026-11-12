/** Label UI halaman detail Kegiatan Desa. */
export const KEGIATAN_DETAIL_TEXT = {
  loading: "Memuat kegiatan",
  notFound: "Kegiatan tidak ditemukan atau sudah tidak ditampilkan.",
  error: "Kegiatan gagal dimuat. Coba muat ulang halaman.",
  backToList: "Lihat semua kegiatan",
  infoLabel: "Informasi kegiatan",
  partisipan: (n: number) => `${n.toLocaleString("id-ID")} partisipan`,
  fotoLabel: "Lihat foto ukuran penuh",
  pembangunan: "Progres Pembangunan",
} as const;
