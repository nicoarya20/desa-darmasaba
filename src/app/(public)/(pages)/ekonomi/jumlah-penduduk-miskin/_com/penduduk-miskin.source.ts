import { readFindMany, type FindManyBody } from "@/app/(public)/_com/main-page/kabar-desa/kabar.source";
import ApiFetch from "@/lib/api-fetch";
import {
  sortTahunDesc,
  toPendudukMiskinTahun,
  type PendudukMiskinApiItem,
  type PendudukMiskinTahun,
} from "./penduduk-miskin.logic";
import { PENDUDUK_MISKIN_FETCH_LIMIT } from "./penduduk-miskin.meta";

/** Semua tahun aktif dalam satu permintaan (limit eksplisit), urut terbaru dulu; tahun rusak dibuang. */
export async function loadPendudukMiskin(): Promise<PendudukMiskinTahun[]> {
  const res = await ApiFetch.api.ekonomi.jumlahpendudukmiskin["find-many"].get({
    query: { page: 1, limit: PENDUDUK_MISKIN_FETCH_LIMIT },
  });
  const body = res.data as (FindManyBody & { total?: number }) | null | undefined;
  const items = readFindMany<PendudukMiskinApiItem>("jumlah penduduk miskin", res.status, body);
  const total = Number(body?.total);
  if (Number.isFinite(total) && total > items.length) {
    console.warn(`Jumlah penduduk miskin: ${total} tahun, hanya ${items.length} pertama yang dimuat (batas muat klien).`);
  }
  const rows = items.map(toPendudukMiskinTahun).filter((row): row is PendudukMiskinTahun => row !== null);
  return sortTahunDesc(rows);
}
