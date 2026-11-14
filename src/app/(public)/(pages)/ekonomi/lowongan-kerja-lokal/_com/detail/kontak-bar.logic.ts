/** Letak elemen terhadap area pandang (dari IntersectionObserverEntry). */
export type LetakAksi = 'above' | 'inside' | 'below';

/**
 * Tinggi navbar publik yang menempel di atas (sama dengan `top: 68px` panel Filter daftar). Aksi kepala yang
 * tertutup navbar dihitung sudah lewat, jadi bilah melayang muncul.
 */
export const NAVBAR_OFFSET_PX = 68;

/** Letak elemen dari entri observer: terlihat → inside; tak terlihat → di atas atau di bawah area pandang. */
export function letakDari(entry: { isIntersecting: boolean; boundingClientRect: { top: number } }): LetakAksi {
  if (entry.isIntersecting) return 'inside';
  return entry.boundingClientRect.top < 0 ? 'above' : 'below';
}

/**
 * Bilah kontak melayang tampil hanya di antara kedua aksi: aksi kepala sudah tergulir lewat (di atas) dan aksi
 * penutup belum tercapai (di bawah). Setelah penutup tergulir lewat bilah tetap tersembunyi, supaya tidak menutupi
 * footer di ujung halaman.
 */
export function isBarVisible(kepala: LetakAksi, penutup: LetakAksi): boolean {
  return kepala === 'above' && penutup === 'below';
}
