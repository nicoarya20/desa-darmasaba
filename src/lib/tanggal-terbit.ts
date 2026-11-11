/**
 * Tanggal terbit konten (Berita, Pengumuman) — fungsi murni (tanpa I/O) dipakai API, form admin, dan
 * halaman publik supaya tanggal yang diketik admin, disimpan, dan ditampilkan selalu dibaca di zona
 * waktu desa. Keputusan: docs/decisions/2026-11-10-pengumuman-lampiran.md (pola awal) dan
 * docs/decisions/2026-11-11-berita-tanggal-terbit.md (dipakai bersama Berita).
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
export function tanggalTerbitAtauDibuat(item: {
  tanggalTerbit?: Date | string | null;
  createdAt: Date | string;
}): Date {
  return new Date(item.tanggalTerbit ?? item.createdAt);
}

/**
 * Nilai `tanggalTerbit` untuk body update: dikirim hanya bila input berbeda dari nilai awal, supaya jam
 * asli (mis. hasil backfill `createdAt`) tidak tertimpa 00:00. `""` = tidak diubah.
 */
export function tanggalTerbitJikaDiubah(input: string, awal: string): string {
  return input !== awal ? input : "";
}

/**
 * Format tampilan publik/admin di WITA: default `Senin, 3 November 2026`; tanpa hari `3 November 2026`;
 * `month: "short"` → `3 Nov 2026` (kartu list).
 */
export function formatTanggalTerbit(
  date: Date,
  withWeekday = true,
  month: "long" | "short" = "long",
): string {
  return new Intl.DateTimeFormat("id-ID", {
    ...(withWeekday ? { weekday: "long" as const } : {}),
    day: "numeric",
    month,
    year: "numeric",
    timeZone: DESA_TIME_ZONE,
  }).format(date);
}
