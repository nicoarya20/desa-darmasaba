import ApiFetch from '@/lib/api-fetch';
import { isDataTampil } from '../detail-umkm/detail-umkm.logic';
import { readTokoBody, toDetailToko, type TokoBody } from './detail-toko.adapter.logic';
import type { DetailToko } from './detail-toko.types';

/**
 * Detail satu toko UMKM publik beserta produknya. `null` = tidak ditemukan; galat jaringan/server → Error berkonteks.
 * MITIGASI SEMENTARA(umkm-detail-toko): endpoint mengirim UMKM nonaktif/terhapus (docs/BACKEND-TODO.md P2), jadi
 * yang gagal `isDataTampil` juga dianggap tidak ditemukan; hapus setelah endpoint memfilter sendiri.
 */
export async function loadDetailToko(id: string): Promise<DetailToko | null> {
  const res = await ApiFetch.api.ekonomi.umkm({ id }).get();
  const item = readTokoBody(id, res.status, res.data as TokoBody);
  return item && isDataTampil(item) ? toDetailToko(item) : null;
}
