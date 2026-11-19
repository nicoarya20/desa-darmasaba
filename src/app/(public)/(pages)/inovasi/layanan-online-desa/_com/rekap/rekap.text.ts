/** Label UI "Rekap Tindak Lanjut Pengaduan" di hub Layanan Online Desa. */
export const PENGADUAN_REKAP_TEXT = {
  title: "Rekap Tindak Lanjut Pengaduan",
  lead: "Ringkasan pengaduan yang masuk dan tanggapan pemerintah desa. Identitas pelapor tidak ditampilkan.",
  statsLabel: "Jumlah pengaduan menurut status",
  total: (jumlah: number) => `Total ${jumlah} pengaduan`,
  listTitle: "Tanggapan terbaru",
  listLabel: "Daftar tanggapan terbaru atas pengaduan",
  loading: "Memuat rekap tindak lanjut pengaduan",
  empty: "Belum ada pengaduan yang tercatat.",
  noTanggapan: "Belum ada tanggapan yang dipublikasikan.",
  error: "Rekap tindak lanjut pengaduan belum dapat dimuat. Coba muat ulang halaman beberapa saat lagi.",
} as const;
