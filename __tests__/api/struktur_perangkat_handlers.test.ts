// @vitest-environment node
// Handler API Struktur Perangkat Desa dengan prisma + MinIO di-mock (worker tanpa DB).
import { describe, it, expect, vi, beforeEach } from "vitest";

const { prismaMock, minioMock } = vi.hoisted(() => ({
  prismaMock: {
    posisiPerangkatDesa: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    perangkatDesa: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    fileStorage: { delete: vi.fn(), updateMany: vi.fn(async () => ({ count: 1 })) },
  },
  minioMock: { removeObject: vi.fn() },
}));
vi.mock("@/lib/prisma", () => ({ default: prismaMock }));
vi.mock("@/lib/minio", () => ({ default: minioMock, MINIO_BUCKET: "bucket-test" }));
vi.mock("@/app/api/[[...slugs]]/_lib/fileStorage/_lib/fileReferences", () => ({ isFileReferenced: vi.fn(async () => false) }));

import { strukturPerangkatHandlers } from "@/app/api/[[...slugs]]/_lib/desa/struktur-perangkat/handlers";

const {
  posisi: { create: posisiCreate, update: posisiUpdate, delete: posisiDelete, findManyAll: posisiFindManyAll },
  pegawai: { create: pegawaiCreate, update: pegawaiUpdate, delete: pegawaiDelete, findMany: pegawaiFindMany },
} = strukturPerangkatHandlers;

const posisiDb = prismaMock.posisiPerangkatDesa;
const pegawaiDb = prismaMock.perangkatDesa;

// Context Elysia minimal: body, params, query, set.status.
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- stub context test
const ctx = (opts: { body?: unknown; id?: string; query?: Record<string, string> } = {}): any => ({
  body: opts.body,
  params: opts.id ? { id: opts.id } : {},
  query: opts.query ?? {},
  set: { status: 200 },
});

const oldImage = { id: "img-lama", path: "image", name: "lama.webp" };

beforeEach(() => {
  vi.clearAllMocks();
  posisiDb.findUnique.mockResolvedValue({ id: "pd-perbekel" });
});

describe("pegawai create", () => {
  it("hanya nama + jabatan → tersimpan, field lain null", async () => {
    pegawaiDb.create.mockResolvedValueOnce({ id: "p1" });
    const c = ctx({ body: { namaLengkap: "  I Made Sukra ", posisiId: "pd-perbekel" } });
    const res = await pegawaiCreate(c);
    expect(res).toMatchObject({ success: true, data: { id: "p1" } });
    expect(pegawaiDb.create.mock.calls[0][0].data).toEqual({
      namaLengkap: "I Made Sukra",
      posisiId: "pd-perbekel",
      gelarAkademik: null,
      imageId: null,
      tanggalMasuk: null,
      email: null,
      telepon: null,
      alamat: null,
      isActive: true,
    });
  });

  it("string kosong/spasi → null, tanggal → Date", async () => {
    pegawaiDb.create.mockResolvedValueOnce({ id: "p2" });
    await pegawaiCreate(
      ctx({
        body: { namaLengkap: "A", posisiId: "pd-perbekel", email: " ", telepon: "", tanggalMasuk: "2020-01-15" },
      })
    );
    const data = pegawaiDb.create.mock.calls[0][0].data;
    expect(data.email).toBeNull();
    expect(data.telepon).toBeNull();
    expect(data.tanggalMasuk).toEqual(new Date("2020-01-15T00:00:00.000Z"));
  });

  it("400 bila nama kosong, email salah, tanggal invalid, atau jabatan tidak ada", async () => {
    const bad = [
      { namaLengkap: "  ", posisiId: "pd-perbekel" },
      { namaLengkap: "A", posisiId: "pd-perbekel", email: "salah" },
      { namaLengkap: "A", posisiId: "pd-perbekel", tanggalMasuk: "2020-02-31" },
    ];
    for (const body of bad) {
      const c = ctx({ body });
      expect(await pegawaiCreate(c)).toMatchObject({ success: false });
      expect(c.set.status).toBe(400);
    }
    posisiDb.findUnique.mockResolvedValueOnce(null);
    const c = ctx({ body: { namaLengkap: "A", posisiId: "tidak-ada" } });
    expect(await pegawaiCreate(c)).toEqual({ success: false, message: "Jabatan tidak ditemukan" });
    expect(c.set.status).toBe(400);
    expect(pegawaiDb.create).not.toHaveBeenCalled();
  });
});

