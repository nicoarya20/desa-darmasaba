/** Kontak yang dimuat sekaligus (data ±4); semua tampil tanpa paginasi. */
export const KONTAK_LIST_LIMIT = 50;

/** Rute halaman daftar Kontak Darurat Kesehatan. */
export const KONTAK_LIST_HREF = '/kesehatan/kontak-darurat';

/** Rute detail satu kontak. */
export const kontakDetailHref = (id: string) => `${KONTAK_LIST_HREF}/${encodeURIComponent(id)}`;

/**
 * Nomor darurat nasional yang selalu tampil di atas daftar. Statis (bukan dari API) karena nomornya sama
 * di seluruh Indonesia dan tidak dikelola admin desa: 112 panggilan darurat terpadu, 119 PSC/ambulans Kemenkes.
 */
export const NATIONAL_EMERGENCY_NUMBERS = ['112', '119'] as const;

export type NationalEmergencyNumber = (typeof NATIONAL_EMERGENCY_NUMBERS)[number];
