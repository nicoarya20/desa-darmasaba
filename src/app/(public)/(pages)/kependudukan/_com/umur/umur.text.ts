/** Teks section Kelompok Umur di Dashboard Kependudukan (`#umur`). */
export const UMUR_TEXT = {
  title: "Kelompok Umur",
  caption: "Jumlah penduduk menurut kelompok umur, diurutkan dari yang termuda.",
  meta: (tahun: number, tanggal: string | null) => (tanggal ? `Data ${tahun} · Diperbarui ${tanggal}` : `Data ${tahun}`),
  totalLabel: "Total tercatat",
  unit: "jiwa",
  notFilled: "Belum diisi",
  notFilledNote: (n: number) => `${n} kelompok belum diisi jumlahnya, jadi tidak ikut dihitung dalam total dan persen.`,
  overlapNote: (a: string, b: string) =>
    `Kelompok ${a} dan ${b} tumpang tindih, jadi total dan persen tidak ditampilkan agar tidak ada penduduk yang terhitung dua kali.`,
  unreadNote: (label: string) => `Rentang umur "${label}" tidak terbaca, jadi total dan persen tidak ditampilkan.`,
  sourceNote: "Total ini dihitung dari isian kelompok umur, sehingga bisa berbeda dengan jumlah penduduk per banjar.",
  turunanLabel: "Angka turunan kelompok umur",
  produktifLabel: "Usia produktif (15–64 tahun)",
  produktifHint: (persen: string) => `${persen} dari penduduk yang tercatat menurut umur.`,
  rasioLabel: "Rasio ketergantungan",
  rasioHint: (n: number) => `Sekitar ${n} penduduk usia anak (0–14) dan lansia (65 ke atas) untuk setiap 100 penduduk usia produktif.`,
  emptyBody: "Data kelompok umur belum diisi. Jumlah penduduk menurut kelompok umur akan tampil di sini setelah diisi oleh pemerintah desa.",
  failed: "Data kelompok umur gagal dimuat. Periksa koneksi lalu coba lagi.",
  loading: "Memuat data kelompok umur",
} as const;
