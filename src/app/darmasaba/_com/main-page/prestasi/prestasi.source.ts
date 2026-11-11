import ApiFetch from "@/lib/api-fetch";
import { safePage, toPrestasiItem, type PrestasiApiItem, type PrestasiItem } from "./prestasi.logic";

/*
 * Prestasi & penghargaan kini satu tabel (PrestasiDesa; penghargaan = kategori "Penghargaan"),
 * jadi cukup satu endpoint find-many yang sudah urut terbaru + paginasi + total dari server.
 * Semua komponen hanya memakai `loadPrestasiPage`.
 */

/** Halaman data gabungan prestasi + penghargaan (urut terbaru). */
export type PrestasiPage = { items: PrestasiItem[]; total: number };

type FindManyBody = { success?: boolean; message?: string; data?: unknown; total?: number } | null | undefined;

function readPage(status: number, body: FindManyBody): PrestasiPage {
  if (status !== 200 || !body?.success || !Array.isArray(body.data)) {
    throw new Error(`find-many prestasi gagal (HTTP ${status}): ${body?.message ?? "respons tidak valid"}`);
  }
  const items = (body.data as PrestasiApiItem[]).map(toPrestasiItem);
  return { items, total: body.total ?? items.length };
}

/** Ambil halaman `page` (ukuran `pageSize`) gabungan prestasi + penghargaan, opsional dengan pencarian. */
export async function loadPrestasiPage({
  page,
  pageSize,
  search = "",
}: {
  page: number;
  pageSize: number;
  search?: string;
}): Promise<PrestasiPage> {
  const query: Record<string, string | number> = { page: safePage(page), limit: pageSize };
  const q = search.trim();
  if (q) query.search = q;
  const res = await ApiFetch.api.landingpage.prestasidesa["find-many"].get({ query });
  return readPage(res.status, res.data as FindManyBody);
}
