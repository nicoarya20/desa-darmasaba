/** Konstanta halaman Program Penghijauan (`/lingkungan/program-penghijauan`). */

export const PENGHIJAUAN_BASE_HREF = "/lingkungan/program-penghijauan";

/** Ubin per halaman daftar (3 baris × 3 kolom di desktop), sama dengan Program Kreatif Desa. */
export const PENGHIJAUAN_PAGE_SIZE = 9;

/**
 * Batas entri yang dimuat sekaligus (satu permintaan find-many), lalu disaring & dipaginasi di klien: jumlah total
 * (penentu kolom cari) diketahui tanpa permintaan kedua, dan cari mencakup deskripsi (cari API hanya nama & judul).
 * Stg 2026-11-16: 3 entri. Entri ke-101 dst. tidak tampil (ada console.warn).
 */
export const PENGHIJAUAN_FETCH_LIMIT = 100;
