/**
 * Status tindak lanjut Pengaduan Masyarakat (Juknis lomba 3.3): konstanta, label Indonesia, dan validator.
 * Satu-satunya tempat yang boleh memutuskan arti `status = null` (data lama & kiriman baru = BARU).
 */

export const PENGADUAN_STATUS = ["BARU", "DIPROSES", "SELESAI", "DITOLAK"] as const;

export type PengaduanStatus = (typeof PENGADUAN_STATUS)[number];

/** Status awal; juga arti dari kolom `status` yang null. */
export const PENGADUAN_STATUS_DEFAULT: PengaduanStatus = "BARU";

export const PENGADUAN_STATUS_LABEL: Record<PengaduanStatus, string> = {
  BARU: "Baru",
  DIPROSES: "Diproses",
  SELESAI: "Selesai",
  DITOLAK: "Ditolak",
};

/** Batas panjang tanggapan (karakter, setelah HTML dibuang); tampil publik, jadi dibuat ringkas. */
export const PENGADUAN_TANGGAPAN_MAX = 1000;

/** Penjaga tipe: apakah nilai adalah salah satu status yang dikenal. */
export function isPengaduanStatus(value: unknown): value is PengaduanStatus {
  return typeof value === "string" && (PENGADUAN_STATUS as readonly string[]).includes(value);
}

/** Validasi input (body/query): status yang dikenal, atau null bila tidak valid. */
export function parsePengaduanStatus(value: unknown): PengaduanStatus | null {
  return isPengaduanStatus(value) ? value : null;
}

/**
 * Baca kolom `status` dari database: null/kosong → BARU. Nilai di luar daftar (hanya mungkin lewat sunting
 * database manual, API selalu memvalidasi) juga dibaca BARU supaya jumlah per status tetap sama dengan total.
 */
export function resolvePengaduanStatus(stored: string | null | undefined): PengaduanStatus {
  return isPengaduanStatus(stored) ? stored : PENGADUAN_STATUS_DEFAULT;
}
