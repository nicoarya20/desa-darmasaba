/** Hash string deterministik (FNV-1a 32-bit) untuk memilih warna tetap per judul/kunci. */
export function hashSeed(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/**
 * Nada gradasi terang sampul cadangan (lagu/artis tanpa sampul): biru brand + pastel netral.
 * Nada tergelap tiap pasangan cukup terang sehingga ikon/inisial `--m-muted` (#6e6e73) kontras ≥ 3:1 (dicek di test).
 */
export const COVER_TONES = [
  ['#e5f2fa', '#b8daef'],
  ['#f2eee8', '#ded5c8'],
  ['#eaf1ec', '#c9ddd0'],
  ['#f1ecf4', '#dacde3'],
  ['#f6ecea', '#e6cfca'],
  ['#eef0f3', '#d3d8df'],
] as const;

/** Gradasi CSS dari `COVER_TONES`, urutan sama. */
export const COVER_GRADIENTS = COVER_TONES.map(([from, to]) => `linear-gradient(135deg, ${from} 0%, ${to} 100%)`);

/**
 * Latar ubin genre (warna sedang di tema terang). Semua cukup gelap sehingga teks putih tebal
 * kontras ≥ 4.5:1 (dicek di test lewat luminans relatif).
 */
export const GENRE_COLORS = [
  '#7a2e3b',
  '#1f5f73',
  '#5b3a8c',
  '#2f6b3f',
  '#8a4b12',
  '#274a8c',
  '#6b2f6b',
  '#3d5a5a',
] as const;

/** Pilih satu item palet secara deterministik dari seed. */
export function pickFromPalette<T>(palette: readonly T[], seed: string): T {
  return palette[hashSeed(seed) % palette.length];
}
