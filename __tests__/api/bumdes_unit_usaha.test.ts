// @vitest-environment node
// Unit usaha BUMDes: validasi input, paginasi list, urutan otomatis, soft delete.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Prisma } from "@prisma/client";

const prismaMock = vi.hoisted(() => ({
  unitUsahaBumDes: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
    aggregate: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));
vi.mock("@/lib/prisma", () => ({ default: prismaMock }));

import { MAX_PAGE_LIMIT, parsePagination } from "@/app/api/[[...slugs]]/_lib/ekonomi/bumdes/http";
import unitUsahaCreate from "@/app/api/[[...slugs]]/_lib/ekonomi/bumdes/unit-usaha/create";
import unitUsahaDelete from "@/app/api/[[...slugs]]/_lib/ekonomi/bumdes/unit-usaha/del";
import unitUsahaFindMany from "@/app/api/[[...slugs]]/_lib/ekonomi/bumdes/unit-usaha/findMany";
import unitUsahaFindUnique from "@/app/api/[[...slugs]]/_lib/ekonomi/bumdes/unit-usaha/findUnique";
import unitUsahaUpdate from "@/app/api/[[...slugs]]/_lib/ekonomi/bumdes/unit-usaha/updt";
import {
  MAX_URUTAN,
  unitUsahaCreateSchema,
  unitUsahaUpdateSchema,
} from "@/app/api/[[...slugs]]/_lib/ekonomi/bumdes/unit-usaha/validation";

const db = prismaMock.unitUsahaBumDes;

// Context Elysia minimal: body, params, query, set.status.
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- stub context test
const ctx = (opts: { body?: unknown; id?: string; query?: Record<string, string> } = {}): any => ({
  body: opts.body,
  params: opts.id ? { id: opts.id } : {},
  query: opts.query ?? {},
  set: { status: 200 },
});

const validBody = { nama: "Simpan Pinjam", deskripsi: "Layanan simpan pinjam warga" };

beforeEach(() => vi.clearAllMocks());

describe("parsePagination", () => {
  it("default page 1, limit 10", () => {
    expect(parsePagination({})).toEqual({ page: 1, limit: 10, skip: 0 });
  });

  it("menghitung skip dari page & limit", () => {
    expect(parsePagination({ page: "3", limit: "5" })).toEqual({ page: 3, limit: 5, skip: 10 });
  });

  it("limit dibatasi MAX_PAGE_LIMIT dan page minimal 1", () => {
    expect(parsePagination({ limit: "100000" }).limit).toBe(MAX_PAGE_LIMIT);
    expect(parsePagination({ page: "-4" }).page).toBe(1);
    expect(parsePagination({ page: "abc", limit: "abc" })).toEqual({ page: 1, limit: 10, skip: 0 });
  });
});

describe("skema unit usaha", () => {
  it("create: nama & deskripsi wajib", () => {
    expect(unitUsahaCreateSchema.safeParse(validBody).success).toBe(true);
    expect(unitUsahaCreateSchema.safeParse({ deskripsi: "x" }).success).toBe(false);
    expect(unitUsahaCreateSchema.safeParse({ nama: "x" }).success).toBe(false);
    expect(unitUsahaCreateSchema.safeParse({ ...validBody, nama: "  " }).success).toBe(false);
  });

  it("urutan harus bilangan bulat 0..MAX_URUTAN", () => {
    const urutan = (v: number) => unitUsahaCreateSchema.safeParse({ ...validBody, urutan: v });
    expect(urutan(0).success).toBe(true);
    expect(urutan(-1).success).toBe(false);
    expect(urutan(1.5).success).toBe(false);
    expect(urutan(MAX_URUTAN + 1).success).toBe(false);
  });

  it("update: semua field opsional, tetapi yang dikirim tetap divalidasi", () => {
    expect(unitUsahaUpdateSchema.safeParse({}).success).toBe(true);
    expect(unitUsahaUpdateSchema.safeParse({ isActive: false }).success).toBe(true);
    expect(unitUsahaUpdateSchema.safeParse({ nama: "" }).success).toBe(false);
  });

  it("imageId kosong → null", () => {
    expect(unitUsahaCreateSchema.parse({ ...validBody, imageId: "" }).imageId).toBeNull();
  });
});

describe("GET find-many unit usaha", () => {
  it("shape: data, page, totalPages, total; default hanya unit aktif & belum dihapus", async () => {
    db.findMany.mockResolvedValueOnce([{ id: "u1" }]);
    db.count.mockResolvedValueOnce(25);
    const res = await unitUsahaFindMany(ctx({ query: { page: "2", limit: "10" } }));
    const args = db.findMany.mock.calls[0][0];
    expect(args.where).toEqual({ deletedAt: null, isActive: true });
    expect(args.skip).toBe(10);
    expect(args.take).toBe(10);
    expect(args.orderBy).toEqual([{ urutan: "asc" }, { createdAt: "asc" }]);
    expect(res).toMatchObject({ success: true, data: [{ id: "u1" }], page: 2, totalPages: 3, total: 25 });
  });

  it("limit besar dipotong ke MAX_PAGE_LIMIT (tidak menarik seluruh tabel)", async () => {
    db.findMany.mockResolvedValueOnce([]);
    db.count.mockResolvedValueOnce(0);
    await unitUsahaFindMany(ctx({ query: { limit: "99999" } }));
    expect(db.findMany.mock.calls[0][0].take).toBe(MAX_PAGE_LIMIT);
  });

  it("list kosong → totalPages minimal 1", async () => {
    db.findMany.mockResolvedValueOnce([]);
    db.count.mockResolvedValueOnce(0);
    const res = await unitUsahaFindMany(ctx());
    expect(res.totalPages).toBe(1);
    expect(res.data).toEqual([]);
  });

  it("includeInactive=true menampilkan unit nonaktif; search memfilter nama/deskripsi", async () => {
    db.findMany.mockResolvedValueOnce([]);
    db.count.mockResolvedValueOnce(0);
    await unitUsahaFindMany(ctx({ query: { includeInactive: "true", search: " kopi " } }));
    const { where } = db.findMany.mock.calls[0][0];
    expect(where.isActive).toBeUndefined();
    expect(where.deletedAt).toBeNull();
    expect(where.OR).toEqual([
      { nama: { contains: "kopi", mode: "insensitive" } },
      { deskripsi: { contains: "kopi", mode: "insensitive" } },
    ]);
  });
});

describe("GET unit usaha by id", () => {
  it("tidak ada → 404", async () => {
    db.findFirst.mockResolvedValueOnce(null);
    const c = ctx({ id: "x" });
    const res = await unitUsahaFindUnique(c);
    expect(c.set.status).toBe(404);
    expect(res.success).toBe(false);
  });

  it("ada → success + data", async () => {
    db.findFirst.mockResolvedValueOnce({ id: "u1" });
    const res = await unitUsahaFindUnique(ctx({ id: "u1" }));
    expect(res).toMatchObject({ success: true, data: { id: "u1" } });
  });
});

describe("POST create unit usaha", () => {
  it("body tidak valid → 400 dan DB tidak disentuh", async () => {
    const c = ctx({ body: { nama: "", deskripsi: "x" } });
    const res = (await unitUsahaCreate(c)) as { success: boolean };
    expect(c.set.status).toBe(400);
    expect(res.success).toBe(false);
    expect(db.create).not.toHaveBeenCalled();
  });

  it("urutan tidak dikirim → max urutan + 1", async () => {
    db.aggregate.mockResolvedValueOnce({ _max: { urutan: 4 } });
    db.create.mockResolvedValueOnce({ id: "u1", urutan: 5 });
    await unitUsahaCreate(ctx({ body: validBody }));
    expect(db.create.mock.calls[0][0].data.urutan).toBe(5);
  });

  it("tabel kosong → urutan 0", async () => {
    db.aggregate.mockResolvedValueOnce({ _max: { urutan: null } });
    db.create.mockResolvedValueOnce({ id: "u1", urutan: 0 });
    await unitUsahaCreate(ctx({ body: validBody }));
    expect(db.create.mock.calls[0][0].data.urutan).toBe(0);
  });

  it("urutan eksplisit dipakai apa adanya tanpa aggregate", async () => {
    db.create.mockResolvedValueOnce({ id: "u1", urutan: 2 });
    await unitUsahaCreate(ctx({ body: { ...validBody, urutan: 2 } }));
    expect(db.aggregate).not.toHaveBeenCalled();
    expect(db.create.mock.calls[0][0].data.urutan).toBe(2);
  });

  it("imageId tidak ada (P2003) → 422", async () => {
    db.aggregate.mockResolvedValueOnce({ _max: { urutan: null } });
    db.create.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError("fk", {
        code: "P2003",
        clientVersion: "6.3.1",
        meta: { field_name: "UnitUsahaBumDes_imageId_fkey" },
      }),
    );
    const c = ctx({ body: { ...validBody, imageId: "hilang" } });
    await unitUsahaCreate(c);
    expect(c.set.status).toBe(422);
  });
});

