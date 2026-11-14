'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Musik } from './music.types';

/** Batas muat pustaka sekali jalan (endpoint dipaginasi, klien memuat satu halaman). */
const MUSIK_LOAD_LIMIT = 50;

/** MITIGASI: pustaka hanya memuat MUSIK_LOAD_LIMIT lagu pertama; beri tahu bila server punya lebih. */
function warnTruncated(total: unknown, loaded: number) {
  const count = Number(total);
  if (Number.isFinite(count) && count > loaded) {
    console.warn(`Musik Desa: ${count} lagu di server, hanya ${loaded} pertama yang dimuat (batas ${MUSIK_LOAD_LIMIT}).`);
  }
}

/**
 * Pustaka lagu aktif dari GET /api/desa/musik/find-many, dimuat sekali saat mount. `loadError` = muat terakhir
 * gagal (HTTP bukan 2xx, `success:false`, atau jaringan/JSON); `loadMusikData()` dipakai juga sebagai "Coba lagi".
 * Data lama dipertahankan saat muat ulang gagal.
 */
export function useMusicLibraryLoader() {
  const [musikData, setMusikData] = useState<Musik[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const loadMusikData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(false);
    const fail = (reason: string) => {
      console.error(`Musik Desa: gagal memuat pustaka lagu (${reason}).`);
      setLoadError(true);
    };
    try {
      const res = await fetch(`/api/desa/musik/find-many?page=1&limit=${MUSIK_LOAD_LIMIT}`);
      if (!res.ok) {
        fail(`HTTP ${res.status}`);
        return;
      }
      const data = await res.json();
      if (!data?.success || !Array.isArray(data.data)) {
        fail(`HTTP ${res.status}, success:${String(data?.success)}`);
        return;
      }
      warnTruncated(data.total, data.data.length);
      setMusikData(data.data.filter((m: Musik) => m.isActive));
    } catch (error) {
      fail(`jaringan/JSON: ${error instanceof Error ? error.name : typeof error}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMusikData();
  }, [loadMusikData]);

  return { musikData, isLoading, loadError, loadMusikData };
}
