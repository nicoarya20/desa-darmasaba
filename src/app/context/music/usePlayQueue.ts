'use client';

import { useCallback, useMemo, useState } from 'react';
import { buildShuffledOrder, computeUpNext, reconcileOrder, resolveIds } from './musicQueue';
import type { Musik } from './music.types';

const hasAudio = (song: Musik | undefined): boolean => Boolean(song?.audioFile?.link);

/** Urutan putar (pustaka atau acak) + daftar "Berikutnya" untuk lagu saat ini. */
export function usePlayQueue(musikData: Musik[], currentSong: Musik | null) {
  const [isShuffle, setIsShuffle] = useState(false);
  // Urutan acak tersimpan; null = acak mati (urutan pustaka).
  const [shuffledOrder, setShuffledOrder] = useState<string[] | null>(null);

  const libraryIds = useMemo(() => musikData.map((m) => m.id), [musikData]);
  const songById = useMemo(() => new Map(musikData.map((m) => [m.id, m])), [musikData]);

  const playOrder = useMemo(
    () => (shuffledOrder ? reconcileOrder(shuffledOrder, libraryIds) : libraryIds),
    [shuffledOrder, libraryIds]
  );
  const currentOrderIndex = currentSong ? playOrder.indexOf(currentSong.id) : -1;

  const isPlayableAt = useCallback(
    (index: number) => hasAudio(songById.get(playOrder[index])),
    [songById, playOrder]
  );
  const songAt = useCallback((index: number) => songById.get(playOrder[index]), [songById, playOrder]);

  const upNext = useMemo(
    () => resolveIds(computeUpNext(playOrder, currentSong?.id ?? null), musikData),
    [playOrder, currentSong, musikData]
  );

  // Acak nyala → lagu saat ini di depan, sisanya diacak sekali; mati → kembali ke urutan pustaka.
  const toggleShuffle = useCallback(() => {
    const next = !isShuffle;
    setIsShuffle(next);
    setShuffledOrder(next ? buildShuffledOrder(libraryIds, currentSong?.id ?? null) : null);
  }, [isShuffle, libraryIds, currentSong]);

  return {
    isShuffle,
    toggleShuffle,
    orderLength: playOrder.length,
    currentOrderIndex,
    isPlayableAt,
    songAt,
    upNext,
  };
}
