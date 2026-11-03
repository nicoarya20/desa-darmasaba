// @vitest-environment node
// Kegiatan Desa — kategori Pembangunan (anggaran, progres, status, sumber dana).
//
// Mengunci: validasi progres 0-100 & status enum, perilaku lama create/update/list
// (tanpa field baru) tidak berubah, field baru bersifat aditif, dan endpoint
// ringkasan Monev (agregat benar + paginasi + tanpa N+1).
import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  kegiatanDesa: {
    create: vi.fn(),
    update: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
    aggregate: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ default: prismaMock }));

import kegiatanDesaCreate from "@/app/api/[[...slugs]]/_lib/desa/kegiatan-desa/create";
import kegiatanDesaFindMany from "@/app/api/[[...slugs]]/_lib/desa/kegiatan-desa/find-many";
import kegiatanDesaMonev, {
  buildMonevSummary,
} from "@/app/api/[[...slugs]]/_lib/desa/kegiatan-desa/monev";
import kegiatanDesaUpdate from "@/app/api/[[...slugs]]/_lib/desa/kegiatan-desa/updt";
import {
  KATEGORI_PEMBANGUNAN_ID,
  formatRupiah,
  isKegiatanPembangunan,
  parsePembangunanInput,
  resolvePembangunanData,
} from "@/lib/kegiatan-pembangunan";

const KATEGORI_SOSIAL_ID = "katsosia000001"; // test-only: id kategori non-pembangunan

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ctx = (over: Record<string, any>) => ({ set: {}, query: {}, params: {}, ...over }) as any;

const baseBody = {
  judul: "Contoh Kegiatan", // test-only
  deskripsiSingkat: "Ringkas",
  deskripsiLengkap: "<p>Lengkap</p>",
  tanggal: "2026-01-15",
  lokasi: "Balai Desa",
  partisipan: 12,
  kategoriKegiatanId: KATEGORI_SOSIAL_ID,
};

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.kegiatanDesa.create.mockResolvedValue({ id: "k1" });
  prismaMock.kegiatanDesa.update.mockResolvedValue({ id: "k1" });
});

describe("parsePembangunanInput", () => {
  it("menolak progres di luar 0-100", () => {
    for (const progres of [-1, 101, 1000]) {
      const r = parsePembangunanInput({ progres });
      expect(r.ok).toBe(false);
    }
  });

  it("menolak progres pecahan, string, atau NaN", () => {
    for (const progres of [50.5, "50", Number.NaN]) {
      expect(parsePembangunanInput({ progres }).ok).toBe(false);
    }
  });

  it("menerima batas 0 dan 100", () => {
    expect(parsePembangunanInput({ progres: 0 })).toEqual({ ok: true, data: { progres: 0 } });
    expect(parsePembangunanInput({ progres: 100 })).toEqual({ ok: true, data: { progres: 100 } });
  });

  it("menolak status di luar rencana|berjalan|selesai", () => {
    const r = parsePembangunanInput({ statusPembangunan: "ditunda" });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.message).toContain("rencana, berjalan, selesai");
  });

  it("menerima ketiga status valid", () => {
    for (const s of ["rencana", "berjalan", "selesai"]) {
      expect(parsePembangunanInput({ statusPembangunan: s })).toEqual({
        ok: true,
        data: { statusPembangunan: s },
      });
    }
  });

  it("menolak anggaran negatif atau bukan angka", () => {
    expect(parsePembangunanInput({ anggaran: -5 }).ok).toBe(false);
    expect(parsePembangunanInput({ anggaran: "1000" }).ok).toBe(false);
    expect(parsePembangunanInput({ anggaran: 0 }).ok).toBe(true);
  });

  it("memangkas sumber dana, mengosongkan string kosong, dan membatasi panjang", () => {
    expect(parsePembangunanInput({ sumberDana: "  APBDes  " })).toEqual({
      ok: true,
      data: { sumberDana: "APBDes" },
    });
    expect(parsePembangunanInput({ sumberDana: "   " })).toEqual({
      ok: true,
      data: { sumberDana: null },
    });
    expect(parsePembangunanInput({ sumberDana: "x".repeat(256) }).ok).toBe(false);
  });

  it("body tanpa field baru menghasilkan data kosong (tidak mengubah apa pun)", () => {
    expect(parsePembangunanInput({ judul: "x" })).toEqual({ ok: true, data: {} });
  });

  it("null mengosongkan field", () => {
    expect(
      parsePembangunanInput({ anggaran: null, progres: null, statusPembangunan: null }),
    ).toEqual({ ok: true, data: { anggaran: null, progres: null, statusPembangunan: null } });
  });
});

