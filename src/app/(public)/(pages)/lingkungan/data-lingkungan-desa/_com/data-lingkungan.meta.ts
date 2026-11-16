/** Konstanta halaman Data Lingkungan Desa (`/lingkungan/data-lingkungan-desa`). */

export const DATA_LINGKUNGAN_BASE_HREF = "/lingkungan/data-lingkungan-desa";

/**
 * Batas entri yang dimuat sekaligus (satu permintaan find-many), lalu disaring & dipaginasi di klien agar jumlah total
 * (penentu kolom cari) diketahui tanpa permintaan kedua. Stg 2026-11-16: 7 entri. Entri ke-101 dst. tidak tampil
 * (ada console.warn).
 */
export const DATA_LINGKUNGAN_FETCH_LIMIT = 100;

/** Baris per halaman daftar (paginasi klien), sama dengan Kolaborasi Inovasi. */
export const DATA_LINGKUNGAN_PAGE_SIZE = 10;
