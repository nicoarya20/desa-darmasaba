/** Konstanta halaman Gotong Royong (`/lingkungan/gotong-royong/*`). */

export const GOTONG_ROYONG_BASE_HREF = "/lingkungan/gotong-royong";

/**
 * Batas kegiatan Gotong Royong yang dimuat sekali (dipaginasi di klien). Kegiatan disaring per id kategori tetap
 * `KATEGORI_GOTONG_ROYONG_ID` (src/lib/kegiatan-gotong-royong.ts), bukan nama — lihat
 * docs/decisions/2026-11-16-gotong-royong-kategori-kegiatan.md.
 */
export const GOTONG_ROYONG_LIMIT = 100;

/** Segmen kategori URL detail bila kategori kosong (segmen hanya kosmetik, data dibaca dari `id`). */
export const GOTONG_ROYONG_FALLBACK_SLUG = "gotong-royong";
