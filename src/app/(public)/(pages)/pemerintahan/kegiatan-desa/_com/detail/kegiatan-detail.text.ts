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
  dokumentasi: "Dokumentasi Pembangunan",
  labelFoto: { sebelum: "Sebelum", sesudah: "Sesudah" },
  altFoto: {
    sebelum: (judul: string) => `Foto sebelum pembangunan ${judul}`,
    sesudah: (judul: string) => `Foto sesudah pembangunan ${judul}`,
  },
} as const;
