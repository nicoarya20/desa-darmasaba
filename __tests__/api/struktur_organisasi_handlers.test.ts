// @vitest-environment node
// Factory handler API struktur organisasi (dipakai Perangkat Desa, PPID, nanti BUMDes) dengan delegate Prisma
// di-mock: field pegawai opsional → null, deskripsi/urutan jabatan, atasan siklus, soft-delete vs hard-delete.
import { describe, it, expect, vi, beforeEach } from "vitest";

const { prismaMock, minioMock } = vi.hoisted(() => ({
  prismaMock: { fileStorage: { delete: vi.fn(), updateMany: vi.fn(async () => ({ count: 1 })) } },
  minioMock: { removeObject: vi.fn() },
}));
vi.mock("@/lib/prisma", () => ({ default: prismaMock }));
vi.mock("@/lib/minio", () => ({ default: minioMock, MINIO_BUCKET: "bucket-test" }));
vi.mock("@/app/api/[[...slugs]]/_lib/fileStorage/_lib/fileReferences", () => ({ isFileReferenced: vi.fn(async () => false) }));

import { createStrukturHandlers } from "@/app/api/[[...slugs]]/_lib/_struktur-organisasi";

const delegate = () => ({
  findMany: vi.fn(),
  findUnique: vi.fn(),
  count: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
});
const db = { posisi: delegate(), pegawai: delegate() };
const handlersFor = (softDelete: boolean) =>
  createStrukturHandlers({
    posisi: () => db.posisi,
    pegawai: () => db.pegawai,
    pegawaiLabel: "Pegawai uji",
    pegawaiLabelLower: "pegawai uji",
    softDelete,
    fileOwner: "PegawaiUji", // test-only: owner tak dikenal → kelompok "Lainnya"
  });
const hard = handlersFor(false); // seperti Perangkat Desa / BUMDes
const soft = handlersFor(true); // seperti PPID

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- stub context Elysia minimal
const ctx = (opts: { body?: unknown; id?: string; query?: Record<string, string> } = {}): any => ({
  body: opts.body,
  params: opts.id ? { id: opts.id } : {},
  query: opts.query ?? {},
  set: { status: 200 },
});

const foto = { id: "img-1", path: "image", name: "a.webp" };

beforeEach(() => {
  vi.clearAllMocks();
  db.posisi.findUnique.mockResolvedValue({ id: "kepala" });
});

describe("pegawai: hanya nama + jabatan wajib", () => {
  it("field opsional tidak dikirim → null; email/telepon/imageId kosong → null", async () => {
    db.pegawai.create.mockResolvedValue({ id: "p1" });
    await soft.pegawai.create(ctx({ body: { namaLengkap: "Ni Wayan, S.Pd", posisiId: "kepala" } }));
    await soft.pegawai.create(
      ctx({ body: { namaLengkap: "I Made", posisiId: "kepala", email: "", telepon: "  ", imageId: "" } })
    );
    for (const [args] of db.pegawai.create.mock.calls) {
      expect(args.data).toMatchObject({ email: null, telepon: null, imageId: null, gelarAkademik: null, alamat: null });
    }
    expect(db.pegawai.create.mock.calls[0][0].data.namaLengkap).toBe("Ni Wayan, S.Pd");
  });

  it("dua pegawai tanpa email sama-sama tersimpan (email tidak unik)", async () => {
    db.pegawai.create.mockResolvedValueOnce({ id: "p1" }).mockResolvedValueOnce({ id: "p2" });
    const a = await hard.pegawai.create(ctx({ body: { namaLengkap: "A", posisiId: "kepala" } }));
    const b = await hard.pegawai.create(ctx({ body: { namaLengkap: "B", posisiId: "kepala", email: "" } }));
    expect([a, b]).toMatchObject([{ success: true, data: { id: "p1" } }, { success: true, data: { id: "p2" } }]);
  });

  it("tanpa nama atau jabatan → 400 tanpa menulis", async () => {
    for (const body of [{ posisiId: "kepala" }, { namaLengkap: "A" }, { namaLengkap: " ", posisiId: "kepala" }]) {
      const c = ctx({ body });
      expect(await soft.pegawai.create(c)).toMatchObject({ success: false });
      expect(c.set.status).toBe(400);
    }
    expect(db.pegawai.create).not.toHaveBeenCalled();
  });

  it("soft-delete: jabatan dicek tanpa baris terhapus; list mengabaikan baris terhapus", async () => {
    db.pegawai.create.mockResolvedValueOnce({ id: "p1" });
    await soft.pegawai.create(ctx({ body: { namaLengkap: "A", posisiId: "kepala" } }));
    expect(db.posisi.findUnique.mock.calls[0][0].where).toEqual({ id: "kepala", deletedAt: null });

    db.pegawai.findMany.mockResolvedValueOnce([]);
    db.pegawai.count.mockResolvedValueOnce(0);
    await soft.pegawai.findMany(ctx({ query: { isActive: "true" } }));
    expect(db.pegawai.findMany.mock.calls[0][0].where).toEqual({ deletedAt: null, isActive: true });
  });
});

