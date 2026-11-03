// Aturan kegiatan Pembangunan (Kegiatan Desa) — fungsi & konstanta murni, tanpa
// I/O, dipakai bersama oleh API (Elysia), admin, dan halaman publik.

/** Id tetap kategori "Pembangunan" di tabel KategoriKegiatan (di-seed & dibuat migrasi). */
export const KATEGORI_PEMBANGUNAN_ID = "katpembangunan01";

export const STATUS_PEMBANGUNAN = ["rencana", "berjalan", "selesai"] as const;
export type StatusPembangunan = (typeof STATUS_PEMBANGUNAN)[number];

export const STATUS_PEMBANGUNAN_LABEL: Record<StatusPembangunan, string> = {
  rencana: "Rencana",
  berjalan: "Berjalan",
  selesai: "Selesai",
};

export const PROGRES_MIN = 0;
export const PROGRES_MAX = 100;
export const SUMBER_DANA_MAX_LENGTH = 255;

export type PembangunanFields = {
  anggaran: number | null;
  progres: number | null;
  statusPembangunan: StatusPembangunan | null;
  sumberDana: string | null;
};

/** Field pembangunan yang BOLEH tidak dikirim klien (undefined = jangan ubah). */
export type PembangunanInput = Partial<PembangunanFields>;

export type ParseResult =
  | { ok: true; data: PembangunanInput }
  | { ok: false; message: string };

/** Apakah nilai adalah status pembangunan yang valid. */
export function isStatusPembangunan(value: unknown): value is StatusPembangunan {
  return (STATUS_PEMBANGUNAN as readonly unknown[]).includes(value);
}

/** Apakah kegiatan ini termasuk kategori Pembangunan. */
export function isKegiatanPembangunan(
  item: { kategoriKegiatanId?: string | null } | null | undefined,
): boolean {
  return item?.kategoriKegiatanId === KATEGORI_PEMBANGUNAN_ID;
}

const isBlank = (v: unknown) => v === undefined || v === null;

/**
 * Validasi & normalisasi field pembangunan dari body request.
 * undefined → dilewati (tidak diubah); null → dikosongkan; selain itu harus valid.
 */
export function parsePembangunanInput(body: Record<string, unknown>): ParseResult {
  const data: PembangunanInput = {};

  if (body.anggaran !== undefined) {
    if (body.anggaran === null) {
      data.anggaran = null;
    } else if (
      typeof body.anggaran !== "number" ||
      !Number.isFinite(body.anggaran) ||
      body.anggaran < 0
    ) {
      return { ok: false, message: "Anggaran harus berupa angka tidak negatif" };
    } else {
      data.anggaran = body.anggaran;
    }
  }

  if (body.progres !== undefined) {
    if (body.progres === null) {
      data.progres = null;
    } else if (
      typeof body.progres !== "number" ||
      !Number.isInteger(body.progres) ||
      body.progres < PROGRES_MIN ||
      body.progres > PROGRES_MAX
    ) {
      return {
        ok: false,
        message: `Progres harus bilangan bulat ${PROGRES_MIN}-${PROGRES_MAX}`,
      };
    } else {
      data.progres = body.progres;
    }
  }

  if (body.statusPembangunan !== undefined) {
    if (body.statusPembangunan === null || body.statusPembangunan === "") {
      data.statusPembangunan = null;
    } else if (!isStatusPembangunan(body.statusPembangunan)) {
      return {
        ok: false,
        message: `Status pembangunan harus salah satu dari: ${STATUS_PEMBANGUNAN.join(", ")}`,
      };
    } else {
      data.statusPembangunan = body.statusPembangunan;
    }
  }

  if (body.sumberDana !== undefined) {
    if (isBlank(body.sumberDana)) {
      data.sumberDana = null;
    } else if (typeof body.sumberDana !== "string") {
      return { ok: false, message: "Sumber dana harus berupa teks" };
    } else {
      const trimmed = body.sumberDana.trim();
      if (trimmed.length > SUMBER_DANA_MAX_LENGTH) {
        return {
          ok: false,
          message: `Sumber dana maksimal ${SUMBER_DANA_MAX_LENGTH} karakter`,
        };
      }
      data.sumberDana = trimmed === "" ? null : trimmed;
    }
  }

  return { ok: true, data };
}

/**
 * Field pembangunan yang boleh disimpan untuk sebuah kategori: kategori selain
 * Pembangunan selalu dikosongkan (field ini khusus Pembangunan).
 */
export function resolvePembangunanData(
  kategoriKegiatanId: string,
  input: PembangunanInput,
): PembangunanInput {
  if (kategoriKegiatanId === KATEGORI_PEMBANGUNAN_ID) return input;
  return { anggaran: null, progres: null, statusPembangunan: null, sumberDana: null };
}

/** Format angka sebagai Rupiah (id-ID), tanpa pecahan. */
export function formatRupiah(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}
