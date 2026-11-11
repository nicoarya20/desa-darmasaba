import { isKategoriEvent, KATEGORI_EVENT } from "@/lib/agenda-desa";
import { awalHariWita, rentangTahunBulan } from "@/lib/agenda-desa-waktu";

/** Query filter opsional list agenda (semua string mentah dari URL). */
export type EventBudayaFilterQuery = {
  kategori?: unknown;
  tahun?: unknown;
  bulan?: unknown;
  mendatang?: unknown;
};

/** Kondisi where Prisma (subset yang dipakai list agenda). */
export type EventBudayaWhere = {
  isActive: true;
  kategori?: string;
  AND?: Record<string, unknown>[];
};

export type ParseFilterResult =
  | { ok: true; where: EventBudayaWhere; tahun: number | null }
  | { ok: false; message: string };

const TAHUN_REGEX = /^\d{4}$/;
const BULAN_MIN = 1;
const BULAN_MAX = 12;

/** Klausa AND: agenda yang rentang harinya menyentuh tahun/bulan tersebut. */
function klausaTumpangTindih(tahun: number, bulan?: number): Record<string, unknown>[] {
  const { gte, lt } = rentangTahunBulan(tahun, bulan);
  return [
    { tanggal: { lt } },
    { OR: [{ tanggalSelesai: { gte } }, { tanggalSelesai: null, tanggal: { gte } }] },
  ];
}

const kosong = (v: unknown) => v === undefined || v === null || v === "";

/**
 * Susun where list agenda dari query `kategori`, `tahun`, `bulan`, `mendatang`.
 * Tanpa param → hanya `{ isActive: true }` (perilaku lama). Agenda multi-hari
 * ikut tampil di tiap bulan/tahun yang dilewatinya; `mendatang` = belum lewat.
 */
export function buildEventBudayaWhere(
  query: EventBudayaFilterQuery,
  now: Date = new Date(),
): ParseFilterResult {
  const where: EventBudayaWhere = { isActive: true };
  const and: Record<string, unknown>[] = [];
  let tahun: number | null = null;

  if (!kosong(query.kategori)) {
    if (!isKategoriEvent(query.kategori)) {
      return { ok: false, message: `Kategori harus salah satu dari: ${KATEGORI_EVENT.join(", ")}` };
    }
    where.kategori = query.kategori;
  }

  if (!kosong(query.bulan) && kosong(query.tahun)) {
    return { ok: false, message: "Filter bulan membutuhkan tahun" };
  }

  if (!kosong(query.tahun)) {
    if (!TAHUN_REGEX.test(String(query.tahun))) {
      return { ok: false, message: "Tahun harus berupa 4 digit angka" };
    }
    tahun = Number(query.tahun);
    let bulan: number | undefined;
    if (!kosong(query.bulan)) {
      bulan = Number(query.bulan);
      if (!Number.isInteger(bulan) || bulan < BULAN_MIN || bulan > BULAN_MAX) {
        return { ok: false, message: `Bulan harus bilangan bulat ${BULAN_MIN}-${BULAN_MAX}` };
      }
    }
    and.push(...klausaTumpangTindih(tahun, bulan));
  }

  if (query.mendatang === "true" || query.mendatang === true) {
    const hariIni = awalHariWita(now);
    and.push({
      OR: [{ tanggalSelesai: { gte: hariIni } }, { tanggalSelesai: null, tanggal: { gte: hariIni } }],
    });
  }

  if (and.length > 0) where.AND = and;
  return { ok: true, where, tahun };
}

/** Where untuk ringkasan setahun (tanpa bulan/mendatang); `kategori` sudah tervalidasi oleh pemanggil. */
export function buildRingkasanTahunWhere(kategori: string | undefined, tahun: number): EventBudayaWhere {
  return {
    isActive: true,
    ...(kategori ? { kategori } : {}),
    AND: klausaTumpangTindih(tahun),
  };
}
