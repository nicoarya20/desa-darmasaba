import { useCallback, useEffect, useState } from 'react';
import { loadLowonganDetail } from './lowongan-detail.source';
import type { LowonganDetailState } from './lowongan-detail.types';

type Loaded = { key: string; state: LowonganDetailState };

/**
 * Detail lowongan untuk `id`. Ganti id atau `reload` → kembali "loading" (data id/percobaan lama tidak ditampilkan).
 * Tidak memakai state admin `lowonganKerjaState.findUnique` (tanpa status galat dan datanya global).
 */
export function useLowonganDetail(id: string): { state: LowonganDetailState; reload: () => void } {
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const key = `${id}#${attempt}`;

  useEffect(() => {
    let cancelled = false;
    loadLowonganDetail(id).then(
      (data) => {
        if (!cancelled) setLoaded({ key, state: data ? { status: 'ready', data } : { status: 'notFound' } });
      },
      (error: unknown) => {
        console.error(`Gagal memuat detail lowongan kerja ${id}:`, error);
        if (!cancelled) setLoaded({ key, state: { status: 'error' } });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [id, key]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  const state: LowonganDetailState = loaded?.key === key ? loaded.state : { status: 'loading' };
  return { state, reload };
}
