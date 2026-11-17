/** Konstanta halaman Program Inovasi (`/inovasi/program-inovasi`). */

export const PROGRAM_INOVASI_BASE_HREF = "/inovasi/program-inovasi";

/** Ubin per halaman daftar (3 baris × 3 kolom di desktop). */
export const PROGRAM_INOVASI_PAGE_SIZE = 9;

/**
 * Batas entri yang dimuat sekaligus (satu permintaan findMany), lalu dipaginasi di klien agar jumlah total (penentu
 * kolom cari) diketahui tanpa permintaan kedua. Lokal 2026-11-17: 8 program. Entri ke-101 dst. tidak tampil (console.warn).
 */
export const PROGRAM_INOVASI_FETCH_LIMIT = 100;

/** Panjang maksimal deskripsi meta (cuplikan teks polos) halaman detail untuk mesin pencari. */
export const PROGRAM_INOVASI_META_DESCRIPTION_MAX = 160;
