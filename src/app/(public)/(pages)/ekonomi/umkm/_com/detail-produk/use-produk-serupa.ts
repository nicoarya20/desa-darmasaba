import { useLazyLoad, type LoadState } from '@/app/(public)/_com/lazy-load/use-lazy-load';
import { useMemo } from 'react';
import { loadKatalogProduk } from '../katalog/katalog.source';
import type { KatalogProduk } from '../katalog/katalog.types';
import { pickProdukSerupa, type ProdukSerupaAcuan } from './produk-serupa.logic';

/** Muat produk katalog sekali, lalu pilih produk serupa untuk produk yang sedang dibuka; `retry` memuat ulang. */
export function useProdukSerupa({ id, kategoriNama, umkmId }: ProdukSerupaAcuan) {
  const { state: load, retry } = useLazyLoad(loadKatalogProduk, true, 'produk serupa UMKM');

  const state = useMemo<LoadState<KatalogProduk[]>>(
    () => (load.status === 'ready' ? { status: 'ready', data: pickProdukSerupa(load.data, { id, kategoriNama, umkmId }) } : load),
    [load, id, kategoriNama, umkmId],
  );

  return { state, retry };
}
