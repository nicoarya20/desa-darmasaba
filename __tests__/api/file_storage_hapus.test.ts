// @vitest-environment node
// Hapus berkas = permanen (baris FileStorage dulu, lalu objek MinIO), berkas yang masih dirujuk data lain dilewati,
// berkas tersimpan dilayani normal (tidak ada lagi filter Sampah tingkat berkas).
import { describe, it, expect, vi, beforeEach } from "vitest";

const { prismaMock, minioMock } = vi.hoisted(() => ({
  prismaMock: {
    fileStorage: {
      updateMany: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      delete: vi.fn(),
    },
    $queryRaw: vi.fn(),
    $queryRawUnsafe: vi.fn(),
  },
  minioMock: { removeObject: vi.fn(), getObject: vi.fn(), statObject: vi.fn(), getPartialObject: vi.fn() },
}));
vi.mock("@/lib/prisma", () => ({ default: prismaMock }));
vi.mock("@/lib/minio", () => ({ default: minioMock, MINIO_BUCKET: "bucket-test" }));

import removeStoredFile from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";
import { purgeStoredFile } from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/purgeStoredFile";
import {
  buildFileReferenceSql,
  isFileReferenced,
  resetFileForeignKeysCache,
} from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/fileReferences";
import fileStorageDelete from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/del";
import fileStorageFindUnique from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/findUniq";
import { fileStorageFindMany } from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/findMany";
import img from "@/app/api/[[...slugs]]/_lib/img";
import imgDel from "@/app/api/[[...slugs]]/_lib/img-del";

const FKS = [
  { tabel: "public.\"Berita\"", kolom: "\"imageId\"" },
  { tabel: "public.\"_BeritaImages\"", kolom: "\"B\"" },
];
const dirujuk = (value: boolean) => prismaMock.$queryRawUnsafe.mockResolvedValue([{ dirujuk: value }]);
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- stub context Elysia minimal
const ctx = (over: Record<string, unknown> = {}): any => ({ params: {}, query: {}, headers: {}, set: { headers: {} }, ...over });

async function* stream(text: string) {
  yield Buffer.from(text);
}

beforeEach(() => {
  vi.clearAllMocks();
  resetFileForeignKeysCache();
  prismaMock.$queryRaw.mockResolvedValue(FKS);
  dirujuk(false);
  prismaMock.fileStorage.findUnique.mockResolvedValue({ path: "image", name: "a.webp" });
});

describe("cek rujukan berkas (FK katalog Postgres)", () => {
  it("SQL satu query EXISTS per kolom FK dengan parameter $1", () => {
    expect(buildFileReferenceSql(FKS)).toBe(
      'SELECT (EXISTS (SELECT 1 FROM public."Berita" WHERE "imageId" = $1) OR EXISTS (SELECT 1 FROM public."_BeritaImages" WHERE "B" = $1)) AS dirujuk',
    );
  });

  it("membaca FK sekali per proses lalu mengecek id berkas sebagai parameter (bukan interpolasi)", async () => {
    dirujuk(true);
    expect(await isFileReferenced("f1")).toBe(true);
    expect(await isFileReferenced("f2")).toBe(true);
    expect(prismaMock.$queryRaw).toHaveBeenCalledTimes(1);
    expect(prismaMock.$queryRawUnsafe).toHaveBeenLastCalledWith(expect.stringContaining("= $1"), "f2");
  });

  it("gagal membaca katalog → error berkonteks dan tidak di-cache", async () => {
    prismaMock.$queryRaw.mockRejectedValueOnce(new Error("db down"));
    await expect(isFileReferenced("f1")).rejects.toThrow("Gagal membaca FK yang merujuk FileStorage: db down");
    expect(await isFileReferenced("f1")).toBe(false);
    expect(prismaMock.$queryRaw).toHaveBeenCalledTimes(2);
  });
});

