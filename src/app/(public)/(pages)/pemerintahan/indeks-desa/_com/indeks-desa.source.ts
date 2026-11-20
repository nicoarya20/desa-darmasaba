import ApiFetch from '@/lib/api-fetch';
import { INDEKS_DESA_MAX_LIMIT, type IndeksDesaRecord } from '@/lib/indeks-desa';

type FindManyBody = { success?: boolean; message?: string; data?: unknown } | null;

/** Semua data IDM aktif, tahun terbaru dulu (sekali muat; satu halaman API memuat semua tahun yang sah). Gagal → Error berkonteks. */
export async function loadIndeksDesa(): Promise<IndeksDesaRecord[]> {
  const res = await ApiFetch.api.desa.indeksdesa['find-many'].get({ query: { page: 1, limit: INDEKS_DESA_MAX_LIMIT } });
  const body = res.data as FindManyBody | undefined;
  if (res.status !== 200 || !body?.success || !Array.isArray(body.data)) {
    throw new Error(`find-many indeks desa gagal (HTTP ${res.status}): ${body?.message ?? 'respons tidak valid'}`);
  }
  return body.data as IndeksDesaRecord[];
}
