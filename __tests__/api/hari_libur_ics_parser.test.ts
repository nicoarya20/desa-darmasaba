// @vitest-environment node
import { describe, it, expect } from "vitest";
import { parseIcsHolidays } from "@/app/api/[[...slugs]]/_lib/landing_page/hari-libur/parseIcsHolidays";

const SAMPLE_ICS = [
  "BEGIN:VCALENDAR",
  "VERSION:2.0",
  "BEGIN:VEVENT",
  "DTSTART;VALUE=DATE:20260817",
  "DTEND;VALUE=DATE:20260818",
  "SUMMARY:Indonesian Independence Day",
  "END:VEVENT",
  "BEGIN:VEVENT",
  "DTSTART;VALUE=DATE:20260319",
  "DTEND;VALUE=DATE:20260320",
  // Baris SUMMARY panjang di-fold RFC5545 (CRLF + spasi di awal baris lanjutan)
  "SUMMARY:Bali's Day of Silence and Hindu New\r\n  Year (Nyepi)",
  "END:VEVENT",
  "BEGIN:VEVENT",
  "DTSTART;VALUE=DATE:20260921",
  "DTEND;VALUE=DATE:20260922",
  "SUMMARY:Bukan Hari Libur (contoh event non-holiday di kalender)",
  "END:VEVENT",
  "END:VCALENDAR",
].join("\r\n");

describe("parseIcsHolidays", () => {
  it("mem-parsing tanggal DTSTART;VALUE=DATE menjadi format YYYY-MM-DD", () => {
    const result = parseIcsHolidays(SAMPLE_ICS);
    expect(result.has("2026-08-17")).toBe(true);
  });

  it("mengambil nama hari libur dari field SUMMARY", () => {
    const result = parseIcsHolidays(SAMPLE_ICS);
    expect(result.get("2026-08-17")).toBe("Indonesian Independence Day");
  });

  it("unfold baris SUMMARY yang terpotong (RFC5545 line folding) sebelum diparse", () => {
    const result = parseIcsHolidays(SAMPLE_ICS);
    expect(result.get("2026-03-19")).toBe("Bali's Day of Silence and Hindu New Year (Nyepi)");
  });

  it("tanggal yang tidak ada di feed dianggap bukan hari libur", () => {
    const result = parseIcsHolidays(SAMPLE_ICS);
    expect(result.has("2026-09-22")).toBe(false);
  });

  it("regresi bug: 2026-09-21 tidak lagi salah dianggap Tahun Baru Islam", () => {
    // Root cause bug asli: array hardcoded lama menandai 2026-09-21 sebagai
    // "Tahun Baru Islam 1448 H", padahal tanggal aslinya 2026-06-16/17.
    const result = parseIcsHolidays(SAMPLE_ICS);
    expect(result.get("2026-09-21")).not.toBe("Tahun Baru Islam 1448 H");
  });

  it("return Map kosong kalau tidak ada VEVENT sama sekali", () => {
    const result = parseIcsHolidays("BEGIN:VCALENDAR\r\nVERSION:2.0\r\nEND:VCALENDAR");
    expect(result.size).toBe(0);
  });

  it("event duplikat di tanggal yang sama hanya diambil yang pertama", () => {
    const dup = [
      "BEGIN:VEVENT",
      "DTSTART;VALUE=DATE:20260101",
      "SUMMARY:New Year's Day",
      "END:VEVENT",
      "BEGIN:VEVENT",
      "DTSTART;VALUE=DATE:20260101",
      "SUMMARY:Duplicate Entry",
      "END:VEVENT",
    ].join("\r\n");
    const result = parseIcsHolidays(dup);
    expect(result.get("2026-01-01")).toBe("New Year's Day");
  });
});
