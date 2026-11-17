import { readFindMany, type FindManyBody } from '@/app/(public)/_com/main-page/kabar-desa/kabar.source';
import ApiFetch from '@/lib/api-fetch';
import { KEPENDUDUKAN_FETCH_LIMIT } from './kependudukan-data.logic';
import type { DatasetKey } from './kependudukan-data.types';

/** Nama dataset untuk pesan galat/log. */
export const DATASET_LABEL: Readonly<Record<DatasetKey, string>> = {
  banjar: 'data per banjar',
  umur: 'distribusi umur',
  agama: 'distribusi agama',
  dinamika: 'dinamika penduduk',
};

const query = { page: 1, limit: KEPENDUDUKAN_FETCH_LIMIT };

type FindManyResponse = { status: number; data: unknown };

const FETCHERS: Readonly<Record<DatasetKey, () => Promise<FindManyResponse>>> = {
  banjar: () => ApiFetch.api.kependudukan.databanjar['find-many'].get({ query }),
  umur: () => ApiFetch.api.kependudukan.distribusiumur['find-many'].get({ query }),
  agama: () => ApiFetch.api.kependudukan.distribusiagama['find-many'].get({ query }),
  dinamika: () => ApiFetch.api.kependudukan.dinamikapenduduk['find-many'].get({ query }),
};

/** Semua baris aktif satu dataset (semua tahun, limit eksplisit); respons tak valid → Error berkonteks. */
export async function loadDataset(key: DatasetKey): Promise<unknown[]> {
  const res = await FETCHERS[key]();
  const body = res.data as (FindManyBody & { total?: number }) | null | undefined;
  const items = readFindMany<unknown>(DATASET_LABEL[key], res.status, body);
  const total = Number(body?.total);
  if (Number.isFinite(total) && total > items.length) {
    console.warn(`Kependudukan ${DATASET_LABEL[key]}: ${total} baris, hanya ${items.length} yang dimuat (batas muat klien).`);
  }
  return items;
}
