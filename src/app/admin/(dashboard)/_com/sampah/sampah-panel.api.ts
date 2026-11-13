// Klien API Sampah per fitur (`/api/sampah/:sumber`, khusus admin). Fetch biasa (bukan Eden) agar mudah
// di-stub di test; tidak melempar error — hasil (data + pesan, atau status + pesan) dikembalikan.
import { getServerMessage } from '@/utils/api-message';
import type { SampahPanelHalaman, SampahSumber } from './sampah-panel.logic';

/** Hasil panggilan API Sampah: data + pesan server, atau status HTTP (0 = jaringan) + pesan siap tampil. */
export type SampahPanelResult<T> =
  | { ok: true; data: T; message: string | null }
  | { ok: false; status: number; message: string };

/** Dependensi yang bisa diganti di test. */
export type SampahPanelApiDeps = { fetchImpl?: typeof fetch };

const SAMPAH_API_BASE = '/api/sampah';
const PESAN_JARINGAN = 'Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.';

async function kirim<T>(url: string, method: string, fallback: string, deps: SampahPanelApiDeps): Promise<SampahPanelResult<T>> {
  const fetchImpl = deps.fetchImpl ?? fetch;
  let res: Response;
  try {
    res = await fetchImpl(url, { method });
  } catch (err) {
    console.error(`[sampah] ${method} ${url} gagal terhubung:`, err);
    return { ok: false, status: 0, message: PESAN_JARINGAN };
  }
  // Body bukan JSON (mis. halaman error proxy) diperlakukan sebagai body kosong → pesan bawaan.
  const body: unknown = await res.json().catch(() => null);
  const success = !!body && typeof body === 'object' && (body as { success?: unknown }).success === true;
  if (!res.ok || !success) return { ok: false, status: res.status, message: getServerMessage(body) ?? fallback };
  return { ok: true, data: (body as { data: T }).data, message: getServerMessage(body) ?? null };
}

const itemUrl = (sumber: SampahSumber, id: string) =>
  `${SAMPAH_API_BASE}/${encodeURIComponent(sumber)}/${encodeURIComponent(id)}`;

/** URL daftar Sampah satu sumber; `scopeId` hanya dikirim bila ada (wajib untuk dokumen APBDes). */
export function sampahPanelListUrl(
  sumber: SampahSumber,
  query: { scopeId?: string; page: number; limit: number },
): string {
  const params = new URLSearchParams();
  if (query.scopeId) params.set('scopeId', query.scopeId);
  params.set('page', String(query.page));
  params.set('limit', String(query.limit));
  return `${SAMPAH_API_BASE}/${encodeURIComponent(sumber)}?${params.toString()}`;
}

/** Muat satu halaman Sampah (terbaru dihapus dulu). */
export function muatSampahPanel(
  sumber: SampahSumber,
  query: { scopeId?: string; page: number; limit: number },
  deps: SampahPanelApiDeps = {},
): Promise<SampahPanelResult<SampahPanelHalaman>> {
  return kirim(sampahPanelListUrl(sumber, query), 'GET', 'Gagal memuat Sampah', deps);
}

/** Pulihkan item ke tempat asalnya (folder asal terhapus → tanpa folder). */
export function pulihkanSampahPanel(
  sumber: SampahSumber,
  id: string,
  deps: SampahPanelApiDeps = {},
): Promise<SampahPanelResult<unknown>> {
  return kirim(`${itemUrl(sumber, id)}/pulihkan`, 'POST', 'Gagal memulihkan item', deps);
}

/** Hapus permanen item di Sampah beserta berkasnya. */
export function hapusPermanenSampahPanel(
  sumber: SampahSumber,
  id: string,
  deps: SampahPanelApiDeps = {},
): Promise<SampahPanelResult<unknown>> {
  return kirim(itemUrl(sumber, id), 'DELETE', 'Gagal menghapus item secara permanen', deps);
}
