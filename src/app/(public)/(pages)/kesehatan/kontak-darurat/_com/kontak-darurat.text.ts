import { KONTAK_CALL_TEXT, NATIONAL_BASE_TEXT } from '@/app/(public)/_com/kontak-darurat/kontak-darurat.text';
import type { NationalEmergencyNumber } from './kontak-darurat.meta';

/** Teks UI halaman Kontak Darurat Kesehatan (daftar + detail). Tanpa em dash. */
export const KONTAK_TEXT = {
  ...KONTAK_CALL_TEXT,
  title: 'Kontak Darurat Kesehatan',
  lead: 'Nomor layanan kesehatan untuk warga Desa Darmasaba. Tekan Telepon untuk langsung menghubungi.',
  listTitle: 'Layanan kesehatan terdekat',
  listLead: 'Kantor desa dan puskesmas yang melayani warga Desa Darmasaba.',
  listLabel: 'Daftar kontak darurat kesehatan',
  searchLabel: 'Cari kontak darurat',
  searchPlaceholder: 'Cari nama atau nomor',
  callPanelLabel: 'Nomor kontak',
  detailLink: 'Info lengkap',
  detailLabel: (name: string) => `Info lengkap ${name}`,
  empty: 'Belum ada kontak darurat kesehatan.',
  noMatch: (q: string) => `Tidak ada kontak yang cocok dengan “${q}”.`,
  error: 'Kontak darurat gagal dimuat. Periksa koneksi internet lalu coba lagi.',
  loading: 'Memuat kontak darurat',
  photoAlt: (name: string) => `Foto ${name}`,
  notFound: 'Kontak tidak ditemukan. Mungkin sudah dihapus atau tautannya keliru.',
  backToList: 'Lihat semua kontak',
  detailError: 'Kontak gagal dimuat. Periksa koneksi internet lalu coba lagi.',
} as const;

/** Teks blok "Darurat nasional" (112 & 119) di atas daftar kontak desa. */
export const NATIONAL_TEXT = {
  ...NATIONAL_BASE_TEXT,
  items: {
    '112': NATIONAL_BASE_TEXT.emergency112,
    '119': {
      name: 'Ambulans gawat darurat (PSC 119)',
      shortName: 'Ambulans',
      description: 'Layanan Public Safety Center Kemenkes untuk kegawatdaruratan medis.',
    },
  } satisfies Record<NationalEmergencyNumber, { name: string; shortName: string; description: string }>,
} as const;
