import { readFindMany, type FindManyBody } from "@/app/(public)/_com/main-page/kabar-desa/kabar.source";
import ApiFetch from "@/lib/api-fetch";
import { toTtg, type InfoTtgApiItem, type Ttg } from "./info-ttg.logic";

export type InfoTtgQuery = { page: number; limit: number; search: string };
/** `total` = jumlah semua entri yang cocok (lintas halaman), dari field `total` find-many. */
export type InfoTtgPage = { items: Ttg[]; totalPages: number; total: number };

/** Satu halaman info teknologi tepat guna aktif (urut terbaru), opsional disaring kata kunci (nama/isi). */
export async function loadInfoTtgPage({ page, limit, search }: InfoTtgQuery): Promise<InfoTtgPage> {
  const query: Record<string, string | number> = { page, limit };
  if (search) query.search = search;
  const res = await ApiFetch.api.inovasi.infotekno["find-many"].get({ query });
  const body = res.data as (FindManyBody & { totalPages?: number; total?: number }) | null | undefined;
  const items = readFindMany<InfoTtgApiItem>("info teknologi tepat guna", res.status, body).map((item) => toTtg(item));
  const total = Number(body?.total);
  return {
    items,
    totalPages: Math.max(1, Number(body?.totalPages) || 1),
    total: Number.isFinite(total) ? total : items.length,
  };
}
