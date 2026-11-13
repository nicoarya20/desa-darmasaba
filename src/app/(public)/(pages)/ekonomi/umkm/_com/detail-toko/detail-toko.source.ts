import ApiFetch from '@/lib/api-fetch';
import { isTokoTampil, readTokoBody, toDetailToko, type TokoBody } from './detail-toko.adapter.logic';
import type { DetailToko } from './detail-toko.types';

/**
 * Detail satu toko UMKM publik beserta produknya. `null` = tidak ditemukan, termasuk UMKM yang tidak boleh tampil
 * (MITIGASI SEMENTARA(umkm-detail-toko), lihat `isTokoTampil`); galat jaringan/server → Error berkonteks.
 */
export async function loadDetailToko(id: string): Promise<DetailToko | null> {
  const res = await ApiFetch.api.ekonomi.umkm({ id }).get();
  const item = readTokoBody(id, res.status, res.data as TokoBody);
  return item && isTokoTampil(item) ? toDetailToko(item) : null;
}
