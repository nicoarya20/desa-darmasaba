/** Konstanta halaman Program Kreatif Desa (`/inovasi/program-kreatif-desa`). */

export const PROGRAM_KREATIF_BASE_HREF = "/inovasi/program-kreatif-desa";

/** Ubin per halaman daftar (3 baris × 3 kolom di desktop). */
export const PROGRAM_KREATIF_PAGE_SIZE = 9;

/**
 * Batas entri yang dimuat sekaligus (satu permintaan find-many), lalu dipaginasi di klien agar jumlah total (penentu
 * kolom cari) diketahui tanpa permintaan kedua. Stg 2026-11-16: 6 entri. Entri ke-101 dst. tidak tampil (ada console.warn).
 */
export const PROGRAM_KREATIF_FETCH_LIMIT = 100;

/**
 * Kolom cari baru tampil bila program lebih dari angka ini (ambang sama dengan Tips Keamanan): untuk daftar pendek cari
 * hanya menambah langkah. Bila URL sudah membawa `?search=`, kolom tetap tampil agar pencarian bisa dihapus.
 */
export const PROGRAM_KREATIF_SEARCH_THRESHOLD = 6;
