/** Konstanta halaman Pendapatan Asli Desa. */

/** Halaman APBDes lengkap (rincian semua kategori + dokumen). */
export const PADESA_APBDES_HREF = "/apbdes";

/**
 * Jumlah APBDes yang dimuat sekali (maks API 100). Satu baris = satu tahun anggaran, jadi 100 jauh di atas kebutuhan;
 * bila total melebihi ini ada console.warn. Stg 2026-11-16: 2 tahun.
 */
export const PADESA_FETCH_LIMIT = 100;
