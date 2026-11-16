/** Konstanta halaman Kolaborasi Inovasi (`/inovasi/kolaborasi-inovasi`). */

export const KOLABORASI_BASE_HREF = "/inovasi/kolaborasi-inovasi";

/**
 * Batas muat sekali dari API. Kolaborasi & mitra disaring/dipaginasi di klien: filter `year` API berbasis `createdAt`
 * (bukan field `tahun`) dan cari API tidak mencakup kolaborator (docs/BACKEND-TODO.md). Stg 2026-11-16: 4 kolaborasi, 3 mitra.
 */
export const KOLABORASI_FETCH_LIMIT = 100;
export const MITRA_FETCH_LIMIT = 100;

/** Entri per halaman daftar (paginasi klien). */
export const KOLABORASI_PAGE_LIMIT = 10;

/** Kolom cari tampil bila kolaborasi lebih dari angka ini atau URL sudah ber-`?search=` (ambang sama dengan Tips Keamanan). */
export const KOLABORASI_SEARCH_THRESHOLD = 6;

/**
 * Deskripsi dengan teks polos lebih panjang dari ini dipotong 4 baris + tombol "Baca selengkapnya" (dibuka di tempat).
 * Deskripsi stg 108–397 karakter (1–3 kalimat) → tampil penuh tanpa tombol.
 */
export const KOLABORASI_COLLAPSE_THRESHOLD = 600;
