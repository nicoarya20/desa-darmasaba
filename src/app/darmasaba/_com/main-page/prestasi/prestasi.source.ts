import ApiFetch from "@/lib/api-fetch";
import {
  mergeNewest,
  pageWindow,
  toPrestasiItem,
  type PrestasiApiItem,
  type PrestasiItem,
  type PrestasiSource,
} from "./prestasi.logic";

/*
 * Adapter SEMENTARA: prestasi & penghargaan masih dua tabel + dua endpoint, jadi frontend
 * mengambil keduanya lalu menggabungkannya. Semua komponen hanya memakai `loadPrestasiPage`.
 * TODO(prestasi-merge): saat rekan backend menyatukan tabel jadi satu endpoint, ganti isi file
 * ini dengan satu panggilan endpoint baru (bentuk keluaran `PrestasiPage` tetap) lalu hapus
 * `pageWindow`/`mergeNewest` bila tak terpakai lagi.
 */

type SourcePage = { items: PrestasiItem[]; total: number };

/** Halaman data gabungan prestasi + penghargaan (urut terbaru). */
export type PrestasiPage = { items: PrestasiItem[]; total: number };

type FindManyBody = { success?: boolean; message?: string; data?: unknown; total?: number } | null | undefined;

function readSource(source: PrestasiSource, status: number, body: FindManyBody): SourcePage {
  if (status !== 200 || !body?.success || !Array.isArray(body.data)) {
    throw new Error(`find-many ${source} gagal (HTTP ${status}): ${body?.message ?? "respons tidak valid"}`);
  }
  const items = (body.data as PrestasiApiItem[]).map((item) => toPrestasiItem(item, source));
  return { items, total: body.total ?? items.length };
}

async function fetchSource(source: PrestasiSource, limit: number, search: string): Promise<SourcePage> {
  const query: Record<string, string | number> = { page: 1, limit };
  if (search) query.search = search;
  const res =
    source === "prestasi"
      ? await ApiFetch.api.landingpage.prestasidesa["find-many"].get({ query })
      : await ApiFetch.api.desa.penghargaan["find-many"].get({ query });
  return readSource(source, res.status, res.data as FindManyBody);
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
  const { fetchLimit, offset } = pageWindow(page, pageSize);
  const q = search.trim();
  const [prestasi, penghargaan] = await Promise.all([
    fetchSource("prestasi", fetchLimit, q),
    fetchSource("penghargaan", fetchLimit, q),
  ]);
  return {
    items: mergeNewest([prestasi.items, penghargaan.items], offset, pageSize),
    total: prestasi.total + penghargaan.total,
  };
}
