// Aturan Agenda & Kalender Desa (model EventBudaya) — konstanta & fungsi murni,
// tanpa I/O, dipakai bersama oleh API (Elysia), admin, dan halaman publik.

export const KATEGORI_EVENT = [
  "BUDAYA",
  "PEMERINTAHAN",
  "MUSYAWARAH",
  "KEPEMUDAAN",
  "PKK_PEREMPUAN",
  "PERTANIAN_PETERNAKAN",
  "LAINNYA",
] as const;
export type KategoriEvent = (typeof KATEGORI_EVENT)[number];

/** Kategori bawaan (sama dengan DEFAULT kolom di DB) untuk event tanpa kategori. */
export const KATEGORI_EVENT_DEFAULT: KategoriEvent = "BUDAYA";

export const KATEGORI_EVENT_LABEL: Record<KategoriEvent, string> = {
  BUDAYA: "Budaya",
  PEMERINTAHAN: "Pemerintahan",
  MUSYAWARAH: "Musyawarah",
  KEPEMUDAAN: "Kepemudaan",
  PKK_PEREMPUAN: "PKK & Perempuan",
  PERTANIAN_PETERNAKAN: "Pertanian & Peternakan",
  LAINNYA: "Lainnya",
};

/** Warna Mantine per kategori, dipakai badge di admin & halaman publik. */
export const KATEGORI_EVENT_COLOR: Record<KategoriEvent, string> = {
  BUDAYA: "orange",
  PEMERINTAHAN: "blue",
  MUSYAWARAH: "violet",
  KEPEMUDAAN: "teal",
  PKK_PEREMPUAN: "pink",
  PERTANIAN_PETERNAKAN: "lime",
  LAINNYA: "gray",
};

/** Opsi {value,label} untuk Select/Chip kategori. */
export const KATEGORI_EVENT_OPTIONS = KATEGORI_EVENT.map((value) => ({
  value,
  label: KATEGORI_EVENT_LABEL[value],
}));

/** Apakah nilai adalah kategori event yang valid. */
export function isKategoriEvent(value: unknown): value is KategoriEvent {
  return (KATEGORI_EVENT as readonly unknown[]).includes(value);
}

/** Label tampilan kategori; nilai tak dikenal jatuh ke label "Lainnya". */
export function labelKategoriEvent(value: string | null | undefined): string {
  return isKategoriEvent(value) ? KATEGORI_EVENT_LABEL[value] : KATEGORI_EVENT_LABEL.LAINNYA;
}

/** Warna Mantine kategori; nilai tak dikenal jatuh ke warna "Lainnya". */
export function warnaKategoriEvent(value: string | null | undefined): string {
  return isKategoriEvent(value) ? KATEGORI_EVENT_COLOR[value] : KATEGORI_EVENT_COLOR.LAINNYA;
}

/** Field agenda baru yang boleh dikirim klien (undefined = jangan ubah). */
export type EventInput = {
  kategori?: KategoriEvent;
  tanggalSelesai?: Date | null;
};

export type ParseEventResult =
  | { ok: true; data: EventInput }
  | { ok: false; message: string };

/**
 * Validasi & normalisasi `kategori` dan `tanggalSelesai` dari body create/update.
 * undefined → dilewati; tanggalSelesai null/"" → dikosongkan; selesai harus ≥ tanggal.
 */
export function parseEventInput(body: Record<string, unknown>): ParseEventResult {
  const data: EventInput = {};

  if (body.kategori !== undefined) {
    if (!isKategoriEvent(body.kategori)) {
      return {
        ok: false,
        message: `Kategori harus salah satu dari: ${KATEGORI_EVENT.join(", ")}`,
      };
    }
    data.kategori = body.kategori;
  }

  if (body.tanggalSelesai !== undefined) {
    if (body.tanggalSelesai === null || body.tanggalSelesai === "") {
      data.tanggalSelesai = null;
    } else {
      const selesai = new Date(String(body.tanggalSelesai));
      const mulai = new Date(String(body.tanggal));
      if (Number.isNaN(selesai.getTime())) {
        return { ok: false, message: "Tanggal selesai tidak valid" };
      }
      if (Number.isNaN(mulai.getTime())) {
        return { ok: false, message: "Tanggal tidak valid" };
      }
      if (selesai.getTime() < mulai.getTime()) {
        return { ok: false, message: "Tanggal selesai tidak boleh sebelum tanggal mulai" };
      }
      data.tanggalSelesai = selesai;
    }
  }

  return { ok: true, data };
}
