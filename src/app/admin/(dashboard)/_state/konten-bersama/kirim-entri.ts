import { getServerMessage } from "@/utils/api-message";

/**
 * Simpan body JSON satu entri domain (POST tambah bila `id` null ke `${base}/create`, PUT ubah ke `${base}/:id`).
 * Mengembalikan id tersimpan, atau melempar Error berpesan server / status HTTP (`label` mis. "bank sampah").
 */
export async function kirimEntri(base: string, id: string | null, body: unknown, label: string): Promise<string> {
  const res = await fetch(id ? `${base}/${encodeURIComponent(id)}` : `${base}/create`, {
    method: id ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  // Body bukan JSON (mis. halaman error proxy) → diperlakukan kosong; status HTTP jadi alasan di pesan error.
  const json: unknown = await res.json().catch(() => null);
  const data = (json as { success?: boolean; data?: { id?: string } } | null) ?? null;
  if (!res.ok || !data?.success || !data.data?.id) {
    throw new Error(getServerMessage(json) ?? `Gagal menyimpan ${label} (HTTP ${res.status})`);
  }
  return data.data.id;
}
