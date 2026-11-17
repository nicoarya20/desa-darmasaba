import { readFindMany, type FindManyBody } from "@/app/(public)/_com/main-page/kabar-desa/kabar.source";
import ApiFetch from "@/lib/api-fetch";
import type { ProgramInovasiApiItem } from "./program-inovasi.logic";
import { PROGRAM_INOVASI_FETCH_LIMIT } from "./program-inovasi.meta";

/**
 * Program inovasi aktif (maks `PROGRAM_INOVASI_FETCH_LIMIT`), urutan dari API: `urutan` admin dulu lalu abjad —
 * sama dengan rel beranda. Opsional disaring kata kunci (API mencari di nama & deskripsi). Dipaginasi di klien.
 */
export async function loadProgramInovasiList(search: string): Promise<ProgramInovasiApiItem[]> {
  const query: Record<string, string | number> = { page: 1, limit: PROGRAM_INOVASI_FETCH_LIMIT };
  if (search) query.search = search;
  const res = await ApiFetch.api.landingpage.programinovasi.findMany.get({ query });
  const body = res.data as (FindManyBody & { total?: number }) | null | undefined;
  const items = readFindMany<ProgramInovasiApiItem>("program inovasi", res.status, body);
  const total = Number(body?.total);
  if (Number.isFinite(total) && total > items.length) {
    console.warn(`Program inovasi: ${total} entri, hanya ${items.length} pertama yang ditampilkan (batas muat klien).`);
  }
  return items;
}