describe("resolvePembangunanData & helper", () => {
  it("mempertahankan input untuk kategori Pembangunan", () => {
    expect(resolvePembangunanData(KATEGORI_PEMBANGUNAN_ID, { progres: 40 })).toEqual({
      progres: 40,
    });
  });

  it("mengosongkan semua field untuk kategori lain", () => {
    expect(resolvePembangunanData(KATEGORI_SOSIAL_ID, { progres: 40, anggaran: 10 })).toEqual({
      anggaran: null,
      progres: null,
      statusPembangunan: null,
      sumberDana: null,
    });
  });

  it("mengenali kategori Pembangunan lewat id", () => {
    expect(isKegiatanPembangunan({ kategoriKegiatanId: KATEGORI_PEMBANGUNAN_ID })).toBe(true);
    expect(isKegiatanPembangunan({ kategoriKegiatanId: KATEGORI_SOSIAL_ID })).toBe(false);
    expect(isKegiatanPembangunan(null)).toBe(false);
  });

  it("memformat Rupiah id-ID tanpa pecahan dan '-' bila kosong", () => {
    expect(formatRupiah(1500000).replace(/\s/g, " ")).toBe("Rp 1.500.000");
    expect(formatRupiah(null)).toBe("-");
    expect(formatRupiah(undefined)).toBe("-");
  });
});

describe("POST create kegiatan desa", () => {
  it("perilaku lama: body tanpa field baru tetap membuat data dengan field lama sama", async () => {
    const res = await kegiatanDesaCreate(ctx({ body: baseBody }));

    expect(res.success).toBe(true);
    const { data } = prismaMock.kegiatanDesa.create.mock.calls[0][0];
    expect(data).toMatchObject({
      judul: baseBody.judul,
      lokasi: baseBody.lokasi,
      partisipan: 12,
      kategoriKegiatanId: KATEGORI_SOSIAL_ID,
      imageId: null,
    });
    expect(data.tanggal).toEqual(new Date("2026-01-15"));
  });

  it("menyimpan field pembangunan untuk kategori Pembangunan", async () => {
    await kegiatanDesaCreate(
      ctx({
        body: {
          ...baseBody,
          kategoriKegiatanId: KATEGORI_PEMBANGUNAN_ID,
          anggaran: 250000000,
          progres: 35,
          statusPembangunan: "berjalan",
          sumberDana: "APBDes",
        },
      }),
    );

    const { data } = prismaMock.kegiatanDesa.create.mock.calls[0][0];
    expect(data).toMatchObject({
      anggaran: 250000000,
      progres: 35,
      statusPembangunan: "berjalan",
      sumberDana: "APBDes",
    });
  });

  it("mengabaikan field pembangunan pada kategori non-Pembangunan", async () => {
    await kegiatanDesaCreate(ctx({ body: { ...baseBody, progres: 50, anggaran: 99 } }));

    const { data } = prismaMock.kegiatanDesa.create.mock.calls[0][0];
    expect(data.progres).toBeNull();
    expect(data.anggaran).toBeNull();
  });

  it("menolak progres di luar 0-100 dengan 400 tanpa menyentuh DB", async () => {
    const set: { status?: number } = {};
    const res = await kegiatanDesaCreate(
      ctx({ set, body: { ...baseBody, kategoriKegiatanId: KATEGORI_PEMBANGUNAN_ID, progres: 101 } }),
    );

    expect(set.status).toBe(400);
    expect(res.success).toBe(false);
    expect(prismaMock.kegiatanDesa.create).not.toHaveBeenCalled();
  });

  it("menolak status tidak valid dengan 400", async () => {
    const set: { status?: number } = {};
    const res = await kegiatanDesaCreate(
      ctx({
        set,
        body: { ...baseBody, kategoriKegiatanId: KATEGORI_PEMBANGUNAN_ID, statusPembangunan: "batal" },
      }),
    );

    expect(set.status).toBe(400);
    expect(res.success).toBe(false);
    expect(prismaMock.kegiatanDesa.create).not.toHaveBeenCalled();
  });
});

