import ApiFetch from '@/lib/api-fetch';
import { LEMBAGA_KOMUNITAS_MAX_LIMIT, type LembagaKomunitasRecord } from '@/lib/lembaga-komunitas';

/** Pengaman jumlah halaman yang dimuat (maks 5 × 100 lembaga); jauh di atas jumlah lembaga desa yang wajar. */
export const LEMBAGA_KOMUNITAS_MAX_HALAMAN = 5;

type FindManyBody = { success?: boolean; message?: string; data?: unknown; totalPages?: number } | null;

/** Semua lembaga aktif (halaman demi halaman sampai habis atau batas pengaman). Gagal → Error berkonteks. */
export async function loadLembagaKomunitas(): Promise<LembagaKomunitasRecord[]> {
  const hasil: LembagaKomunitasRecord[] = [];
  for (let page = 1; page <= LEMBAGA_KOMUNITAS_MAX_HALAMAN; page += 1) {
    const res = await ApiFetch.api.desa.lembagakomunitas['find-many'].get({ query: { page, limit: LEMBAGA_KOMUNITAS_MAX_LIMIT } });
    const body = res.data as FindManyBody | undefined;
    if (res.status !== 200 || !body?.success || !Array.isArray(body.data)) {
      throw new Error(`find-many lembaga komunitas halaman ${page} gagal (HTTP ${res.status}): ${body?.message ?? 'respons tidak valid'}`);
    }
    hasil.push(...(body.data as LembagaKomunitasRecord[]));
    if (page >= (body.totalPages ?? 1)) break;
  }
  return hasil;
}
