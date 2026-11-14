/** Hash string deterministik (FNV-1a 32-bit) untuk memilih warna tetap per judul/kunci. */
export function hashSeed(seed: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Gradasi gelap sampul cadangan (lagu tanpa sampul). */
export const COVER_GRADIENTS = [
  'linear-gradient(135deg, #1f2a44 0%, #0d1220 100%)',
  'linear-gradient(135deg, #3a1f3d 0%, #140b16 100%)',
  'linear-gradient(135deg, #1d3a34 0%, #0a1714 100%)',
  'linear-gradient(135deg, #3d2a17 0%, #160f08 100%)',
  'linear-gradient(135deg, #2a2340 0%, #0f0c18 100%)',
  'linear-gradient(135deg, #3b1d22 0%, #15090b 100%)',
] as const;

/**
 * Latar ubin genre. Semua cukup gelap sehingga teks putih tebal
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
