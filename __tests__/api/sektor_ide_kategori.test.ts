// @vitest-environment node
// Point 6: Sektor Unggulan (satuan & periode), pengantar musyawarah Ajukan Ide,
// dan kategori Kegiatan Desa Kepemudaan / PKK & Pemberdayaan Perempuan.
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  sektorUnggulanDesa: {
    create: vi.fn(),
    update: vi.fn(),
    findUnique: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ default: prismaMock }));

import sektorUnggulanDesaCreate from "@/app/api/[[...slugs]]/_lib/ekonomi/sektor-unggulan-desa/create";
import sektorUnggulanDesaUpdate from "@/app/api/[[...slugs]]/_lib/ekonomi/sektor-unggulan-desa/updt";
import {
  LEGACY_CHART_UNIT,
  PERIODE_MAX_LENGTH,
  SATUAN_MAX_LENGTH,
  formatSektorValue,
  parseSatuanPeriodeInput,
  resolveChartUnit,
} from "@/lib/sektor-unggulan";
import {
  PENGANTAR_MUSYAWARAH_LINKS,
  PENGANTAR_MUSYAWARAH_TEKS,
} from "@/app/(public)/(pages)/inovasi/ajukan-ide-inovatif/_com/pengantar-musyawarah.const";
import kategoriKegiatanJson from "../../prisma/data/desa/kegiatan-desa/kategori-kegiatan.json";

const ROOT = path.resolve(__dirname, "../..");

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- stub context handler test
const ctx = (over: Record<string, any>) => ({ set: {}, query: {}, params: {}, ...over }) as any;

const baseBody = { name: "Sektor Contoh", description: "<p>Deskripsi</p>", value: 12 }; // test-only

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.sektorUnggulanDesa.create.mockResolvedValue({ id: "s1" });
  prismaMock.sektorUnggulanDesa.update.mockResolvedValue({ id: "s1" });
  prismaMock.sektorUnggulanDesa.findUnique.mockResolvedValue({ id: "s1" });
});

describe("parseSatuanPeriodeInput", () => {
  it("melewati field yang tidak dikirim (kontrak lama: tidak diubah)", () => {
    expect(parseSatuanPeriodeInput({})).toEqual({ ok: true, data: {} });
  });

  it("men-trim teks dan mengosongkan null / string kosong menjadi null", () => {
    expect(parseSatuanPeriodeInput({ satuan: "  ton ", periode: " 2025 " })).toEqual({
      ok: true,
      data: { satuan: "ton", periode: "2025" },
    });
    expect(parseSatuanPeriodeInput({ satuan: null, periode: "   " })).toEqual({
      ok: true,
      data: { satuan: null, periode: null },
    });
  });

  it("menolak satuan & periode yang melebihi batas panjang", () => {
    const satuan = parseSatuanPeriodeInput({ satuan: "x".repeat(SATUAN_MAX_LENGTH + 1) });
    expect(satuan.ok).toBe(false);
    const periode = parseSatuanPeriodeInput({ periode: "x".repeat(PERIODE_MAX_LENGTH + 1) });
    expect(periode.ok).toBe(false);
    expect(parseSatuanPeriodeInput({ satuan: "x".repeat(SATUAN_MAX_LENGTH) }).ok).toBe(true);
  });

  it("menolak tipe non-teks", () => {
    expect(parseSatuanPeriodeInput({ satuan: 5 }).ok).toBe(false);
    expect(parseSatuanPeriodeInput({ periode: { a: 1 } }).ok).toBe(false);
  });
});

describe("formatSektorValue", () => {
  it('menampilkan "{value} {satuan} • {periode}" bila semua terisi', () => {
    expect(formatSektorValue({ value: 1250, satuan: "ton", periode: "2025" })).toBe(
      "1.250 ton • 2025",
    );
  });

  it("menampilkan tanpa periode bila periode kosong", () => {
    expect(formatSektorValue({ value: 30, satuan: "ekor", periode: null })).toBe("30 ekor");
    expect(formatSektorValue({ value: 30, satuan: "%", periode: "  " })).toBe("30 %");
  });

  it("mengembalikan null bila satuan kosong (tampilan lama tidak berubah)", () => {
    expect(formatSektorValue({ value: 90 })).toBeNull();
    expect(formatSektorValue({ value: 90, satuan: null, periode: "2025" })).toBeNull();
    expect(formatSektorValue({ value: 90, satuan: "  " })).toBeNull();
  });

  it("mengembalikan null bila nilai kosong", () => {
    expect(formatSektorValue({ value: null, satuan: "ton" })).toBeNull();
  });
});

describe("resolveChartUnit", () => {
  it("memakai satuan bersama bila semua sektor satuannya sama", () => {
    expect(resolveChartUnit([{ satuan: "ton" }, { satuan: " ton " }])).toBe("ton");
  });

  it("kembali ke satuan lama bila ada yang kosong atau satuan beragam", () => {
    expect(resolveChartUnit([{ satuan: "ton" }, { satuan: null }])).toBe(LEGACY_CHART_UNIT);
    expect(resolveChartUnit([{ satuan: "ton" }, { satuan: "ekor" }])).toBe(LEGACY_CHART_UNIT);
    expect(resolveChartUnit([{}, {}])).toBe(LEGACY_CHART_UNIT);
    expect(resolveChartUnit([])).toBe(LEGACY_CHART_UNIT);
  });
});

