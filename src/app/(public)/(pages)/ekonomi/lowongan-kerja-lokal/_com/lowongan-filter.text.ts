import type { LowonganUrut, TayangHari } from './lowongan-filter.meta';

/** Teks UI kerangka halaman daftar lowongan: kepala, panel Filter, baris alat, keadaan kosong/galat. */
export const LOWONGAN_FILTER_TEXT = {
  title: 'Lowongan Kerja Lokal',
  lead: 'Lowongan dari usaha dan lembaga di sekitar Desa Darmasaba. Hubungi pemberi kerja langsung dari halaman detail.',
  searchLabel: 'Cari lowongan',
  searchPlaceholder: 'Cari posisi atau pemberi kerja',
  /** Wajib diisi KabarListHeader; pil kategori tidak dirender (`tabs=[]`). */
  kategoriLabel: 'Kategori lowongan',
  listTitle: 'Daftar lowongan',
  filter: 'Filter',
  filterAktif: (n: number) => `${n} filter aktif`,
  pilihanAnda: 'Pilihan Anda',
  belumAdaFilter: 'Belum ada filter dipilih.',
  aturFilter: 'Atur filter',
  group: {
    tipe: 'Tipe pekerjaan',
    gaji: 'Gaji per bulan',
    pemberi: 'Pemberi kerja',
    tayang: 'Waktu tayang',
  },
  /** `juta` sudah berformat Indonesia, mis. "1,5". */
  gajiMin: (juta: string) => `Minimal Rp${juta} juta`,
  tayang: {
    7: '7 hari terakhir',
    30: '30 hari terakhir',
    90: '3 bulan terakhir',
  } satisfies Record<TayangHari, string>,
  lihatSemua: (n: number) => `Lihat semua (${n})`,
  lebihSedikit: 'Lebih sedikit',
  hapusChip: (label: string) => `Hapus filter ${label}`,
  hapusSemua: 'Hapus semua',
  urutkan: 'Urutkan',
  urut: {
    terbaru: 'Terbaru',
    'gaji-desc': 'Gaji tertinggi',
    'gaji-asc': 'Gaji terendah',
  } satisfies Record<LowonganUrut, string>,
  noun: 'lowongan',
  dari: (total: number) => `dari ${total}`,
  tutup: 'Tutup filter',
  tampilkan: (n: number) => `Tampilkan ${n} lowongan`,
  memuatFilter: 'Memuat filter',
  emptyFiltered: 'Tidak ada lowongan yang cocok',
  emptyFilteredDesc: 'Coba kata kunci lain atau kurangi filter.',
  emptyFilteredAction: 'Hapus filter dan kata kunci',
  emptyData: 'Belum ada lowongan',
  emptyDataDesc: 'Lowongan dari usaha dan lembaga di sekitar desa akan tampil di sini setelah ditambahkan.',
  errorTitle: 'Lowongan belum bisa dimuat',
  errorDesc: 'Periksa koneksi internet lalu coba lagi.',
  retry: 'Coba lagi',
} as const;
