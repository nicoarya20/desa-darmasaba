// Aturan Sektor Unggulan Desa — fungsi & konstanta murni, tanpa I/O, dipakai bersama
// oleh API (Elysia), admin, dan halaman publik.

export const SATUAN_MAX_LENGTH = 20;
export const PERIODE_MAX_LENGTH = 50;

/** Satuan sumbu grafik publik saat belum ada satuan terisi (perilaku tampilan lama). */
export const LEGACY_CHART_UNIT = "Ton";

export type SektorSatuanPeriode = {
  satuan: string | null;
  periode: string | null;
};

/** Field satuan/periode yang BOLEH tidak dikirim klien (undefined = jangan ubah). */
export type SektorSatuanPeriodeInput = Partial<SektorSatuanPeriode>;

export type SektorParseResult =
  | { ok: true; data: SektorSatuanPeriodeInput }
  | { ok: false; message: string };

function parseOptionalText(
  value: unknown,
  label: string,
  maxLength: number,
): { ok: true; value: string | null } | { ok: false; message: string } {
  if (value === null) return { ok: true, value: null };
  if (typeof value !== "string") {
    return { ok: false, message: `${label} harus berupa teks` };
  }
  const trimmed = value.trim();
  if (trimmed.length > maxLength) {
    return { ok: false, message: `${label} maksimal ${maxLength} karakter` };
  }
  return { ok: true, value: trimmed === "" ? null : trimmed };
}

/**
 * Validasi & normalisasi satuan/periode dari body request.
 * undefined → dilewati (tidak diubah); null atau teks kosong → dikosongkan.
 */
export function parseSatuanPeriodeInput(body: Record<string, unknown>): SektorParseResult {
  const data: SektorSatuanPeriodeInput = {};

  if (body.satuan !== undefined) {
    const r = parseOptionalText(body.satuan, "Satuan", SATUAN_MAX_LENGTH);
    if (!r.ok) return r;
    data.satuan = r.value;
  }

  if (body.periode !== undefined) {
    const r = parseOptionalText(body.periode, "Periode", PERIODE_MAX_LENGTH);
    if (!r.ok) return r;
    data.periode = r.value;
  }

  return { ok: true, data };
}

/**
 * Teks "{value} {satuan} • {periode}" untuk tampilan publik. Mengembalikan null bila
 * satuan atau nilai kosong, sehingga tampilan lama (tanpa angka) tidak berubah.
 */
export function formatSektorValue(item: {
  value?: number | null;
  satuan?: string | null;
  periode?: string | null;
}): string | null {
  const satuan = item.satuan?.trim();
  if (!satuan) return null;
  if (typeof item.value !== "number" || !Number.isFinite(item.value)) return null;

  const angka = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(item.value);
  const periode = item.periode?.trim();
  return periode ? `${angka} ${satuan} • ${periode}` : `${angka} ${satuan}`;
}

/**
 * Label sumbu grafik: satuan bersama bila SEMUA sektor di grafik memakai satuan yang
 * sama; selain itu tetap satuan lama ("Ton") agar data lama tidak berubah tampilannya.
 */
export function resolveChartUnit(items: { satuan?: string | null }[]): string {
  if (items.length === 0) return LEGACY_CHART_UNIT;
  const units = new Set(items.map((i) => i.satuan?.trim() || ""));
  if (units.size !== 1) return LEGACY_CHART_UNIT;
  const [only] = Array.from(units);
  return only || LEGACY_CHART_UNIT;
}
