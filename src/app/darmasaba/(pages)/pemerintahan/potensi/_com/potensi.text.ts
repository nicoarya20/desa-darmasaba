/** Label UI halaman Potensi Desa (kartu + overlay detail). */
export const POTENSI_TEXT = {
  detail: "Lihat Detail",
  detailLabel: (name: string) => `Lihat detail ${name}`,
  close: "Tutup detail",
  emptyDescription: "Belum ada deskripsi untuk potensi desa ini.",
  info: { lokasi: "Lokasi", pengelola: "Pengelola", status: "Status" },
  emptyValue: "–",
  emptyValueLabel: "Belum ada data",
  dokumentasi: "Dokumentasi",
  dokumentasiAlt: (name: string, n: number) => `Dokumentasi ${name} ${n}`,
  gridLabel: "Daftar potensi desa",
  loading: "Memuat potensi desa",
} as const;
