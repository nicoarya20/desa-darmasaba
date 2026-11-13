// @vitest-environment node
// Galeri foto Profil BUMDes: list publik, tambah banyak, edit keterangan, soft delete, reorder.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Prisma } from "@prisma/client";

const prismaMock = vi.hoisted(() => ({
  profilBumDes: { findFirst: vi.fn() },
  fotoProfilBumDes: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    count: vi.fn(),
    aggregate: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  $transaction: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({ default: prismaMock }));

import fotoProfilFindMany from "@/app/api/[[...slugs]]/_lib/ekonomi/bumdes/profil/foto/findMany";
import fotoProfilCreate from "@/app/api/[[...slugs]]/_lib/ekonomi/bumdes/profil/foto/create";
import fotoProfilUpdate from "@/app/api/[[...slugs]]/_lib/ekonomi/bumdes/profil/foto/updt";
import fotoProfilDelete from "@/app/api/[[...slugs]]/_lib/ekonomi/bumdes/profil/foto/del";
import fotoProfilReorder from "@/app/api/[[...slugs]]/_lib/ekonomi/bumdes/profil/foto/reorder";
import { MAX_FOTO_GALERI } from "@/lib/bumdes-foto-profil";
import { PROFIL_BUMDES_ID } from "@/lib/bumdes-profil";

type Res = { success: boolean; message: string; data?: unknown };
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- stub context Elysia untuk test
const ctx = (body: unknown, params: Record<string, string> = {}): any => ({ body, params, set: { status: 200 } });
const AKTIF = { profilId: PROFIL_BUMDES_ID, isActive: true, deletedAt: null };

beforeEach(() => {
  vi.clearAllMocks();
  // $transaction array: kembalikan hasil tiap operasi (mock create/update mengembalikan nilai langsung).
  prismaMock.$transaction.mockImplementation(async (ops: unknown[]) => Promise.all(ops));
});

describe("GET galeri foto (publik)", () => {
  it("hanya foto aktif & belum dihapus milik profil, urut urutan lalu createdAt, dibatasi", async () => {
    prismaMock.fotoProfilBumDes.findMany.mockResolvedValueOnce([{ id: "a" }, { id: "b" }]);
    const res = await fotoProfilFindMany();
    const args = prismaMock.fotoProfilBumDes.findMany.mock.calls[0][0];
    expect(args.where).toEqual(AKTIF);
    expect(args.orderBy).toEqual([{ urutan: "asc" }, { createdAt: "asc" }]);
    expect(args.take).toBe(MAX_FOTO_GALERI);
    expect(args.select.image.select).toEqual({ id: true, name: true, link: true });
    expect(res.data).toEqual([{ id: "a" }, { id: "b" }]);
  });
});

describe("POST galeri foto (tambah banyak)", () => {
  const items = [{ imageId: "img-1", keterangan: " Kantor BUMDes " }, { imageId: "img-2" }];

  it("profil belum diisi → 400 'Isi profil BUMDes dulu', tidak menulis", async () => {
    prismaMock.profilBumDes.findFirst.mockResolvedValueOnce(null);
    const c = ctx({ items });
    const res = (await fotoProfilCreate(c)) as Res;
    expect(c.set.status).toBe(400);
    expect(res.message).toContain("Isi profil BUMDes dulu");
    expect(prismaMock.fotoProfilBumDes.create).not.toHaveBeenCalled();
  });

  it("menambah semua foto setelah urutan terbesar, keterangan di-trim / null", async () => {
    prismaMock.profilBumDes.findFirst.mockResolvedValueOnce({ id: PROFIL_BUMDES_ID });
    prismaMock.fotoProfilBumDes.count.mockResolvedValueOnce(3);
    prismaMock.fotoProfilBumDes.aggregate.mockResolvedValueOnce({ _max: { urutan: 4 } });
    prismaMock.fotoProfilBumDes.create.mockImplementation((a: { data: unknown }) => a.data);

    const res = (await fotoProfilCreate(ctx({ items }))) as Res;
    const datas = prismaMock.fotoProfilBumDes.create.mock.calls.map((call) => call[0].data);
    expect(datas).toEqual([
      { profilId: PROFIL_BUMDES_ID, imageId: "img-1", keterangan: "Kantor BUMDes", urutan: 5 },
      { profilId: PROFIL_BUMDES_ID, imageId: "img-2", keterangan: null, urutan: 6 },
    ]);
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(res.success).toBe(true);
    expect(res.data).toHaveLength(2);
  });

  it("melewati batas galeri → 400 dengan sisa slot", async () => {
    prismaMock.profilBumDes.findFirst.mockResolvedValueOnce({ id: PROFIL_BUMDES_ID });
    prismaMock.fotoProfilBumDes.count.mockResolvedValueOnce(MAX_FOTO_GALERI - 1);
    prismaMock.fotoProfilBumDes.aggregate.mockResolvedValueOnce({ _max: { urutan: 48 } });
    const c = ctx({ items });
    const res = (await fotoProfilCreate(c)) as Res;
    expect(c.set.status).toBe(400);
    expect(res.message).toContain("sisa slot 1");
    expect(prismaMock.fotoProfilBumDes.create).not.toHaveBeenCalled();
  });

  it("daftar kosong / imageId ganda → 400 tanpa query DB", async () => {
    for (const body of [{ items: [] }, { items: [{ imageId: "x" }, { imageId: "x" }] }]) {
      const c = ctx(body);
      const res = (await fotoProfilCreate(c)) as Res;
      expect(c.set.status).toBe(400);
      expect(res.success).toBe(false);
    }
    expect(prismaMock.profilBumDes.findFirst).not.toHaveBeenCalled();
  });

  it("imageId tidak ada (P2003) → 422", async () => {
    prismaMock.profilBumDes.findFirst.mockResolvedValueOnce({ id: PROFIL_BUMDES_ID });
    prismaMock.fotoProfilBumDes.count.mockResolvedValueOnce(0);
    prismaMock.fotoProfilBumDes.aggregate.mockResolvedValueOnce({ _max: { urutan: null } });
    prismaMock.$transaction.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError("err", {
        code: "P2003",
        clientVersion: "6.3.1",
        meta: { field_name: "FotoProfilBumDes_imageId_fkey" },
      }),
    );
    const c = ctx({ items: [{ imageId: "hilang" }] });
    const res = (await fotoProfilCreate(c)) as Res;
    expect(c.set.status).toBe(422);
    expect(res.success).toBe(false);
  });
});

describe("PUT keterangan foto", () => {
  it("foto tidak aktif / tidak ada → 404", async () => {
    prismaMock.fotoProfilBumDes.findFirst.mockResolvedValueOnce(null);
    const c = ctx({ keterangan: "x" }, { id: "f1" });
    await fotoProfilUpdate(c);
    expect(c.set.status).toBe(404);
    expect(prismaMock.fotoProfilBumDes.findFirst.mock.calls[0][0].where).toEqual({ id: "f1", ...AKTIF });
    expect(prismaMock.fotoProfilBumDes.update).not.toHaveBeenCalled();
  });

  it("keterangan kosong disimpan sebagai null", async () => {
    prismaMock.fotoProfilBumDes.findFirst.mockResolvedValueOnce({ id: "f1" });
    prismaMock.fotoProfilBumDes.update.mockResolvedValueOnce({ id: "f1", keterangan: null });
    const res = (await fotoProfilUpdate(ctx({ keterangan: "  " }, { id: "f1" }))) as Res;
    const args = prismaMock.fotoProfilBumDes.update.mock.calls[0][0];
    expect(args.where).toEqual({ id: "f1" });
    expect(args.data).toEqual({ keterangan: null });
    expect(res.success).toBe(true);
  });
});

describe("DELETE foto (soft delete)", () => {
  it("mengisi deletedAt + isActive=false, tidak menghapus baris", async () => {
    prismaMock.fotoProfilBumDes.findFirst.mockResolvedValueOnce({ id: "f1" });
    prismaMock.fotoProfilBumDes.update.mockResolvedValueOnce({ id: "f1" });
    const res = (await fotoProfilDelete(ctx(undefined, { id: "f1" }))) as Res;
    const args = prismaMock.fotoProfilBumDes.update.mock.calls[0][0];
    expect(args.where).toEqual({ id: "f1" });
    expect(args.data.isActive).toBe(false);
    expect(args.data.deletedAt).toBeInstanceOf(Date);
    expect(res).toMatchObject({ success: true, data: { id: "f1", deleted: true } });
  });

  it("sudah dihapus → 404", async () => {
    prismaMock.fotoProfilBumDes.findFirst.mockResolvedValueOnce(null);
    const c = ctx(undefined, { id: "f1" });
    await fotoProfilDelete(c);
    expect(c.set.status).toBe(404);
    expect(prismaMock.fotoProfilBumDes.update).not.toHaveBeenCalled();
  });
});

describe("PUT urutan galeri", () => {
  it("menulis urutan sesuai index daftar dalam satu transaksi", async () => {
    prismaMock.fotoProfilBumDes.findMany.mockResolvedValueOnce([{ id: "a" }, { id: "b" }, { id: "c" }]);
    prismaMock.fotoProfilBumDes.update.mockImplementation((a: unknown) => a);
    const res = (await fotoProfilReorder(ctx({ ids: ["c", "a", "b"] }))) as Res;
    const updates = prismaMock.fotoProfilBumDes.update.mock.calls.map((call) => call[0]);
    expect(updates).toEqual([
      { where: { id: "c" }, data: { urutan: 0 } },
      { where: { id: "a" }, data: { urutan: 1 } },
      { where: { id: "b" }, data: { urutan: 2 } },
    ]);
    expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
    expect(res.success).toBe(true);
  });

  it("daftar tidak memuat semua foto aktif → 400, tidak menulis", async () => {
    prismaMock.fotoProfilBumDes.findMany.mockResolvedValueOnce([{ id: "a" }, { id: "b" }]);
    const c = ctx({ ids: ["a"] });
    const res = (await fotoProfilReorder(c)) as Res;
    expect(c.set.status).toBe(400);
    expect(res.message).toContain("berubah");
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("id asing → 400", async () => {
    prismaMock.fotoProfilBumDes.findMany.mockResolvedValueOnce([{ id: "a" }]);
    const c = ctx({ ids: ["zzz"] });
    await fotoProfilReorder(c);
    expect(c.set.status).toBe(400);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });
});
