/** Konstanta halaman Demografi Pekerjaan (`/ekonomi/demografi-pekerjaan`). */

/**
 * Semua pekerjaan dimuat sekaligus karena total, persen, dan legenda butuh seluruh baris. API find-many berpaginasi
 * (bawaan 10, stg 2026-11-16 sudah 10 baris), jadi limit diminta eksplisit. Baris ke-101 dst. tidak tampil (console.warn).
 */
export const DEMOGRAFI_PEKERJAAN_LIMIT = 100;
