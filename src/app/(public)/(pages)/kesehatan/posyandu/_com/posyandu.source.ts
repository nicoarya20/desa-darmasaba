import type { PosyanduStats } from "./posyandu.logic";
import { POSYANDU_LIST_LIMIT } from "./posyandu.meta";

/** Kolom posyandu yang dipakai halaman publik (respons find-many / :id). */
export type PosyanduItem = {
  id: string;
  name: string;
  nomor: string | null;
  deskripsi: string | null;
  jadwalPelayanan: string | null;
  image: { link: string } | null;
  banjar: { id: string; name: string } | null;
};

export type BanjarOption = { id: string; name: string };

type Body<T> = { success?: boolean; message?: string; data?: T | null } | null;

const API = "/api/kesehatan";

async function getBody<T>(url: string): Promise<{ status: number; body: Body<T> }> {
  const res = await fetch(url);
  // Badan bukan JSON (mis. halaman galat proxy) → null; requireData lalu melempar galat berisi status HTTP.
  const body = (await res.json().catch(() => null)) as Body<T>;
  return { status: res.status, body };
}

function requireData<T>(status: number, body: Body<T>, what: string): T {
  if (status >= 200 && status < 300 && body?.success && body.data != null) return body.data;
  throw new Error(`${what} gagal (HTTP ${status}): ${body?.message ?? "respons tidak valid"}`);
}

/** Semua posyandu aktif (direktori tanpa paginasi). */
export async function loadPosyanduList(): Promise<PosyanduItem[]> {
  const { status, body } = await getBody<PosyanduItem[]>(`${API}/posyandu/find-many?page=1&limit=${POSYANDU_LIST_LIMIT}`);
  return requireData(status, body, "daftar posyandu");
}

/** Satu posyandu; `null` = tidak ditemukan (handler membalas HTTP 404). */
export async function loadPosyandu(id: string): Promise<PosyanduItem | null> {
  const what = `detail posyandu ${id}`;
  const { status, body } = await getBody<PosyanduItem>(`${API}/posyandu/${encodeURIComponent(id)}`);
  if (status === 404) return null;
  return requireData(status, body, what);
}

/** Daftar banjar aktif (urut nama). */
export async function loadBanjarList(): Promise<BanjarOption[]> {
  const { status, body } = await getBody<BanjarOption[]>(`${API}/banjar/find-many`);
  return requireData(status, body, "daftar banjar");
}

/** Angka gabungan kesehatan seluruh desa, atau satu banjar bila `banjarId` diisi. Tidak berisi data pribadi. */
export async function loadStats(banjarId?: string): Promise<PosyanduStats> {
  const what = banjarId ? `statistik kesehatan banjar ${banjarId}` : "statistik kesehatan desa";
  const query = banjarId ? `?banjarId=${encodeURIComponent(banjarId)}` : "";
  const { status, body } = await getBody<PosyanduStats>(`${API}/ringkasankesehatan/stats${query}`);
  return requireData(status, body, what);
}
