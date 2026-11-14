import ApiFetch from '@/lib/api-fetch';
import {
  isLowonganTampil,
  readDetailLowongan,
  toLowonganDetail,
  type LowonganDetailBody,
} from './lowongan-detail.adapter.logic';
import type { LowonganDetail } from './lowongan-detail.types';

/**
 * Detail satu lowongan publik. `null` = tidak ditemukan, termasuk lowongan nonaktif
 * (MITIGASI SEMENTARA(lowongan-detail), lihat `isLowonganTampil`); galat jaringan/server → Error berkonteks.
 * Eden menaruh badan respons non-2xx (404 tak ditemukan) di `error.value`, bukan `data`.
 */
export async function loadLowonganDetail(id: string): Promise<LowonganDetail | null> {
  const res = await ApiFetch.api.ekonomi.lowongankerja({ id }).get();
  const body = (res.error ? res.error.value : res.data) as LowonganDetailBody;
  const item = readDetailLowongan(id, res.status, body);
  return item && isLowonganTampil(item) ? toLowonganDetail(item) : null;
}
