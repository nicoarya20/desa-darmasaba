import { useEffect, useState } from 'react';
import type { PengurusDetail } from '../bumdes.logic';
import { loadPengurusDetail } from '../bumdes.source';

export type PengurusDetailState =
  | { status: 'loading' }
  | { status: 'ready'; data: PengurusDetail }
  | { status: 'notfound' }
  | { status: 'error' };

type Loaded = { id: string; state: PengurusDetailState };

/** Profil pengurus BUMDes untuk `id`; ganti id → kembali "loading" (data id lama tidak ditampilkan). */
export function usePengurusDetail(id: string): PengurusDetailState {
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadPengurusDetail(id).then(
      (data) => {
        if (!cancelled) setLoaded({ id, state: data ? { status: 'ready', data } : { status: 'notfound' } });
      },
      (error: unknown) => {
        console.error(`Gagal memuat profil pengurus ${id} (BUMDes):`, error);
        if (!cancelled) setLoaded({ id, state: { status: 'error' } });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [id]);

  return loaded?.id === id ? loaded.state : { status: 'loading' };
}
