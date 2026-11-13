import { readFindMany, type FindManyBody } from '@/app/(public)/_com/main-page/kabar-desa/kabar.source';
import ApiFetch from '@/lib/api-fetch';
import type { KategoriKontak } from './kontak-keamanan.logic';
import { KATEGORI_LIST_LIMIT } from './kontak-keamanan.meta';

/**
 * Semua kategori kontak darurat keamanan aktif beserta kontaknya (satu halaman `KATEGORI_LIST_LIMIT`).
 * Path backend memakai `findMany` (camelCase), bukan `find-many`. Galat → Error berkonteks.
 */
export async function loadKategoriKontak(): Promise<KategoriKontak[]> {
  const res = await ApiFetch.api.keamanan.kontakdaruratkeamanan.findMany.get({
    query: { page: 1, limit: KATEGORI_LIST_LIMIT },
  });
  return readFindMany<KategoriKontak>('kontak darurat keamanan', res.status, res.data as FindManyBody);
}
