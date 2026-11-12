import { readFindMany, type FindManyBody } from "@/app/(public)/_com/main-page/kabar-desa/kabar.source";
import ApiFetch from "@/lib/api-fetch";
import type { PencegahanApiItem } from "./pencegahan.logic";
import { PENCEGAHAN_FETCH_LIMIT } from "./pencegahan.meta";

/**
 * Program pencegahan kriminalitas aktif (maks `PENCEGAHAN_FETCH_LIMIT`, urut createdAt terbaru), opsional disaring kata
 * kunci (API mencari di judul, deskripsi, deskripsi singkat). Dipaginasi di klien; lihat catatan di pencegahan.meta.ts.
 */
export async function loadPencegahanList(search: string): Promise<PencegahanApiItem[]> {
  const query: Record<string, string | number> = { page: 1, limit: PENCEGAHAN_FETCH_LIMIT };
  if (search) query.search = search;
  const res = await ApiFetch.api.keamanan.pencegahankriminalitas["find-many"].get({ query });
  const body = res.data as (FindManyBody & { total?: number }) | null | undefined;
  const items = readFindMany<PencegahanApiItem>("pencegahan kriminalitas", res.status, body);
  const total = Number(body?.total);
  if (Number.isFinite(total) && total > items.length) {
    console.warn(`Pencegahan kriminalitas: ${total} entri, hanya ${items.length} pertama yang ditampilkan (batas muat klien).`);
  }
  return items;
}

type DetailBody = { success?: boolean; message?: string; data?: PencegahanApiItem | null } | null;

/** Detail satu program. `null` = tidak ditemukan (API membalas 404); galat jaringan/server → Error berkonteks. */
export async function loadPencegahanDetail(id: string): Promise<PencegahanApiItem | null> {
  const res = await fetch(`/api/keamanan/pencegahankriminalitas/${encodeURIComponent(id)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`detail pencegahan kriminalitas ${id} gagal (HTTP ${res.status})`);
  const body = (await res.json()) as DetailBody;
  if (body?.success && body.data) return body.data;
  throw new Error(`detail pencegahan kriminalitas ${id} gagal: ${body?.message ?? "respons tidak valid"}`);
}
