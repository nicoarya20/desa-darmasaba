'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { releaseSource } from './audioPlayback';

/** Penangan event elemen audio. Dibaca lewat ref, jadi selalu versi terbaru tanpa memasang ulang listener. */
export type AudioHandlers = {
  onLoadedMetadata: (audio: HTMLAudioElement) => void;
  onTimeUpdate: (audio: HTMLAudioElement) => void;
  onSeeked: (audio: HTMLAudioElement) => void;
  onPlay: (audio: HTMLAudioElement) => void;
  /** Audio benar-benar mulai berbunyi (bukan sekadar play() dipanggil). */
  onPlaying: (audio: HTMLAudioElement) => void;
  onPause: (audio: HTMLAudioElement) => void;
  onEnded: (audio: HTMLAudioElement) => void;
  onError: (audio: HTMLAudioElement) => void;
  /** Sumber diganti/dikosongkan ('loadstart' / 'emptied'): status seret slider lama tidak berlaku lagi. */
  onSourceReset: (audio: HTMLAudioElement) => void;
};

const EVENTS: ReadonlyArray<readonly [string, keyof AudioHandlers]> = [
  ['loadedmetadata', 'onLoadedMetadata'],
  ['timeupdate', 'onTimeUpdate'],
  ['seeked', 'onSeeked'],
  ['play', 'onPlay'],
  ['playing', 'onPlaying'],
  ['pause', 'onPause'],
  ['ended', 'onEnded'],
  ['error', 'onError'],
  ['loadstart', 'onSourceReset'],
  ['emptied', 'onSourceReset'],
];


/**
 * Satu elemen `Audio` untuk seluruh situs (event native = sumber kebenaran status pemutar).
 * Dibuat setelah mount (tidak ada `Audio` di server) dan dihentikan saat provider dilepas.
 */
export function useAudioElement(handlers: RefObject<AudioHandlers>, initialVolume: number) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.volume = initialVolume / 100;
    audioRef.current = audio;

    const bound = EVENTS.map(([type, key]) => {
      const listener = () => handlers.current[key](audio);
      audio.addEventListener(type, listener);
      return [type, listener] as const;
    });

    return () => {
      for (const [type, listener] of bound) audio.removeEventListener(type, listener);
      releaseSource(audio);
      audioRef.current = null;
    };
  }, [handlers, initialVolume]);

  return audioRef;
}
