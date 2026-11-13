import type { PhoneKind } from './kontak-phone.logic';

/** Teks tombol & nomor kontak darurat yang sama di semua halaman (Kesehatan, Keamanan). Tanpa em dash. */
export const KONTAK_CALL_TEXT = {
  call: 'Telepon',
  whatsapp: 'WhatsApp',
  callLabel: (name: string) => `Telepon ${name}`,
  waLabel: (name: string) => `Kirim WhatsApp ke ${name} (tab baru)`,
  noNumber: 'Nomor belum diisi',
  waNote: 'Tombol WhatsApp hanya tersedia untuk nomor seluler.',
  retry: 'Coba lagi',
} as const;

/** Label jenis nomor di atas angka; nomor layanan pendek (112, 110) tanpa label. */
export const PHONE_KIND_LABEL: Record<PhoneKind, string | null> = {
  mobile: 'Seluler',
  landline: 'Telepon tetap',
  service: null,
};

/** Teks bawaan blok "Darurat nasional"; isi tiap nomor (nama, keterangan) diberikan halaman pemakai. */
export const NATIONAL_BASE_TEXT = {
  title: 'Darurat nasional',
  lead: 'Gratis dan aktif 24 jam, berlaku di seluruh Indonesia.',
  listLabel: 'Nomor darurat nasional',
  callLabel: (number: string, name: string) => `Telepon ${number}, ${name}`,
  /** 112 tampil di setiap halaman kontak darurat dengan teks yang sama. */
  emergency112: {
    name: 'Panggilan darurat terpadu',
    shortName: 'Darurat terpadu',
    description: 'Satu nomor untuk polisi, ambulans, dan pemadam kebakaran.',
  },
} as const;
