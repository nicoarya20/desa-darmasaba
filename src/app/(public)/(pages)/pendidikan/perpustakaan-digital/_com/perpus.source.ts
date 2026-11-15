import { readFindMany, type FindManyBody } from '@/app/(public)/_com/main-page/kabar-desa/kabar.source';
import ApiFetch from '@/lib/api-fetch';
import { readBukuDetail, toBuku, type BukuApiItem, type BukuDetailBody } from './perpus-adapter.logic';
import { PERPUS_LIST_LIMIT } from './perpus.meta';
import type { Buku } from './perpus.types';

type ListBody = (FindManyBody & { total?: number }) | null | undefined;

/** Peringatan bila server punya lebih banyak buku dari batas muat klien (lihat PERPUS_LIST_LIMIT). */
function warnTruncated(body: ListBody, loaded: number) {
  const total = Number(body?.total);
  if (Number.isFinite(total) && total > loaded) {
    console.warn(`Perpustakaan digital: ${total} buku, hanya ${loaded} pertama yang dimuat (batas saring klien).`);
  }
}

/** Buku aktif (maks PERPUS_LIST_LIMIT, terbaru dari API) dalam bentuk publik; galat → Error berkonteks. */
export async function loadKatalogBuku(): Promise<Buku[]> {
  const res = await ApiFetch.api.pendidikan.perpustakaandigital.dataperpustakaan.findMany.get({
    query: { page: 1, limit: PERPUS_LIST_LIMIT },
  });
  const body = res.data as ListBody;
  const items = readFindMany<BukuApiItem>('perpustakaan digital', res.status, body);
  warnTruncated(body, items.length);
  return items.map(toBuku);
}

/** Detail satu buku. `null` = tidak ditemukan atau nonaktif (lihat readBukuDetail); galat → Error berkonteks. */
export async function loadBukuDetail(id: string): Promise<Buku | null> {
  const res = await ApiFetch.api.pendidikan.perpustakaandigital.dataperpustakaan({ id }).get();
  const body = (res.error ? res.error.value : res.data) as BukuDetailBody;
  const item = readBukuDetail(id, res.status, body);
  return item ? toBuku(item) : null;
}
