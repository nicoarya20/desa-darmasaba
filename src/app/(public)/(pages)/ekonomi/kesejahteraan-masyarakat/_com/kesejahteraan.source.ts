import { readFindMany, type FindManyBody } from "@/app/(public)/_com/main-page/kabar-desa/kabar.source";
import ApiFetch from "@/lib/api-fetch";
import { toKesejahteraanItem, type KesejahteraanApiItem, type KesejahteraanItem } from "./kesejahteraan.logic";
import { KESEJAHTERAAN_FETCH_LIMIT } from "./kesejahteraan.meta";

/** Semua program kesejahteraan aktif (sekali muat, urut createdAt terbaru); saring kata kunci & paginasi di klien. */
export async function loadKesejahteraanList(): Promise<KesejahteraanItem[]> {
  const res = await ApiFetch.api.ekonomi.kesejahteraanmasyarakat["find-many"].get({
    query: { page: 1, limit: KESEJAHTERAAN_FETCH_LIMIT },
  });
  const body = res.data as (FindManyBody & { total?: number }) | null | undefined;
  const items = readFindMany<KesejahteraanApiItem>("kesejahteraan masyarakat", res.status, body);
  const total = Number(body?.total);
  if (Number.isFinite(total) && total > items.length) {
    console.warn(`Kesejahteraan masyarakat: ${total} entri, hanya ${items.length} pertama yang ditampilkan (batas muat klien).`);
  }
  return items.map(toKesejahteraanItem);
}

type DetailBody = { success?: boolean; message?: string; data?: KesejahteraanApiItem | null } | null;

/** Detail satu program (dengan galeri). `null` = tidak ditemukan (API membalas 404); galat lain → Error berkonteks. */
export async function loadKesejahteraanDetail(id: string): Promise<KesejahteraanApiItem | null> {
  const res = await fetch(`/api/ekonomi/kesejahteraanmasyarakat/${encodeURIComponent(id)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`detail kesejahteraan masyarakat ${id} gagal (HTTP ${res.status})`);
  const body = (await res.json()) as DetailBody;
  if (body?.success && body.data) return body.data;
  throw new Error(`detail kesejahteraan masyarakat ${id} gagal: ${body?.message ?? "respons tidak valid"}`);
}
