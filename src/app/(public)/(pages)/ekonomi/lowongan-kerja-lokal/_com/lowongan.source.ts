import { readFindMany, type FindManyBody } from '@/app/(public)/_com/main-page/kabar-desa/kabar.source';
import ApiFetch from '@/lib/api-fetch';
import { toLowongan, type LowonganApiItem } from './lowongan-adapter.logic';
import { LOWONGAN_LIST_LIMIT } from './lowongan-filter.meta';
import type { Lowongan } from './lowongan.types';

type ListBody = (FindManyBody & { total?: number }) | null | undefined;

/** Peringatan bila server punya lebih banyak lowongan dari batas muat klien (lihat LOWONGAN_LIST_LIMIT). */
function warnTruncated(body: ListBody, loaded: number) {
  const total = Number(body?.total);
  if (Number.isFinite(total) && total > loaded) {
    console.warn(`Lowongan kerja: ${total} lowongan, hanya ${loaded} pertama yang dimuat (batas saring klien).`);
  }
}

/** Lowongan aktif (maks LOWONGAN_LIST_LIMIT, urut terbaru dari API) dalam bentuk daftar publik; galat → Error berkonteks. */
export async function loadLowongan(): Promise<Lowongan[]> {
  const res = await ApiFetch.api.ekonomi.lowongankerja['find-many'].get({
    query: { page: 1, limit: LOWONGAN_LIST_LIMIT },
  });
  const body = res.data as ListBody;
  const items = readFindMany<LowonganApiItem>('lowongan kerja', res.status, body);
  warnTruncated(body, items.length);
  return items.map(toLowongan);
}
