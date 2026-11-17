import { readFindMany, type FindManyBody } from "@/app/(public)/_com/main-page/kabar-desa/kabar.source";
import ApiFetch from "@/lib/api-fetch";
import {
  pickLatestSebaran,
  sortBulan,
  toPengangguranBulan,
  toSebaran,
  type PengangguranBulan,
  type PengangguranBulanApi,
  type Sebaran,
} from "./pengangguran.logic";
import { KOLOM_PENDIDIKAN, KOLOM_USIA, PENGANGGURAN_FETCH_LIMIT, SEBARAN_FETCH_LIMIT } from "./pengangguran.meta";

type Body = (FindManyBody & { total?: number }) | null | undefined;
type SebaranApi = Parameters<typeof toSebaran>[0];

function warnTerpotong(source: string, body: Body, loaded: number) {
  const total = Number(body?.total);
  if (Number.isFinite(total) && total > loaded) {
    console.warn(`${source}: ${total} entri, hanya ${loaded} yang dimuat (batas muat klien).`);
  }
}

/** Semua bulan data pengangguran, urut kalender naik. Baris yang bulan/angkanya tak terbaca dibuang. */
export async function loadPengangguranBulanan(): Promise<PengangguranBulan[]> {
  const res = await ApiFetch.api.ekonomi.jumlahpengangguran.detaildatapengangguran["find-many"].get({
    query: { page: 1, limit: PENGANGGURAN_FETCH_LIMIT },
  });
  const body = res.data as Body;
  const items = readFindMany<PengangguranBulanApi>("jumlah pengangguran", res.status, body);
  warnTerpotong("Jumlah pengangguran", body, items.length);
  return sortBulan(items.map(toPengangguranBulan).filter((row): row is PengangguranBulan => row !== null));
}

/** Sebaran pengangguran menurut usia: baris terakhir diperbarui saja; null bila belum ada baris. */
export async function loadSebaranUsia(): Promise<Sebaran | null> {
  const res = await ApiFetch.api.ekonomi.grafikusiakerjayangmenganggur["find-many"].get({
    query: { page: 1, limit: SEBARAN_FETCH_LIMIT },
  });
  const latest = pickLatestSebaran(readFindMany<SebaranApi>("sebaran pengangguran menurut usia", res.status, res.data as Body));
  return latest ? toSebaran(latest, KOLOM_USIA) : null;
}

/** Sebaran pengangguran menurut pendidikan terakhir: baris terakhir diperbarui saja; null bila belum ada baris. */
export async function loadSebaranPendidikan(): Promise<Sebaran | null> {
  const res = await ApiFetch.api.ekonomi.grafikmenganggurberdasarkanpendidikan["find-many"].get({
    query: { page: 1, limit: SEBARAN_FETCH_LIMIT },
  });
  const latest = pickLatestSebaran(
    readFindMany<SebaranApi>("sebaran pengangguran menurut pendidikan", res.status, res.data as Body),
  );
  return latest ? toSebaran(latest, KOLOM_PENDIDIKAN) : null;
}
