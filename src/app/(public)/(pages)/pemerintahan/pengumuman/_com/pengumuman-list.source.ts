import type { KabarPage, KabarPageQuery } from "@/app/(public)/_com/kabar-list/use-kabar-page";
import { toPengumumanItem, type PengumumanApiItem } from "@/app/(public)/_com/main-page/kabar-desa/kabar.logic";
import { readFindMany, type FindManyBody } from "@/app/(public)/_com/main-page/kabar-desa/kabar.source";
import ApiFetch from "@/lib/api-fetch";

/** Satu halaman pengumuman aktif terbaru, opsional disaring kata kunci dan/atau nama kategori. */
export async function loadPengumumanPage({ page, limit, search, kategori }: KabarPageQuery): Promise<KabarPage> {
  const query: Record<string, string | number> = { page, limit };
  if (search) query.search = search;
  if (kategori) query.kategori = kategori;
  const res = await ApiFetch.api.desa.pengumuman["find-many"].get({ query });
  const body = res.data as (FindManyBody & { totalPages?: number }) | null | undefined;
  const items = readFindMany<PengumumanApiItem>("pengumuman", res.status, body).map(toPengumumanItem);
  return { items, totalPages: Math.max(1, Number(body?.totalPages) || 1) };
}
