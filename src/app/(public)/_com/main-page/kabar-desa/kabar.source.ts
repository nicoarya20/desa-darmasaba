import ApiFetch from "@/lib/api-fetch";
import {
  toBeritaItem,
  toPengumumanItem,
  type BeritaApiItem,
  type KabarItem,
  type PengumumanApiItem,
} from "./kabar.logic";

/** Bentuk umum respons find-many (`success`, `message`, `data`). */
export type FindManyBody = { success?: boolean; message?: string; data?: unknown } | null | undefined;

/** Validasi respons find-many; gagal → Error dengan konteks sumber + status. */
export function readFindMany<T>(source: string, status: number, body: FindManyBody): T[] {
  if (status !== 200 || !body?.success || !Array.isArray(body.data)) {
    throw new Error(`find-many ${source} gagal (HTTP ${status}): ${body?.message ?? "respons tidak valid"}`);
  }
  return body.data as T[];
}

/** `limit` berita aktif terbaru. */
export async function loadBeritaTerbaru(limit: number): Promise<KabarItem[]> {
  const res = await ApiFetch.api.desa.berita["find-many"].get({ query: { page: 1, limit } });
  return readFindMany<BeritaApiItem>("berita", res.status, res.data as FindManyBody).map(toBeritaItem);
}

/** `limit` pengumuman aktif terbaru. */
export async function loadPengumumanTerbaru(limit: number): Promise<KabarItem[]> {
  const res = await ApiFetch.api.desa.pengumuman["find-many"].get({ query: { page: 1, limit } });
  return readFindMany<PengumumanApiItem>("pengumuman", res.status, res.data as FindManyBody).map(toPengumumanItem);
}
