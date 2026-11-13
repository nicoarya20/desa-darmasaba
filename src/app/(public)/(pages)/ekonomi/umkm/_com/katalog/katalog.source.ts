import { readFindMany, type FindManyBody } from '@/app/(public)/_com/main-page/kabar-desa/kabar.source';
import ApiFetch from '@/lib/api-fetch';
import {
  isProdukTampil,
  isTokoAktif,
  toKatalogProduk,
  toKatalogToko,
  type ProdukApiItem,
  type TokoApiItem,
} from './katalog-adapter.logic';
import { KATALOG_LIST_LIMIT } from './katalog-filter.meta';
import type { KatalogProduk, KatalogToko } from './katalog.types';

type ListBody = (FindManyBody & { total?: number }) | null | undefined;

/** Peringatan bila server punya lebih banyak entri dari batas muat klien (lihat KATALOG_LIST_LIMIT). */
function warnTruncated(what: string, body: ListBody, loaded: number) {
  const total = Number(body?.total);
  if (Number.isFinite(total) && total > loaded) {
    console.warn(`Katalog UMKM: ${total} ${what}, hanya ${loaded} pertama yang dimuat (batas saring klien).`);
  }
}

/** Produk UMKM aktif (maks KATALOG_LIST_LIMIT, urut terbaru), tanpa produk milik UMKM nonaktif; galat → Error berkonteks. */
export async function loadKatalogProduk(): Promise<KatalogProduk[]> {
  const res = await ApiFetch.api.ekonomi.umkm.produk['find-many'].get({
    query: { page: 1, limit: KATALOG_LIST_LIMIT },
  });
  const body = res.data as ListBody;
  const items = readFindMany<ProdukApiItem>('produk UMKM', res.status, body);
  warnTruncated('produk', body, items.length);
  return items.filter(isProdukTampil).map(toKatalogProduk);
}

/** UMKM (maks KATALOG_LIST_LIMIT), tanpa yang nonaktif; galat → Error berkonteks. */
export async function loadKatalogToko(): Promise<KatalogToko[]> {
  const res = await ApiFetch.api.ekonomi.umkm['find-many'].get({ query: { page: 1, limit: KATALOG_LIST_LIMIT } });
  const body = res.data as ListBody;
  const items = readFindMany<TokoApiItem>('UMKM', res.status, body);
  warnTruncated('UMKM', body, items.length);
  return items.filter(isTokoAktif).map(toKatalogToko);
}
