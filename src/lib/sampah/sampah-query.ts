// Validasi query API Sampah (murni): kelompok, paging, pencarian. Pesan error → HTTP 400.
import { isSampahKelompokId, SAMPAH_KELOMPOK_SEMUA } from "./sampah-kelompok";

export const SAMPAH_LIMIT_DEFAULT = 20;
export const SAMPAH_LIMIT_MAX = 100;
/** Batas `page × limit`: tiap sumber mengambil sebanyak ini baris teratas untuk digabung. */
export const SAMPAH_JENDELA_MAX = 5000;
/** Panjang maksimal teks pencarian. */
export const SAMPAH_CARI_MAX = 100;

type Raw = Record<string, unknown> | undefined;
type Hasil<T> = { ok: true; value: T } | { ok: false; message: string };

const teks = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** Kelompok valid: "semua", ID section sidebar, atau "lainnya". Kosong → `fallback` (null = wajib diisi). */
export function parseSampahKelompok(raw: unknown, fallback: string | null): Hasil<string> {
  const v = teks(raw) || fallback;
  if (!v) return { ok: false, message: "Parameter kelompok wajib diisi" };
  if (v !== SAMPAH_KELOMPOK_SEMUA && !isSampahKelompokId(v)) return { ok: false, message: `Kelompok tidak dikenal: ${v}` };
  return { ok: true, value: v };
}

function parseInt1(raw: unknown, fallback: number, max: number, nama: string): Hasil<number> {
  const v = teks(raw);
  if (!v) return { ok: true, value: fallback };
  const n = Number(v);
  if (!Number.isInteger(n) || n < 1 || n > max) return { ok: false, message: `${nama} harus bilangan bulat 1–${max}` };
  return { ok: true, value: n };
}

/** Query daftar Sampah (`kelompok` default "semua", `page` 1, `limit` 20, `cari` kosong). */
export function parseSampahListQuery(query: Raw): Hasil<{ kelompok: string; page: number; limit: number; cari: string }> {
  const kelompok = parseSampahKelompok(query?.kelompok, SAMPAH_KELOMPOK_SEMUA);
  if (!kelompok.ok) return kelompok;
  const limit = parseInt1(query?.limit, SAMPAH_LIMIT_DEFAULT, SAMPAH_LIMIT_MAX, "limit");
  if (!limit.ok) return limit;
  const page = parseInt1(query?.page, 1, Math.floor(SAMPAH_JENDELA_MAX / limit.value), "page");
  if (!page.ok) return page;
  const cari = teks(query?.cari);
  if (cari.length > SAMPAH_CARI_MAX) return { ok: false, message: `cari maksimal ${SAMPAH_CARI_MAX} karakter` };
  return { ok: true, value: { kelompok: kelompok.value, page: page.value, limit: limit.value, cari } };
}
