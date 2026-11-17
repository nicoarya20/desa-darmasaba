/** Label UI halaman Jumlah Penduduk Miskin. */
export const PENDUDUK_MISKIN_TEXT = {
  title: "Jumlah Penduduk Miskin",
  lead: "Jumlah penduduk miskin Desa Darmasaba yang tercatat setiap tahun.",
  /** Wajib diisi KabarListHeader; cari & pil tidak dirender (data per tahun). */
  searchLabel: "Cari tahun",
  kategoriLabel: "Kategori data penduduk miskin",
  orang: "orang",
  summaryLabel: (tahun: number) => `Penduduk miskin tahun ${tahun}`,
  naik: "Naik",
  turun: "Turun",
  tetap: "Sama dengan",
  dari: (tahun: number) => `dari ${tahun}`,
  tanpaPembanding: "Belum ada data tahun sebelumnya untuk dibandingkan.",
  updated: (tanggal: string) => `Data diperbarui ${tanggal}`,
  panelTitle: "Penduduk miskin per tahun",
  panelCaption: "Tahun terbaru di atas. Panjang batang dibandingkan dengan tahun terbanyak.",
  loading: "Memuat data penduduk miskin",
  empty: "Data jumlah penduduk miskin per tahun akan tampil di sini setelah diisi pemerintah desa.",
  error: "Data jumlah penduduk miskin gagal dimuat. Coba muat ulang halaman.",
  terkaitTitle: "Program Pengentasan Kemiskinan",
  terkaitText: "Program bantuan dan pemberdayaan desa untuk warga kurang mampu.",
  terkaitAksi: "Lihat program",
} as const;
