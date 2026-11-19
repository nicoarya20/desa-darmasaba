import ApiFetch from '@/lib/api-fetch';
import type { ProdukHukumRecord } from '@/lib/produk-hukum';
import type { ProdukHukumFilter } from './produk-hukum.logic';

/** Satu halaman daftar produk hukum dari API plus jumlah total (untuk paginasi dan keadaan kosong). */
export type ProdukHukumPageData = { items: ProdukHukumRecord[]; total: number; totalPages: number };

/** Query satu halaman: filter + nomor halaman dan ukuran halaman. */
export type ProdukHukumQuery = ProdukHukumFilter & { limit: number };

type FindManyBody = { success?: boolean; message?: string; data?: unknown; total?: number; totalPages?: number } | null;

/** Muat satu halaman produk hukum aktif (GET publik). Gagal → Error berkonteks (status + pesan API). */
export async function loadProdukHukum(query: ProdukHukumQuery): Promise<ProdukHukumPageData> {
  const params: Record<string, string | number> = { page: query.page, limit: query.limit };
  if (query.kategori) params.kategori = query.kategori;
  if (query.search) params.q = query.search;
  const res = await ApiFetch.api.desa.produkhukum['find-many'].get({ query: params });
  const body = res.data as FindManyBody | undefined;
  if (res.status !== 200 || !body?.success || !Array.isArray(body.data)) {
    throw new Error(`find-many produk hukum gagal (HTTP ${res.status}): ${body?.message ?? 'respons tidak valid'}`);
  }
  return {
    items: body.data as ProdukHukumRecord[],
    total: Number(body.total) || 0,
    totalPages: Math.max(1, Number(body.totalPages) || 1),
  };
}
