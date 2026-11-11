import { toBeritaItem, type BeritaApiItem, type KabarItem } from "@/app/(public)/_com/main-page/kabar-desa/kabar.logic";
import { readFindMany, type FindManyBody } from "@/app/(public)/_com/main-page/kabar-desa/kabar.source";
import ApiFetch from "@/lib/api-fetch";

export type BeritaQuery = { page: number; limit: number; search: string; kategori: string };

export type BeritaPage = { items: KabarItem[]; totalPages: number };

/** Satu halaman berita aktif terbaru, opsional disaring kata kunci dan/atau nama kategori. */
export async function loadBeritaPage({ page, limit, search, kategori }: BeritaQuery): Promise<BeritaPage> {
  const query: Record<string, string | number> = { page, limit };
  if (search) query.search = search;
  if (kategori) query.kategori = kategori;
  const res = await ApiFetch.api.desa.berita["find-many"].get({ query });
  const body = res.data as (FindManyBody & { totalPages?: number }) | null | undefined;
  const items = readFindMany<BeritaApiItem>("berita", res.status, body).map(toBeritaItem);
  return { items, totalPages: Math.max(1, Number(body?.totalPages) || 1) };
}
