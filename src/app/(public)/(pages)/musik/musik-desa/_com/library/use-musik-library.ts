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
  const { musikData, isLoading, loadError, currentSong, isPlaying, playSong, togglePlayPause, loadMusikData } = useMusic();
  const raw = useMemo(() => musikData.map(toTrack), [musikData]);
  const genres = useMemo(() => deriveGenres(raw), [raw]);
  const tracks = useMemo(() => withGenreLabels(raw, genres), [raw, genres]);
  const artists = useMemo(() => deriveArtists(tracks), [tracks]);
  const currentId = currentSong?.id ?? null;

  const onPlay = (track: Track) => {
    if (playIntent(track, currentId) === 'toggle') togglePlayPause();
    else playSong(track.source);
  };

  // Mesin mencatat kegagalan (console.error) & menandai `loadError` sendiri; promise-nya tidak pernah menolak.
  const onRetry = (): void => {
    void loadMusikData();
  };

  return { tracks, artists, genres, isLoading, loadError, onRetry, currentId, isPlaying, onPlay };
}

/** Bentuk nilai kembali hook, dipakai komponen yang menerima pustaka lewat prop (memudahkan test). */
export type MusikLibrary = ReturnType<typeof useMusikLibrary>;
