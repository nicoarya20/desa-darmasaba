export function seekTo(
  audioRef: React.RefObject<HTMLAudioElement | null>,
  time: number,
  setCurrentTime?: (v: number) => void
) {
  if (!audioRef.current) return;
  
  audioRef.current.currentTime = time;
  
  // Update state jika provided
  if (setCurrentTime) {
    setCurrentTime(time);
  }
}
