import type { RefObject } from "react";

export function setAudioVolume(
  audioRef: RefObject<HTMLAudioElement | null>,
  volume: number,
  setVolume: (v: number) => void,
  setIsMuted: (v: boolean) => void
) {
  if (!audioRef.current) return;

  audioRef.current.volume = volume / 100;
  setVolume(volume);

  if (volume > 0) {
    setIsMuted(false);
  }
}

export function toggleMute(
  audioRef: RefObject<HTMLAudioElement | null>,
  isMuted: boolean,
  setIsMuted: (v: boolean) => void
) {
  if (!audioRef.current) return;

  const muted = !isMuted;
  audioRef.current.muted = muted;
  setIsMuted(muted);
}