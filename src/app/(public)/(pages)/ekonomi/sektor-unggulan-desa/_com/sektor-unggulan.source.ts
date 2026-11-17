import { readFindMany, type FindManyBody } from "@/app/(public)/_com/main-page/kabar-desa/kabar.source";
import ApiFetch from "@/lib/api-fetch";
import { toSektor, type Sektor, type SektorApiItem } from "./sektor-unggulan.logic";
import { SEKTOR_UNGGULAN_FETCH_LIMIT } from "./sektor-unggulan.meta";

/** Semua sektor unggulan aktif (sekali muat, limit eksplisit); urutan peringkat dihitung di klien (`summarizeSektor`). */
export async function loadSektorUnggulan(): Promise<Sektor[]> {
  // Prefix API memang `sektourunggulandesa` (salah ketik lama, bagian kontrak).
  const res = await ApiFetch.api.ekonomi.sektourunggulandesa["find-many"].get({
    query: { page: 1, limit: SEKTOR_UNGGULAN_FETCH_LIMIT },
  });
  const body = res.data as (FindManyBody & { total?: number }) | null | undefined;
  const items = readFindMany<SektorApiItem>("sektor unggulan desa", res.status, body);
  const total = Number(body?.total);
  if (Number.isFinite(total) && total > items.length) {
    console.warn(`Sektor unggulan desa: ${total} entri, hanya ${items.length} pertama yang ditampilkan (batas muat klien).`);
  }
  return items.map((item) => toSektor(item));
}
