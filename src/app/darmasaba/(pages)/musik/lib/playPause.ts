import { RefObject } from "react";

export function togglePlayPause(
  audioRef: RefObject<HTMLAudioElement | null>,
  isPlaying: boolean,
  setIsPlaying: (v: boolean) => void
) {
  if (!audioRef.current) return;

  if (isPlaying) {
    audioRef.current.pause();
    setIsPlaying(false);
  } else {
    audioRef.current
      .play()
      .then(() => setIsPlaying(true))
      .catch(console.error);
  }
}

// pakai di ui
// onClick={() =>
//   togglePlayPause(audioRef, isPlaying, setIsPlaying)
// }