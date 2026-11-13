import { readFindMany, type FindManyBody } from "@/app/(public)/_com/main-page/kabar-desa/kabar.source";
import ApiFetch from "@/lib/api-fetch";
import type { ProgramApiItem } from "./program.logic";
import { PROGRAM_FETCH_LIMIT } from "./program.meta";

/**
 * Semua program kesehatan aktif (maks `PROGRAM_FETCH_LIMIT`, urut createdAt terbaru), opsional disaring kata kunci
 * (API mencari di nama, case-insensitive). Dipisah & dipaginasi di klien; lihat catatan mitigasi di program.meta.ts.
 */
export async function loadProgramKesehatan(search: string): Promise<ProgramApiItem[]> {
  const query: Record<string, string | number> = { page: 1, limit: PROGRAM_FETCH_LIMIT };
  if (search) query.search = search;
  const res = await ApiFetch.api.kesehatan.programkesehatan["find-many"].get({ query });
  const body = res.data as (FindManyBody & { total?: number }) | null | undefined;
  const items = readFindMany<ProgramApiItem>("program kesehatan", res.status, body);
  const total = Number(body?.total);
  if (Number.isFinite(total) && total > items.length) {
    console.warn(`Program kesehatan: ${total} entri, hanya ${items.length} pertama yang ditampilkan (batas muat klien).`);
  }
  return items;
}

type DetailBody = { success?: boolean; message?: string; data?: ProgramApiItem | null } | null;

/** Detail satu program. `null` = tidak ditemukan (API membalas 404); galat jaringan/server → Error berkonteks. */
export async function loadProgramDetail(id: string): Promise<ProgramApiItem | null> {
  const res = await fetch(`/api/kesehatan/programkesehatan/${encodeURIComponent(id)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`detail program kesehatan ${id} gagal (HTTP ${res.status})`);
  const body = (await res.json()) as DetailBody;
  if (body?.success && body.data) return body.data;
  throw new Error(`detail program kesehatan ${id} gagal: ${body?.message ?? "respons tidak valid"}`);
}
