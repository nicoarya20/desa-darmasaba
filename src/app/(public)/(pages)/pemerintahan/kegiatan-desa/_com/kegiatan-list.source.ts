import type { KabarPage, KabarPageQuery } from "@/app/(public)/_com/kabar-list/use-kabar-page";
import { readFindMany, type FindManyBody } from "@/app/(public)/_com/main-page/kabar-desa/kabar.source";
import ApiFetch from "@/lib/api-fetch";
import { toKegiatanItem, type KegiatanApiItem } from "./kegiatan-list.logic";

/** Satu halaman kegiatan desa aktif, opsional disaring kata kunci (judul/lokasi) dan/atau nama kategori. */
export async function loadKegiatanPage({ page, limit, search, kategori }: KabarPageQuery): Promise<KabarPage> {
  const query: Record<string, string | number> = { page, limit };
  if (search) query.search = search;
  if (kategori) query.kategori = kategori;
  const res = await ApiFetch.api.desa.kegiatandesa["find-many"].get({ query });
  const body = res.data as (FindManyBody & { totalPages?: number }) | null | undefined;
  const items = readFindMany<KegiatanApiItem>("kegiatan desa", res.status, body).map(toKegiatanItem);
  return { items, totalPages: Math.max(1, Number(body?.totalPages) || 1) };
}
