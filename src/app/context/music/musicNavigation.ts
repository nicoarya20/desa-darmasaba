/**
 * Navigasi next/prev di atas urutan putar (indeks pada playOrder, lihat musicQueue.ts).
 * Lagu yang tidak bisa diputar (tanpa audio) dilewati lewat `isPlayable`.
 */
const RESTART_THRESHOLD_SECONDS = 3;

type IsPlayable = (index: number) => boolean;
const ALL_PLAYABLE: IsPlayable = () => true;

/**
 * Indeks lagu berikutnya yang bisa diputar. `wrap` (bawaan) melingkar ke awal setelah ujung urutan dan
 * lagu saat ini ikut dicek paling akhir (bila hanya dia yang bisa diputar, hasilnya dirinya sendiri);
 * tanpa `wrap` (mode ulang mati) pencarian berhenti di ujung. `currentIndex` -1 (belum ada lagu) → mulai
 * dari indeks 0. Tidak ada yang bisa diputar → -1.
 */
export function computeNextIndex(
  currentIndex: number,
  length: number,
  isPlayable: IsPlayable = ALL_PLAYABLE,
  wrap = true
): number {
  for (let step = 1; step <= length; step += 1) {
    const raw = currentIndex + step;
    if (!wrap && raw >= length) return -1;
    const index = raw % length;
    if (index >= 0 && isPlayable(index)) return index;
  }
  return -1;
}

export type PrevAction = { type: 'restart' } | { type: 'index'; index: number };

/**
 * Lewat 3 detik → ulang lagu dari awal; selain itu mundur ke lagu sebelumnya yang bisa diputar.
 * `wrap` (bawaan) melingkar ke ujung urutan; tanpa `wrap` (mode ulang mati) tidak ada lagu sebelum awal
 * urutan → ulang lagu saat ini. `currentIndex` -1 dianggap posisi 0. Tidak ada yang bisa diputar → -1.
 */
export function computePrevAction(
  currentIndex: number,
  length: number,
  currentTime: number,
  isPlayable: IsPlayable = ALL_PLAYABLE,
  wrap = true
): PrevAction {
  if (currentTime > RESTART_THRESHOLD_SECONDS) {
    return { type: 'restart' };
  }
  const start = Math.max(currentIndex, 0);
  for (let step = 1; step <= length; step += 1) {
    if (!wrap && start - step < 0) return { type: 'restart' };
    const index = (((start - step) % length) + length) % length;
    if (isPlayable(index)) return { type: 'index', index };
  }
  return { type: 'index', index: -1 };
}
