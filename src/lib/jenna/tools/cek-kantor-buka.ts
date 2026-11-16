import { z } from "zod";
import { getDayOfWeek, getWorkStatus } from "@/app/(public)/_com/main-page/landing-page/landing.logic";
import { getHolidayMap } from "@/app/api/[[...slugs]]/_lib/landing_page/hari-libur/holidayCache";
import { DESA_ALAMAT_UMUM, officeHoursLines } from "../knowledge/static-guide";
import { isRealDate, parseToolArgs, witaTime, witaToday } from "./common";
import type { JennaTool } from "./types";

export const cekKantorBukaArgs = z
  .object({ tanggal: z.string().refine(isRealDate, "format tanggal YYYY-MM-DD").optional() })
  .strict();

/** Status kantor desa pada `tanggal` (default hari ini WITA). `now` hanya diganti oleh test. */
export async function cekKantorBuka(tanggal: string | undefined, now = new Date()): Promise<string> {
  const today = witaToday(now);
  const ymd = tanggal ?? today;
  const [y, m, d] = ymd.split("-").map(Number);
  // Date lokal + getDay() lokal (dalam getDayOfWeek) → hari kalender yang sama di zona server mana pun.
  const day = getDayOfWeek(new Date(y, m - 1, d, 12));
  const holidays = await getHolidayMap();
  const holidayName = holidays.get(ymd) ?? null;
  const isToday = ymd === today;
  const status = getWorkStatus(day, isToday ? witaTime(now) : "00:00", { isHoliday: holidayName !== null, holidayName });

  const lines = [`Tanggal: ${ymd} (${day})`];
  if (holidayName) lines.push(`Hari libur nasional: ${holidayName} — kantor desa tutup.`);
  else if (/^\d{2}:\d{2}/.test(status.message)) lines.push(`Jam layanan: ${status.message} WITA`);
  else lines.push(`Kantor desa tutup (${status.message}).`);
  if (isToday) lines.push(`Status sekarang (${witaTime(now)} WITA): ${status.status}`);
  lines.push(`Jam layanan umum: ${officeHoursLines().join("; ")}.`, `Alamat umum: ${DESA_ALAMAT_UMUM}.`);
  return lines.join("\n");
}

export const cekKantorBukaTool: JennaTool = {
  spec: {
    name: "cek_kantor_buka",
    description: "Cek apakah kantor desa buka pada tanggal tertentu (memperhitungkan akhir pekan dan hari libur nasional). Tanpa tanggal = hari ini.",
    parameters: {
      type: "object",
      properties: { tanggal: { type: "string", format: "date", description: "Tanggal YYYY-MM-DD (opsional)." } },
      additionalProperties: false,
    },
  },
  async run(args) {
    const parsed = parseToolArgs(cekKantorBukaArgs, args);
    if (!parsed.ok) return parsed.output;
    const text = await cekKantorBuka(parsed.data.tanggal);
    return { ok: true, items: [{ title: "Jam layanan kantor desa", url: "/", text }] };
  },
};
