export function seekTo(
  audioRef: React.RefObject<HTMLAudioElement | null>,
  time: number,
  setCurrentTime?: (v: number) => void
) {
  if (!audioRef.current) {
    console.error('[seekTo] Audio element tidak ada!');
    return;
  }
  
  console.log('[seekTo] Before seek - currentTime:', audioRef.current.currentTime, 'Target:', time);
  
  // Set waktu audio
  audioRef.current.currentTime = time;
  
  console.log('[seekTo] After seek - currentTime:', audioRef.current.currentTime);
  
  // Update state jika provided
  if (setCurrentTime) {
    setCurrentTime(Math.round(time));
  }
  
  // Debug log
  console.log('[seekTo] Seek to:', time, 'seconds');
}
