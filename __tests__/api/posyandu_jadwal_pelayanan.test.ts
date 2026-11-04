// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  parseJadwal,
  stringifyJadwal,
  isJadwalEntryComplete,
  isJadwalEmpty,
  isLegacyJadwal,
  jadwalToText,
  jadwalToLines,
  formatJadwalEntry,
  type JadwalEntry,
} from "@/lib/jadwal-pelayanan";

describe("parseJadwal", () => {
  it("mengembalikan [] untuk nilai kosong/null/undefined", () => {
    expect(parseJadwal("")).toEqual([]);
    expect(parseJadwal("   ")).toEqual([]);
    expect(parseJadwal(null)).toEqual([]);
    expect(parseJadwal(undefined)).toEqual([]);
  });

  it("mengembalikan [] untuk konten legacy HTML (bukan JSON kita)", () => {
    expect(parseJadwal("<p>Senin - Jumat 08.00</p>")).toEqual([]);
    expect(parseJadwal("Setiap hari kerja")).toEqual([]);
  });

  it("mem-parse JSON entri valid", () => {
    const json = JSON.stringify([{ hari: "senin-jumat", buka: "08:00", tutup: "12:00" }]);
    expect(parseJadwal(json)).toEqual([
      { hari: "senin-jumat", buka: "08:00", tutup: "12:00" },
    ]);
  });

  it("membuang jam untuk entri libur", () => {
    const json = JSON.stringify([{ hari: "libur", buka: "08:00", tutup: "12:00" }]);
    expect(parseJadwal(json)).toEqual([{ hari: "libur" }]);
  });

  it("melewati entri dengan hari tidak valid", () => {
    const json = JSON.stringify([
      { hari: "rabu", buka: "08:00", tutup: "12:00" },
      { hari: "sabtu-minggu", buka: "09:00", tutup: "11:00" },
    ]);
    expect(parseJadwal(json)).toEqual([
      { hari: "sabtu-minggu", buka: "09:00", tutup: "11:00" },
    ]);
  });

  it("mengembalikan [] untuk JSON non-array", () => {
    expect(parseJadwal(JSON.stringify({ hari: "senin-jumat" }))).toEqual([]);
  });
});

describe("isJadwalEntryComplete", () => {
  it("true untuk non-libur dengan buka & tutup terisi", () => {
    expect(isJadwalEntryComplete({ hari: "senin-jumat", buka: "08:00", tutup: "12:00" })).toBe(true);
  });

  it("false untuk non-libur tanpa jam lengkap", () => {
    expect(isJadwalEntryComplete({ hari: "senin-jumat", buka: "08:00" })).toBe(false);
    expect(isJadwalEntryComplete({ hari: "senin-jumat", buka: "", tutup: "" })).toBe(false);
  });

  it("true untuk libur tanpa jam", () => {
    expect(isJadwalEntryComplete({ hari: "libur" })).toBe(true);
  });

  it("false untuk hari tidak valid", () => {
    expect(isJadwalEntryComplete({ hari: "rabu" as JadwalEntry["hari"] })).toBe(false);
  });
});

describe("stringifyJadwal", () => {
  it("hanya menyertakan entri lengkap", () => {
    const out = stringifyJadwal([
      { hari: "senin-jumat", buka: "08:00", tutup: "12:00" },
      { hari: "sabtu-minggu", buka: "09:00" }, // tidak lengkap
    ]);
    expect(JSON.parse(out)).toEqual([
      { hari: "senin-jumat", buka: "08:00", tutup: "12:00" },
    ]);
  });

  it("mengembalikan string kosong jika tak ada entri lengkap", () => {
    expect(stringifyJadwal([])).toBe("");
    expect(stringifyJadwal([{ hari: "senin-jumat", buka: "08:00" }])).toBe("");
  });

  it("round-trip stringify -> parse konsisten", () => {
    const entries: JadwalEntry[] = [
      { hari: "senin-jumat", buka: "08:00", tutup: "12:00" },
      { hari: "libur" },
    ];
    expect(parseJadwal(stringifyJadwal(entries))).toEqual(entries);
  });
});

describe("isLegacyJadwal", () => {
  it("true untuk konten HTML lama", () => {
    expect(isLegacyJadwal("<p>Senin 08.00</p>")).toBe(true);
  });

  it("false untuk JSON format kita", () => {
    expect(isLegacyJadwal(JSON.stringify([{ hari: "libur" }]))).toBe(false);
  });

  it("false untuk kosong dan array/objek JSON kosong", () => {
    expect(isLegacyJadwal("")).toBe(false);
    expect(isLegacyJadwal("[]")).toBe(false);
    expect(isLegacyJadwal("{}")).toBe(false);
  });
});

describe("isJadwalEmpty", () => {
  it("true untuk kosong / null", () => {
    expect(isJadwalEmpty("")).toBe(true);
    expect(isJadwalEmpty(null)).toBe(true);
    expect(isJadwalEmpty("[]")).toBe(true);
  });

  it("false jika ada entri terstruktur", () => {
    const json = JSON.stringify([{ hari: "senin-jumat", buka: "08:00", tutup: "12:00" }]);
    expect(isJadwalEmpty(json)).toBe(false);
  });

  it("false untuk konten legacy yang masih berisi", () => {
    expect(isJadwalEmpty("<p>Senin 08.00</p>")).toBe(false);
  });
});

describe("formatJadwalEntry", () => {
  it("format non-libur dengan jam gaya Indonesia (titik)", () => {
    expect(formatJadwalEntry({ hari: "senin-jumat", buka: "08:00", tutup: "12:00" })).toBe(
      "Senin–Jumat 08.00–12.00",
    );
  });

  it("libur hanya label", () => {
    expect(formatJadwalEntry({ hari: "libur" })).toBe("Libur");
  });
});

describe("jadwalToText", () => {
  it("gabung entri dengan pemisah bullet", () => {
    const json = JSON.stringify([
      { hari: "senin-jumat", buka: "08:00", tutup: "12:00" },
      { hari: "sabtu-minggu", buka: "09:00", tutup: "11:00" },
    ]);
    expect(jadwalToText(json)).toBe("Senin–Jumat 08.00–12.00 • Sabtu–Minggu 09.00–11.00");
  });

  it("strip HTML untuk legacy", () => {
    expect(jadwalToText("<p>Senin&nbsp;08.00</p>")).toBe("Senin 08.00");
  });

  it("string kosong untuk nilai kosong", () => {
    expect(jadwalToText("")).toBe("");
    expect(jadwalToText(null)).toBe("");
  });
});

describe("jadwalToLines", () => {
  it("memisah label dan jam per baris", () => {
    const json = JSON.stringify([
      { hari: "senin-jumat", buka: "08:00", tutup: "12:00" },
      { hari: "libur" },
    ]);
    expect(jadwalToLines(json)).toEqual([
      { label: "Senin–Jumat", jam: "08.00–12.00" },
      { label: "Libur", jam: null },
    ]);
  });

  it("[] untuk legacy/kosong", () => {
    expect(jadwalToLines("<p>x</p>")).toEqual([]);
    expect(jadwalToLines("")).toEqual([]);
  });
});
