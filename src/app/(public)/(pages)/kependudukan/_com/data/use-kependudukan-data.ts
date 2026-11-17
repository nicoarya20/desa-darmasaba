import { useCallback, useEffect, useMemo, useState } from 'react';
import { toDatasetSlice, type DatasetLoad } from './kependudukan-data.logic';
import { DATASET_LABEL, loadDataset } from './kependudukan-data.source';
import type { DatasetKey, DatasetSlice, KependudukanData } from './kependudukan-data.types';

/** Satu dataset: muat saat dibuka, `retry` memuat ulang dataset ini saja (dataset lain tidak ikut). */
function useDataset(key: DatasetKey): DatasetSlice {
  const [attempt, setAttempt] = useState(0);
  const [load, setLoad] = useState<DatasetLoad>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    loadDataset(key).then(
      (rows) => {
        if (!cancelled) setLoad({ status: 'ready', rows });
      },
      (error: unknown) => {
        console.error(`Gagal memuat ${DATASET_LABEL[key]} (Dashboard Kependudukan):`, error);
        if (!cancelled) setLoad({ status: 'error' });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [key, attempt]);

  const retry = useCallback(() => {
    setLoad({ status: 'loading' });
    setAttempt((n) => n + 1);
  }, []);

  return useMemo(() => toDatasetSlice(load, retry), [load, retry]);
}

/** Empat dataset Dashboard Kependudukan, dimuat paralel sekali; tiap section memakai tahun terbaru datasetnya. */
export function useKependudukanData(): KependudukanData {
  const banjar = useDataset('banjar');
  const umur = useDataset('umur');
  const agama = useDataset('agama');
  const dinamika = useDataset('dinamika');
  return useMemo(() => ({ banjar, umur, agama, dinamika }), [banjar, umur, agama, dinamika]);
}
