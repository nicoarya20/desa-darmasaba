'use client';
import { useEffect, useState } from 'react';
import type { ProgramInfoEntry, ProgramInfoRecord } from './program-info.logic';

/** Satu bagian halaman: `title` = label cadangan bila judul CMS kosong/gagal; `load` dari source halaman. */
export type ProgramInfoLoader = {
  key: string;
  title: string;
  load: () => Promise<ProgramInfoRecord | null>;
};

export type ProgramInfoState = { status: 'loading' } | { status: 'ready'; entries: ProgramInfoEntry[] };

/** Gabungkan hasil `Promise.allSettled` jadi entri bagian (urutan = urutan loader). */
export function toProgramInfoEntries(
  loaders: readonly ProgramInfoLoader[],
  results: readonly PromiseSettledResult<ProgramInfoRecord | null>[],
): ProgramInfoEntry[] {
  return loaders.map((loader, i) => {
    const result = results[i];
    if (result.status === 'rejected') return { key: loader.key, title: loader.title, html: null, failed: true };
    const record = result.value;
    return {
      key: loader.key,
      title: record?.judul.trim() || loader.title,
      html: record?.deskripsi ?? null,
      failed: false,
    };
  });
}

/**
 * Muat semua bagian paralel sekali saat mount. Satu bagian gagal tidak menggagalkan yang lain.
 * `loaders` harus konstanta modul (referensi stabil), bukan dibuat ulang tiap render.
 */
export function useProgramInfo(loaders: readonly ProgramInfoLoader[]): ProgramInfoState {
  const [state, setState] = useState<ProgramInfoState>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    void Promise.allSettled(loaders.map((loader) => loader.load())).then((results) => {
      results.forEach((result, i) => {
        if (result.status === 'rejected') console.error(`Bagian ${loaders[i].key} gagal dimuat:`, result.reason);
      });
      if (active) setState({ status: 'ready', entries: toProgramInfoEntries(loaders, results) });
    });
    return () => {
      active = false;
    };
  }, [loaders]);

  return state;
}