describe("removeStoredFile = hapus permanen", () => {
  it("baris FileStorage dihapus dulu, baru objek MinIO; tidak ada soft delete", async () => {
    await removeStoredFile({ id: "f1" }, "Berita");
    expect(prismaMock.fileStorage.delete).toHaveBeenCalledWith({ where: { id: "f1" } });
    expect(minioMock.removeObject).toHaveBeenCalledWith("bucket-test", "image/a.webp");
    expect(prismaMock.fileStorage.delete.mock.invocationCallOrder[0]).toBeLessThan(minioMock.removeObject.mock.invocationCallOrder[0]);
    expect(prismaMock.fileStorage.updateMany).not.toHaveBeenCalled();
  });

  it("berkas masih dirujuk data lain → dilewati (dicatat info), baris & MinIO utuh", async () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => undefined);
    dirujuk(true);
    await removeStoredFile({ id: "f1" }, "Berita");
    expect(prismaMock.fileStorage.delete).not.toHaveBeenCalled();
    expect(minioMock.removeObject).not.toHaveBeenCalled();
    expect(String(info.mock.calls[0][0])).toContain("f1");
    info.mockRestore();
  });

  it("gagal dicatat dengan konteks pemilik + id tanpa melempar", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    prismaMock.fileStorage.delete.mockRejectedValueOnce(new Error("db down"));
    await expect(removeStoredFile({ id: "f9" }, "Posyandu")).resolves.toBeUndefined();
    expect(String(spy.mock.calls[0][0])).toContain("f9");
    expect(String(spy.mock.calls[0][0])).toContain("Posyandu");
    expect(minioMock.removeObject).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe("DELETE /api/fileStorage/delete/:id", () => {
  it("hapus permanen; query lama `from` diabaikan", async () => {
    const res = await fileStorageDelete(ctx({ params: { id: "f1" }, query: { from: "ekonomi.bumdes" } }));
    expect(res).toEqual({ message: "File berhasil dihapus", deletedId: "f1" });
    expect(prismaMock.fileStorage.delete).toHaveBeenCalledWith({ where: { id: "f1" } });
    expect(minioMock.removeObject).toHaveBeenCalledWith("bucket-test", "image/a.webp");
  });

  it("berkas yang masih dipakai → 409, tidak dihapus", async () => {
    dirujuk(true);
    const c = ctx({ params: { id: "f1" } });
    expect(await fileStorageDelete(c)).toMatchObject({ success: false });
    expect(c.set.status).toBe(409);
    expect(prismaMock.fileStorage.delete).not.toHaveBeenCalled();
  });

  it("berkas tidak ada → 404 body lama", async () => {
    prismaMock.fileStorage.findUnique.mockResolvedValueOnce(null);
    expect(await fileStorageDelete(ctx({ params: { id: "f1" } }))).toEqual({ status: 404, body: "File tidak ditemukan di database" });
    expect(prismaMock.fileStorage.delete).not.toHaveBeenCalled();
  });
});

describe("DELETE /api/img/:name", () => {
  it("gambar tercatat di FileStorage → hapus permanen lewat jalur aman (baris dulu)", async () => {
    prismaMock.fileStorage.findUnique.mockResolvedValueOnce({ id: "f1" });
    expect(await imgDel({ name: "a.webp" })).toBe("ok");
    expect(prismaMock.fileStorage.delete).toHaveBeenCalledWith({ where: { id: "f1" } });
    expect(minioMock.removeObject).toHaveBeenCalledWith("bucket-test", "image/a.webp");
  });

  it("gambar masih dirujuk → error, tidak dihapus; objek lama tanpa baris → MinIO langsung", async () => {
    prismaMock.fileStorage.findUnique.mockResolvedValueOnce({ id: "f1" });
    dirujuk(true);
    expect(await imgDel({ name: "a.webp" })).toBe("error");
    expect(minioMock.removeObject).not.toHaveBeenCalled();

    prismaMock.fileStorage.findUnique.mockResolvedValueOnce(null);
    expect(await imgDel({ name: "lama.webp" })).toBe("ok");
    expect(minioMock.removeObject).toHaveBeenCalledWith("bucket-test", "image/lama.webp");
  });
});

describe("berkas tersimpan dilayani normal (tanpa filter Sampah)", () => {
  it("pustaka file admin (findMany) memfilter berkas aktif saja, tanpa kolom deletedAt", async () => {
    prismaMock.fileStorage.findMany.mockResolvedValueOnce([]);
    prismaMock.fileStorage.count.mockResolvedValueOnce(0);
    await fileStorageFindMany(ctx({ query: { category: "image" } }));
    expect(prismaMock.fileStorage.findMany.mock.calls[0][0].where).toEqual({ isActive: true, category: "image" });
    expect(prismaMock.fileStorage.count.mock.calls[0][0].where).toEqual({ isActive: true, category: "image" });
  });

  it("findUnique/:name melayani berkas yang barisnya ada (deletedAt tidak dicek)", async () => {
    prismaMock.fileStorage.findUnique.mockResolvedValueOnce({ name: "a.pdf", path: "document", mimeType: "application/pdf", deletedAt: new Date() });
    minioMock.getObject.mockResolvedValueOnce(stream("isi"));
    const c = ctx({ params: { name: "a.pdf" } });
    expect(String(await fileStorageFindUnique(c))).toBe("isi");
    expect(minioMock.getObject).toHaveBeenCalledWith("bucket-test", "document/a.pdf");
    expect(c.set.headers["Cache-Control"]).toContain("public");
  });

  it("findUnique/:name → 404 bila baris tidak ada, MinIO tidak dibaca", async () => {
    prismaMock.fileStorage.findUnique.mockResolvedValueOnce(null);
    const c = ctx({ params: { name: "x.pdf" } });
    expect(await fileStorageFindUnique(c)).toEqual({ status: 404, message: "File not found" });
    expect(minioMock.getObject).not.toHaveBeenCalled();
  });

  it("/api/img/:name langsung dari MinIO tanpa membaca FileStorage", async () => {
    minioMock.getObject.mockResolvedValueOnce(stream("png"));
    const res = await img({ name: "lama.webp", ROOT: process.cwd() });
    expect(res.status).toBe(200);
    expect(minioMock.getObject).toHaveBeenCalledWith("bucket-test", "image/lama.webp");
    expect(prismaMock.fileStorage.findUnique).not.toHaveBeenCalled();
  });
});

describe("purgeStoredFile (hapus permanen)", () => {
  it("baris FileStorage dihapus dulu, baru objek MinIO", async () => {
    expect(await purgeStoredFile("f1")).toBe("deleted");
    expect(prismaMock.fileStorage.delete).toHaveBeenCalledWith({ where: { id: "f1" } });
    expect(minioMock.removeObject).toHaveBeenCalledWith("bucket-test", "image/a.webp");
    expect(prismaMock.fileStorage.delete.mock.invocationCallOrder[0]).toBeLessThan(minioMock.removeObject.mock.invocationCallOrder[0]);
  });

  it("berkas masih dirujuk → tidak dihapus sama sekali", async () => {
    dirujuk(true);
    expect(await purgeStoredFile("f1")).toBe("referenced");
    expect(prismaMock.fileStorage.delete).not.toHaveBeenCalled();
    expect(minioMock.removeObject).not.toHaveBeenCalled();
  });

  it("gagal hapus objek MinIO dicatat, baris tetap terhapus", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    minioMock.removeObject.mockRejectedValueOnce(new Error("minio down"));
    expect(await purgeStoredFile("f1")).toBe("deleted");
    expect(String(spy.mock.calls[0][0])).toContain("f1");
    spy.mockRestore();
  });
});
