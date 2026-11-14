'use client';

import { useCallback, useMemo, useState } from 'react';
import { buildShuffledOrder, computeUpNext, reconcileOrder, resolveIds } from './musicQueue';
import type { Musik } from './music.types';

/**
 * Urutan putar (pustaka atau acak) + daftar "Berikutnya" untuk lagu saat ini. `isPlayable` menentukan
 * lagu yang boleh dituju next/prev (punya audio dan filenya tidak tercatat rusak); harus stabil.
 * `wrap` false (mode ulang mati) → "Berikutnya" berhenti di ujung urutan.
 */
export function usePlayQueue(
  musikData: Musik[],
  currentSong: Musik | null,
  isPlayable: (song: Musik) => boolean,
  wrap: boolean
) {
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
    (index: number) => {
      const song = songById.get(playOrder[index]);
      return song !== undefined && isPlayable(song);
    },
    [songById, playOrder, isPlayable]
  );
  const songAt = useCallback((index: number) => songById.get(playOrder[index]), [songById, playOrder]);

  const upNext = useMemo(
    () => resolveIds(computeUpNext(playOrder, currentSong?.id ?? null, wrap), musikData),
    [playOrder, currentSong, musikData, wrap]
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
