import { useCallback, useEffect, useState } from 'react';
import type { MuatState } from './program-kemiskinan.types';

type Tersimpan<T> = { kunci: string; state: MuatState<T> };

/**
 * Muat data setiap `kunci` berubah (mis. tahun/halaman/cari). `load` mengembalikan `null` = tidak ditemukan.
 * Status "loading" diturunkan dari kunci yang belum selesai dimuat (tanpa setState sinkron di efek);
 * hasil permintaan lama yang selesai belakangan diabaikan. `retry` memuat ulang kunci yang sama.
 */
export function useMuat<T>(kunci: string, load: () => Promise<T | null>, what: string) {
  const [attempt, setAttempt] = useState(0);
  const [hasil, setHasil] = useState<Tersimpan<T> | null>(null);
  const kunciPenuh = `${kunci}#${attempt}`;

  useEffect(() => {
    let batal = false;
    load().then(
      (data) => {
        if (!batal) setHasil({ kunci: kunciPenuh, state: data === null ? { status: 'notFound' } : { status: 'ready', data } });
      },
      (error: unknown) => {
        console.error(`Gagal memuat ${what}:`, error);
        if (!batal) setHasil({ kunci: kunciPenuh, state: { status: 'error' } });
      },
    );
    return () => {
      batal = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `load` & `what` mengikuti kunci; pemicu muat = kunciPenuh
  }, [kunciPenuh]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);
  const state: MuatState<T> = hasil?.kunci === kunciPenuh ? hasil.state : { status: 'loading' };
  return { state, retry };
}
