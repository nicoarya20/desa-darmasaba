import ApiFetch from '@/lib/api-fetch';
import { loadHargaTampil, terapkanHarga } from '../../_lib/harga-publik.source';
import { isDetailTampil, readDetailBody, toDetailProduk, type DetailBody } from './detail-produk.adapter.logic';
import type { DetailProduk } from './detail-produk.types';

/**
 * Detail satu produk UMKM publik. `null` = tidak ditemukan, termasuk produk yang tidak boleh tampil
 * (MITIGASI SEMENTARA(umkm-detail), lihat `isDetailTampil`); harga null bila admin menyembunyikannya.
 * Galat jaringan/server → Error berkonteks.
 */
export async function loadDetailProduk(id: string): Promise<DetailProduk | null> {
  const [res, hargaTampil] = await Promise.all([ApiFetch.api.ekonomi.umkm.produk({ id }).get(), loadHargaTampil()]);
  const item = readDetailBody(id, res.status, res.data as DetailBody);
  return item && isDetailTampil(item) ? terapkanHarga(toDetailProduk(item), hargaTampil) : null;
}
