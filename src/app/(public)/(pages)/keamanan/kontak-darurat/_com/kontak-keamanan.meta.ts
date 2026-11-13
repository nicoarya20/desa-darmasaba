import type { NationalEmergencyEntry } from '@/app/(public)/_com/kontak-darurat/kontak-darurat.meta';
import { NATIONAL_BASE_TEXT } from '@/app/(public)/_com/kontak-darurat/kontak-darurat.text';
import { IconFiretruck, IconLifebuoy, IconShield, IconSos } from '@tabler/icons-react';

/** Kategori yang dimuat sekaligus (data 3-4); semua tampil tanpa paginasi. */
export const KATEGORI_LIST_LIMIT = 50;

/**
 * Nomor darurat nasional yang selalu tampil di atas daftar. Statis (bukan dari API) karena nomornya sama di
 * seluruh Indonesia, gratis, aktif 24 jam, dan tidak dikelola admin desa.
 */
export const KEAMANAN_NATIONAL_ENTRIES: readonly NationalEmergencyEntry[] = [
  { number: '112', ...NATIONAL_BASE_TEXT.emergency112, icon: IconSos },
  {
    number: '110',
    name: 'Polisi',
    shortName: 'Polisi',
    description: 'Kejahatan, kecelakaan lalu lintas, dan gangguan keamanan.',
    icon: IconShield,
  },
  {
    number: '113',
    name: 'Pemadam kebakaran',
    shortName: 'Damkar',
    description: 'Kebakaran rumah, bangunan, atau lahan.',
    icon: IconFiretruck,
  },
  {
    number: '115',
    name: 'Basarnas (pencarian dan pertolongan)',
    shortName: 'Basarnas (SAR)',
    description: 'Korban bencana, orang hilang, dan kecelakaan di air atau gunung.',
    icon: IconLifebuoy,
  },
];