describe("PUT update kegiatan desa", () => {
  it("perilaku lama: field pembangunan yang tidak dikirim pada kategori Pembangunan tidak ditimpa", async () => {
    await kegiatanDesaUpdate(
      ctx({
        params: { id: "k1" },
        body: { ...baseBody, kategoriKegiatanId: KATEGORI_PEMBANGUNAN_ID },
      }),
    );

    const { data } = prismaMock.kegiatanDesa.update.mock.calls[0][0];
    expect(data).not.toHaveProperty("progres");
    expect(data).not.toHaveProperty("anggaran");
    expect(data.judul).toBe(baseBody.judul);
  });

  it("memindahkan kegiatan ke kategori lain mengosongkan field pembangunan", async () => {
    await kegiatanDesaUpdate(ctx({ params: { id: "k1" }, body: baseBody }));

    const { data } = prismaMock.kegiatanDesa.update.mock.calls[0][0];
    expect(data).toMatchObject({
      anggaran: null,
      progres: null,
      statusPembangunan: null,
      sumberDana: null,
    });
  });

  it("menolak progres negatif dengan 400", async () => {
    const set: { status?: number } = {};
    const res = await kegiatanDesaUpdate(
      ctx({
        set,
        params: { id: "k1" },
        body: { ...baseBody, kategoriKegiatanId: KATEGORI_PEMBANGUNAN_ID, progres: -1 },
      }),
    );

    expect(set.status).toBe(400);
    expect(res.success).toBe(false);
    expect(prismaMock.kegiatanDesa.update).not.toHaveBeenCalled();
  });
});

describe("GET find-many kegiatan desa (kontrak lama)", () => {
  it("bentuk respons & query tidak berubah; field baru ikut terkirim", async () => {
    const row = { id: "k1", judul: "A", progres: 10, anggaran: 5, statusPembangunan: "rencana" };
    prismaMock.kegiatanDesa.findMany.mockResolvedValue([row]);
    prismaMock.kegiatanDesa.count.mockResolvedValue(1);

    const res = await kegiatanDesaFindMany(ctx({ query: { page: "2", limit: "5" } }));

    expect(res).toMatchObject({ success: true, data: [row], page: 2, limit: 5, total: 1, totalPages: 1 });
    const args = prismaMock.kegiatanDesa.findMany.mock.calls[0][0];
    expect(args).toMatchObject({ skip: 5, take: 5, orderBy: { tanggal: "asc" } });
    expect(args.where).toEqual({ isActive: true });
  });
});

describe("buildMonevSummary", () => {
  it("menghitung jumlah per status, total, dan membulatkan rata-rata 1 desimal", () => {
    const summary = buildMonevSummary(
      [
        { statusPembangunan: "rencana", _count: { _all: 2 } },
        { statusPembangunan: "berjalan", _count: { _all: 3 } },
        { statusPembangunan: "selesai", _count: { _all: 1 } },
        { statusPembangunan: null, _count: { _all: 4 } },
      ],
      { _sum: { anggaran: 900000000 }, _avg: { progres: 46.666667 } },
    );

    expect(summary).toEqual({
      totalKegiatan: 10,
      perStatus: { rencana: 2, berjalan: 3, selesai: 1, belumDiisi: 4 },
      totalAnggaran: 900000000,
      rataRataProgres: 46.7,
    });
  });

  it("data kosong menghasilkan nol, bukan null", () => {
    expect(buildMonevSummary([], { _sum: { anggaran: null }, _avg: { progres: null } })).toEqual({
      totalKegiatan: 0,
      perStatus: { rencana: 0, berjalan: 0, selesai: 0, belumDiisi: 0 },
      totalAnggaran: 0,
      rataRataProgres: 0,
    });
  });
});

