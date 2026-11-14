'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { resolveIds } from './musicQueue';
import { pushRecentId, readRecentIds, writeRecentIds } from './recentlyPlayed';
import type { Musik } from './music.types';

/**
 * Riwayat "Baru diputar". Lagu ditandai `markPending` saat dimuat, lalu baru dicatat oleh
 * `commitPending` pada event 'play' pertamanya (jeda lalu lanjut tidak mencatat ulang).
 * Callback stabil (berbasis ref) supaya aman dipanggil dari listener audio yang dipasang sekali.
 */
export function useRecentlyPlayed(musikData: Musik[]) {
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const recentIdsRef = useRef<string[]>([]);
  const pendingRef = useRef<string | null>(null);

  // Dibaca setelah mount: localStorage tidak ada di server, dan render pertama harus sama dengan SSR.
  useEffect(() => {
    const stored = readRecentIds();
    recentIdsRef.current = stored;
    setRecentIds(stored);
  }, []);

  const markPending = useCallback((id: string | null) => {
    pendingRef.current = id;
  }, []);

  const commitPending = useCallback(() => {
    const id = pendingRef.current;
    if (!id) return;
    pendingRef.current = null;
    const next = pushRecentId(recentIdsRef.current, id);
    recentIdsRef.current = next;
    setRecentIds(next);
    writeRecentIds(next);
  }, []);

  const recentlyPlayed = useMemo(() => resolveIds(recentIds, musikData), [recentIds, musikData]);

  return { recentlyPlayed, markPending, commitPending };
}
