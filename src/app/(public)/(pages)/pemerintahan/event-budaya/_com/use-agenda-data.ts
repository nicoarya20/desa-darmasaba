'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AGENDA_MENDATANG_LIMIT, AGENDA_TAHUN_LIMIT } from './agenda.meta';
import { loadAgendaMendatang, loadAgendaTahun } from './agenda.source';
import type { AgendaItem } from './kalender.logic';

type Muat<T> = { data: T | null; error: boolean };

/** Acara satu tahun; hasil per tahun disimpan agar pindah bulan bolak-balik tidak memuat ulang. */
export function useAgendaTahun(tahun: number) {
  const cache = useRef(new Map<number, AgendaItem[]>());
  const [state, setState] = useState<Muat<AgendaItem[]> & { tahun: number }>({ tahun, data: null, error: false });
  const [percobaan, setPercobaan] = useState(0);

  useEffect(() => {
    const tersimpan = cache.current.get(tahun);
    if (tersimpan) {
      setState({ tahun, data: tersimpan, error: false });
      return;
    }
    let batal = false;
    setState({ tahun, data: null, error: false });
    loadAgendaTahun(tahun, AGENDA_TAHUN_LIMIT).then(
      (items) => {
        cache.current.set(tahun, items);
        if (!batal) setState({ tahun, data: items, error: false });
      },
      (e: unknown) => {
        console.error(`Gagal memuat agenda tahun ${tahun}:`, e);
        if (!batal) setState({ tahun, data: null, error: true });
      },
    );
    return () => {
      batal = true;
    };
  }, [tahun, percobaan]);

  const muatUlang = useCallback(() => setPercobaan((n) => n + 1), []);
  // Selama tahun baru dimuat, jangan tampilkan data tahun sebelumnya.
  const sesuai = state.tahun === tahun;
  return { items: sesuai ? state.data : null, error: sesuai && state.error, muatUlang };
}

/** Acara mendatang (dimuat sekali per kunjungan halaman). */
export function useAgendaMendatang() {
  const [state, setState] = useState<Muat<{ items: AgendaItem[]; total: number }>>({ data: null, error: false });

  useEffect(() => {
    let batal = false;
    loadAgendaMendatang(AGENDA_MENDATANG_LIMIT).then(
      (data) => !batal && setState({ data, error: false }),
      (e: unknown) => {
        console.error('Gagal memuat acara mendatang:', e);
        if (!batal) setState({ data: null, error: true });
      },
    );
    return () => {
      batal = true;
    };
  }, []);

  return state;
}
