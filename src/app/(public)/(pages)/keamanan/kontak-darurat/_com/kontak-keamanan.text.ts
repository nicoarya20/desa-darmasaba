import { KONTAK_CALL_TEXT } from '@/app/(public)/_com/kontak-darurat/kontak-darurat.text';

/** Teks UI halaman Kontak Darurat Keamanan. Tanpa em dash. */
export const KEAMANAN_TEXT = {
  ...KONTAK_CALL_TEXT,
  title: 'Kontak Darurat Keamanan',
  lead: 'Nomor polisi, pemadam kebakaran, dan tim penyelamat untuk warga Desa Darmasaba. Tekan Telepon untuk langsung menghubungi.',
  listTitle: 'Kontak keamanan wilayah',
  listLead: 'Kantor polisi, pemadam kebakaran, dan instansi lain yang melayani wilayah Desa Darmasaba.',
  searchLabel: 'Cari kontak darurat',
  searchPlaceholder: 'Cari nama atau nomor',
  groupLabel: (nama: string) => `Kontak ${nama}`,
  empty: 'Belum ada kontak darurat keamanan.',
  noMatch: (q: string) => `Tidak ada kontak yang cocok dengan “${q}”.`,
  error: 'Kontak darurat gagal dimuat. Periksa koneksi internet lalu coba lagi.',
  loading: 'Memuat kontak darurat',
} as const;
