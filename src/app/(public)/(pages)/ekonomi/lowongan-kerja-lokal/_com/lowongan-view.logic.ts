import {
  activeChips,
  filterLowongan,
  lowonganFacets,
  resolveParams,
  sortLowongan,
  type FilterChip,
  type LowonganFacets,
} from './lowongan-filter.logic';
import { countActiveFilters, type LowonganParams } from './lowongan-params.logic';
import type { Lowongan } from './lowongan.types';

/** Semua yang dirender halaman daftar: pilihan filter, hasil tersaring dan terurut, chip aktif. */
export type LowonganView = {
  /** Params setelah kunci tak dikenal dibuang. */
  params: LowonganParams;
  facets: LowonganFacets;
  items: Lowongan[];
  /** Banyak lowongan yang dimuat (sebelum saring). */
  total: number;
  chips: FilterChip[];
  activeCount: number;
};

/** Susun tampilan dari lowongan yang dimuat + params URL; `nowMs` = waktu acuan filter Waktu tayang. */
export function buildLowonganView(data: readonly Lowongan[], raw: LowonganParams, nowMs: number): LowonganView {
  const facets = lowonganFacets(data, nowMs);
  const params = resolveParams(raw, facets);
  return {
    params,
    facets,
    items: sortLowongan(filterLowongan(data, params, nowMs), params.urut),
    total: data.length,
    chips: activeChips(params, facets),
    activeCount: countActiveFilters(params),
  };
}
