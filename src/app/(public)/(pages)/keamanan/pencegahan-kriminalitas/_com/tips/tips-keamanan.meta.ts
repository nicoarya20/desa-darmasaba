/** Konstanta bagian Tips Keamanan di halaman Pencegahan Kriminalitas (`/keamanan/pencegahan-kriminalitas`). */

/**
 * id bagian tips: tujuan alamat lama `/keamanan/tips-keamanan` (redirect ke `…#tips-keamanan`) dan hasil pencarian.
 * Jangan diganti: tautan lama yang sudah tersebar memakai anchor ini.
 */
export const TIPS_SECTION_ID = "tips-keamanan";

/**
 * Tips yang dimuat sekaligus dan ditampilkan semua (tanpa paginasi): halaman ini sudah punya `?page=` untuk program,
 * jadi paginasi kedua akan bentrok. Data prod 2026-11-24: 2 tips. Tips ke-51 dst. tidak tampil (ada console.warn);
 * bila tips bertambah sebanyak itu, pertimbangkan "Tampilkan semua" atau parameter halaman sendiri.
 */
export const TIPS_FETCH_LIMIT = 50;
