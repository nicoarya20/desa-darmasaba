// src/app/api/[[...slugs]]/_lib/landing_page/hari-libur/cekHariLibur.ts
import { Context } from "elysia";
import { getHolidayMap } from "./holidayCache";

export default async function cekHariLibur(context: Context) {
  const { date } = context.query as { date?: string };

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    context.set.status = 400;
    return {
      success: false,
      message: "Parameter date wajib diisi dengan format YYYY-MM-DD",
    };
  }

  const holidayMap = await getHolidayMap();
  const holidayName = holidayMap.get(date) ?? null;

  return {
    success: true,
    isHoliday: holidayMap.has(date),
    holidayName,
  };
}
