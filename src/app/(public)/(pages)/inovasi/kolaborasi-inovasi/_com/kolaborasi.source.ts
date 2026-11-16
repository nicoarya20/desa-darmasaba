import { readFindMany, type FindManyBody } from "@/app/(public)/_com/main-page/kabar-desa/kabar.source";
import ApiFetch from "@/lib/api-fetch";
import { sortKolaborasi, toKolaborasi, type Kolaborasi, type KolaborasiApiItem } from "./kolaborasi.logic";
import { KOLABORASI_FETCH_LIMIT, MITRA_FETCH_LIMIT } from "./kolaborasi.meta";
import { toMitra, type Mitra, type MitraApiItem } from "./mitra.logic";

/** Semua kolaborasi aktif (sekali muat), urut tahun terbaru; saring tahun/kata kunci dilakukan di klien. */
export async function loadKolaborasi(): Promise<Kolaborasi[]> {
  const res = await ApiFetch.api.inovasi.kolaborasiinovasi["find-many"].get({
    query: { page: 1, limit: KOLABORASI_FETCH_LIMIT },
  });
  const items = readFindMany<KolaborasiApiItem>("kolaborasi inovasi", res.status, res.data as FindManyBody);
  return sortKolaborasi(items.map((item) => toKolaborasi(item)));
}

/** Semua mitra kolaborasi aktif (sekali muat, terlepas dari halaman daftar kolaborasi). */
export async function loadMitra(): Promise<Mitra[]> {
  const res = await ApiFetch.api.inovasi.mitrakolaborasi["find-many"].get({ query: { page: 1, limit: MITRA_FETCH_LIMIT } });
  return readFindMany<MitraApiItem>("mitra kolaborasi", res.status, res.data as FindManyBody).map(toMitra);
}
