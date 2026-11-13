import { CCTV_TIME_ZONE, CCTV_TIME_ZONE_LABEL, RELATIVE_MAX_DAYS } from "./cctv.meta";
import type { CctvItem } from "./cctv.source";
import { CCTV_TEXT as T } from "./cctv.text";

/** Helper murni halaman CCTV: ringkasan status, saring cari, format "aktif terakhir". */

export type CctvSummary = { total: number; online: number; offline: number; unknown: number; mapped: number };

/** Titik yang punya koordinat lengkap (bisa ditaruh di peta). */
export function hasCoords(item: CctvItem): item is CctvItem & { latitude: number; longitude: number } {
  return item.latitude !== null && item.longitude !== null;
}

/** Hitungan untuk ubin ringkasan, dari seluruh titik (tidak terpengaruh kata kunci cari). */
export function summarizeCctv(items: readonly CctvItem[]): CctvSummary {
  const summary: CctvSummary = { total: items.length, online: 0, offline: 0, unknown: 0, mapped: 0 };
  for (const item of items) {
    summary[item.status] += 1;
    if (hasCoords(item)) summary.mapped += 1;
  }
  return summary;
}

const normalize = (value: string) => value.toLocaleLowerCase("id").replace(/\s+/g, " ").trim();
// "CCTV - 09" dan "cctv-09" dianggap sama: bandingkan juga tanpa spasi/tanda hubung.
const compact = (value: string) => normalize(value).replace(/[\s-]+/g, "");

/** Saring kode/nama/lokasi tanpa beda huruf besar/kecil, spasi, atau tanda hubung; kata kunci kosong = semua. */
export function filterCctv(items: readonly CctvItem[], query: string): CctvItem[] {
  const needle = normalize(query);
  if (!needle) return [...items];
  const needleCompact = compact(query);
  return items.filter((item) =>
    [item.kode, item.nama, item.lokasi].some(
      (field) => normalize(field).includes(needle) || (needleCompact !== "" && compact(field).includes(needleCompact)),
    ),
  );
}

export type LastActiveText = { text: string; full: string; dateTime: string };

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * "Aktif terakhir": relatif bila masih dalam RELATIVE_MAX_DAYS ("5 menit yang lalu", "kemarin"),
 * selebihnya tanggal WITA ("12 Feb 2026, 22.30 WITA"). `full` = tanggal lengkap untuk tooltip. Tanggal tidak valid → null.
 */
export function formatLastActive(iso: string | null, now: Date): LastActiveText | null {
  if (!iso) return null;
  const date = new Date(iso);
  const time = date.getTime();
  if (Number.isNaN(time)) return null;

  const full = `${new Intl.DateTimeFormat("id-ID", { dateStyle: "full", timeStyle: "short", timeZone: CCTV_TIME_ZONE }).format(date)} ${CCTV_TIME_ZONE_LABEL}`;
  const base = { full, dateTime: date.toISOString() };
  const diff = now.getTime() - time;

  if (diff >= -MINUTE && diff < MINUTE) return { ...base, text: T.justNow };
  if (diff > 0 && diff < RELATIVE_MAX_DAYS * DAY) {
    const rtf = new Intl.RelativeTimeFormat("id", { numeric: "auto" });
    const text =
      diff < HOUR
        ? rtf.format(-Math.floor(diff / MINUTE), "minute")
        : diff < DAY
          ? rtf.format(-Math.floor(diff / HOUR), "hour")
          : rtf.format(-Math.floor(diff / DAY), "day");
    return { ...base, text };
  }
  const short = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: CCTV_TIME_ZONE,
  }).format(date);
  return { ...base, text: `${short} ${CCTV_TIME_ZONE_LABEL}` };
}
