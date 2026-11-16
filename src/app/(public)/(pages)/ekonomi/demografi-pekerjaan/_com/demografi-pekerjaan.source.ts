import { readFindMany, type FindManyBody } from "@/app/(public)/_com/main-page/kabar-desa/kabar.source";
import ApiFetch from "@/lib/api-fetch";
import { toDemografiPekerjaanItem, type DemografiPekerjaanApiItem, type DemografiPekerjaanItem } from "./demografi-pekerjaan.logic";
import { DEMOGRAFI_PEKERJAAN_LIMIT } from "./demografi-pekerjaan.meta";

/** Semua data demografi pekerjaan aktif (sekali muat). Galat dilempar berkonteks agar tidak tampil sebagai "kosong". */
export async function loadDemografiPekerjaan(): Promise<DemografiPekerjaanItem[]> {
  const res = await ApiFetch.api.ekonomi.demografipekerjaan["find-many"].get({
    query: { page: 1, limit: DEMOGRAFI_PEKERJAAN_LIMIT },
  });
  const body = res.data as (FindManyBody & { total?: number }) | null | undefined;
  const items = readFindMany<DemografiPekerjaanApiItem>("demografi pekerjaan", res.status, body);
  // MITIGASI SEMENTARA demografi-pekerjaan-limit: find-many tak punya mode "semua"; di atas limit total & persen
  // kurang dari sebenarnya. Hapus bila API menyediakan daftar tanpa paginasi.
  const total = Number(body?.total);
  if (Number.isFinite(total) && total > items.length) {
    console.warn(`Demografi pekerjaan terpotong: ${items.length} dari ${total} baris dimuat (limit ${DEMOGRAFI_PEKERJAAN_LIMIT}).`);
  }
  return items.map(toDemografiPekerjaanItem);
}
