export function seekTo(
  audioRef: React.RefObject<HTMLAudioElement | null>,
  time: number
) {
  if (!audioRef.current) return;
  audioRef.current.currentTime = time;
}


// import { RefObject } from "react";

// export function seekTo(
//   audioRef: RefObject<HTMLAudioElement | null>,
//   time: number,
//   setCurrentTime: (v: number) => void
// ) {
//   if (!audioRef.current) return;

//   audioRef.current.currentTime = time;
//   setCurrentTime(time);
// }

// //pakai di ui

// // onChange={(v) => seekTo(audioRef, v, setCurrentTime)}
