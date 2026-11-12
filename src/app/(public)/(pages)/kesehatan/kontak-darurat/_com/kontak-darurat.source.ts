import { readFindMany, type FindManyBody } from '@/app/(public)/_com/main-page/kabar-desa/kabar.source';
import ApiFetch from '@/lib/api-fetch';
import type { KontakDarurat } from './kontak-darurat.logic';
import { KONTAK_LIST_LIMIT } from './kontak-darurat.meta';

/** Semua kontak darurat kesehatan aktif (satu halaman `KONTAK_LIST_LIMIT`); galat → Error berkonteks. */
export async function loadKontakDaruratList(): Promise<KontakDarurat[]> {
  const res = await ApiFetch.api.kesehatan.kontakdarurat['find-many'].get({
    query: { page: 1, limit: KONTAK_LIST_LIMIT },
  });
  return readFindMany<KontakDarurat>('kontak darurat kesehatan', res.status, res.data as FindManyBody);
}

type DetailBody = { success?: boolean; message?: string; data?: KontakDarurat | null } | null;

const HTTP_NOT_FOUND = 404;

/** Satu kontak (`GET /api/kesehatan/kontakdarurat/:id`). `null` = tidak ditemukan/nonaktif; galat lain → Error. */
export async function loadKontakDaruratDetail(id: string): Promise<KontakDarurat | null> {
  const res = await fetch(`/api/kesehatan/kontakdarurat/${encodeURIComponent(id)}`);
  if (res.status === HTTP_NOT_FOUND) return null;
  if (!res.ok) throw new Error(`detail kontak darurat ${id} gagal (HTTP ${res.status})`);
  const body = (await res.json()) as DetailBody;
  if (!body?.success || !body.data) {
    throw new Error(`detail kontak darurat ${id} gagal: ${body?.message ?? 'respons tidak valid'}`);
  }
  return body.data.isActive === false ? null : body.data;
}
