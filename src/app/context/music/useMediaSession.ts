'use client';

import { useEffect, useRef, type RefObject } from 'react';
import {
  applyActionHandlers,
  buildActionHandlers,
  buildMetadataInit,
  clearActionHandlers,
  getMediaSession,
  toPlaybackState,
  toPositionState,
  type MediaActionCallbacks,
} from './mediaSession.logic';
import type { Musik } from './music.types';
import type { MusicTimeStore } from './musicTime';
import { canSeek } from './playable';

/** Event audio yang mengubah posisi/durasi di luar laju normal (bukan 'timeupdate', yang diekstrapolasi sistem). */
const POSITION_EVENTS = ['loadedmetadata', 'durationchange', 'seeked', 'play', 'pause', 'ratechange'] as const;

type MediaSessionInput = {
  audioRef: RefObject<HTMLAudioElement | null>;
  timeStore: MusicTimeStore;
  currentSong: Musik | null;
  isPlaying: boolean;
  hasNext: boolean;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrev: () => void;
  seek: (time: number) => void;
};

/** Hubungkan mesin pemutar ke Media Session API: metadata, status putar, posisi, dan aksi kontrol sistem. */
export function useMediaSession(input: MediaSessionInput) {
  const { audioRef, timeStore, currentSong, isPlaying, hasNext } = input;
  const hasSong = currentSong !== null;

  // Penangan aksi selalu memanggil versi terbaru tanpa memasang ulang ke navigator setiap render.
  const latestRef = useRef(input);
  useEffect(() => {
    latestRef.current = input;
  });

  useEffect(() => {
    const session = getMediaSession();
    if (!session) return;
    session.metadata =
      currentSong && typeof MediaMetadata !== 'undefined' ? new MediaMetadata(buildMetadataInit(currentSong)) : null;
  }, [currentSong]);

  useEffect(() => {
    const session = getMediaSession();
    if (session) session.playbackState = toPlaybackState(hasSong, isPlaying);
  }, [hasSong, isPlaying]);

  useEffect(() => {
    const session = getMediaSession();
    if (!session || !hasSong) return;
    const pausedNow = () => audioRef.current?.paused ?? true;
    const callbacks: MediaActionCallbacks = {
      play: () => {
        if (pausedNow()) latestRef.current.togglePlayPause();
      },
      pause: () => {
        if (!pausedNow()) latestRef.current.togglePlayPause();
      },
      previous: () => latestRef.current.playPrev(),
      next: () => latestRef.current.playNext(),
      seekTo: (time) => {
        const { currentSong: song, seek } = latestRef.current;
        if (canSeek(song, timeStore.getSnapshot().duration)) seek(time);
      },
    };
    applyActionHandlers(session, buildActionHandlers(callbacks, hasNext));
    return () => clearActionHandlers(session);
  }, [audioRef, timeStore, hasSong, hasNext]);

  // Posisi hanya dikirim saat berubah di luar laju putar; 'emptied' (ganti lagu / berhenti) mengosongkannya.
  useEffect(() => {
    const audio = audioRef.current;
    const session = getMediaSession();
    if (!audio || !session?.setPositionState) return;
    const update = () => {
      const state = toPositionState(audio.duration, audio.currentTime, audio.playbackRate);
      if (state) session.setPositionState?.(state);
    };
    const clear = () => session.setPositionState?.();
    for (const type of POSITION_EVENTS) audio.addEventListener(type, update);
    audio.addEventListener('emptied', clear);
    return () => {
      for (const type of POSITION_EVENTS) audio.removeEventListener(type, update);
      audio.removeEventListener('emptied', clear);
      clear();
    };
  }, [audioRef]);

  // Provider dilepas: metadata & status ikut dilepas (efek di atas hanya membersihkan saat nilainya berganti).
  useEffect(
    () => () => {
      const session = getMediaSession();
      if (!session) return;
      session.metadata = null;
      session.playbackState = 'none';
    },
    []
  );
}
