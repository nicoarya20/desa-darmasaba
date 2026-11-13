'use client';
import { useCallback, useEffect, useState } from 'react';
import type { PolsekTerdekat } from './polsek.logic';
import { loadPolsekList } from './polsek.source';

export type PolsekListState =
  | { status: 'loading' }
  | { status: 'ready'; items: PolsekTerdekat[] }
  | { status: 'error' };

/** Muat semua polsek sekali; `retry` memuat ulang setelah galat. */
export function usePolsekList(): { state: PolsekListState; retry: () => void } {
  const [state, setState] = useState<PolsekListState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    loadPolsekList().then(
      (items) => {
        if (!cancelled) setState({ status: 'ready', items });
      },
      (error: unknown) => {
        console.error('Gagal memuat polsek terdekat:', error);
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
