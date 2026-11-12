// @vitest-environment node
// Galeri many-to-many Berita & Kesejahteraan Masyarakat: delete menghapus permanen gambar utama + seluruh galeri,
// update menghapus yang dilepas saja — keduanya SETELAH operasi DB sukses; operasi gagal → berkas tidak disentuh.
import { describe, it, expect, vi, beforeEach } from "vitest";

const { prismaMock, removeStoredFileMock } = vi.hoisted(() => {
  const delegate = () => ({ findUnique: vi.fn(), delete: vi.fn(), update: vi.fn() });
  return {
    removeStoredFileMock: vi.fn(),
    prismaMock: { berita: delegate(), kesejahteraanMasyarakat: delegate() },
  };
});
vi.mock("@/lib/prisma", () => ({ default: prismaMock }));
vi.mock("@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile", () => ({ default: removeStoredFileMock }));

import beritaDelete from "@/app/api/[[...slugs]]/_lib/desa/berita/del";
import beritaUpdate from "@/app/api/[[...slugs]]/_lib/desa/berita/updt";
import kesejahteraanDelete from "@/app/api/[[...slugs]]/_lib/ekonomi/kesejahteraan-masyarakat/del";
import kesejahteraanUpdate from "@/app/api/[[...slugs]]/_lib/ekonomi/kesejahteraan-masyarakat/updt";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- stub context Elysia minimal
const ctx = (body: unknown = {}): any => ({ params: { id: "r1" }, body, set: {} });
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- handler Elysia beda tipe kembalian per domain
type Handler = (c: any) => Promise<unknown>;
type Delegate = (typeof prismaMock)["berita"];

const dihapus = () => removeStoredFileMock.mock.calls.map(([file, owner]) => [file.id, owner]);
const afterDb = (fn: { mock: { invocationCallOrder: number[] } }) =>
  removeStoredFileMock.mock.calls.length > 0 &&
  removeStoredFileMock.mock.invocationCallOrder.every((o) => o > fn.mock.invocationCallOrder[0]);

const BODY = { judul: "J", deskripsi: "D", content: "C" };
const galeri = (...ids: string[]) => ids.map((id) => ({ id }));

// [pemilik, delete, update, delegate]
const domain: [string, Handler, Handler, Delegate][] = [
  ["Berita", beritaDelete, beritaUpdate, prismaMock.berita],
  ["KesejahteraanMasyarakat", kesejahteraanDelete, kesejahteraanUpdate, prismaMock.kesejahteraanMasyarakat],
];

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  removeStoredFileMock.mockResolvedValue(undefined);
});

describe.each(domain)("%s", (owner, del, update, db) => {
  it("delete → gambar utama + seluruh galeri dihapus permanen setelah delete sukses", async () => {
    db.findUnique.mockResolvedValue({ id: "r1", imageId: "utama", images: galeri("g1", "g2") });
    db.delete.mockResolvedValue({ id: "r1" });
    expect(await del(ctx())).toMatchObject({ success: true });
    expect(db.findUnique.mock.calls[0][0].include).toMatchObject({ images: { select: { id: true } } });
    expect(dihapus()).toEqual(["utama", "g1", "g2"].map((id) => [id, owner]));
    expect(afterDb(db.delete)).toBe(true);
  });

  it("delete gagal → berkas tidak disentuh", async () => {
    db.findUnique.mockResolvedValue({ id: "r1", imageId: "utama", images: galeri("g1") });
    db.delete.mockRejectedValue(new Error("db down"));
    await expect(del(ctx())).rejects.toThrow("db down");
    expect(removeStoredFileMock).not.toHaveBeenCalled();
  });

  it("update → gambar utama & galeri yang dilepas dihapus permanen; yang tetap/dipindah ke galeri tidak", async () => {
    db.findUnique.mockResolvedValue({ id: "r1", imageId: "utama", images: galeri("g1", "g2", "g3") });
    db.update.mockResolvedValue({ id: "r1", imageId: "g3", images: galeri("g2", "utama") });
    const res = (await update(ctx({ ...BODY, imageId: "g3", imageIds: ["g2", "utama"] }))) as Response;
    expect(res.status).toBe(200);
    expect(dihapus()).toEqual([["g1", owner]]);
    expect(afterDb(db.update)).toBe(true);
  });

  it("update tanpa imageIds → galeri tidak diubah, tidak ada yang dihapus", async () => {
    db.findUnique.mockResolvedValue({ id: "r1", imageId: "utama", images: galeri("g1") });
    db.update.mockResolvedValue({ id: "r1", imageId: "utama", images: galeri("g1") });
    await update(ctx({ ...BODY, imageId: "utama" }));
    expect(db.update.mock.calls[0][0].data).not.toHaveProperty("images");
    expect(removeStoredFileMock).not.toHaveBeenCalled();
  });

  it("update gagal → 500 dan galeri lama tetap aktif", async () => {
    db.findUnique.mockResolvedValue({ id: "r1", imageId: "utama", images: galeri("g1") });
    db.update.mockRejectedValue(new Error("db down"));
    const res = (await update(ctx({ ...BODY, imageId: "baru", imageIds: [] }))) as Response;
    expect(res.status).toBe(500);
    expect(removeStoredFileMock).not.toHaveBeenCalled();
  });
});