describe("sektorUnggulanDesaCreate", () => {
  it("body lama tanpa satuan/periode: data yang disimpan tetap persis kontrak lama", async () => {
    const res = await sektorUnggulanDesaCreate(ctx({ body: baseBody }));
    expect(res).toMatchObject({ success: true });
    const arg = prismaMock.sektorUnggulanDesa.create.mock.calls[0][0];
    expect(arg.data).toEqual(baseBody);
  });

  it("output aditif: field lama tetap ada di select, satuan & periode ditambahkan", async () => {
    await sektorUnggulanDesaCreate(ctx({ body: baseBody }));
    const { select } = prismaMock.sektorUnggulanDesa.create.mock.calls[0][0];
    expect(select).toEqual({
      id: true,
      name: true,
      description: true,
      value: true,
      satuan: true,
      periode: true,
    });
  });

  it("menyimpan satuan & periode yang sudah dinormalisasi", async () => {
    await sektorUnggulanDesaCreate(
      ctx({ body: { ...baseBody, satuan: " ton ", periode: "Semester I 2026" } }),
    );
    const arg = prismaMock.sektorUnggulanDesa.create.mock.calls[0][0];
    expect(arg.data).toEqual({ ...baseBody, satuan: "ton", periode: "Semester I 2026" });
  });

  it("400 dan tidak menyentuh DB bila satuan terlalu panjang", async () => {
    const context = ctx({ body: { ...baseBody, satuan: "x".repeat(SATUAN_MAX_LENGTH + 1) } });
    const res = await sektorUnggulanDesaCreate(context);
    expect(context.set.status).toBe(400);
    expect(res).toMatchObject({ success: false });
    expect(prismaMock.sektorUnggulanDesa.create).not.toHaveBeenCalled();
  });
});

describe("sektorUnggulanDesaUpdate", () => {
  it("body lama tanpa satuan/periode: kolom satuan/periode tidak ikut diubah", async () => {
    await sektorUnggulanDesaUpdate(ctx({ params: { id: "s1" }, body: baseBody }));
    const arg = prismaMock.sektorUnggulanDesa.update.mock.calls[0][0];
    expect(arg.data).toEqual(baseBody);
    expect(arg.data).not.toHaveProperty("satuan");
    expect(arg.data).not.toHaveProperty("periode");
  });

  it("string kosong / null mengosongkan satuan & periode", async () => {
    await sektorUnggulanDesaUpdate(
      ctx({ params: { id: "s1" }, body: { ...baseBody, satuan: "", periode: null } }),
    );
    const arg = prismaMock.sektorUnggulanDesa.update.mock.calls[0][0];
    expect(arg.data).toMatchObject({ satuan: null, periode: null });
  });

  it("400 dan tidak update bila periode terlalu panjang", async () => {
    const context = ctx({
      params: { id: "s1" },
      body: { ...baseBody, periode: "x".repeat(PERIODE_MAX_LENGTH + 1) },
    });
    const res = await sektorUnggulanDesaUpdate(context);
    expect(context.set.status).toBe(400);
    expect(res).toMatchObject({ success: false });
    expect(prismaMock.sektorUnggulanDesa.update).not.toHaveBeenCalled();
  });
});

describe("kategori Kegiatan Desa Kepemudaan & PKK", () => {
  const baru = [
    { id: "katkepemudaan01", nama: "Kepemudaan" },
    { id: "katpkkperempuan01", nama: "PKK & Pemberdayaan Perempuan" },
  ];

  it("kategori baru ada di JSON dengan id & nama sesuai", () => {
    for (const k of baru) expect(kategoriKegiatanJson).toContainEqual(k);
  });

  it("id unik, nama unik, dan kategori lama tetap utuh", () => {
    const ids = kategoriKegiatanJson.map((k) => k.id);
    const namas = kategoriKegiatanJson.map((k) => k.nama.toLowerCase());
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(namas).size).toBe(namas.length);
    expect(kategoriKegiatanJson.slice(0, 6).map((k) => k.id)).toEqual([
      "katbudaya000001",
      "katsosia000001",
      "katolahraga0001",
      "katkeagamaan01",
      "katpemberday01",
      "katpembangunan01",
    ]);
  });

  const sql = readFileSync(
    path.join(ROOT, "prisma/migrations/20261106100500_add_satuan_periode_sektor_unggulan/migration.sql"),
    "utf8",
  );

  it("migrasi idempoten: kolom dengan IF NOT EXISTS dan insert dengan WHERE NOT EXISTS", () => {
    expect(sql).toContain('ADD COLUMN IF NOT EXISTS "satuan"');
    expect(sql).toContain('ADD COLUMN IF NOT EXISTS "periode"');
    expect(sql.match(/WHERE NOT EXISTS/g)).toHaveLength(baru.length);
  });

  it("migrasi menyisipkan id & nama yang sama dengan JSON", () => {
    for (const k of baru) {
      expect(sql).toContain(`'${k.id}', '${k.nama}'`);
    }
  });
});

describe("pengantar musyawarah Ajukan Ide", () => {
  it("menyebut Musyawarah Desa / Musrenbangdes", () => {
    expect(PENGANTAR_MUSYAWARAH_TEKS).toContain("Musyawarah Desa");
    expect(PENGANTAR_MUSYAWARAH_TEKS).toContain("Musrenbangdes");
  });

  it("memuat tautan ke Agenda & Kalender Desa dan Dokumen Perencanaan", () => {
    expect(PENGANTAR_MUSYAWARAH_LINKS.map((l) => l.href)).toEqual([
      "/pemerintahan/event-budaya",
      "/pemerintahan/monev-pembangunan",
    ]);
  });

  it("setiap tautan menunjuk rute publik yang ada (page.tsx)", () => {
    for (const link of PENGANTAR_MUSYAWARAH_LINKS) {
      const rute = link.href.replace("/", "");
      const page = path.join(ROOT, "src/app/(public)/(pages)", rute, "page.tsx");
      expect(existsSync(page), page).toBe(true);
    }
  });
});