describe("GET monev kegiatan desa", () => {
  beforeEach(() => {
    prismaMock.kegiatanDesa.findMany.mockResolvedValue([{ id: "p1" }, { id: "p2" }]);
    prismaMock.kegiatanDesa.count.mockResolvedValue(25);
    prismaMock.kegiatanDesa.groupBy.mockResolvedValue([
      { statusPembangunan: "berjalan", _count: { _all: 20 } },
      { statusPembangunan: "selesai", _count: { _all: 5 } },
    ]);
    prismaMock.kegiatanDesa.aggregate.mockResolvedValue({
      _sum: { anggaran: 1200000000 },
      _avg: { progres: 62.5 },
    });
  });

  it("mengembalikan daftar + agregat untuk data contoh", async () => {
    const res = await kegiatanDesaMonev(ctx({ query: {} }));

    expect(res.success).toBe(true);
    expect(res.data).toHaveLength(2);
    expect(res.summary).toEqual({
      totalKegiatan: 25,
      perStatus: { rencana: 0, berjalan: 20, selesai: 5, belumDiisi: 0 },
      totalAnggaran: 1200000000,
      rataRataProgres: 62.5,
    });
  });

  it("hanya mengambil kegiatan aktif kategori Pembangunan", async () => {
    await kegiatanDesaMonev(ctx({ query: {} }));

    const expectedWhere = { isActive: true, kategoriKegiatanId: KATEGORI_PEMBANGUNAN_ID };
    expect(prismaMock.kegiatanDesa.findMany.mock.calls[0][0].where).toEqual(expectedWhere);
    expect(prismaMock.kegiatanDesa.groupBy.mock.calls[0][0].where).toEqual(expectedWhere);
    expect(prismaMock.kegiatanDesa.aggregate.mock.calls[0][0].where).toEqual(expectedWhere);
  });

  it("paginasi: skip/take/totalPages dihitung dari page & limit", async () => {
    const res = await kegiatanDesaMonev(ctx({ query: { page: "3", limit: "10" } }));

    const args = prismaMock.kegiatanDesa.findMany.mock.calls[0][0];
    expect(args.skip).toBe(20);
    expect(args.take).toBe(10);
    expect(res).toMatchObject({ page: 3, limit: 10, total: 25, totalPages: 3 });
  });

  it("membatasi limit maksimum dan menormalkan page tidak valid", async () => {
    await kegiatanDesaMonev(ctx({ query: { page: "-4", limit: "9999" } }));

    const args = prismaMock.kegiatanDesa.findMany.mock.calls[0][0];
    expect(args.take).toBe(50);
    expect(args.skip).toBe(0);
  });

  it("filter status hanya mempersempit daftar, bukan agregat", async () => {
    await kegiatanDesaMonev(ctx({ query: { status: "selesai" } }));

    expect(prismaMock.kegiatanDesa.findMany.mock.calls[0][0].where).toMatchObject({
      statusPembangunan: "selesai",
    });
    expect(prismaMock.kegiatanDesa.count.mock.calls[0][0].where).toMatchObject({
      statusPembangunan: "selesai",
    });
    expect(prismaMock.kegiatanDesa.groupBy.mock.calls[0][0].where).not.toHaveProperty(
      "statusPembangunan",
    );
  });

  it("menolak status tidak valid dengan 400 tanpa query DB", async () => {
    const set: { status?: number } = {};
    const res = await kegiatanDesaMonev(ctx({ set, query: { status: "ditunda" } }));

    expect(set.status).toBe(400);
    expect(res.success).toBe(false);
    expect(prismaMock.kegiatanDesa.findMany).not.toHaveBeenCalled();
  });

  it("tanpa N+1: satu query per jenis, tanpa query per baris", async () => {
    await kegiatanDesaMonev(ctx({ query: {} }));

    expect(prismaMock.kegiatanDesa.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.kegiatanDesa.count).toHaveBeenCalledTimes(1);
    expect(prismaMock.kegiatanDesa.groupBy).toHaveBeenCalledTimes(1);
    expect(prismaMock.kegiatanDesa.aggregate).toHaveBeenCalledTimes(1);
  });

  it("mengembalikan success=false bila DB gagal", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    prismaMock.kegiatanDesa.findMany.mockRejectedValue(new Error("db down"));

    const res = await kegiatanDesaMonev(ctx({ query: {} }));

    expect(res.success).toBe(false);
    spy.mockRestore();
  });
});
