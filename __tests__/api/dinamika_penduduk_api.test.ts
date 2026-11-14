// @vitest-environment node
// Dinamika Penduduk: CRUD total per tahun (tahun unik → 409), pagination, dan field `dinamika`
// di dashboard summary yang kini dibaca dari DinamikaPenduduk tahun terbaru.
import { Prisma } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => ({
  dinamikaPenduduk: {
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
  },
  dataBanjar: { aggregate: vi.fn(), findMany: vi.fn() },
  kelahiran: { count: vi.fn() },
  distribusiAgama: { findMany: vi.fn() },
  distribusiUmur: { findMany: vi.fn() },
}));
vi.mock("@/lib/prisma", () => ({ default: prismaMock }));

import dinamikaPendudukCreate from "@/app/api/[[...slugs]]/_lib/kependudukan/dinamika-penduduk/create";
import dinamikaPendudukUpdate from "@/app/api/[[...slugs]]/_lib/kependudukan/dinamika-penduduk/updt";
import dinamikaPendudukDelete from "@/app/api/[[...slugs]]/_lib/kependudukan/dinamika-penduduk/del";
import dinamikaPendudukFindMany from "@/app/api/[[...slugs]]/_lib/kependudukan/dinamika-penduduk/findMany";
import dinamikaPendudukFindUnique from "@/app/api/[[...slugs]]/_lib/kependudukan/dinamika-penduduk/findUnique";
import dashboardSummary from "@/app/api/[[...slugs]]/_lib/kependudukan/dashboard/summary";
import { formatSelisih, parsePagination, ringkasanDinamika } from "@/lib/dinamika-penduduk";

const row2025 = { tahun: 2025, kelahiran: 96, kematian: 82, masuk: 65, keluar: 61 };

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- konteks Elysia minimal untuk handler
const ctx = (opts: { body?: unknown; id?: string; query?: Record<string, string> } = {}): any => ({
  body: opts.body,
  params: opts.id ? { id: opts.id } : {},
  query: opts.query ?? {},
  set: { status: 200 },
});

function p2002() {
  return new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
    code: "P2002",
    clientVersion: "6.3.1",
    meta: { target: "DinamikaPenduduk_tahun_key" },
  });
}

beforeEach(() => vi.clearAllMocks());

describe("create", () => {
  it("menyimpan lima angka dan mengembalikan baris baru", async () => {
    prismaMock.dinamikaPenduduk.create.mockResolvedValueOnce({ id: "d1", ...row2025 });
    const c = ctx({ body: row2025 });
    const res = await dinamikaPendudukCreate(c);
    expect(prismaMock.dinamikaPenduduk.create).toHaveBeenCalledWith({ data: row2025 });
    expect(c.set.status).toBe(200);
    expect(res).toMatchObject({ success: true, data: { id: "d1", tahun: 2025 } });
  });

  it("tahun sudah ada (P2002) → 409 'Tahun sudah dipakai'", async () => {
    prismaMock.dinamikaPenduduk.create.mockRejectedValueOnce(p2002());
    const c = ctx({ body: row2025 });
    const res = await dinamikaPendudukCreate(c);
    expect(c.set.status).toBe(409);
    expect(res).toEqual({ success: false, message: "Tahun sudah dipakai" });
  });

  it("error lain dilempar dengan konteks tahun", async () => {
    prismaMock.dinamikaPenduduk.create.mockRejectedValueOnce(new Error("db down"));
    await expect(dinamikaPendudukCreate(ctx({ body: row2025 }))).rejects.toThrow(
      "Gagal menambahkan dinamika penduduk tahun 2025: db down",
    );
  });
});

describe("update", () => {
  it("id tidak ada → 404 tanpa memanggil update", async () => {
    prismaMock.dinamikaPenduduk.findUnique.mockResolvedValueOnce(null);
    const c = ctx({ body: row2025, id: "x" });
    const res = await dinamikaPendudukUpdate(c);
    expect(c.set.status).toBe(404);
    expect(res).toEqual({ success: false, message: "Data tidak ditemukan" });
    expect(prismaMock.dinamikaPenduduk.update).not.toHaveBeenCalled();
  });

  it("mengubah baris yang ada", async () => {
    prismaMock.dinamikaPenduduk.findUnique.mockResolvedValueOnce({ id: "d1" });
    prismaMock.dinamikaPenduduk.update.mockResolvedValueOnce({ id: "d1", ...row2025 });
    const res = await dinamikaPendudukUpdate(ctx({ body: row2025, id: "d1" }));
    expect(prismaMock.dinamikaPenduduk.update).toHaveBeenCalledWith({ where: { id: "d1" }, data: row2025 });
    expect(res).toMatchObject({ success: true, data: { id: "d1" } });
  });

  it("pindah ke tahun yang sudah dipakai baris lain → 409", async () => {
    prismaMock.dinamikaPenduduk.findUnique.mockResolvedValueOnce({ id: "d1" });
    prismaMock.dinamikaPenduduk.update.mockRejectedValueOnce(p2002());
    const c = ctx({ body: row2025, id: "d1" });
    const res = await dinamikaPendudukUpdate(c);
    expect(c.set.status).toBe(409);
    expect(res).toEqual({ success: false, message: "Tahun sudah dipakai" });
  });
});

