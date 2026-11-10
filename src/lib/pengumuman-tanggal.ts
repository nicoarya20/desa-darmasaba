/**
 * Tanggal terbit Pengumuman — fungsi murni (tanpa I/O) dipakai API, form admin, dan halaman publik
 * supaya tanggal yang diketik admin, disimpan, dan ditampilkan selalu dibaca di zona waktu desa.
 */
import { DESA_TIME_ZONE } from "@/app/darmasaba/_com/main-page/apbdes/apbdes.logic";

/** Offset UTC zona waktu desa (WITA, tanpa DST) untuk membaca input tanggal `YYYY-MM-DD`. */
const DESA_UTC_OFFSET = "+08:00";

const TANGGAL_SAJA = /^\d{4}-\d{2}-\d{2}$/;

type Hasil<T> = { ok: true; data: T } | { ok: false; message: string };

/**
 * Baca `tanggalTerbit` dari body. Kosong/null/undefined → `undefined` (create: default DB = sekarang,
 * update: tidak diubah). `YYYY-MM-DD` = awal hari itu di WITA; ISO lengkap diterima apa adanya.
 */
export function parseTanggalTerbit(input: unknown): Hasil<Date | undefined> {
  if (input === undefined || input === null) return { ok: true, data: undefined };
  if (typeof input !== "string") return { ok: false, message: "Tanggal terbit tidak valid" };
  const raw = input.trim();
  if (raw === "") return { ok: true, data: undefined };

  const date = TANGGAL_SAJA.test(raw) ? new Date(`${raw}T00:00:00${DESA_UTC_OFFSET}`) : new Date(raw);
  if (Number.isNaN(date.getTime())) return { ok: false, message: `Tanggal terbit tidak valid: "${raw}"` };
  // `new Date("2026-02-31T00:00+08:00")` bergeser ke Maret; tolak supaya salah ketik tidak lolos.
  if (TANGGAL_SAJA.test(raw) && tanggalKeInput(date) !== raw) {
    return { ok: false, message: `Tanggal terbit tidak valid: "${raw}"` };
  }
  return { ok: true, data: date };
}

/** Date/ISO → `YYYY-MM-DD` menurut kalender WITA (nilai untuk input tanggal admin). */
export function tanggalKeInput(value: Date | string): string {
  // en-CA memformat tanggal sebagai YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: DESA_TIME_ZONE,
  }).format(new Date(value));
}

/** Tanggal hari ini (WITA) sebagai `YYYY-MM-DD` — default input Tanggal Terbit. */
export function hariIniInput(now: Date = new Date()): string {
  return tanggalKeInput(now);
}

/** Tanggal yang ditampilkan: `tanggalTerbit`, fallback `createdAt` untuk respons lama. */
export function tanggalPengumuman(item: {
  tanggalTerbit?: Date | string | null;
  createdAt: Date | string;
}): Date {
  return new Date(item.tanggalTerbit ?? item.createdAt);
}

/** Format tampilan publik/admin, mis. `Senin, 3 November 2026` (WITA). */
export function formatTanggalTerbit(date: Date, withWeekday = true): string {
  return new Intl.DateTimeFormat("id-ID", {
    ...(withWeekday ? { weekday: "long" as const } : {}),
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: DESA_TIME_ZONE,
  }).format(date);
}
