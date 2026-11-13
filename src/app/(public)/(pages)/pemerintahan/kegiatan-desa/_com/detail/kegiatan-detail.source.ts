import type { PembangunanInfoItem } from "../PembangunanInfo";

/** Bentuk respons detail kegiatan (`GET /api/desa/kegiatandesa/:id`) yang dipakai halaman publik. */
export type KegiatanDetail = PembangunanInfoItem & {
  id: string;
  judul: string;
  deskripsiSingkat?: string | null;
  deskripsiLengkap?: string | null;
  tanggal: string;
  lokasi?: string | null;
  partisipan?: number | null;
  image?: { link?: string | null } | null;
  kategoriKegiatanId?: string | null;
  kategoriKegiatan?: { nama?: string | null } | null;
};

type DetailBody = { success?: boolean; message?: string; data?: KegiatanDetail | null } | null;

/** Pesan handler saat id tidak ada; handler membalas HTTP 200 + `success: false` untuk tidak-ditemukan maupun galat DB. */
const NOT_FOUND_MESSAGE = /tidak ditemukan/i;

/**
 * Detail satu kegiatan. `null` = tidak ditemukan (dibedakan dari galat DB lewat pesan handler, karena keduanya
 * HTTP 200 `success: false`); galat jaringan/server → Error berkonteks.
 */
export async function loadKegiatanDetail(id: string): Promise<KegiatanDetail | null> {
  const res = await fetch(`/api/desa/kegiatandesa/${encodeURIComponent(id)}`);
  if (!res.ok) throw new Error(`detail kegiatan ${id} gagal (HTTP ${res.status})`);
  const body = (await res.json()) as DetailBody;
  if (body?.success && body.data) return body.data;
  if (body?.success === false && NOT_FOUND_MESSAGE.test(body.message ?? "")) return null;
  throw new Error(`detail kegiatan ${id} gagal: ${body?.message ?? "respons tidak valid"}`);
}
