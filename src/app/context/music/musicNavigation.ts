/**
 * Navigasi next/prev di atas urutan putar (indeks pada playOrder, lihat musicQueue.ts).
 * Lagu yang tidak bisa diputar (tanpa audio) dilewati lewat `isPlayable`.
 */
const RESTART_THRESHOLD_SECONDS = 3;

type IsPlayable = (index: number) => boolean;
const ALL_PLAYABLE: IsPlayable = () => true;

/**
 * Indeks lagu berikutnya yang bisa diputar, melingkar ke awal setelah ujung urutan.
 * `currentIndex` -1 (belum ada lagu) → mulai dari indeks 0. Lagu saat ini ikut dicek paling akhir,
 * jadi bila hanya dia yang bisa diputar, hasilnya dirinya sendiri. Tidak ada yang bisa diputar → -1.
 */
export function computeNextIndex(
  currentIndex: number,
  length: number,
  isPlayable: IsPlayable = ALL_PLAYABLE
): number {
  for (let step = 1; step <= length; step += 1) {
    const index = (currentIndex + step) % length;
    if (index >= 0 && isPlayable(index)) return index;
  }
  return -1;
}

export type PrevAction = { type: 'restart' } | { type: 'index'; index: number };

/**
 * Lewat 3 detik → ulang lagu dari awal; selain itu mundur ke lagu sebelumnya yang bisa diputar
 * (melingkar ke ujung urutan). `currentIndex` -1 dianggap posisi 0. Tidak ada yang bisa diputar → -1.
 */
export function computePrevAction(
  currentIndex: number,
  length: number,
  currentTime: number,
  isPlayable: IsPlayable = ALL_PLAYABLE
): PrevAction {
  if (currentTime > RESTART_THRESHOLD_SECONDS) {
    return { type: 'restart' };
  }
  const start = Math.max(currentIndex, 0);
  for (let step = 1; step <= length; step += 1) {
    const index = (((start - step) % length) + length) % length;
    if (isPlayable(index)) return { type: 'index', index };
  }
  return { type: 'index', index: -1 };
}
