'use client';
import { useCallback, useEffect, useState } from 'react';
import type { KontakDarurat } from './kontak-darurat.logic';
import { loadKontakDaruratDetail, loadKontakDaruratList } from './kontak-darurat.source';

export type KontakListState =
  | { status: 'loading' }
  | { status: 'ready'; items: KontakDarurat[] }
  | { status: 'error' };

/** Muat semua kontak sekali; `retry` memuat ulang setelah galat. */
export function useKontakDaruratList(): { state: KontakListState; retry: () => void } {
  const [state, setState] = useState<KontakListState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    loadKontakDaruratList().then(
      (items) => {
        if (!cancelled) setState({ status: 'ready', items });
      },
      (error: unknown) => {
        console.error('Gagal memuat kontak darurat kesehatan:', error);
        if (!cancelled) setState({ status: 'error' });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((n) => n + 1);
  }, []);

  return { state, retry };
}

export type KontakDetailState =
  | { status: 'loading' }
  | { status: 'ready'; data: KontakDarurat }
  | { status: 'notfound' }
  | { status: 'error' };

type Loaded = { key: string; state: KontakDetailState };

/** Detail kontak untuk `id`; ganti id atau `retry` → kembali "loading" (data lama tidak ditampilkan). */
export function useKontakDaruratDetail(id: string): { state: KontakDetailState; retry: () => void } {
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const key = `${id}#${attempt}`;

  useEffect(() => {
    let cancelled = false;
    loadKontakDaruratDetail(id).then(
      (data) => {
        if (!cancelled) setLoaded({ key, state: data ? { status: 'ready', data } : { status: 'notfound' } });
      },
      (error: unknown) => {
        console.error(`Gagal memuat kontak darurat ${id}:`, error);
        if (!cancelled) setLoaded({ key, state: { status: 'error' } });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [id, key]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  return { state: loaded?.key === key ? loaded.state : { status: 'loading' }, retry };
}
