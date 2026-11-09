/** Label UI halaman detail Desa Anti Korupsi. */
export const AK_DETAIL_TEXT = {
  title: 'Desa Anti Korupsi',
  lead:
    'Desa antikorupsi mendorong pemerintahan jujur dan transparan. Keuangan desa dikelola terbuka dengan melibatkan warga untuk mengawasi anggaran sehingga tepat sasaran sesuai kebutuhan.',
  filterLabel: 'Pilih kategori indikator',
  summary: (available: number, total: number) => `${available} dari ${total} dokumen tersedia`,
  open: (type: string) => `Buka ${type}`,
  openLabel: (indikator: string, type: string) => `Buka ${type} ${indikator} (tab baru)`,
  pending: 'Dokumen belum tersedia',
  loading: 'Memuat indikator desa anti korupsi',
  empty: 'Belum ada indikator desa anti korupsi.',
  emptyKategori: 'Belum ada indikator untuk kategori ini.',
} as const;
