import { useLazyLoad, type LoadState } from '@/app/(public)/_com/lazy-load/use-lazy-load';
import { useCallback } from 'react';
import { loadKatalogProduk, loadKatalogToko } from './katalog.source';
import type { KatalogProduk, KatalogToko } from './katalog.types';

/** Data katalog: produk & UMKM, dimuat sekali saat halaman dibuka (keduanya perlu: jumlah produk per toko). */
export type KatalogData = { produk: KatalogProduk[]; toko: KatalogToko[] };

/** Gabungkan dua status muat: galat bila salah satu galat, siap bila keduanya siap. */
export function combineLoad(produk: LoadState<KatalogProduk[]>, toko: LoadState<KatalogToko[]>): LoadState<KatalogData> {
  if (produk.status === 'error' || toko.status === 'error') return { status: 'error' };
  if (produk.status === 'ready' && toko.status === 'ready') {
    return { status: 'ready', data: { produk: produk.data, toko: toko.data } };
  }
  return { status: 'loading' };
}

/** Muat produk & UMKM sekali; `retry` memuat ulang yang gagal saja (yang sudah siap disimpan). */
export function useKatalogData() {
  const produk = useLazyLoad(loadKatalogProduk, true, 'produk katalog UMKM');
  const toko = useLazyLoad(loadKatalogToko, true, 'daftar UMKM katalog');
  const retryProduk = produk.retry;
  const retryToko = toko.retry;
  const produkFailed = produk.state.status === 'error';
  const tokoFailed = toko.state.status === 'error';

  const retry = useCallback(() => {
    if (produkFailed) retryProduk();
    if (tokoFailed) retryToko();
  }, [produkFailed, tokoFailed, retryProduk, retryToko]);

  return { state: combineLoad(produk.state, toko.state), retry };
}
