import { useMemo } from 'react';
import { useMusic } from '@/app/context/MusicContext';
import { deriveArtists, deriveGenres, playIntent, toTrack, withGenreLabels } from './musik-library.logic';
import type { Track } from './musik.types';

/**
 * Pustaka siap tampil dari `useMusic()` (mesin sudah memuat saat mount, jadi tidak fetch ulang di sini).
 * `currentId` = lagu yang sedang dipilih; `onPlay` = jeda/lanjut bila sama, putar bila beda; `onRetry` = muat ulang
 * setelah gagal (`loadError`).
 */
export function useMusikLibrary() {
  const music = useMusic();
  const { musikData, isLoading, currentSong, isPlaying, playSong, togglePlayPause, loadMusikData } = music;
  // TODO(musik-load-error): baca langsung `music.loadError` setelah commit Sesi C menambah field itu ke
  // MusicContextType (audit 2026-11-14, MIND/PLAN/musik-desa-audit.md butir 2); sampai itu, field opsional.
  const loadError = (music as { loadError?: boolean }).loadError === true;
  const raw = useMemo(() => musikData.map(toTrack), [musikData]);
  const genres = useMemo(() => deriveGenres(raw), [raw]);
  const tracks = useMemo(() => withGenreLabels(raw, genres), [raw, genres]);
  const artists = useMemo(() => deriveArtists(tracks), [tracks]);
  const currentId = currentSong?.id ?? null;

  const onPlay = (track: Track) => {
    if (playIntent(track, currentId) === 'toggle') togglePlayPause();
    else playSong(track.source);
  };

  // Kegagalan dicatat & ditandai `loadError` oleh mesin; promise dibiarkan mengalir (tanpa catch bisu).
  const onRetry = (): void => {
    void loadMusikData();
  };

  return { tracks, artists, genres, isLoading, loadError, onRetry, currentId, isPlaying, onPlay };
}

/** Bentuk nilai kembali hook, dipakai komponen yang menerima pustaka lewat prop (memudahkan test). */
export type MusikLibrary = ReturnType<typeof useMusikLibrary>;
