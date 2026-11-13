/** Konstanta halaman Tips Keamanan (`/keamanan/tips-keamanan`). */

export const TIPS_KEAMANAN_BASE_HREF = "/keamanan/tips-keamanan";

/** Tips per halaman. Tiap tips dibaca langsung (tanpa detail), jadi satu halaman memuat cukup banyak. */
export const TIPS_KEAMANAN_PAGE_LIMIT = 10;

/**
 * Kolom cari baru tampil bila tips lebih dari angka ini (ambang sama dengan Kontak Darurat): untuk daftar pendek cari
 * hanya menambah langkah. Bila URL sudah membawa `?search=`, kolom tetap tampil agar pencarian bisa dihapus.
 */
export const TIPS_KEAMANAN_SEARCH_THRESHOLD = 6;
