'use client';

import { useCallback, useState, type RefObject } from 'react';

/** Volume awal (persen) elemen audio dan slider. */
export const DEFAULT_VOLUME = 70;

/** Volume 0–100 + bisu, diterapkan langsung ke elemen audio milik mesin. */
export function useVolume(audioRef: RefObject<HTMLAudioElement | null>) {
  const [volume, setVolumeState] = useState(DEFAULT_VOLUME);
  const [isMuted, setIsMuted] = useState(false);

  const setVolume = useCallback(
    (vol: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      const normalizedVol = Math.max(0, Math.min(100, vol)) / 100;
      audio.volume = normalizedVol;
      // toggleMute memasang audio.muted; tanpa ini menggeser volume setelah bisu tetap senyap walau UI "tidak bisu".
      audio.muted = normalizedVol === 0;
      setVolumeState(Math.max(0, Math.min(100, vol)));
      setIsMuted(normalizedVol === 0);
    },
    [audioRef]
  );

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const newMuted = !isMuted;
    audio.muted = newMuted;
    setIsMuted(newMuted);
    if (newMuted && volume > 0) {
      audio.volume = 0;
    } else if (!newMuted && volume > 0) {
      audio.volume = volume / 100;
    }
  }, [audioRef, isMuted, volume]);

  return { volume, isMuted, setVolume, toggleMute };
}
