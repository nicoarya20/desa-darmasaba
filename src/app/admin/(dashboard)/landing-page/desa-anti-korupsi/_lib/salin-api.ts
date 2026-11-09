// Panggilan API "Salin ke program lain" di editor admin Desa Anti Korupsi: daftar program tujuan,
// folder program tujuan, dan POST salin. Tidak melempar error — hasil berupa { ok, data | message }.
import type { SalinInput } from '@/lib/desa-anti-korupsi-salin';

/** Base endpoint program DAK (relatif, sama origin dengan halaman admin). */
export const DAK_API_BASE = '/api/landingpage/desaantikorupsi';

/** Batas program yang dimuat untuk pilihan tujuan (findMany berpaginasi; pencarian di Select). */
export const PROGRAM_TUJUAN_LIMIT = 100;

/** Program yang bisa jadi tujuan salin. */
export type ProgramTujuan = { id: string; name: string };

/** Folder di program tujuan (tanpa "Umum" — folder virtual ditambahkan di UI). */
export type FolderTujuan = { id: string; nama: string };

/** Jumlah dokumen yang disalin & dilewati (berkas sudah ada di folder tujuan). */
export type SalinHasil = { copied: number; skipped: number };

/** Hasil panggilan API: data, atau pesan gagal siap tampil. */
export type ApiResult<T> = { ok: true; data: T } | { ok: false; message: string };

const PESAN_KONEKSI = 'Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.';

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

/** Pesan gagal dari body `{ message }` server bila ada, selain itu `fallback` (+ kode status). */
export function pesanGagalApi(status: number, body: unknown, fallback: string): string {
  if (isRecord(body) && typeof body.message === 'string' && body.message.trim() !== '') return body.message;
  return status > 0 ? `${fallback} (HTTP ${status})` : fallback;
}

/** Fetch JSON: gagal jaringan, status bukan 2xx, atau `success: false` → { ok: false, message }. */
async function requestJson(url: string, init: RequestInit | undefined, fetchImpl: typeof fetch, fallback: string) {
  let res: Response;
  try {
    res = await fetchImpl(url, init);
  } catch {
    return { ok: false as const, message: PESAN_KONEKSI };
  }
  const body: unknown = await res.json().catch(() => null);
  if (!res.ok || !isRecord(body) || body.success === false) {
    return { ok: false as const, message: pesanGagalApi(res.ok ? 0 : res.status, body, fallback) };
  }
  return { ok: true as const, body };
}

/** Daftar program DAK aktif (halaman pertama, maks PROGRAM_TUJUAN_LIMIT) untuk pilihan tujuan. */
export async function fetchProgramTujuan(fetchImpl: typeof fetch = fetch): Promise<ApiResult<ProgramTujuan[]>> {
  const query = new URLSearchParams({ page: '1', limit: String(PROGRAM_TUJUAN_LIMIT) });
  const res = await requestJson(`${DAK_API_BASE}/findMany?${query.toString()}`, undefined, fetchImpl, 'Gagal memuat daftar program');
  if (!res.ok) return res;
  const rows = Array.isArray(res.body.data) ? res.body.data : [];
  const data = rows.flatMap((row: unknown) =>
    isRecord(row) && typeof row.id === 'string' && typeof row.name === 'string' ? [{ id: row.id, name: row.name }] : [],
  );
  return { ok: true, data };
}

/** Folder aktif program tujuan (urut sesuai detail program) dari GET /:id. */
export async function fetchFolderTujuan(programId: string, fetchImpl: typeof fetch = fetch): Promise<ApiResult<FolderTujuan[]>> {
  const url = `${DAK_API_BASE}/${encodeURIComponent(programId)}`;
  const res = await requestJson(url, undefined, fetchImpl, 'Gagal memuat folder program tujuan');
  if (!res.ok) return res;
  const folders = isRecord(res.body.data) && Array.isArray(res.body.data.folders) ? res.body.data.folders : [];
  const data = folders.flatMap((f: unknown) =>
    isRecord(f) && typeof f.id === 'string' && typeof f.nama === 'string' ? [{ id: f.id, nama: f.nama }] : [],
  );
  return { ok: true, data };
}

/** POST /dokumen/salin-ke-program — salinan langsung tersimpan di program tujuan. */
export async function salinKeProgram(input: SalinInput, fetchImpl: typeof fetch = fetch): Promise<ApiResult<SalinHasil>> {
  const res = await requestJson(
    `${DAK_API_BASE}/dokumen/salin-ke-program`,
    { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) },
    fetchImpl,
    'Gagal menyalin dokumen',
  );
  if (!res.ok) return res;
  const data = isRecord(res.body.data) ? res.body.data : {};
  const copied = typeof data.copied === 'number' ? data.copied : 0;
  const skipped = typeof data.skipped === 'number' ? data.skipped : 0;
  return { ok: true, data: { copied, skipped } };
}
