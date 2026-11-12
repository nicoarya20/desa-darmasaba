'use client';
import { useCallback, useEffect, useState } from 'react';
import { toGroups, type KontakGroup } from './kontak-keamanan.logic';
import { loadKategoriKontak } from './kontak-keamanan.source';

export type KontakKeamananState =
  | { status: 'loading' }
  | { status: 'ready'; groups: KontakGroup[] }
  | { status: 'error' };

/** Muat semua kategori sekali lalu kelompokkan; `retry` memuat ulang setelah galat. */
export function useKontakKeamanan(): { state: KontakKeamananState; retry: () => void } {
  const [state, setState] = useState<KontakKeamananState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    loadKategoriKontak().then(
      (kategori) => {
        if (!cancelled) setState({ status: 'ready', groups: toGroups(kategori) });
      },
      (error: unknown) => {
        console.error('Gagal memuat kontak darurat keamanan:', error);
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
