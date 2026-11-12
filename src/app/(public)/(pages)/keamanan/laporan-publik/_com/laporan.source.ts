import type { LaporanPublik } from "./laporan.logic";

type ListBody = { success?: boolean; message?: string; data?: LaporanPublik[]; totalPages?: number } | null;
type DetailBody = { success?: boolean; message?: string; data?: LaporanPublik | null } | null;

export type LaporanPage = { items: LaporanPublik[]; totalPages: number };

/** Satu halaman laporan (`GET /api/keamanan/laporanpublik/find-many`, API mencari di judul & lokasi). */
export async function loadLaporanPage(query: { page: number; limit: number; search: string }): Promise<LaporanPage> {
  const params = new URLSearchParams({ page: String(query.page), limit: String(query.limit) });
  if (query.search) params.set("search", query.search);
  const res = await fetch(`/api/keamanan/laporanpublik/find-many?${params}`);
  if (!res.ok) throw new Error(`daftar laporan publik gagal (HTTP ${res.status})`);
  const body = (await res.json()) as ListBody;
  if (!body?.success) throw new Error(`daftar laporan publik gagal: ${body?.message ?? "respons tidak valid"}`);
  return { items: body.data ?? [], totalPages: Math.max(1, body.totalPages ?? 1) };
}

/**
 * Detail satu laporan (`GET /api/keamanan/laporanpublik/:id`). `null` = tidak ditemukan atau nonaktif:
 * handler membalas `success:false` (HTTP 200) bila id tak ada dan tidak menyaring `isActive`.
 */
export async function loadLaporanDetail(id: string): Promise<LaporanPublik | null> {
  const res = await fetch(`/api/keamanan/laporanpublik/${encodeURIComponent(id)}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`detail laporan publik ${id} gagal (HTTP ${res.status})`);
  const body = (await res.json()) as DetailBody;
  if (!body?.success || !body.data) return null;
  return body.data.isActive === false ? null : body.data;
}
