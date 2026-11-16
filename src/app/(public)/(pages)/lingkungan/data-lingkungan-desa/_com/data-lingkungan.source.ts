import { readFindMany, type FindManyBody } from "@/app/(public)/_com/main-page/kabar-desa/kabar.source";
import ApiFetch from "@/lib/api-fetch";
import { toDataLingkungan, type DataLingkungan, type DataLingkunganApiItem } from "./data-lingkungan.logic";
import { DATA_LINGKUNGAN_FETCH_LIMIT } from "./data-lingkungan.meta";

/** Semua data lingkungan aktif (sekali muat, urut createdAt terbaru); saring kata kunci & paginasi di klien. */
export async function loadDataLingkungan(): Promise<DataLingkungan[]> {
  const res = await ApiFetch.api.lingkungan.datalingkungandesa["find-many"].get({
    query: { page: 1, limit: DATA_LINGKUNGAN_FETCH_LIMIT },
  });
  const body = res.data as (FindManyBody & { total?: number }) | null | undefined;
  const items = readFindMany<DataLingkunganApiItem>("data lingkungan desa", res.status, body);
  const total = Number(body?.total);
  if (Number.isFinite(total) && total > items.length) {
    console.warn(`Data lingkungan desa: ${total} entri, hanya ${items.length} pertama yang ditampilkan (batas muat klien).`);
  }
  return items.map((item) => toDataLingkungan(item));
}
