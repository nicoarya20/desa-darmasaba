import type { PhoneKind } from './kontak-darurat.logic';
import type { NationalEmergencyNumber } from './kontak-darurat.meta';

/** Teks UI halaman Kontak Darurat Kesehatan (daftar + detail). Tanpa em dash. */
export const KONTAK_TEXT = {
  title: 'Kontak Darurat Kesehatan',
  lead: 'Nomor layanan kesehatan untuk warga Desa Darmasaba. Tekan Telepon untuk langsung menghubungi.',
  listTitle: 'Layanan kesehatan terdekat',
  listLead: 'Kantor desa dan puskesmas yang melayani warga Desa Darmasaba.',
  listLabel: 'Daftar kontak darurat kesehatan',
  searchLabel: 'Cari kontak darurat',
  searchPlaceholder: 'Cari nama atau nomor',
  waNote: 'Tombol WhatsApp hanya tersedia untuk nomor seluler.',
  call: 'Telepon',
  callPanelLabel: 'Nomor kontak',
  whatsapp: 'WhatsApp',
  callLabel: (name: string) => `Telepon ${name}`,
  waLabel: (name: string) => `Kirim WhatsApp ke ${name} (tab baru)`,
  noNumber: 'Nomor belum diisi',
  detailLink: 'Info lengkap',
  detailLabel: (name: string) => `Info lengkap ${name}`,
  empty: 'Belum ada kontak darurat kesehatan.',
  noMatch: (q: string) => `Tidak ada kontak yang cocok dengan “${q}”.`,
  error: 'Kontak darurat gagal dimuat. Periksa koneksi internet lalu coba lagi.',
  retry: 'Coba lagi',
  loading: 'Memuat kontak darurat',
  photoAlt: (name: string) => `Foto ${name}`,
  notFound: 'Kontak tidak ditemukan. Mungkin sudah dihapus atau tautannya keliru.',
  backToList: 'Lihat semua kontak',
  detailError: 'Kontak gagal dimuat. Periksa koneksi internet lalu coba lagi.',
} as const;

/** Label jenis nomor di atas angka; nomor layanan pendek (112, 119) tanpa label. */
export const PHONE_KIND_LABEL: Record<PhoneKind, string | null> = {
  mobile: 'Seluler',
  landline: 'Telepon tetap',
  service: null,
};

/** Teks blok "Darurat nasional" (112 & 119) di atas daftar kontak desa. */
export const NATIONAL_TEXT = {
  title: 'Darurat nasional',
  lead: 'Gratis dan aktif 24 jam, berlaku di seluruh Indonesia.',
  listLabel: 'Nomor darurat nasional',
  items: {
    '112': {
      name: 'Panggilan darurat terpadu',
      description: 'Satu nomor untuk polisi, ambulans, dan pemadam kebakaran.',
    },
    '119': {
      name: 'Ambulans gawat darurat (PSC 119)',
      description: 'Layanan Public Safety Center Kemenkes untuk kegawatdaruratan medis.',
    },
  } satisfies Record<NationalEmergencyNumber, { name: string; description: string }>,
  callLabel: (number: string, name: string) => `Telepon ${number}, ${name}`,
} as const;
