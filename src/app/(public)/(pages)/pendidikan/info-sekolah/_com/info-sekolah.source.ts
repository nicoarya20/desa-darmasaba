import { SORT_BY_JENJANG } from "@/lib/jenjang-pendidikan-urutan";
import {
  buildRingkasan,
  type InfoSekolahQuery,
  type InfoSekolahRingkasan,
  type LembagaItem,
  type StatsPendidikan,
} from "./info-sekolah.logic";
import { JENJANG_LIST_LIMIT, LEMBAGA_LIST_LIMIT, PENGAJAR_PAGE_SIZE } from "./info-sekolah.meta";

/**
 * Sumber data publik Info Sekolah (langsung ke API, bukan state admin): galat dilempar agar halaman bisa
 * menampilkan "Coba lagi" alih-alih angka 0. Halaman publik sengaja tidak memanggil endpoint daftar siswa
 * (nama siswa = data anak); siswa hanya tampil sebagai angka dari statistik.
 */

export type PengajarItem = {
  id: string;
  nama: string;
  lembaga: { nama: string; jenjangPendidikan: { nama: string } | null } | null;
};

export type PengajarPage = { items: PengajarItem[]; total: number; totalPages: number };

type Body<T> = { success?: boolean; message?: string; data?: T | null; total?: number; totalPages?: number } | null;

const API = "/api/pendidikan";
const SEKOLAH_API = `${API}/infosekolahpaud`;

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

function query(params: Record<string, string | number | undefined>): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value !== undefined && value !== "") qs.set(key, String(value));
  return qs.toString();
}

async function loadStats(): Promise<StatsPendidikan> {
  const { status, body } = await getBody<StatsPendidikan>(`${API}/ringkasan/stats`);
  return requireData(status, body, "statistik pendidikan");
}

async function loadLembaga(): Promise<{ items: LembagaItem[]; total: number }> {
  const url = `${SEKOLAH_API}/lembagapendidikan/find-many?${query({ page: 1, limit: LEMBAGA_LIST_LIMIT, sort: SORT_BY_JENJANG })}`;
  const { status, body } = await getBody<LembagaItem[]>(url);
  const items = requireData(status, body, "daftar lembaga pendidikan");
  const total = typeof body?.total === "number" ? body.total : items.length;
  if (total > items.length) {
    // MITIGASI SEMENTARA(info-sekolah-lembaga): direktori memuat satu halaman berbatas; bila lembaga melebihi batas,
    // sisanya tidak tampil di direktori (total di ubin tetap benar). Hapus bila direktori diberi paginasi/endpoint per jenjang.
    console.warn(`Info Sekolah: ${total} lembaga, direktori hanya memuat ${items.length}.`);
  }
  return { items, total };
}

/** Ubin ringkasan + direktori per jenjang (dua permintaan paralel). */
export async function loadInfoSekolah(): Promise<InfoSekolahRingkasan> {
  const [stats, lembaga] = await Promise.all([loadStats(), loadLembaga()]);
  return buildRingkasan(stats, lembaga.items, lembaga.total);
}

/** Nama jenjang yang punya lembaga aktif (opsi pil filter). */
export async function loadJenjangNames(): Promise<string[]> {
  const url = `${SEKOLAH_API}/jenjangpendidikan/find-many?${query({ page: 1, limit: JENJANG_LIST_LIMIT, hasLembaga: "true" })}`;
  const { status, body } = await getBody<{ nama: string }[]>(url);
  return requireData(status, body, "daftar jenjang pendidikan").map((j) => j.nama);
}

/** Satu halaman pengajar (urut jenjang lalu nama), disaring jenjang (nama) dan kata kunci. */
export async function loadPengajarPage({ jenjang, search, page }: InfoSekolahQuery): Promise<PengajarPage> {
  // Nama parameter `jenjangPendidikanId` memang berisi NAMA jenjang (kontrak API lama; lihat docs/BACKEND-TODO.md).
  const qs = query({ page, limit: PENGAJAR_PAGE_SIZE, search, jenjangPendidikanId: jenjang, sort: SORT_BY_JENJANG });
  const { status, body } = await getBody<PengajarItem[]>(`${SEKOLAH_API}/pengajar/find-many?${qs}`);
  const items = requireData(status, body, "daftar pengajar");
  return {
    items,
    total: typeof body?.total === "number" ? body.total : items.length,
    totalPages: typeof body?.totalPages === "number" ? body.totalPages : 1,
  };
}
