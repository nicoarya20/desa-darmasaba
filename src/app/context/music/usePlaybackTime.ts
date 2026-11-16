'use client';

import { useCallback, useMemo, useRef, useState, type RefObject } from 'react';
import { createMusicTimeStore, ZERO_TIME } from './musicTime';
import type { AudioHandlers } from './useAudioElement';

type TimeHandlers = Pick<AudioHandlers, 'onLoadedMetadata' | 'onTimeUpdate' | 'onSeeked' | 'onSourceReset'>;

/**
 * Waktu pemutaran milik mesin: store waktu, seret slider (pratinjau/commit), dan penangan event audio
 * yang memperbaruinya. Semua callback stabil, jadi nilai context waktu tidak pernah berganti.
 */
export function usePlaybackTime(audioRef: RefObject<HTMLAudioElement | null>) {
  const [store] = useState(createMusicTimeStore);
  // Selama slider diseret, 'timeupdate' tidak boleh menimpa posisi pratinjau.
  const isSeekingRef = useRef(false);

  /** Lagu baru dimuat: posisi & durasi ke 0, seret yang tertinggal dibatalkan. */
  const resetTime = useCallback(() => {
    isSeekingRef.current = false;
    store.set(ZERO_TIME);
  }, [store]);

  /** Kembali ke awal lagu yang sedang dimuat. */
  const restart = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    store.set({ currentTime: 0 });
  }, [audioRef, store]);

  // Visual saja saat slider diseret (tidak menyentuh elemen audio).
  const seekPreview = useCallback(
    (time: number) => {
      isSeekingRef.current = true;
      store.set({ currentTime: time });
    },
    [store]
  );

  // Commit posisi ke elemen audio; isSeekingRef dilepas oleh event native 'seeked'.
  const seek = useCallback(
    (time: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      // Tanpa sumber, 'seeked' tidak pernah datang: jangan biarkan progres membeku menunggu.
      if (!audio.getAttribute('src')) {
        isSeekingRef.current = false;
        return;
      }
      isSeekingRef.current = true;
      audio.currentTime = time;
      store.set({ currentTime: time });
    },
    [audioRef, store]
  );

  const timeHandlers = useMemo<TimeHandlers>(
    () => ({
      onLoadedMetadata: (audio) => store.set({ duration: Number.isFinite(audio.duration) ? Math.floor(audio.duration) : 0 }),
      onTimeUpdate: (audio) => {
        if (!isSeekingRef.current) store.set({ currentTime: Math.floor(audio.currentTime) });
      },
      onSeeked: (audio) => {
        isSeekingRef.current = false;
        store.set({ currentTime: Math.floor(audio.currentTime) });
      },
      // Sumber diganti/dilepas ('loadstart'/'emptied'): 'seeked' untuk seret lama tidak akan datang.
      onSourceReset: () => {
        isSeekingRef.current = false;
      },
    }),
    [store]
  );

  const time = useMemo(() => ({ store, seek, seekPreview }), [store, seek, seekPreview]);

  return { time, timeHandlers, resetTime, restart };
}
