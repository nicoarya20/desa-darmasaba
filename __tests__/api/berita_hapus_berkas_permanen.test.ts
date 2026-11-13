// @vitest-environment node
// Contoh handler menu non-koleksi (Berita): berkas yang dilepas dihapus PERMANEN (baris FileStorage → objek MinIO)
// SESUDAH operasi DB record sukses — tidak lagi masuk Sampah. removeStoredFile asli dipakai (prisma & MinIO di-mock).
import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, minioMock } = vi.hoisted(() => ({
  prismaMock: {
    berita: { findUnique: vi.fn(), delete: vi.fn(), update: vi.fn() },
    fileStorage: { findUnique: vi.fn(), delete: vi.fn(), updateMany: vi.fn() },
    $queryRaw: vi.fn(),
    $queryRawUnsafe: vi.fn(),
  },
  minioMock: { removeObject: vi.fn() },
}));
vi.mock("@/lib/prisma", () => ({ default: prismaMock }));
vi.mock("@/lib/minio", () => ({ default: minioMock, MINIO_BUCKET: "bucket-test" }));

import beritaDelete from "@/app/api/[[...slugs]]/_lib/desa/berita/del";
import beritaUpdate from "@/app/api/[[...slugs]]/_lib/desa/berita/updt";
import { resetFileForeignKeysCache } from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/fileReferences";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- stub context Elysia minimal
const ctx = (body: unknown = {}): any => ({ params: { id: "b1" }, body, set: {} });
const order = (fn: { mock: { invocationCallOrder: number[] } }, i = 0) => fn.mock.invocationCallOrder[i];

beforeEach(() => {
  vi.clearAllMocks();
  resetFileForeignKeysCache();
  prismaMock.$queryRaw.mockResolvedValue([{ tabel: 'public."Berita"', kolom: '"imageId"' }]);
  prismaMock.$queryRawUnsafe.mockResolvedValue([{ dirujuk: false }]);
  prismaMock.fileStorage.findUnique.mockImplementation(async ({ where }: { where: { id: string } }) => ({
    path: "image",
    name: `${where.id}.webp`,
  }));
});

describe("Berita: hapus berkas permanen setelah operasi DB", () => {
  it("delete → berita dihapus dulu, lalu gambar utama + galeri: baris FileStorage lalu objek MinIO", async () => {
    prismaMock.berita.findUnique.mockResolvedValue({ id: "b1", imageId: "utama", images: [{ id: "g1" }] });
    prismaMock.berita.delete.mockResolvedValue({ id: "b1" });

    expect(await beritaDelete(ctx())).toMatchObject({ success: true });

    expect(prismaMock.fileStorage.delete.mock.calls.map(([a]) => a.where.id)).toEqual(["utama", "g1"]);
    expect(minioMock.removeObject.mock.calls.map(([, key]) => key)).toEqual(["image/utama.webp", "image/g1.webp"]);
    expect(order(prismaMock.fileStorage.delete)).toBeGreaterThan(order(prismaMock.berita.delete));
    expect(order(minioMock.removeObject)).toBeGreaterThan(order(prismaMock.fileStorage.delete));
    expect(prismaMock.fileStorage.updateMany).not.toHaveBeenCalled();
  });

  it("update ganti gambar → gambar lama dihapus permanen sesudah update; gambar baru utuh", async () => {
    prismaMock.berita.findUnique.mockResolvedValue({ id: "b1", imageId: "lama", images: [] });
    prismaMock.berita.update.mockResolvedValue({ id: "b1", imageId: "baru", images: [] });

    const res = (await beritaUpdate(ctx({ judul: "J", deskripsi: "D", content: "C", imageId: "baru" }))) as Response;

    expect(res.status).toBe(200);
    expect(prismaMock.fileStorage.delete).toHaveBeenCalledTimes(1);
    expect(prismaMock.fileStorage.delete).toHaveBeenCalledWith({ where: { id: "lama" } });
    expect(minioMock.removeObject).toHaveBeenCalledWith("bucket-test", "image/lama.webp");
    expect(order(prismaMock.fileStorage.delete)).toBeGreaterThan(order(prismaMock.berita.update));
  });

  it("gambar lama masih dirujuk data lain → dilewati; update gagal → berkas tidak disentuh", async () => {
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    prismaMock.berita.findUnique.mockResolvedValue({ id: "b1", imageId: "lama", images: [] });
    prismaMock.berita.update.mockResolvedValueOnce({ id: "b1", imageId: "baru", images: [] });
    prismaMock.$queryRawUnsafe.mockResolvedValueOnce([{ dirujuk: true }]);
    await beritaUpdate(ctx({ judul: "J", deskripsi: "D", content: "C", imageId: "baru" }));
    expect(prismaMock.fileStorage.delete).not.toHaveBeenCalled();

    prismaMock.berita.update.mockRejectedValueOnce(new Error("db down"));
    const res = (await beritaUpdate(ctx({ judul: "J", deskripsi: "D", content: "C", imageId: "baru" }))) as Response;
    expect(res.status).toBe(500);
    expect(prismaMock.fileStorage.delete).not.toHaveBeenCalled();
    expect(minioMock.removeObject).not.toHaveBeenCalled();
  });
});
