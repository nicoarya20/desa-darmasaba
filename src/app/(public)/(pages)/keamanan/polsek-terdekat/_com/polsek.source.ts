import { readFindMany, type FindManyBody } from '@/app/(public)/_com/main-page/kabar-desa/kabar.source';
import ApiFetch from '@/lib/api-fetch';
import type { PolsekTerdekat } from './polsek.logic';
import { POLSEK_LIST_LIMIT } from './polsek.meta';

/** Semua polsek aktif (satu halaman `POLSEK_LIST_LIMIT`); galat API → Error berkonteks, bukan daftar kosong. */
export async function loadPolsekList(): Promise<PolsekTerdekat[]> {
  const res = await ApiFetch.api.keamanan.polsekterdekat['find-many'].get({
    query: { page: 1, limit: POLSEK_LIST_LIMIT },
  });
  return readFindMany<PolsekTerdekat>('polsek terdekat', res.status, res.data as FindManyBody);
}
