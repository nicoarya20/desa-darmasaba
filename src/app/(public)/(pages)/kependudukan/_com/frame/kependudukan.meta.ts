import type { DatasetKey } from '../data/kependudukan-data.types';

/** Rute satu-satunya Dashboard Kependudukan (navbar 8.1). */
export const KEPENDUDUKAN_HREF = '/kependudukan/dashboard';

/** Anchor kartu ringkasan (hero) di atas section data. */
export const RINGKASAN_ANCHOR = 'ringkasan';

/** Anchor section per dataset; harus sama dengan `id` section milik sesi masing-masing (dijaga test). */
export const SECTION_ANCHOR: Readonly<Record<DatasetKey, string>> = {
  banjar: 'banjar',
  umur: 'umur',
  agama: 'agama',
  dinamika: 'dinamika',
};

/** `/kependudukan/dashboard#<anchor>`: tujuan redirect rute lama dan tautan Jenna. */
export function kependudukanSectionHref(key: DatasetKey): string {
  return `${KEPENDUDUKAN_HREF}#${SECTION_ANCHOR[key]}`;
}
