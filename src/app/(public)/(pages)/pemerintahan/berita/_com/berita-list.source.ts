import type { KabarPage, KabarPageQuery } from "@/app/(public)/_com/kabar-list/use-kabar-page";
import { toBeritaItem, type BeritaApiItem } from "@/app/(public)/_com/main-page/kabar-desa/kabar.logic";
import { readFindMany, type FindManyBody } from "@/app/(public)/_com/main-page/kabar-desa/kabar.source";
import ApiFetch from "@/lib/api-fetch";

/** Satu halaman berita aktif terbaru, opsional disaring kata kunci dan/atau nama kategori. */
export async function loadBeritaPage({ page, limit, search, kategori }: KabarPageQuery): Promise<KabarPage> {
  const query: Record<string, string | number> = { page, limit };
  if (search) query.search = search;
  if (kategori) query.kategori = kategori;
  const res = await ApiFetch.api.desa.berita["find-many"].get({ query });
  const body = res.data as (FindManyBody & { totalPages?: number }) | null | undefined;
  const items = readFindMany<BeritaApiItem>("berita", res.status, body).map(toBeritaItem);
  return { items, totalPages: Math.max(1, Number(body?.totalPages) || 1) };
}
