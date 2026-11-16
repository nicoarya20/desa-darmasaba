import { readFindMany, type FindManyBody } from "@/app/(public)/_com/main-page/kabar-desa/kabar.source";
import ApiFetch from "@/lib/api-fetch";
import { isNotFoundMessage, type ProgramKreatifApiItem } from "./program-kreatif.logic";
import { PROGRAM_KREATIF_FETCH_LIMIT } from "./program-kreatif.meta";

/**
 * Program kreatif aktif (maks `PROGRAM_KREATIF_FETCH_LIMIT`, urut createdAt terbaru), opsional disaring kata kunci
 * (API mencari di nama & deskripsi). Dipaginasi di klien; lihat catatan di program-kreatif.meta.ts.
 */
export async function loadProgramKreatifList(search: string): Promise<ProgramKreatifApiItem[]> {
  const query: Record<string, string | number> = { page: 1, limit: PROGRAM_KREATIF_FETCH_LIMIT };
  if (search) query.search = search;
  const res = await ApiFetch.api.inovasi.programkreatif["find-many"].get({ query });
  const body = res.data as (FindManyBody & { total?: number }) | null | undefined;
  const items = readFindMany<ProgramKreatifApiItem>("program kreatif", res.status, body);
  const total = Number(body?.total);
  if (Number.isFinite(total) && total > items.length) {
    console.warn(`Program kreatif: ${total} entri, hanya ${items.length} pertama yang ditampilkan (batas muat klien).`);
  }
  return items;
}

type DetailBody = { success?: boolean; message?: string; data?: ProgramKreatifApiItem | null } | null;

/** Detail satu program. `null` = tidak ditemukan; galat jaringan/server → Error berkonteks. */
export async function loadProgramKreatifDetail(id: string): Promise<ProgramKreatifApiItem | null> {
  const res = await fetch(`/api/inovasi/programkreatif/${encodeURIComponent(id)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`detail program kreatif ${id} gagal (HTTP ${res.status})`);
  const body = (await res.json()) as DetailBody;
  if (body?.success && body.data) return body.data;
  // API membalas 200 + success:false untuk id tak dikenal (lihat isNotFoundMessage).
  if (isNotFoundMessage(body?.message)) return null;
  throw new Error(`detail program kreatif ${id} gagal: ${body?.message ?? "respons tidak valid"}`);
}
