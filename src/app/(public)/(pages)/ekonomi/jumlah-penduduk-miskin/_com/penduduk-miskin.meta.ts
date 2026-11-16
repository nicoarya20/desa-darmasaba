/** Konstanta halaman Jumlah Penduduk Miskin (`/ekonomi/jumlah-penduduk-miskin`). */

/**
 * Batas baris (tahun) yang dimuat sekaligus. API urut tahun naik dengan limit bawaan 10, jadi tanpa limit eksplisit
 * tahun TERBARU yang terpotong begitu data > 10 tahun. Stg 2026-11-16: 6 tahun. Lebih dari batas → console.warn.
 */
export const PENDUDUK_MISKIN_FETCH_LIMIT = 100;

/** Halaman saudara (tautan silang). */
export const PROGRAM_KEMISKINAN_HREF = "/ekonomi/program-kemiskinan";
