import type { PengumumanDetail } from "@/lib/pengumuman-lampiran";

type DetailBody = { success?: boolean; status?: number; message?: string; data?: PengumumanDetail | null } | null;

/**
 * Detail satu pengumuman (`GET /api/desa/pengumuman/:id`). `null` = tidak ditemukan (handler membalas
 * `{ status: 404 }` dengan HTTP 200); galat jaringan/server → Error berkonteks.
 */
export async function loadPengumumanDetail(id: string): Promise<PengumumanDetail | null> {
  const res = await fetch(`/api/desa/pengumuman/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(`detail pengumuman ${id} gagal (HTTP ${res.status})`);
  const body = (await res.json()) as DetailBody;
  if (body?.success && body.data) return body.data;
  if (body?.status === 404) return null;
  throw new Error(`detail pengumuman ${id} gagal: ${body?.message ?? "respons tidak valid"}`);
}
