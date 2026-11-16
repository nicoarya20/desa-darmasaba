import { readFindMany, type FindManyBody } from "@/app/(public)/_com/main-page/kabar-desa/kabar.source";
import ApiFetch from "@/lib/api-fetch";
import type { DesaDigitalApiItem } from "./desa-digital.logic";
import { DESA_DIGITAL_FETCH_LIMIT } from "./desa-digital.meta";

/**
 * Layanan desa digital aktif (maks `DESA_DIGITAL_FETCH_LIMIT`, urut createdAt terbaru), opsional disaring kata kunci
 * (API mencari di nama & deskripsi). Dipaginasi di klien; lihat catatan di desa-digital.meta.ts.
 */
export async function loadDesaDigitalList(search: string): Promise<DesaDigitalApiItem[]> {
  const query: Record<string, string | number> = { page: 1, limit: DESA_DIGITAL_FETCH_LIMIT };
  if (search) query.search = search;
  const res = await ApiFetch.api.inovasi.desadigital["find-many"].get({ query });
  const body = res.data as (FindManyBody & { total?: number }) | null | undefined;
  const items = readFindMany<DesaDigitalApiItem>("desa digital", res.status, body);
  const total = Number(body?.total);
  if (Number.isFinite(total) && total > items.length) {
    console.warn(`Desa digital: ${total} entri, hanya ${items.length} pertama yang ditampilkan (batas muat klien).`);
  }
  return items;
}

type DetailBody = { success?: boolean; message?: string; data?: DesaDigitalApiItem | null } | null;

/** Detail satu layanan. `null` = tidak ditemukan (API membalas 404); galat jaringan/server → Error berkonteks. */
export async function loadDesaDigitalDetail(id: string): Promise<DesaDigitalApiItem | null> {
  const res = await fetch(`/api/inovasi/desadigital/${encodeURIComponent(id)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`detail desa digital ${id} gagal (HTTP ${res.status})`);
  const body = (await res.json()) as DetailBody;
  if (body?.success && body.data) return body.data;
  throw new Error(`detail desa digital ${id} gagal: ${body?.message ?? "respons tidak valid"}`);
}
