export function getNextIndex(
  currentIndex: number,
  total: number,
  isShuffle: boolean
) {
  if (total === 0) return -1;

  if (isShuffle) {
    return Math.floor(Math.random() * total);
  }

  return (currentIndex + 1) % total;
}

export function getPrevIndex(
  currentIndex: number,
  total: number,
  isShuffle: boolean
) {
  if (total === 0) return -1;

  if (isShuffle) {
    return Math.floor(Math.random() * total);
  }

  return currentIndex - 1 < 0 ? total - 1 : currentIndex - 1;
}

//pakai di ui

// const next = getNextIndex(currentSongIndex, filteredMusik.length, isShuffle);
// playSong(next);