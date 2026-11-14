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

/** Pustaka lagu aktif dari GET /api/desa/musik/find-many, dimuat sekali saat mount. */
export function useMusicLibraryLoader() {
  const [musikData, setMusikData] = useState<Musik[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMusikData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/desa/musik/find-many?page=1&limit=${MUSIK_LOAD_LIMIT}`);
      const data = await res.json();
      if (data.success && data.data) {
        warnTruncated(data.total, data.data.length);
        const activeMusik = data.data.filter((m: Musik) => m.isActive);
        setMusikData(activeMusik);
      }
    } catch (error) {
      console.error('Error fetching musik:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMusikData();
  }, [loadMusikData]);

  return { musikData, isLoading, loadMusikData };
}
