// @vitest-environment node
// Helper API bersama CRUD daftar anak (dipakai galeri & pengurus Bank Sampah): batas, urutan, 404 induk,
// hapus permanen + bersihkan berkas, reorder parsial ditolak. Prisma & penghapus berkas di-mock.
import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, removeReleasedFiles } = vi.hoisted(() => ({
  prismaMock: {
    pengurusBankSampah: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn(),
      create: vi.fn((args: { data: unknown }) => Promise.resolve({ id: "baru", ...(args.data as object) })),
      update: vi.fn((args: { data: unknown }) => Promise.resolve({ id: "p1", ...(args.data as object) })),
      delete: vi.fn(),
    },
    $transaction: vi.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
  },
  removeReleasedFiles: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({ default: prismaMock }));
vi.mock("@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeReleasedFiles", () => ({ default: removeReleasedFiles }));

import { pengurusConfig } from "@/app/api/[[...slugs]]/_lib/_konten-bersama/daftar-anak.config";
import { createDaftarAnakHandlers } from "@/app/api/[[...slugs]]/_lib/_konten-bersama/daftar-anak.handlers";

const db = prismaMock.pengurusBankSampah;
const parentExists = vi.fn();
const H = createDaftarAnakHandlers(
  pengurusConfig({
    delegate: () => db as never,
    parentKey: "bankSampahId",
    parentExists,
    parentNotFound: "Bank sampah tidak ditemukan",
    fileOwner: "PengurusBankSampah",
    max: 3,
  }),
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- stub context Elysia minimal
const ctx = (params: Record<string, string>, body?: unknown): any => ({ params, body, set: { status: 200 } });

beforeEach(() => {
  vi.clearAllMocks();
  parentExists.mockResolvedValue(true);
  db.count.mockResolvedValue(1);
  db.aggregate.mockResolvedValue({ _max: { urutan: 4 } });
});

describe("create", () => {
  it("menambah setelah urutan terbesar dengan FK induk terisi", async () => {
    const res = await H.create(ctx({ id: "bs1" }, { items: [{ nama: "Ketua Contoh", jabatan: "Ketua" }, { nama: "B", jabatan: "Bendahara" }] }));
    expect(res).toMatchObject({ success: true, message: "2 pengurus berhasil ditambahkan" });
    expect(db.create.mock.calls.map((c) => c[0].data)).toEqual([
      { nama: "Ketua Contoh", jabatan: "Ketua", imageId: undefined, bankSampahId: "bs1", urutan: 5 },
      { nama: "B", jabatan: "Bendahara", imageId: undefined, bankSampahId: "bs1", urutan: 6 },
    ]);
  });

  it("induk tidak ada → 404; melewati batas → 400; body invalid → 400", async () => {
    parentExists.mockResolvedValueOnce(false);
    const c1 = ctx({ id: "x" }, { items: [{ nama: "A", jabatan: "B" }] });
    expect(await H.create(c1)).toEqual({ success: false, message: "Bank sampah tidak ditemukan" });
    expect(c1.set.status).toBe(404);

    db.count.mockResolvedValueOnce(3);
    const c2 = ctx({ id: "bs1" }, { items: [{ nama: "A", jabatan: "B" }] });
    expect(await H.create(c2)).toMatchObject({ success: false, message: "Pengurus maksimal 3; sisa slot 0" });
    expect(c2.set.status).toBe(400);

    const c3 = ctx({ id: "bs1" }, { items: [{ nama: "", jabatan: "B" }] });
    expect(await H.create(c3)).toMatchObject({ success: false, message: "Nama wajib diisi" });
    expect(c3.set.status).toBe(400);
    expect(db.create).not.toHaveBeenCalled();
  });
});

describe("update & remove", () => {
  it("ganti foto → berkas lama dilepas; item milik induk lain → 404", async () => {
    db.findFirst.mockResolvedValueOnce({ id: "p1", imageId: "img-lama" });
    const res = await H.update(ctx({ id: "bs1", itemId: "p1" }, { imageId: "img-baru" }));
    expect(res).toMatchObject({ success: true, message: "Pengurus berhasil diperbarui" });
    expect(db.findFirst.mock.calls[0][0].where).toEqual({ id: "p1", bankSampahId: "bs1" });
    expect(removeReleasedFiles).toHaveBeenCalledWith("PengurusBankSampah", ["img-lama"], ["img-baru"]);

    db.findFirst.mockResolvedValueOnce(null);
    const c = ctx({ id: "bs2", itemId: "p1" }, { nama: "A" });
    expect(await H.update(c)).toMatchObject({ success: false, message: "Pengurus tidak ditemukan" });
    expect(c.set.status).toBe(404);
  });

  it("hapus permanen baris lalu berkasnya", async () => {
    db.findFirst.mockResolvedValueOnce({ id: "p1", imageId: "img-1" });
    expect(await H.remove(ctx({ id: "bs1", itemId: "p1" }))).toMatchObject({ success: true, data: { id: "p1" } });
    expect(db.delete).toHaveBeenCalledWith({ where: { id: "p1" } });
    expect(removeReleasedFiles).toHaveBeenCalledWith("PengurusBankSampah", ["img-1"]);
  });
});

describe("reorder & list", () => {
  it("permutasi lengkap disimpan sesuai posisi; daftar parsial ditolak 400", async () => {
    db.findMany.mockResolvedValue([{ id: "a" }, { id: "b" }]);
    expect(await H.reorder(ctx({ id: "bs1" }, { ids: ["b", "a"] }))).toMatchObject({ success: true });
    expect(db.update.mock.calls.map((c) => c[0])).toEqual([
      { where: { id: "b" }, data: { urutan: 0 } },
      { where: { id: "a" }, data: { urutan: 1 } },
    ]);

    const c = ctx({ id: "bs1" }, { ids: ["a"] });
    expect(await H.reorder(c)).toMatchObject({ success: false, message: "Daftar pengurus sudah berubah. Muat ulang halaman lalu coba lagi." });
    expect(c.set.status).toBe(400);
  });

  it("list hanya milik induk, urut urutan lalu createdAt, dibatasi max", async () => {
    db.findMany.mockResolvedValueOnce([{ id: "a" }]);
    expect(await H.list(ctx({ id: "bs1" }))).toMatchObject({ success: true, data: [{ id: "a" }] });
    expect(db.findMany.mock.calls[0][0]).toMatchObject({
      where: { bankSampahId: "bs1" },
      orderBy: [{ urutan: "asc" }, { createdAt: "asc" }],
      take: 3,
    });
  });
});
