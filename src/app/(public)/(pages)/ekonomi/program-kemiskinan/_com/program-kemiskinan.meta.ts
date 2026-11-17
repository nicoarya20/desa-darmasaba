/** Konstanta halaman Program Pengentasan Kemiskinan (`/ekonomi/program-kemiskinan`). */

export const PROGRAM_KEMISKINAN_BASE_HREF = "/ekonomi/program-kemiskinan";

/** Halaman saudara (tautan silang). */
export const PENDUDUK_MISKIN_HREF = "/ekonomi/jumlah-penduduk-miskin";
export const KESEJAHTERAAN_HREF = "/ekonomi/kesejahteraan-masyarakat";

/**
 * Batas program yang dimuat sekaligus (satu find-many), lalu disaring & dipaginasi di klien: tidak ada lagi dua
 * permintaan berbeda limit yang saling balap saat ganti halaman. Stg 2026-11-16: 3 program. Lebih → console.warn.
 */
export const PROGRAM_KEMISKINAN_FETCH_LIMIT = 100;

/** Baris per halaman (paginasi klien), sama dengan Data Lingkungan & Kolaborasi Inovasi. */
export const PROGRAM_KEMISKINAN_PAGE_SIZE = 10;
