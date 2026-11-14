/**
 * Breakpoint kerangka aplikasi Musik Desa (px), sumber tunggal untuk JS (`useMediaQuery` / `matchMedia`).
 * CSS modul tidak bisa mengimpor JS, jadi `@media` di `musik-app.module.css` menulis angka yang sama dan
 * merujuk nama konstanta ini di komentarnya: ubah keduanya bersamaan.
 */

/** ≤ lebar ini: sidebar diganti pil tab dan antrean menjadi lembar dari bawah. */
export const MUSIK_COMPACT_MAX_PX = 1068;
/** ≥ lebar ini: antrean tampil sebagai kolom kanan (di bawahnya Drawer). */
export const MUSIK_QUEUE_COLUMN_MIN_PX = 1280;

export const MUSIK_COMPACT_QUERY = `(max-width: ${MUSIK_COMPACT_MAX_PX}px)`;
export const MUSIK_QUEUE_COLUMN_QUERY = `(min-width: ${MUSIK_QUEUE_COLUMN_MIN_PX}px)`;
