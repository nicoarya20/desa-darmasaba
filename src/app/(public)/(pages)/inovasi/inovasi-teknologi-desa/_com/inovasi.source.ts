import type { KabarPage, KabarPageQuery } from "@/app/(public)/_com/kabar-list/use-kabar-page";
import { readFindMany, type FindManyBody } from "@/app/(public)/_com/main-page/kabar-desa/kabar.source";
import ApiFetch from "@/lib/api-fetch";
import { toInovasiItem, type InovasiApiItem } from "./inovasi.logic";

/** Satu halaman daftar (paginasi & saringan kategori di server). Galat → Error berkonteks (dari readFindMany). */
export async function loadInovasiPage({ page, limit, search, kategori }: KabarPageQuery): Promise<KabarPage> {
  const query: Record<string, string | number> = { page, limit };
  if (search) query.search = search;
  if (kategori) query.kategori = kategori;
  const res = await ApiFetch.api.inovasi.inovasiteknologi["find-many"].get({ query });
  const body = res.data as (FindManyBody & { totalPages?: number }) | null | undefined;
  const items = readFindMany<InovasiApiItem>("inovasi teknologi desa", res.status, body);
  return { items: items.map(toInovasiItem), totalPages: Math.max(1, Number(body?.totalPages) || 1) };
}

type DetailBody = { success?: boolean; message?: string; data?: InovasiApiItem | null } | null;

/** Detail satu inovasi. `null` = tidak ditemukan (404); galat jaringan/server → Error berkonteks. */
export async function loadInovasiDetail(id: string): Promise<InovasiApiItem | null> {
  const res = await fetch(`/api/inovasi/inovasiteknologi/${encodeURIComponent(id)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`detail inovasi teknologi desa ${id} gagal (HTTP ${res.status})`);
  const body = (await res.json()) as DetailBody;
  if (body?.success && body.data) return body.data;
  throw new Error(`detail inovasi teknologi desa ${id} gagal: ${body?.message ?? "respons tidak valid"}`);
}
