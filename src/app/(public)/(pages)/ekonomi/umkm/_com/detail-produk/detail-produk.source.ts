import ApiFetch from '@/lib/api-fetch';
import { isDetailTampil, readDetailBody, toDetailProduk, type DetailBody } from './detail-produk.adapter.logic';
import type { DetailProduk } from './detail-produk.types';

/**
 * Detail satu produk UMKM publik. `null` = tidak ditemukan, termasuk produk yang tidak boleh tampil
 * (MITIGASI SEMENTARA(umkm-detail), lihat `isDetailTampil`); galat jaringan/server → Error berkonteks.
 */
export async function loadDetailProduk(id: string): Promise<DetailProduk | null> {
  const res = await ApiFetch.api.ekonomi.umkm.produk({ id }).get();
  const item = readDetailBody(id, res.status, res.data as DetailBody);
  return item && isDetailTampil(item) ? toDetailProduk(item) : null;
}
