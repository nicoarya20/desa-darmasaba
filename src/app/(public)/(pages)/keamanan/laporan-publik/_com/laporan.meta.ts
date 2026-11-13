/** Konstanta halaman Laporan Publik (menu Keamanan). */

/** Rute daftar laporan publik. */
export const LAPORAN_LIST_HREF = "/keamanan/laporan-publik";

/** Laporan per halaman daftar (sama dengan limit bawaan state admin yang memuat ulang daftar setelah kirim). */
export const LAPORAN_PAGE_LIMIT = 10;

/** Panjang minimal judul & lokasi — sama dengan skema zod `templateForm` di state admin laporan-publik. */
export const LAPORAN_MIN_TEXT = 3;
