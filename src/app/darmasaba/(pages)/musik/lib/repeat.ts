import type { RefObject } from "react";

export function handleRepeatOrNext(
  audioRef: RefObject<HTMLAudioElement | null>,
  isRepeat: boolean,
  playNext: () => void
) {
  if (!audioRef.current) return;

  if (isRepeat) {
    audioRef.current.currentTime = 0;
    audioRef.current.play();
  } else {
    playNext();
  }
}

//dipakai di ui

// onEnded={() =>
//   handleRepeatOrNext(audioRef, isRepeat, playNext)
// }