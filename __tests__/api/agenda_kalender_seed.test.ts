// @vitest-environment node
// Data seed Agenda & Kalender Desa: kategori valid, rentang tanggal konsisten,
// event 2025 lama tetap ada (kategori BUDAYA), dan agenda riset 2026 tercatat.
import { describe, expect, it } from "vitest";
import { isKategoriEvent } from "@/lib/agenda-desa";
import eventBudayaSeed from "../../prisma/data/desa/event-budaya/event-budaya.json";

type SeedItem = {
  id: string;
  nama: string;
  tanggal: string;
  tanggalSelesai?: string;
  kategori: string;
  lokasi: string;
};
const items = eventBudayaSeed as SeedItem[];

describe("seed event-budaya.json", () => {
  it("id unik dan setiap kategori termasuk kategori valid", () => {
    expect(new Set(items.map((i) => i.id)).size).toBe(items.length);
    for (const item of items) expect(isKategoriEvent(item.kategori)).toBe(true);
  });

  it("tanggal valid dan tanggalSelesai tidak sebelum tanggal", () => {
    for (const item of items) {
      expect(Number.isNaN(new Date(item.tanggal).getTime())).toBe(false);
      if (item.tanggalSelesai) {
        expect(new Date(item.tanggalSelesai).getTime()).toBeGreaterThanOrEqual(new Date(item.tanggal).getTime());
      }
    }
  });

  it("event 2025 yang lama dipertahankan dengan kategori BUDAYA", () => {
    const lama2025 = items.filter((i) => i.id.match(/^event-budaya-([1-9]|1\d|20)$/));
    expect(lama2025).toHaveLength(20);
    for (const item of lama2025) {
      expect(item.tanggal.startsWith("2025")).toBe(true);
      expect(item.kategori).toBe("BUDAYA");
    }
  });

  it("agenda hasil riset tercatat dengan kategori & tanggal sesuai", () => {
    const byNama = (frag: string) => items.find((i) => i.nama.includes(frag));

    const hut = byNama("HUT ke-47 Sekaa Teruna");
    expect(hut?.kategori).toBe("KEPEMUDAAN");
    expect(hut?.tanggal.slice(0, 10)).toBe("2026-10-17");
    expect(hut?.tanggalSelesai?.slice(0, 10)).toBe("2026-10-18");

    expect(byNama("Musdes) Khusus")).toMatchObject({ kategori: "MUSYAWARAH" });
    expect(byNama("Musdes) Khusus")?.tanggal.slice(0, 10)).toBe("2026-08-29");
    expect(byNama("Musrenbangdes")?.tanggal.slice(0, 10)).toBe("2025-10-07");
    expect(byNama("Masyarakat Desa (MMD)")?.tanggal.slice(0, 10)).toBe("2025-11-13");
  });
});
