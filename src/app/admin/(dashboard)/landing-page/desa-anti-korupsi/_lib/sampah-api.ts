// Klien API tempat sampah dokumen Desa Anti Korupsi (khusus admin) untuk halaman detail.
// Fetch biasa (bukan state Valtio) supaya mudah diuji; tidak melempar error — hasil dikembalikan.

/** Satu item tempat sampah sesuai respons GET /:id/sampah (tanggal sudah berupa string JSON). */
export type SampahItemView = {
  id: string;
  judul: string;
  folderId: string | null;
  folderNama: string | null;
  file: { id: string; link: string; realName: string; mimeType: string };
  deletedAt: string;
  sisaHari: number;
};

/** Hasil panggilan API sampah: data, atau status HTTP (0 = jaringan) + pesan siap tampil. */
export type SampahApiResult<T> = { ok: true; data: T } | { ok: false; status: number; message: string };

type Deps = { fetchImpl?: typeof fetch };

const SAMPAH_API_BASE = '/api/landingpage/desaantikorupsi';
const PESAN_JARINGAN = 'Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.';

function messageOf(body: unknown): string | null {
  if (body && typeof body === 'object' && 'message' in body) {
    const { message } = body as { message: unknown };
    if (typeof message === 'string' && message.trim()) return message;
  }
  return null;
}

async function request<T>(url: string, method: string, fallback: string, deps: Deps): Promise<SampahApiResult<T>> {
  const { fetchImpl = fetch } = deps;
  let res: Response;
  try {
    res = await fetchImpl(url, { method });
  } catch {
    return { ok: false, status: 0, message: PESAN_JARINGAN };
  }
  // Body bukan JSON (mis. halaman error proxy) diperlakukan sebagai body kosong → pesan bawaan.
  const body: unknown = await res.json().catch(() => null);
  const success = !!body && typeof body === 'object' && (body as { success?: unknown }).success === true;
  if (!res.ok || !success) return { ok: false, status: res.status, message: messageOf(body) ?? fallback };
  return { ok: true, data: (body as { data: T }).data };
}

/** Muat daftar tempat sampah satu program (terbaru dulu). */
export function muatSampah(programId: string, deps: Deps = {}): Promise<SampahApiResult<SampahItemView[]>> {
  const url = `${SAMPAH_API_BASE}/${encodeURIComponent(programId)}/sampah`;
  return request(url, 'GET', 'Gagal memuat tempat sampah', deps);
}

/** Pulihkan dokumen dari tempat sampah; `folderId` = folder tujuan (null = "Umum"). */
export function pulihkanSampah(
  dokumenId: string,
  deps: Deps = {},
): Promise<SampahApiResult<{ id: string; folderId: string | null }>> {
  const url = `${SAMPAH_API_BASE}/sampah/${encodeURIComponent(dokumenId)}/pulihkan`;
  return request(url, 'POST', 'Gagal memulihkan dokumen', deps);
}

/** Hapus permanen dokumen yang ada di tempat sampah. */
export function hapusPermanenSampah(dokumenId: string, deps: Deps = {}): Promise<SampahApiResult<{ id: string }>> {
  const url = `${SAMPAH_API_BASE}/sampah/${encodeURIComponent(dokumenId)}`;
  return request(url, 'DELETE', 'Gagal menghapus dokumen secara permanen', deps);
}
