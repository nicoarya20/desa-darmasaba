import { countProdukPerToko } from './katalog-adapter.logic';
import {
  activeChips,
  expandIds,
  filterProduk,
  filterToko,
  produkFacets,
  resolveParams,
  sortProduk,
  sortToko,
  tokoFacets,
  type FilterChip,
  type ProdukFacets,
  type TokoFacets,
} from './katalog-filter.logic';
import { countActiveFilters, type KatalogParams } from './katalog-params.logic';
import type { KatalogProduk, KatalogToko } from './katalog.types';

type ViewBase = {
  /** Params setelah id tak dikenal dibuang. */
  params: KatalogParams;
  /** Banyak entri yang dimuat (sebelum saring). */
  total: number;
  chips: FilterChip[];
  activeCount: number;
};

/** Semua yang dirender satu tab: pilihan saring, hasil tersaring & terurut, chip aktif. */
export type KatalogView =
  | (ViewBase & { tab: 'produk'; facets: ProdukFacets; items: KatalogProduk[] })
  | (ViewBase & { tab: 'toko'; facets: TokoFacets; items: KatalogToko[]; jumlahProduk: ReadonlyMap<string, number> });

/** Susun tampilan tab aktif dari data yang dimuat + params URL. */
export function buildKatalogView(data: { produk: KatalogProduk[]; toko: KatalogToko[] }, raw: KatalogParams): KatalogView {
  if (raw.tab === 'toko') {
    const facets = tokoFacets(data.toko);
    const params = resolveParams(raw, facets);
    return {
      tab: 'toko',
      facets,
      params,
      items: sortToko(filterToko(data.toko, { ...params, kategori: expandIds(params.kategori, facets.kategori) }), params.urut),
      total: data.toko.length,
      chips: activeChips(params, facets),
      activeCount: countActiveFilters(params),
      jumlahProduk: countProdukPerToko(data.produk),
    };
  }
  const facets = produkFacets(data.produk);
  const params = resolveParams(raw, facets);
  const filterBy = { ...params, kategori: expandIds(params.kategori, facets.kategori), toko: expandIds(params.toko, facets.toko) };
  return {
    tab: 'produk',
    facets,
    params,
    items: sortProduk(filterProduk(data.produk, filterBy), params.urut),
    total: data.produk.length,
    chips: activeChips(params, facets),
    activeCount: countActiveFilters(params),
  };
}
