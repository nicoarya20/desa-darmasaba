// Batas pemakaian chat publik Jenna: validasi input, hari Asia/Jakarta, identitas anonim (IP/sesi
// di-hash), dan rate limiter per menit (in-memory, single instance — lihat src/lib/rate-limit.ts).
import { createHmac } from "node:crypto";
import { env } from "@/lib/env";
import { createLimiter } from "@/lib/rate-limit";
import { DEFAULT_JENNA_SETTINGS } from "./mappers";

export const INPUT_MESSAGES = {
  empty: "Pesan tidak boleh kosong.",
  too_long: (max: number) => `Pesan terlalu panjang. Maksimal ${max} karakter.`,
} as const;

export type InputCheckResult =
  | { ok: true; text: string }
  | { ok: false; reason: "empty" | "too_long"; message: string };

// Karakter kontrol & format (termasuk zero-width, bidi override) dibuang; baris baru dipertahankan.
const CONTROL_EXCEPT_NEWLINE = /(?!\n)[\p{Cc}\p{Cf}]/gu;

/** Bersihkan lalu validasi pesan pengunjung. `text` hasil = versi bersih yang dipakai selanjutnya. */
export function checkInput(text: string, maxInputChars: number): InputCheckResult {
  const cleaned = text.replace(CONTROL_EXCEPT_NEWLINE, "").trim();
  if (!cleaned) return { ok: false, reason: "empty", message: INPUT_MESSAGES.empty };
  if (cleaned.length > maxInputChars) {
    return { ok: false, reason: "too_long", message: INPUT_MESSAGES.too_long(maxInputChars) };
  }
  return { ok: true, text: cleaned };
}

const JAKARTA_OFFSET_MS = 7 * 60 * 60 * 1000; // WIB = UTC+7, tanpa DST.
const DAY_MS = 86_400_000;

/** 00:00 WIB hari `now` sebagai instan UTC (batas kuota harian). */
export function startOfJakartaDay(now: Date): Date {
  const local = now.getTime() + JAKARTA_OFFSET_MS;
  return new Date(local - (((local % DAY_MS) + DAY_MS) % DAY_MS) - JAKARTA_OFFSET_MS);
}

/** Detik sampai kuota harian reset (00:00 WIB berikutnya), minimal 1. */
export function secondsUntilJakartaMidnight(now: Date): number {
  const next = startOfJakartaDay(now).getTime() + DAY_MS;
  return Math.max(1, Math.ceil((next - now.getTime()) / 1000));
}

const IP_PATTERN = /^[0-9a-fA-F:.]{2,45}$/;

const validIp = (raw: string | null | undefined): string | null => {
  const value = raw?.trim();
  return value && IP_PATTERN.test(value) ? value : null;
};

/**
 * IP pengunjung: `cf-connecting-ip` → `x-real-ip` → hop paling kanan `x-forwarded-for` (ditambahkan
 * proxy terdekat, bukan klien) → null. Nilai yang bukan bentuk IP dilewati.
 */
export function getClientIp(headers: Headers): string | null {
  const direct = validIp(headers.get("cf-connecting-ip")) ?? validIp(headers.get("x-real-ip"));
  if (direct) return direct;
  const hops = headers.get("x-forwarded-for")?.split(",") ?? [];
  return validIp(hops[hops.length - 1]);
}

/** HMAC-SHA256 hex; nilai asli (IP/token sesi) tidak pernah disimpan. */
export function hashIdentifier(value: string, salt: string): string {
  return createHmac("sha256", salt).update(value).digest("hex");
}

/** Hash identitas Jenna dengan salt dari BETTER_AUTH_SECRET (dipisah domain agar tidak dipakai ulang). */
export function hashJennaIdentifier(value: string): string {
  return hashIdentifier(value, `jenna-identifier:${env.BETTER_AUTH_SECRET}`);
}

const MINUTE_MS = 60_000;

/** Plafon global semua pengunjung per menit (meredam lonjakan biaya). */
export const JENNA_GLOBAL_PER_MINUTE = 60;

// Batas default dari setelan bawaan; pemanggil memberi `rateLimitPerMinute` aktual per panggilan.
export const jennaIpMinuteLimiter = createLimiter(DEFAULT_JENNA_SETTINGS.rateLimitPerMinute, MINUTE_MS);
export const jennaSessionMinuteLimiter = createLimiter(DEFAULT_JENNA_SETTINGS.rateLimitPerMinute, MINUTE_MS);
export const jennaGlobalMinuteLimiter = createLimiter(JENNA_GLOBAL_PER_MINUTE, MINUTE_MS);
