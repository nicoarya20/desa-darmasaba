// @vitest-environment node
// Seed kependudukan memakai data resmi desa (Laporan Penduduk Sep 2026, KPM BLT-DD 2026, dinamika 2023–2025),
// dan seeder dinamika berkunci `tahun` supaya tidak bentrok dengan baris yang dibuat admin.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadJsonData } from "../../prisma/load-json";

const prismaMock = vi.hoisted(() => ({
  dinamikaPenduduk: { upsert: vi.fn() },
}));
vi.mock("@/lib/prisma", () => ({ default: prismaMock }));

import { seedDinamikaPenduduk } from "../../prisma/_seeder_list/kependudukan/seed_dinamika_penduduk";

type Banjar = { id: string; nama: string; penduduk: number; kk: number; miskin: number; tahun: number };
type Dinamika = { id: string; tahun: number; kelahiran: number; kematian: number; masuk: number; keluar: number };

const banjar = loadJsonData<Banjar[]>("kependudukan/data-banjar/data-banjar.json");
const dinamika = loadJsonData<Dinamika[]>("kependudukan/dinamika-penduduk/dinamika-penduduk.json");
const sum = (key: "penduduk" | "kk" | "miskin") => banjar.reduce((acc, b) => acc + b[key], 0);

describe("seed data banjar", () => {
  it("12 Banjar Dinas tahun 2026 dengan nama unik, tanpa sisa Banjar Adat dummy", () => {
    expect(banjar).toHaveLength(12);
    expect(new Set(banjar.map((b) => b.nama)).size).toBe(12);
    expect(banjar.every((b) => b.nama.startsWith("Banjar Dinas ") && b.tahun === 2026)).toBe(true);
  });

  it("total cocok dengan dokumen resmi: 10262 jiwa, 2308 KK, 26 KPM miskin", () => {
    expect(sum("penduduk")).toBe(10262);
    expect(sum("kk")).toBe(2308);
    expect(sum("miskin")).toBe(26);
  });

  it("id lama dipertahankan agar baris prod hasil seed tetap terpetakan", () => {
    expect(banjar.map((b) => b.id).sort()).toEqual(
      Array.from({ length: 12 }, (_, i) => `cmk-banjar-${String(i + 1).padStart(3, "0")}`),
    );
  });
});

describe("seed dinamika penduduk", () => {
  beforeEach(() => vi.clearAllMocks());

  it("berisi data asli 2023–2025 tanpa tahun ganda", () => {
    expect(dinamika.map((d) => [d.tahun, d.kelahiran, d.kematian, d.masuk, d.keluar])).toEqual([
      [2023, 128, 89, 72, 57],
      [2024, 103, 95, 82, 71],
      [2025, 96, 82, 65, 61],
    ]);
  });

  it("upsert berkunci tahun dan create-only (tidak menimpa editan admin)", async () => {
    await seedDinamikaPenduduk();
    expect(prismaMock.dinamikaPenduduk.upsert).toHaveBeenCalledTimes(dinamika.length);
    for (const [i, d] of dinamika.entries()) {
      const args = prismaMock.dinamikaPenduduk.upsert.mock.calls[i][0];
      expect(args.where).toEqual({ tahun: d.tahun });
      expect(args.update).toEqual({});
      expect(args.create).toMatchObject({ id: d.id, tahun: d.tahun, kelahiran: d.kelahiran });
    }
  });
});
