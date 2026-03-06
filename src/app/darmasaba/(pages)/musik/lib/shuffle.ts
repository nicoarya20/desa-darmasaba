export function toggleShuffle(
  isShuffle: boolean,
  setIsShuffle: (v: boolean) => void
) {
  setIsShuffle(!isShuffle);
}