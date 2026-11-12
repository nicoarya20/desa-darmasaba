// @vitest-environment node
// Hapus berkas = pindah ke Sampah (soft delete, MinIO tidak disentuh), berkas yang masih dirujuk tidak dipindah,
// berkas di Sampah tidak tampil/terlayani untuk publik, hapus permanen berurutan baris → MinIO.
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

import removeStoredFile, { moveFileToSampah } from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeStoredFile";
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
  prismaMock.fileStorage.updateMany.mockResolvedValue({ count: 1 });
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

describe("removeStoredFile = pindah ke Sampah", () => {
  it("soft delete dengan deletedFrom dari registry pemilik; baris & MinIO tidak dihapus", async () => {
    await removeStoredFile({ id: "f1" }, "Berita");
    expect(prismaMock.fileStorage.updateMany).toHaveBeenCalledWith({
      where: { id: "f1", deletedAt: null },
      data: { deletedAt: expect.any(Date), isActive: false, deletedFrom: "desa.berita" },
    });
    expect(prismaMock.fileStorage.delete).not.toHaveBeenCalled();
    expect(minioMock.removeObject).not.toHaveBeenCalled();
  });

  it("pemilik tak dikenal → deletedFrom null (kelompok Lainnya)", async () => {
    await removeStoredFile({ id: "f1" }, "Entah");
    expect(prismaMock.fileStorage.updateMany.mock.calls[0][0].data.deletedFrom).toBeNull();
  });

  it("berkas masih dirujuk data lain → tidak masuk Sampah", async () => {
    dirujuk(true);
    expect(await moveFileToSampah("f1", "desa.berita")).toBe("referenced");
    await removeStoredFile({ id: "f1" }, "Berita");
    expect(prismaMock.fileStorage.updateMany).not.toHaveBeenCalled();
  });

  it("gagal dicatat dengan konteks pemilik + id tanpa melempar", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    prismaMock.fileStorage.updateMany.mockRejectedValueOnce(new Error("db down"));
    await expect(removeStoredFile({ id: "f9" }, "Posyandu")).resolves.toBeUndefined();
    expect(String(spy.mock.calls[0][0])).toContain("f9");
    expect(String(spy.mock.calls[0][0])).toContain("Posyandu");
    spy.mockRestore();
  });

  it("berkas sudah di Sampah / tidak ada → missing", async () => {
    prismaMock.fileStorage.updateMany.mockResolvedValueOnce({ count: 0 });
    expect(await moveFileToSampah("f1", null)).toBe("missing");
  });
});

describe("DELETE /api/fileStorage/delete/:id", () => {
  it("memindah ke Sampah dengan `from` yang dikenal", async () => {
    prismaMock.fileStorage.findUnique.mockResolvedValueOnce({ id: "f1", deletedAt: null });
    const res = await fileStorageDelete(ctx({ params: { id: "f1" }, query: { from: "ekonomi.bumdes" } }));
    expect(res).toEqual({ message: "File dipindahkan ke Sampah", deletedId: "f1" });
    expect(prismaMock.fileStorage.updateMany.mock.calls[0][0].data.deletedFrom).toBe("ekonomi.bumdes");
    expect(minioMock.removeObject).not.toHaveBeenCalled();
  });

  it("`from` tak dikenal diabaikan (null); berkas yang masih dipakai → 409", async () => {
    prismaMock.fileStorage.findUnique.mockResolvedValue({ id: "f1", deletedAt: null });
    await fileStorageDelete(ctx({ params: { id: "f1" }, query: { from: "bukan.menu" } }));
    expect(prismaMock.fileStorage.updateMany.mock.calls[0][0].data.deletedFrom).toBeNull();

    dirujuk(true);
    const c = ctx({ params: { id: "f1" } });
    expect(await fileStorageDelete(c)).toMatchObject({ success: false });
    expect(c.set.status).toBe(409);
  });

  it("berkas yang sudah di Sampah diperlakukan tidak ada", async () => {
    prismaMock.fileStorage.findUnique.mockResolvedValueOnce({ id: "f1", deletedAt: new Date() });
    expect(await fileStorageDelete(ctx({ params: { id: "f1" } }))).toEqual({ status: 404, body: "File tidak ditemukan di database" });
    expect(prismaMock.fileStorage.updateMany).not.toHaveBeenCalled();
  });
});

describe("berkas di Sampah tidak terlayani publik", () => {
  it("pustaka file admin (findMany) hanya berkas aktif yang belum dihapus", async () => {
    prismaMock.fileStorage.findMany.mockResolvedValueOnce([]);
    prismaMock.fileStorage.count.mockResolvedValueOnce(0);
    await fileStorageFindMany(ctx({ query: { category: "image" } }));
    expect(prismaMock.fileStorage.findMany.mock.calls[0][0].where).toEqual({ isActive: true, deletedAt: null, category: "image" });
    expect(prismaMock.fileStorage.count.mock.calls[0][0].where).toMatchObject({ deletedAt: null });
  });

  it("findUnique/:name → 404 untuk berkas di Sampah tanpa membaca MinIO", async () => {
    prismaMock.fileStorage.findUnique.mockResolvedValueOnce({ name: "a.pdf", path: "document", mimeType: "application/pdf", deletedAt: new Date() });
    const c = ctx({ params: { name: "a.pdf" } });
    expect(await fileStorageFindUnique(c)).toEqual({ status: 404, message: "File not found" });
    expect(c.set.status).toBe("Not Found");
    expect(minioMock.getObject).not.toHaveBeenCalled();
  });

  it("findUnique/:name tetap melayani berkas aktif", async () => {
    prismaMock.fileStorage.findUnique.mockResolvedValueOnce({ name: "a.pdf", path: "document", mimeType: "application/pdf", deletedAt: null });
    minioMock.getObject.mockResolvedValueOnce(stream("isi"));
    const c = ctx({ params: { name: "a.pdf" } });
    expect(String(await fileStorageFindUnique(c))).toBe("isi");
    expect(minioMock.getObject).toHaveBeenCalledWith("bucket-test", "document/a.pdf");
  });

  it("/api/img/:name → 404 untuk gambar di Sampah; gambar aktif / tanpa baris tetap dilayani", async () => {
    prismaMock.fileStorage.findUnique.mockResolvedValueOnce({ deletedAt: new Date() });
    const trashed = await img({ name: "x.webp", ROOT: process.cwd() });
    expect(trashed.status).toBe(404);
    expect(minioMock.getObject).not.toHaveBeenCalled();

    prismaMock.fileStorage.findUnique.mockResolvedValueOnce(null);
    minioMock.getObject.mockResolvedValueOnce(stream("png"));
    const aktif = await img({ name: "lama.webp", ROOT: process.cwd() });
    expect(aktif.status).toBe(200);
    expect(minioMock.getObject).toHaveBeenCalledWith("bucket-test", "image/lama.webp");
  });
});

describe("purgeStoredFile (hapus permanen)", () => {
  it("baris FileStorage dihapus dulu, baru objek MinIO", async () => {
    prismaMock.fileStorage.findUnique.mockResolvedValueOnce({ path: "image", name: "a.webp" });
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
    prismaMock.fileStorage.findUnique.mockResolvedValueOnce({ path: "image", name: "a.webp" });
    minioMock.removeObject.mockRejectedValueOnce(new Error("minio down"));
    expect(await purgeStoredFile("f1")).toBe("deleted");
    expect(String(spy.mock.calls[0][0])).toContain("f1");
    spy.mockRestore();
  });
});
