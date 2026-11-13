// Validasi query daftar Sampah per fitur (murni): paging + scopeId. Pesan error → HTTP 400.

export const SAMPAH_LIMIT_DEFAULT = 20;
export const SAMPAH_LIMIT_MAX = 100;
/** Batas atas `page` (penjaga nilai absurd; daftar dipaging di DB). */
export const SAMPAH_PAGE_MAX = 10_000;
/** Panjang maksimal `scopeId` (ID cuid jauh di bawahnya). */
export const SAMPAH_SCOPE_MAX = 100;

type Raw = Record<string, unknown> | undefined;
type Hasil<T> = { ok: true; value: T } | { ok: false; message: string };

/** Query daftar Sampah yang sudah divalidasi; `scopeId` null bila kosong. */
export type SampahListQuery = { page: number; limit: number; scopeId: string | null };

const teks = (v: unknown) => (typeof v === "string" ? v.trim() : "");

function parseInt1(raw: unknown, fallback: number, max: number, nama: string): Hasil<number> {
  const v = teks(raw);
  if (!v) return { ok: true, value: fallback };
  const n = Number(v);
  if (!Number.isInteger(n) || n < 1 || n > max) return { ok: false, message: `${nama} harus bilangan bulat 1–${max}` };
  return { ok: true, value: n };
}

/** Query daftar Sampah (`page` 1, `limit` 20, `scopeId` opsional — wajib-tidaknya ditentukan sumber). */
export function parseSampahListQuery(query: Raw): Hasil<SampahListQuery> {
  const limit = parseInt1(query?.limit, SAMPAH_LIMIT_DEFAULT, SAMPAH_LIMIT_MAX, "limit");
  if (!limit.ok) return limit;
  const page = parseInt1(query?.page, 1, SAMPAH_PAGE_MAX, "page");
  if (!page.ok) return page;
  const scopeId = teks(query?.scopeId);
  if (scopeId.length > SAMPAH_SCOPE_MAX) return { ok: false, message: `scopeId maksimal ${SAMPAH_SCOPE_MAX} karakter` };
  return { ok: true, value: { page: page.value, limit: limit.value, scopeId: scopeId || null } };
}
