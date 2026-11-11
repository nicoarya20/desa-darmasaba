/** Label UI halaman detail layanan surat keterangan (`/pemerintahan/layanan/{id}`). */
export const LAYANAN_DETAIL_TEXT = {
  kategori: "Layanan Surat Keterangan",
  loading: "Memuat layanan",
  notFound: "Layanan tidak ditemukan atau sudah tidak ditampilkan.",
  backToList: "Lihat semua layanan",
  ajukan: "Ajukan Permohonan",
  alurAlt: (name: string) => `Alur pelayanan ${name}`,
  alurLabel: "Lihat gambar alur pelayanan ukuran penuh",
  closingTitle: "Sudah menyiapkan persyaratan?",
  closingText: "Ajukan permohonan secara online dengan mengisi formulir.",
} as const;
