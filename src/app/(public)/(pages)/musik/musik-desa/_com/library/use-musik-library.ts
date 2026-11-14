import { useMemo } from 'react';
import { useMusic } from '@/app/context/MusicContext';
import { deriveArtists, deriveGenres, toTrack } from './musik-library.logic';
import type { Track } from './musik.types';

/**
 * Pustaka siap tampil dari `useMusic()` (mesin sudah memuat saat mount, jadi tidak fetch ulang di sini).
 * `isActive(track)` = lagu itu yang sedang dipilih; `onPlay` = jeda/lanjut bila sama, putar bila beda.
 */
export function useMusikLibrary() {
  const { musikData, isLoading, currentSong, isPlaying, playSong, togglePlayPause } = useMusic();
  const tracks = useMemo(() => musikData.map(toTrack), [musikData]);
  const artists = useMemo(() => deriveArtists(tracks), [tracks]);
  const genres = useMemo(() => deriveGenres(tracks), [tracks]);
  const currentId = currentSong?.id ?? null;

  const onPlay = (track: Track) => {
    // Lagu yang sama & bisa diputar → jeda/lanjut (seperti TIDAL), bukan mengulang dari 0:00.
    if (track.id === currentId && track.playable) togglePlayPause();
    else playSong(track.source);
  };

  return { tracks, artists, genres, isLoading, currentId, isPlaying, onPlay };
}

/** Bentuk nilai kembali hook, dipakai komponen yang menerima pustaka lewat prop (memudahkan test). */
export type MusikLibrary = ReturnType<typeof useMusikLibrary>;
