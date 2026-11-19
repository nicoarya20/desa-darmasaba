'use client';

import { useCallback, useRef, useState } from 'react';
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
 * Pustaka lagu aktif dari GET /api/desa/musik/find-many. TIDAK dimuat saat mount: provider ada di root layout, jadi
 * muat saat mount = satu fetch di setiap halaman (termasuk beranda, berebut jaringan dengan foto hero). Pustaka
 * diminta lewat `ensureMusikData()` oleh yang butuh (aplikasi Musik Desa); panggilan berikutnya tidak fetch ulang.
 * `isLoading` true sejak awal sampai muat pertama selesai, supaya halaman Musik menampilkan kerangka (bukan
 * "Belum ada lagu") di render pertamanya. `loadError` = muat terakhir gagal (HTTP bukan 2xx, `success:false`, atau
 * jaringan/JSON); `loadMusikData()` dipakai sebagai "Coba lagi". Data lama dipertahankan saat muat ulang gagal.
 */
export function useMusicLibraryLoader() {
  const [musikData, setMusikData] = useState<Musik[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  // Ref (bukan state): cukup mencegah fetch ganda, tidak perlu memicu render.
  const requestedRef = useRef(false);

  const loadMusikData = useCallback(async () => {
    requestedRef.current = true;
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

  const ensureMusikData = useCallback(() => {
    if (requestedRef.current) return;
    // loadMusikData menangani & mencatat galatnya sendiri (loadError), promise-nya tidak pernah menolak.
    void loadMusikData();
  }, [loadMusikData]);

  return { musikData, isLoading, loadError, loadMusikData, ensureMusikData };
}