describe("pegawai update & delete: gambar lama ke Sampah", () => {
  const SAMPAH_DATA = { deletedAt: expect.any(Date), isActive: false, deletedFrom: "desa.struktur-perangkat-desa" };

  it("imageId dikosongkan → update dulu, lalu gambar lama dipindah ke Sampah (MinIO tidak disentuh)", async () => {
    pegawaiDb.findUnique.mockResolvedValueOnce({ id: "p1", imageId: oldImage.id, image: oldImage });
    pegawaiDb.update.mockResolvedValueOnce({ id: "p1", imageId: null });
    const c = ctx({ id: "p1", body: { namaLengkap: "A", posisiId: "pd-perbekel", imageId: "" } });
    const res = await pegawaiUpdate(c);

    expect(res).toMatchObject({ success: true });
    expect(pegawaiDb.update.mock.calls[0][0].data.imageId).toBeNull();
    expect(prismaMock.fileStorage.updateMany).toHaveBeenCalledWith({
      where: { id: "img-lama", deletedAt: null },
      data: SAMPAH_DATA,
    });
    expect(prismaMock.fileStorage.delete).not.toHaveBeenCalled();
    expect(minioMock.removeObject).not.toHaveBeenCalled();
    const updateOrder = pegawaiDb.update.mock.invocationCallOrder[0];
    expect(prismaMock.fileStorage.updateMany.mock.invocationCallOrder[0]).toBeGreaterThan(updateOrder);
  });

  it("imageId tetap sama atau tidak dikirim → gambar tidak dipindah", async () => {
    for (const imageId of [oldImage.id, undefined]) {
      pegawaiDb.findUnique.mockResolvedValueOnce({ id: "p1", imageId: oldImage.id, image: oldImage });
      pegawaiDb.update.mockResolvedValueOnce({ id: "p1" });
      await pegawaiUpdate(ctx({ id: "p1", body: { namaLengkap: "A", posisiId: "pd-perbekel", imageId } }));
    }
    expect(prismaMock.fileStorage.updateMany).not.toHaveBeenCalled();
  });

  it("update gagal → gambar lama tidak disentuh", async () => {
    pegawaiDb.findUnique.mockResolvedValueOnce({ id: "p1", imageId: oldImage.id, image: oldImage });
    pegawaiDb.update.mockRejectedValueOnce(new Error("db down"));
    await expect(
      pegawaiUpdate(ctx({ id: "p1", body: { namaLengkap: "A", posisiId: "pd-perbekel", imageId: "baru" } }))
    ).rejects.toThrow("db down");
    expect(prismaMock.fileStorage.updateMany).not.toHaveBeenCalled();
  });

  it("gagal memindah ke Sampah dicatat dengan konteks, update tetap sukses", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    pegawaiDb.findUnique.mockResolvedValueOnce({ id: "p1", imageId: oldImage.id, image: oldImage });
    pegawaiDb.update.mockResolvedValueOnce({ id: "p1" });
    prismaMock.fileStorage.updateMany.mockRejectedValueOnce(new Error("db down"));
    const res = await pegawaiUpdate(ctx({ id: "p1", body: { namaLengkap: "A", posisiId: "pd-perbekel", imageId: "baru" } }));
    expect(res).toMatchObject({ success: true });
    expect(String(spy.mock.calls[0][0])).toContain("img-lama");
    expect(String(spy.mock.calls[0][0])).toContain("PerangkatDesa");
    spy.mockRestore();
  });

  it("update 404 bila pegawai tidak ada", async () => {
    pegawaiDb.findUnique.mockResolvedValueOnce(null);
    const c = ctx({ id: "x", body: { namaLengkap: "A", posisiId: "pd-perbekel" } });
    expect(await pegawaiUpdate(c)).toMatchObject({ success: false });
    expect(c.set.status).toBe(404);
  });

  it("delete pegawai → baris dihapus dulu, lalu fotonya ke Sampah", async () => {
    pegawaiDb.findUnique.mockResolvedValueOnce({ id: "p1", image: oldImage });
    pegawaiDb.delete.mockResolvedValueOnce({ id: "p1" });
    expect(await pegawaiDelete(ctx({ id: "p1" }))).toMatchObject({ success: true, data: { id: "p1" } });
    expect(prismaMock.fileStorage.updateMany.mock.invocationCallOrder[0]).toBeGreaterThan(
      pegawaiDb.delete.mock.invocationCallOrder[0]
    );
    expect(minioMock.removeObject).not.toHaveBeenCalled();
  });
});

