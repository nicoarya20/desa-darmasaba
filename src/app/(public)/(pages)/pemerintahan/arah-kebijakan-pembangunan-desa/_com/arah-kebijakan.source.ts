import { readFindMany, type FindManyBody } from "@/app/(public)/_com/main-page/kabar-desa/kabar.source";
import ApiFetch from "@/lib/api-fetch";
import type { JenisDokumen } from "@/lib/dokumen-perencanaan";
import { ARAH_PAGE_SIZE, KATEGORI_BERITA_ACARA, type ArahDokumen, type ArahDokumenPage } from "./arah-kebijakan.logic";

type FindManyPageBody = FindManyBody & { totalPages?: number; total?: number };

async function findMany(jenis: JenisDokumen, page: number, limit: number) {
  const res = await ApiFetch.api.desa["dokumenperencanaan"]["find-many"].get({ query: { jenis, page, limit } });
  const body = res.data as FindManyPageBody;
  const items = readFindMany<ArahDokumen>(`dokumen perencanaan ${jenis}`, res.status, body);
  return { items, totalPages: body?.totalPages ?? 1, total: body?.total ?? items.length };
}

/** Satu halaman dokumen aktif satu kategori (urutan tahun dari API); gagal → Error berkonteks. */
export async function loadDokumenKategori(jenis: JenisDokumen, page: number): Promise<ArahDokumenPage> {
  return findMany(jenis, page, ARAH_PAGE_SIZE);
}

/** Apakah sudah ada minimal satu berita acara musyawarah aktif (menentukan tab Berita Acara tampil). */
export async function loadAdaBeritaAcara(): Promise<boolean> {
  const { total } = await findMany(KATEGORI_BERITA_ACARA, 1, 1);
  return total > 0;
}
