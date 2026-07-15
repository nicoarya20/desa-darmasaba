/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Ambil pesan error dari respons Eden (ApiFetch) atau fetch JSON, secara
 * seragam. Menggantikan pesan generik "failed create"/"gagal" di state admin
 * agar pesan asli server (mis. 409 "Bulan sudah dipakai") sampai ke user.
 *
 * Bentuk respons yang didukung:
 * - Eden treaty: `{ data, error }` — sukses di `data`, error body di `error.value`.
 * - Body langsung: `{ message }` (mis. hasil `await res.json()`).
 */
export function getServerMessage(res: unknown): string | undefined {
  if (!res || typeof res !== "object") return undefined;
  const r = res as any;

  const fromData = r.data?.message;
  if (typeof fromData === "string" && fromData) return fromData;

  const fromError = r.error?.value?.message;
  if (typeof fromError === "string" && fromError) return fromError;

  const fromRoot = r.message;
  if (typeof fromRoot === "string" && fromRoot) return fromRoot;

  return undefined;
}
