'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { resolveIds } from './musicQueue';
import { RECENT_STORAGE_KEY, pushRecentId, readRecentIds, writeRecentIds } from './recentlyPlayed';
import type { Musik } from './music.types';

/**
 * Riwayat "Baru diputar". Lagu ditandai `markPending` saat dimuat, lalu baru dicatat oleh
 * `commitPending` pada event 'playing' pertamanya (audio benar-benar berbunyi) (jeda lalu lanjut tidak mencatat ulang).
 * Callback stabil (berbasis ref) supaya aman dipanggil dari listener audio yang dipasang sekali.
 * Beberapa tab berbagi satu kunci localStorage: sebelum menulis, isi storage dibaca ulang (tab lain tidak
 * tertimpa), dan event 'storage' dari tab lain memperbarui daftar di tab ini.
 */
export function useRecentlyPlayed(musikData: Musik[]) {
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const recentIdsRef = useRef<string[]>([]);
  const pendingRef = useRef<string | null>(null);

  // Dibaca setelah mount: localStorage tidak ada di server, dan render pertama harus sama dengan SSR.
  useEffect(() => {
    const sync = () => {
      const stored = readRecentIds();
      recentIdsRef.current = stored;
      setRecentIds(stored);
    };
    sync();
    // key null = storage dikosongkan seluruhnya (mis. hapus data situs) di tab lain.
    const onStorage = (event: StorageEvent) => {
      if (event.key === RECENT_STORAGE_KEY || event.key === null) sync();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const markPending = useCallback((id: string | null) => {
    pendingRef.current = id;
  }, []);

  const commitPending = useCallback(() => {
    const id = pendingRef.current;
    if (!id) return;
    pendingRef.current = null;
    const next = pushRecentId(readRecentIds(), id);
    recentIdsRef.current = next;
    setRecentIds(next);
    writeRecentIds(next);
  }, []);

  const recentlyPlayed = useMemo(() => resolveIds(recentIds, musikData), [recentIds, musikData]);

  return { recentlyPlayed, markPending, commitPending };
}
