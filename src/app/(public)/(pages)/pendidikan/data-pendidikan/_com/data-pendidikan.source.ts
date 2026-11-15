import { DATA_PENDIDIKAN_LIMIT } from "./data-pendidikan.meta";
import { parseJumlah, type DataPendidikanItem } from "./data-pendidikan.logic";

/** Bentuk mentah satu baris respons API (dibaca longgar: kolom bisa null/kosong dari data admin). */
type RawDataPendidikan = { id?: unknown; name?: unknown; jumlah?: unknown; updatedAt?: unknown };
type Body = { success?: boolean; message?: string; data?: RawDataPendidikan[] | null; total?: unknown } | null;

const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

/** Normalkan satu baris respons. */
export function toDataPendidikanItem(raw: RawDataPendidikan): DataPendidikanItem {
  return {
    id: String(raw.id ?? ""),
    nama: text(raw.name),
    jumlah: parseJumlah(raw.jumlah),
    updatedAt: text(raw.updatedAt) || null,
  };
}

/** Semua kategori data pendidikan aktif (sekali muat, tanpa paginasi). Galat dilempar agar tidak tampil sebagai "kosong". */
export async function loadDataPendidikan(): Promise<DataPendidikanItem[]> {
  const res = await fetch(`/api/pendidikan/datapendidikan/findMany?page=1&limit=${DATA_PENDIDIKAN_LIMIT}`);
  // Badan bukan JSON (mis. halaman galat proxy) → null; dilempar sebagai galat berisi status HTTP.
  const body = (await res.json().catch(() => null)) as Body;
  if (!res.ok || !body?.success || !Array.isArray(body.data)) {
    throw new Error(`Data pendidikan gagal (HTTP ${res.status}): ${body?.message ?? "respons tidak valid"}`);
  }
  // MITIGASI SEMENTARA data-pendidikan-limit: find-many tak punya mode "semua"; bila kategori melebihi limit,
  // total & persen kurang dari sebenarnya. Hapus bila API menyediakan daftar tanpa paginasi.
  if (typeof body.total === "number" && body.total > body.data.length) {
    console.warn(`Data pendidikan terpotong: ${body.data.length} dari ${body.total} kategori dimuat (limit ${DATA_PENDIDIKAN_LIMIT}).`);
  }
  return body.data.map(toDataPendidikanItem);
}