describe("delete & findUnique", () => {
  it("hapus id tidak ada → 404", async () => {
    prismaMock.dinamikaPenduduk.findUnique.mockResolvedValueOnce(null);
    const c = ctx({ id: "x" });
    expect(await dinamikaPendudukDelete(c)).toEqual({ success: false, message: "Data tidak ditemukan" });
    expect(c.set.status).toBe(404);
    expect(prismaMock.dinamikaPenduduk.delete).not.toHaveBeenCalled();
  });

  it("hapus permanen baris yang ada", async () => {
    prismaMock.dinamikaPenduduk.findUnique.mockResolvedValueOnce({ id: "d1" });
    prismaMock.dinamikaPenduduk.delete.mockResolvedValueOnce({ id: "d1", ...row2025 });
    const res = await dinamikaPendudukDelete(ctx({ id: "d1" }));
    expect(prismaMock.dinamikaPenduduk.delete).toHaveBeenCalledWith({ where: { id: "d1" } });
    expect(res.success).toBe(true);
  });

  it("findUnique id tidak ada → 404", async () => {
    prismaMock.dinamikaPenduduk.findUnique.mockResolvedValueOnce(null);
    const c = ctx({ id: "x" });
    expect((await dinamikaPendudukFindUnique(c)).success).toBe(false);
    expect(c.set.status).toBe(404);
  });
});

describe("findMany", () => {
  it("terbaru dulu, hanya aktif, dengan pagination", async () => {
    prismaMock.dinamikaPenduduk.findMany.mockResolvedValueOnce([{ id: "d1", ...row2025 }]);
    prismaMock.dinamikaPenduduk.count.mockResolvedValueOnce(12);
    const res = await dinamikaPendudukFindMany(ctx({ query: { page: "2", limit: "5" } }));
    expect(prismaMock.dinamikaPenduduk.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { isActive: true }, skip: 5, take: 5, orderBy: { tahun: "desc" } }),
    );
    expect(res).toMatchObject({ success: true, page: 2, totalPages: 3, total: 12 });
  });

  it("limit di atas batas dipotong ke 100", async () => {
    prismaMock.dinamikaPenduduk.findMany.mockResolvedValueOnce([]);
    prismaMock.dinamikaPenduduk.count.mockResolvedValueOnce(0);
    const res = await dinamikaPendudukFindMany(ctx({ query: { limit: "100000" } }));
    expect(prismaMock.dinamikaPenduduk.findMany).toHaveBeenCalledWith(expect.objectContaining({ take: 100, skip: 0 }));
    expect(res.totalPages).toBe(1);
  });
});

describe("dashboard summary — dinamika", () => {
  function mockSummaryRest() {
    prismaMock.dataBanjar.aggregate.mockImplementation(async ({ _sum }: { _sum: Record<string, true> }) => {
      const key = Object.keys(_sum)[0];
      return { _sum: { [key]: { penduduk: 10262, kk: 2308, miskin: 26 }[key] } };
    });
    prismaMock.kelahiran.count.mockResolvedValue(7);
    prismaMock.distribusiAgama.findMany.mockResolvedValue([{ agama: "Hindu" }]);
    prismaMock.distribusiUmur.findMany.mockResolvedValue([{ rentangUmur: "0-4" }]);
    prismaMock.dataBanjar.findMany.mockResolvedValue([{ nama: "Banjar Dinas Cabe" }]);
  }

  it("dinamika = tahun terbaru DinamikaPenduduk; field lain tetap di posisinya", async () => {
    mockSummaryRest();
    prismaMock.dinamikaPenduduk.findFirst.mockResolvedValueOnce({ id: "d1", ...row2025 });
    const res = await dashboardSummary();
    expect(prismaMock.dinamikaPenduduk.findFirst).toHaveBeenCalledWith({ where: { isActive: true }, orderBy: { tahun: "desc" } });
    expect(res.data?.dinamika).toEqual({ tahun: 2025, kelahiran: 96, kematian: 82, pindahMasuk: 65, pindahKeluar: 61 });
    expect(res.data?.summary).toEqual({ totalPenduduk: 10262, totalKK: 2308, totalKelahiran: 7, totalKemiskinan: 26 });
    expect(res.data?.agama).toEqual([{ agama: "Hindu" }]);
    expect(res.data?.umur).toEqual([{ rentangUmur: "0-4" }]);
    expect(res.data?.banjar).toEqual([{ nama: "Banjar Dinas Cabe" }]);
  });

  it("belum ada data dinamika → null (kartu dinamika disembunyikan)", async () => {
    mockSummaryRest();
    prismaMock.dinamikaPenduduk.findFirst.mockResolvedValueOnce(null);
    const res = await dashboardSummary();
    expect(res.success).toBe(true);
    expect(res.data?.dinamika).toBeNull();
  });
});

describe("lib dinamika-penduduk", () => {
  it("ringkasan 2025: pertumbuhan alami +14, migrasi bersih +4", () => {
    expect(ringkasanDinamika(row2025)).toEqual({ pertumbuhanAlami: 14, migrasiBersih: 4 });
  });

  it("formatSelisih memberi tanda dan pemisah ribuan", () => {
    expect(formatSelisih(14)).toBe("+14");
    expect(formatSelisih(-1500)).toBe("-1.500");
    expect(formatSelisih(0)).toBe("0");
  });

  it("parsePagination menolak nilai kosong/negatif/pecahan", () => {
    expect(parsePagination(undefined, undefined)).toEqual({ page: 1, limit: 10, skip: 0 });
    expect(parsePagination("-3", "0")).toEqual({ page: 1, limit: 10, skip: 0 });
    expect(parsePagination("2.7", "abc")).toEqual({ page: 2, limit: 10, skip: 10 });
  });
});
