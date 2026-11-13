import { useCallback, useEffect, useState } from 'react';
import { loadDetailProduk } from './detail-produk.source';
import type { DetailProdukState } from './detail-produk.types';

type Loaded = { key: string; state: DetailProdukState };

/**
 * Detail produk untuk `id`. Ganti id atau `reload` → kembali "loading" (data id/percobaan lama tidak ditampilkan).
 * Tidak memakai state admin `umkmState.produk.findUnique` (tanpa status galat dan datanya global).
 */
export function useDetailProduk(id: string) {
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const key = `${id}#${attempt}`;

  useEffect(() => {
    let cancelled = false;
    loadDetailProduk(id).then(
      (data) => {
        if (!cancelled) setLoaded({ key, state: data ? { status: 'ready', data } : { status: 'notFound' } });
      },
      (error: unknown) => {
        console.error(`Gagal memuat detail produk UMKM ${id}:`, error);
        if (!cancelled) setLoaded({ key, state: { status: 'error' } });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [id, key]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  const state: DetailProdukState = loaded?.key === key ? loaded.state : { status: 'loading' };
  return { state, reload };
}
