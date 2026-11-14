'use client';

import { useCallback, useRef, useState, type RefObject } from 'react';

/** Volume awal (persen) elemen audio dan slider. */
export const DEFAULT_VOLUME = 70;

/** Volume 0–100 + bisu, diterapkan langsung ke elemen audio milik mesin. */
export function useVolume(audioRef: RefObject<HTMLAudioElement | null>) {
  const [volume, setVolumeState] = useState(DEFAULT_VOLUME);
  const [isMuted, setIsMuted] = useState(false);
  // Volume terakhir yang terdengar: bunyikan dari volume 0 kembali ke sini, bukan tetap senyap.
  const lastAudibleRef = useRef(DEFAULT_VOLUME);

  const setVolume = useCallback(
    (vol: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      const clamped = Math.max(0, Math.min(100, vol));
      const normalizedVol = clamped / 100;
      audio.volume = normalizedVol;
      // toggleMute memasang audio.muted; tanpa ini menggeser volume setelah bisu tetap senyap walau UI "tidak bisu".
      audio.muted = normalizedVol === 0;
      if (clamped > 0) lastAudibleRef.current = clamped;
      setVolumeState(clamped);
      setIsMuted(normalizedVol === 0);
    },
    [audioRef]
  );

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isMuted || volume === 0) {
      const restored = volume > 0 ? volume : lastAudibleRef.current;
      audio.muted = false;
      audio.volume = restored / 100;
      setVolumeState(restored);
      setIsMuted(false);
    } else {
      audio.muted = true;
      setIsMuted(true);
    }
  }, [audioRef, isMuted, volume]);

  return { volume, isMuted, setVolume, toggleMute };
}
