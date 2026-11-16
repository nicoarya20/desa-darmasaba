import { useCallback, useEffect, useState } from 'react';
import { loadBukuDetail } from '../perpus.source';
import type { BukuDetailState } from '../perpus.types';

type Loaded = { key: string; state: BukuDetailState };

/**
 * Detail buku untuk `id`. Ganti id atau `reload` → kembali "loading" (data id/percobaan lama tidak ditampilkan).
 * Tidak memakai state admin `dataPerpustakaan.findUnique` (tanpa status tidak ditemukan/galat → spinner abadi).
 */
export function useBukuDetail(id: string) {
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const key = `${id}#${attempt}`;

  useEffect(() => {
    let cancelled = false;
    loadBukuDetail(id).then(
      (data) => {
        if (!cancelled) setLoaded({ key, state: data ? { status: 'ready', data } : { status: 'notFound' } });
      },
      (error: unknown) => {
        console.error(`Gagal memuat detail buku ${id}:`, error);
        if (!cancelled) setLoaded({ key, state: { status: 'error' } });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [id, key]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  const state: BukuDetailState = loaded?.key === key ? loaded.state : { status: 'loading' };
  return { state, reload };
}
