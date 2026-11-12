import { readFindMany, type FindManyBody } from "@/app/(public)/_com/main-page/kabar-desa/kabar.source";
import ApiFetch from "@/lib/api-fetch";
import { toTip, type Tip, type TipsKeamananApiItem } from "./tips-keamanan.logic";

export type TipsPageQuery = { page: number; limit: number; search: string };
/** `total` = jumlah semua tips yang cocok (lintas halaman), dari field `total` find-many. */
export type TipsPage = { tips: Tip[]; totalPages: number; total: number };

/** Satu halaman tips keamanan aktif (urut terbaru), opsional disaring kata kunci (judul/isi). */
export async function loadTipsKeamananPage({ page, limit, search }: TipsPageQuery): Promise<TipsPage> {
  const query: Record<string, string | number> = { page, limit };
  if (search) query.search = search;
  const res = await ApiFetch.api.keamanan.menutipskeamanan["find-many"].get({ query });
  const body = res.data as (FindManyBody & { totalPages?: number; total?: number }) | null | undefined;
  const tips = readFindMany<TipsKeamananApiItem>("tips keamanan", res.status, body).map(toTip);
  const total = Number(body?.total);
  return { tips, totalPages: Math.max(1, Number(body?.totalPages) || 1), total: Number.isFinite(total) ? total : tips.length };
}
