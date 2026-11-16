import { readFindMany, type FindManyBody } from "@/app/(public)/_com/main-page/kabar-desa/kabar.source";
import ApiFetch from "@/lib/api-fetch";
import { toProgramKemiskinan, type ProgramKemiskinan, type ProgramKemiskinanApiItem } from "./program-kemiskinan.logic";
import { PROGRAM_KEMISKINAN_FETCH_LIMIT } from "./program-kemiskinan.meta";

/** Semua program aktif (sekali muat, urut createdAt terbaru); saring kata kunci & paginasi di klien. */
export async function loadProgramKemiskinan(): Promise<ProgramKemiskinan[]> {
  const res = await ApiFetch.api.ekonomi.programkemiskinan["find-many"].get({
    query: { page: 1, limit: PROGRAM_KEMISKINAN_FETCH_LIMIT },
  });
  const body = res.data as (FindManyBody & { total?: number }) | null | undefined;
  const items = readFindMany<ProgramKemiskinanApiItem>("program pengentasan kemiskinan", res.status, body);
  const total = Number(body?.total);
  if (Number.isFinite(total) && total > items.length) {
    console.warn(`Program pengentasan kemiskinan: ${total} entri, hanya ${items.length} pertama yang ditampilkan (batas muat klien).`);
  }
  return items.map((item) => toProgramKemiskinan(item));
}
