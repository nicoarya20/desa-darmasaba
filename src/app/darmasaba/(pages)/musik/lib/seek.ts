export function seekTo(
  audioRef: React.RefObject<HTMLAudioElement>,
  time: number,
  setCurrentTime?: (v: number) => void
) {
  if (!audioRef.current) return;

  // Validasi: jangan seek melebihi durasi atau negatif
  const duration = audioRef.current.duration || 0;
  const safeTime = Math.min(Math.max(0, time), duration);

  // Set waktu audio
  audioRef.current.currentTime = safeTime;

  // Update state jika provided
  if (setCurrentTime) {
    setCurrentTime(Math.floor(safeTime));
  }
}