describe("pegawai find-many", () => {
  it("paginasi di DB, limit maks 100, urut jabatan lalu nama, search nama + jabatan", async () => {
    pegawaiDb.findMany.mockResolvedValueOnce([{ id: "p1" }]);
    pegawaiDb.count.mockResolvedValueOnce(250);
    const res = await pegawaiFindMany(ctx({ query: { page: "2", limit: "500", search: " kelian ", isActive: "true" } }));
    const args = pegawaiDb.findMany.mock.calls[0][0];
    expect(args.take).toBe(100);
    expect(args.skip).toBe(100);
    expect(args.orderBy).toEqual([
      { posisi: { hierarki: "asc" } },
      { posisi: { urutan: "asc" } },
      { namaLengkap: "asc" },
    ]);
    expect(args.where).toEqual({
      isActive: true,
      OR: [
        { namaLengkap: { contains: "kelian", mode: "insensitive" } },
        { posisi: { nama: { contains: "kelian", mode: "insensitive" } } },
      ],
    });
    expect(res).toMatchObject({ success: true, page: 2, limit: 100, total: 250, totalPages: 3 });
  });
});

describe("posisi", () => {
  it("find-many-all urut hierarki, urutan, nama; isActive opsional", async () => {
    posisiDb.findMany.mockResolvedValueOnce([]);
    await posisiFindManyAll(ctx({ query: { isActive: "" } }));
    expect(posisiDb.findMany.mock.calls[0][0]).toMatchObject({
      where: {},
      orderBy: [{ hierarki: "asc" }, { urutan: "asc" }, { nama: "asc" }],
    });
  });

  it("create: parent tidak ada → 400; parentId kosong → null", async () => {
    posisiDb.findMany.mockResolvedValueOnce([{ id: "pd-perbekel", parentId: null }]);
    const bad = ctx({ body: { nama: "Kasi", hierarki: 2, parentId: "tidak-ada" } });
    expect(await posisiCreate(bad)).toMatchObject({ success: false });
    expect(bad.set.status).toBe(400);

    posisiDb.create.mockResolvedValueOnce({ id: "baru" });
    await posisiCreate(ctx({ body: { nama: "Perbekel 2", hierarki: 1, parentId: " " } }));
    expect(posisiDb.create.mock.calls[0][0].data).toMatchObject({ parentId: null, urutan: 0, deskripsi: null });
  });

  it("update: siklus ditolak 400, atasan diri sendiri ditolak 400", async () => {
    const nodes = [
      { id: "A", parentId: null },
      { id: "B", parentId: "A" },
    ];
    posisiDb.findMany.mockResolvedValue(nodes);
    for (const [id, parentId] of [["A", "B"], ["B", "B"]]) {
      posisiDb.findUnique.mockResolvedValueOnce({ id });
      const c = ctx({ id, body: { nama: "X", hierarki: 1, parentId } });
      expect(await posisiUpdate(c)).toMatchObject({ success: false });
      expect(c.set.status).toBe(400);
    }
    expect(posisiDb.update).not.toHaveBeenCalled();
  });

  it("delete: 409 bila masih punya pegawai atau bawahan; 404 bila tidak ada; sukses bila kosong", async () => {
    posisiDb.findUnique.mockResolvedValueOnce({ id: "A", _count: { pegawai: 2, children: 0 } });
    const c1 = ctx({ id: "A" });
    expect(await posisiDelete(c1)).toMatchObject({ success: false });
    expect(c1.set.status).toBe(409);

    posisiDb.findUnique.mockResolvedValueOnce({ id: "A", _count: { pegawai: 0, children: 3 } });
    const c2 = ctx({ id: "A" });
    expect(await posisiDelete(c2)).toMatchObject({ success: false });
    expect(c2.set.status).toBe(409);
    expect(posisiDb.delete).not.toHaveBeenCalled();

    posisiDb.findUnique.mockResolvedValueOnce(null);
    const c3 = ctx({ id: "Z" });
    await posisiDelete(c3);
    expect(c3.set.status).toBe(404);

    posisiDb.findUnique.mockResolvedValueOnce({ id: "A", _count: { pegawai: 0, children: 0 } });
    expect(await posisiDelete(ctx({ id: "A" }))).toMatchObject({ success: true, data: { id: "A" } });
    expect(posisiDb.delete).toHaveBeenCalledWith({ where: { id: "A" } });
  });
});
