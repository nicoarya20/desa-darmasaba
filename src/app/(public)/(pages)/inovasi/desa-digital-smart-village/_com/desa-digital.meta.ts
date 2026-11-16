/** Konstanta halaman Desa Digital / Smart Village (`/inovasi/desa-digital-smart-village`). */

export const DESA_DIGITAL_BASE_HREF = "/inovasi/desa-digital-smart-village";

/** Kartu per halaman daftar (2 baris × 3 kolom di desktop). Sorotan di halaman 1 tidak dihitung (halaman 1 = 1 + 6). */
export const DESA_DIGITAL_PAGE_SIZE = 6;

/**
 * Batas entri yang dimuat sekaligus (satu permintaan find-many), lalu dipaginasi di klien.
 * MITIGASI SEMENTARA: sorotan (entri terbaru) dikeluarkan dari kartu di semua halaman, sehingga kartu halaman n mulai
 * dari offset 1 + (n-1)×6; API find-many hanya punya `page`/`limit` (tanpa `offset`). Stg 2026-11-16: 5 entri.
 * Entri ke-101 dst. tidak tampil (ada console.warn). Bisa dihapus bila backend menambah param `offset`/`skip`.
 */
export const DESA_DIGITAL_FETCH_LIMIT = 100;
