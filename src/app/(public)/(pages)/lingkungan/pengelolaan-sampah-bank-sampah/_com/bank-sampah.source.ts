import { readFindMany, type FindManyBody } from "@/app/(public)/_com/main-page/kabar-desa/kabar.source";
import ApiFetch from "@/lib/api-fetch";
import { sortLokasi, toLangkah, toLokasi, type Langkah, type LangkahApiItem, type Lokasi, type LokasiApiItem } from "./bank-sampah.logic";
import { BANK_SAMPAH_FETCH_LIMIT } from "./bank-sampah.meta";

/** Langkah mekanisme Bank Sampah aktif, urut createdAt ASC dari API (= urutan langkah). */
export async function loadLangkah(): Promise<Langkah[]> {
  const res = await ApiFetch.api.lingkungan.pengelolaansampah["find-many"].get({
    query: { page: 1, limit: BANK_SAMPAH_FETCH_LIMIT },
  });
  return toLangkah(readFindMany<LangkahApiItem>("pengelolaan sampah", res.status, res.data as FindManyBody));
}

/** Semua lokasi Bank Sampah aktif (sekali muat), urut nama; cari dilakukan di klien. */
export async function loadLokasi(): Promise<Lokasi[]> {
  const res = await ApiFetch.api.lingkungan.keteranganbankterdekat["find-many"].get({
    query: { page: 1, limit: BANK_SAMPAH_FETCH_LIMIT },
  });
  const items = readFindMany<LokasiApiItem>("keterangan bank sampah terdekat", res.status, res.data as FindManyBody);
  return sortLokasi(items.map(toLokasi));
}
