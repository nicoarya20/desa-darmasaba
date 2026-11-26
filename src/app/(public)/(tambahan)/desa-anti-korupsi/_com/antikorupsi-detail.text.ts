/** Label UI halaman detail Desa Anti Korupsi. */
export const AK_DETAIL_TEXT = {
  title: 'Desa Antikorupsi',
  lead:
    'Desa antikorupsi mendorong pemerintahan jujur dan transparan. Keuangan desa dikelola terbuka dengan melibatkan warga untuk mengawasi anggaran sehingga tepat sasaran sesuai kebutuhan.',
  filterLabel: 'Pilih kategori indikator',
  summary: (available: number, total: number) => `${available} dari ${total} indikator sudah ada dokumennya`,
  openLabel: (indikator: string, ringkasan: string) => `Buka dokumen ${indikator} (${ringkasan})`,
  pending: 'Dokumen belum tersedia',
  loading: 'Memuat indikator desa antikorupsi',
  empty: 'Belum ada indikator desa antikorupsi.',
  emptyKategori: 'Belum ada indikator untuk kategori ini.',
} as const;
