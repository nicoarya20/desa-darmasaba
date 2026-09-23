// src/app/api/[[...slugs]]/_lib/landing_page/hari-libur/parseIcsHolidays.ts

/**
 * Hapus line-folding iCalendar (RFC 5545 §3.1): baris panjang dipecah dengan
 * CRLF + spasi/tab di awal baris lanjutan. Harus di-unfold dulu sebelum regex
 * per-baris, kalau tidak SUMMARY yang panjang akan terpotong.
 */
function unfoldIcsLines(icsText: string): string {
  return icsText.replace(/\r\n[ \t]/g, "");
}

/**
 * Parse isi iCalendar (.ics) mentah menjadi Map tanggal (YYYY-MM-DD) -> nama hari libur.
 * Hanya mengambil field DTSTART;VALUE=DATE dan SUMMARY dari tiap blok VEVENT (all-day event).
 * Kalau ada beberapa event di tanggal yang sama, event pertama yang dipakai.
 */
export function parseIcsHolidays(icsText: string): Map<string, string> {
  const holidays = new Map<string, string>();
  const unfolded = unfoldIcsLines(icsText);
  const events = unfolded.split("BEGIN:VEVENT").slice(1);

  for (const eventBlock of events) {
    const dateMatch = eventBlock.match(/DTSTART;VALUE=DATE:(\d{8})/);
    if (!dateMatch) continue;

    const raw = dateMatch[1]; // YYYYMMDD
    const isoDate = `${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`;

    if (holidays.has(isoDate)) continue;

    const summaryMatch = eventBlock.match(/SUMMARY:(.+)/);
    const summary = summaryMatch ? summaryMatch[1].trim() : "Hari Libur Nasional";
    holidays.set(isoDate, summary);
  }

  return holidays;
}
