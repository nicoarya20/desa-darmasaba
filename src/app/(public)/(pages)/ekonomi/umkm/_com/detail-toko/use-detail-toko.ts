import { useCallback, useEffect, useState } from 'react';
import { loadDetailToko } from './detail-toko.source';
import type { DetailTokoState } from './detail-toko.types';

type Loaded = { key: string; state: DetailTokoState };

/**
 * Detail toko untuk `id`. Ganti id atau `reload` → kembali "loading" (data id/percobaan lama tidak ditampilkan).
 * Tidak memakai state admin `umkmState.umkm.findUnique` (tanpa status galat dan datanya global).
 */
export function useDetailToko(id: string) {
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const key = `${id}#${attempt}`;

  useEffect(() => {
    let cancelled = false;
    loadDetailToko(id).then(
      (data) => {
        if (!cancelled) setLoaded({ key, state: data ? { status: 'ready', data } : { status: 'notFound' } });
      },
      (error: unknown) => {
        console.error(`Gagal memuat detail toko UMKM ${id}:`, error);
        if (!cancelled) setLoaded({ key, state: { status: 'error' } });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [id, key]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  const state: DetailTokoState = loaded?.key === key ? loaded.state : { status: 'loading' };
  return { state, reload };
}