describe("PUT update unit usaha", () => {
  it("tidak ada → 404 tanpa update", async () => {
    db.findFirst.mockResolvedValueOnce(null);
    const c = ctx({ id: "x", body: { nama: "Baru" } });
    await unitUsahaUpdate(c);
    expect(c.set.status).toBe(404);
    expect(db.update).not.toHaveBeenCalled();
  });

  it("update parsial hanya mengirim field yang diberikan", async () => {
    db.findFirst.mockResolvedValueOnce({ id: "u1" });
    db.update.mockResolvedValueOnce({ id: "u1", isActive: false });
    const res = (await unitUsahaUpdate(ctx({ id: "u1", body: { isActive: false } }))) as { success: boolean };
    expect(db.update.mock.calls[0][0].data).toEqual({ isActive: false });
    expect(res.success).toBe(true);
  });

  it("nilai tidak valid → 400", async () => {
    const c = ctx({ id: "u1", body: { urutan: -3 } });
    await unitUsahaUpdate(c);
    expect(c.set.status).toBe(400);
    expect(db.findFirst).not.toHaveBeenCalled();
  });
});

describe("DELETE unit usaha", () => {
  it("soft delete: deletedAt diisi dan isActive=false", async () => {
    db.findFirst.mockResolvedValueOnce({ id: "u1" });
    db.update.mockResolvedValueOnce({});
    const res = (await unitUsahaDelete(ctx({ id: "u1" }))) as { success: boolean };
    const { where, data } = db.update.mock.calls[0][0];
    expect(where).toEqual({ id: "u1" });
    expect(data.deletedAt).toBeInstanceOf(Date);
    expect(data.isActive).toBe(false);
    expect(res.success).toBe(true);
  });

  it("sudah dihapus/tidak ada → 404", async () => {
    db.findFirst.mockResolvedValueOnce(null);
    const c = ctx({ id: "u1" });
    await unitUsahaDelete(c);
    expect(c.set.status).toBe(404);
    expect(db.update).not.toHaveBeenCalled();
  });
});
