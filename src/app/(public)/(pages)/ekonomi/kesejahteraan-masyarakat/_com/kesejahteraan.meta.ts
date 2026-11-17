/** Konstanta halaman Kesejahteraan Masyarakat (`/ekonomi/kesejahteraan-masyarakat`). */

export const KESEJAHTERAAN_BASE_HREF = "/ekonomi/kesejahteraan-masyarakat";

/** Tautan silang ke halaman saudara (kabar bansos di sini, katalog program + angka di sana). */
export const PROGRAM_KEMISKINAN_HREF = "/ekonomi/program-kemiskinan";

/** Kartu per halaman daftar (2 baris × 3 kolom di desktop). Sorotan di halaman 1 tidak dihitung (halaman 1 = 1 + 6). */
export const KESEJAHTERAAN_PAGE_SIZE = 6;

/**
 * Batas entri yang dimuat sekaligus (satu permintaan find-many), lalu disaring & dipaginasi di klien.
 * MITIGASI SEMENTARA: sorotan (entri terbaru) dikeluarkan dari kartu di semua halaman, sehingga kartu halaman n mulai
 * dari offset 1 + (n-1)×6, sedangkan API find-many hanya punya `page`/`limit` (tanpa `offset`). Muat sekali juga
 * membuat jumlah total (penentu kolom cari) diketahui tanpa permintaan kedua. Stg 2026-11-16: 6 entri.
 * Entri ke-101 dst. tidak tampil (ada console.warn). Bisa dihapus bila backend menambah param `offset`/`skip`.
 */
export const KESEJAHTERAAN_FETCH_LIMIT = 100;
