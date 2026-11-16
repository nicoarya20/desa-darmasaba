/** Konstanta halaman Gotong Royong (`/lingkungan/gotong-royong/*`). */

export const GOTONG_ROYONG_BASE_HREF = "/lingkungan/gotong-royong";

/** Kategori kegiatan desa (tabel sama dengan Kegiatan Desa) yang tampil sebagai Gotong Royong; nama persis milik admin. */
export const GOTONG_ROYONG_KATEGORI = ["Lingkungan", "Kebersihan"] as const;

/**
 * Batas kegiatan yang dimuat per kategori (sekali muat, dipaginasi di klien). API `kategori` hanya menerima satu nama,
 * jadi tiap kategori satu panggilan; stg 2026-11-16: 3 kegiatan Lingkungan, 0 Kebersihan.
 */
export const GOTONG_ROYONG_KATEGORI_LIMIT = 100;

/** Segmen kategori URL detail bila kategori kosong (segmen hanya kosmetik, data dibaca dari `id`). */
export const GOTONG_ROYONG_FALLBACK_SLUG = "lingkungan";
