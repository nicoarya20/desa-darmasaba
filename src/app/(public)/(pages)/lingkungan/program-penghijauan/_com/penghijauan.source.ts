import { readFindMany, type FindManyBody } from "@/app/(public)/_com/main-page/kabar-desa/kabar.source";
import ApiFetch from "@/lib/api-fetch";
import { isNotFoundMessage, toPenghijauan, type Penghijauan, type PenghijauanApiItem } from "./penghijauan.logic";
import { PENGHIJAUAN_FETCH_LIMIT } from "./penghijauan.meta";

/** Semua program penghijauan aktif (sekali muat, urut createdAt terbaru); saring kata kunci & paginasi di klien. */
export async function loadPenghijauanList(): Promise<Penghijauan[]> {
  const res = await ApiFetch.api.lingkungan.programpenghijauan["find-many"].get({
    query: { page: 1, limit: PENGHIJAUAN_FETCH_LIMIT },
  });
  const body = res.data as (FindManyBody & { total?: number }) | null | undefined;
  const items = readFindMany<PenghijauanApiItem>("program penghijauan", res.status, body);
  const total = Number(body?.total);
  if (Number.isFinite(total) && total > items.length) {
    console.warn(`Program penghijauan: ${total} entri, hanya ${items.length} pertama yang ditampilkan (batas muat klien).`);
  }
  return items.map(toPenghijauan);
}

type DetailBody = { success?: boolean; message?: string; data?: PenghijauanApiItem | null } | null;

/** Detail satu program. `null` = tidak ditemukan; galat jaringan/server → Error berkonteks. */
export async function loadPenghijauanDetail(id: string): Promise<PenghijauanApiItem | null> {
  const res = await fetch(`/api/lingkungan/programpenghijauan/${encodeURIComponent(id)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`detail program penghijauan ${id} gagal (HTTP ${res.status})`);
  const body = (await res.json()) as DetailBody;
  if (body?.success && body.data) return body.data;
  // API membalas 200 + success:false untuk id tak dikenal (lihat isNotFoundMessage).
  if (isNotFoundMessage(body?.message)) return null;
  throw new Error(`detail program penghijauan ${id} gagal: ${body?.message ?? "respons tidak valid"}`);
}
