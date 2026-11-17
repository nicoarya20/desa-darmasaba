/** Teks UI section Agama di Dashboard Kependudukan. */
export const AGAMA_TEXT = {
  title: 'Agama',
  caption: 'Penduduk menurut agama yang dianut',
  totalLabel: 'Total tercatat',
  unit: 'jiwa',
  loading: 'Memuat data agama penduduk',
  error: 'Data agama penduduk gagal dimuat. Periksa koneksi internet Anda.',
  empty: 'Data agama penduduk belum diisi oleh pemerintah desa.',
  sourceNote: 'Total ini dihitung dari isian agama, sehingga bisa berbeda dengan jumlah penduduk per banjar.',
  meta: (tahun: number, diperbarui: string | null) =>
    diperbarui ? `Data ${tahun} · Diperbarui ${diperbarui}` : `Data ${tahun}`,
} as const;