describe("jabatan", () => {
  it("deskripsi opsional (kosong → null) dan urutan tersimpan", async () => {
    db.posisi.create.mockResolvedValueOnce({ id: "baru" });
    await hard.posisi.create(ctx({ body: { nama: "Sekretaris", hierarki: 2, urutan: 3 } }));
    expect(db.posisi.create.mock.calls[0][0].data).toEqual({
      nama: "Sekretaris",
      hierarki: 2,
      deskripsi: null,
      urutan: 3,
      parentId: null,
    });

    db.posisi.update.mockResolvedValueOnce({ id: "baru" });
    await hard.posisi.update(ctx({ id: "baru", body: { nama: "Sekretaris", hierarki: 2, deskripsi: " ", urutan: 5 } }));
    expect(db.posisi.update.mock.calls[0][0].data).toMatchObject({ deskripsi: null, urutan: 5 });
  });

  it("atasan yang membentuk siklus ditolak 400; node terhapus tidak ikut dihitung (soft-delete)", async () => {
    db.posisi.findMany.mockResolvedValue([
      { id: "A", parentId: null },
      { id: "B", parentId: "A" },
    ]);
    const c = ctx({ id: "A", body: { nama: "A", hierarki: 1, parentId: "B" } });
    expect(await soft.posisi.update(c)).toMatchObject({ success: false });
    expect(c.set.status).toBe(400);
    expect(db.posisi.findMany.mock.calls[0][0].where).toEqual({ deletedAt: null });
    expect(db.posisi.update).not.toHaveBeenCalled();
  });

  it("jumlah pegawai di respons hanya menghitung baris belum terhapus (soft-delete)", async () => {
    db.posisi.findMany.mockResolvedValueOnce([]);
    await soft.posisi.findManyAll(ctx());
    expect(db.posisi.findMany.mock.calls[0][0].select._count).toEqual({
      select: { pegawai: { where: { deletedAt: null } } },
    });
    db.posisi.findMany.mockResolvedValueOnce([]);
    await hard.posisi.findManyAll(ctx());
    expect(db.posisi.findMany.mock.calls[1][0].select._count).toEqual({ select: { pegawai: true } });
  });
});

describe("hapus sesuai opsi soft-delete", () => {
  it("hard-delete pegawai: baris dihapus lalu fotonya ke Sampah", async () => {
    db.pegawai.findUnique.mockResolvedValueOnce({ id: "p1", imageId: foto.id, image: foto });
    expect(await hard.pegawai.delete(ctx({ id: "p1" }))).toMatchObject({ success: true, data: { id: "p1" } });
    expect(db.pegawai.delete).toHaveBeenCalledWith({ where: { id: "p1" } });
    expect(db.pegawai.update).not.toHaveBeenCalled();
    expect(prismaMock.fileStorage.updateMany).toHaveBeenCalledWith({
      where: { id: foto.id, deletedAt: null },
      data: { deletedAt: expect.any(Date), isActive: false, deletedFrom: null },
    });
    expect(minioMock.removeObject).not.toHaveBeenCalled();
  });

  it("soft-delete pegawai: deletedAt diisi + nonaktif, baris & foto tidak dihapus", async () => {
    db.pegawai.findUnique.mockResolvedValueOnce({ id: "p1", imageId: foto.id, image: foto });
    expect(await soft.pegawai.delete(ctx({ id: "p1" }))).toMatchObject({ success: true, data: { id: "p1" } });
    const args = db.pegawai.update.mock.calls[0][0];
    expect(args.where).toEqual({ id: "p1" });
    expect(args.data).toEqual({ deletedAt: expect.any(Date), isActive: false });
    expect(db.pegawai.delete).not.toHaveBeenCalled();
    expect(prismaMock.fileStorage.updateMany).not.toHaveBeenCalled();
  });

  it("jabatan: hard-delete menghapus baris, soft-delete mengisi deletedAt; 409 tetap berlaku", async () => {
    const kosong = { id: "A", _count: { pegawai: 0, children: 0 } };
    db.posisi.findUnique.mockResolvedValueOnce(kosong).mockResolvedValueOnce(kosong);
    await hard.posisi.delete(ctx({ id: "A" }));
    expect(db.posisi.delete).toHaveBeenCalledWith({ where: { id: "A" } });

    await soft.posisi.delete(ctx({ id: "A" }));
    expect(db.posisi.update.mock.calls[0][0]).toEqual({
      where: { id: "A" },
      data: { deletedAt: expect.any(Date), isActive: false },
    });
    expect(db.posisi.findUnique.mock.calls[1][0].select._count).toEqual({
      select: { pegawai: { where: { deletedAt: null } }, children: { where: { deletedAt: null } } },
    });

    db.posisi.findUnique.mockResolvedValueOnce({ id: "A", _count: { pegawai: 1, children: 0 } });
    const c = ctx({ id: "A" });
    await soft.posisi.delete(c);
    expect(c.set.status).toBe(409);
    expect(db.posisi.update).toHaveBeenCalledTimes(1);
  });
});
