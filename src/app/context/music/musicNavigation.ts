const RESTART_THRESHOLD_SECONDS = 3;

export function computeNextIndex(
  currentIndex: number,
  length: number,
  shuffle: boolean,
  random: () => number = Math.random
): number {
  if (length === 0) return -1;
  if (shuffle) return Math.floor(random() * length);
  return (currentIndex + 1) % length;
}

export type PrevAction = { type: 'restart' } | { type: 'index'; index: number };

export function computePrevAction(
  currentIndex: number,
  length: number,
  currentTime: number
): PrevAction {
  if (currentTime > RESTART_THRESHOLD_SECONDS) {
    return { type: 'restart' };
  }
  if (length === 0) {
    return { type: 'index', index: -1 };
  }
  const index = currentIndex <= 0 ? length - 1 : currentIndex - 1;
  return { type: 'index', index };
}
