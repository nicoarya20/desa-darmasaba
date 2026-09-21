// src/app/api/[[...slugs]]/_lib/landing_page/hari-libur/holidayCache.ts
import { parseIcsHolidays } from "./parseIcsHolidays";

// Kalender publik "Indonesian holidays" yang di-maintain Google — gratis, tanpa API key.
const GOOGLE_CALENDAR_ICS_URL =
  "https://calendar.google.com/calendar/ical/en.indonesian%23holiday%40group.v.calendar.google.com/public/basic.ics";

// Kalender hari libur jarang berubah dalam sehari, jadi cache 24 jam cukup aman
// dan menghindari fetch berulang ke Google di setiap kunjungan halaman.
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

let cachedHolidays: Map<string, string> | null = null;
let cacheExpiresAt = 0;

/**
 * Ambil map tanggal hari libur nasional Indonesia dari Google Calendar, dengan in-memory cache
 * (server berjalan sebagai proses persisten `next start`, bukan serverless per-request).
 *
 * Fail-open: kalau fetch ke Google gagal, pakai cache lama walau sudah expired; kalau belum
 * pernah berhasil fetch sama sekali, return Map kosong (dianggap tidak libur) supaya widget jam
 * operasional tidak pernah rusak/blank hanya gara-gara Google Calendar sedang tidak bisa diakses.
 */
export async function getHolidayMap(): Promise<Map<string, string>> {
  const now = Date.now();
  if (cachedHolidays && now < cacheExpiresAt) {
    return cachedHolidays;
  }

  try {
    const response = await fetch(GOOGLE_CALENDAR_ICS_URL);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const icsText = await response.text();
    cachedHolidays = parseIcsHolidays(icsText);
    cacheExpiresAt = now + CACHE_TTL_MS;
    return cachedHolidays;
  } catch (error) {
    console.error("Gagal mengambil kalender hari libur nasional dari Google Calendar:", error);
    return cachedHolidays ?? new Map();
  }
}
