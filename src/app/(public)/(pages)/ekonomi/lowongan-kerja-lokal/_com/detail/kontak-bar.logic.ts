/** Letak elemen terhadap area pandang (dari IntersectionObserverEntry). */
export type LetakAksi = 'above' | 'inside' | 'below';

/**
 * Tinggi navbar publik yang menempel di atas (sama dengan `top: 68px` panel Filter daftar). Aksi kepala yang
 * tertutup navbar dihitung sudah lewat, jadi bilah melayang muncul.
 */
export const NAVBAR_OFFSET_PX = 68;

/**
 * Letak elemen dari entri observer: terlihat → inside; tak terlihat → di atas atau di bawah area pandang.
 * Dibandingkan dengan tepi atas root (area pandang dikurangi navbar), bukan 0: elemen yang berhenti tepat di bawah
 * navbar (top 2px, bottom < 68px) sudah tidak berpotongan tetapi top ≥ 0. Bila dinilai 'below', gulir lebih jauh
 * tidak memicu callback lagi dan bilah terkunci tersembunyi. `rootBounds` null (iframe lintas origin) → offset navbar.
 */
export function letakDari(entry: {
  isIntersecting: boolean;
  boundingClientRect: { top: number };
  rootBounds: { top: number } | null;
}): LetakAksi {
  if (entry.isIntersecting) return 'inside';
  const rootTop = entry.rootBounds?.top ?? NAVBAR_OFFSET_PX;
  return entry.boundingClientRect.top < rootTop ? 'above' : 'below';
}

/**
 * Bilah kontak melayang tampil hanya di antara kedua aksi: aksi kepala sudah tergulir lewat (di atas) dan aksi
 * penutup belum tercapai (di bawah). Setelah penutup tergulir lewat bilah tetap tersembunyi, supaya tidak menutupi
 * footer di ujung halaman.
 */
export function isBarVisible(kepala: LetakAksi, penutup: LetakAksi): boolean {
  return kepala === 'above' && penutup === 'below';
}
