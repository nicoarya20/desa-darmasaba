// @vitest-environment node
// API Sampah per fitur `/api/sampah/:sumber` (prisma & MinIO di-mock): guard admin, sumber & scopeId, daftar
// (bentuk kontrak, paging di DB, retensi), pulihkan, hapus permanen berurutan aman, 404.
import { describe, it, expect, vi, beforeEach } from "vitest";

const { requireAuthMock, prismaMock, minioMock } = vi.hoisted(() => {
  const entity = () => ({
    count: vi.fn(),
    findMany: vi.fn(),
    findFirst: vi.fn(),
    deleteMany: vi.fn(),
    updateMany: vi.fn(),
    update: vi.fn(),
    aggregate: vi.fn(),
  });
  const tables = {
    fileStorage: { findUnique: vi.fn(), delete: vi.fn() },
    dokumenDesaAntiKorupsi: entity(),
    dokumenAPBDes: entity(),
    fotoProfilBumDes: entity(),
    dokumenPerencanaan: entity(),
  };
  return {
    requireAuthMock: vi.fn(),
    minioMock: { removeObject: vi.fn() },
    prismaMock: {
      ...tables,
      $queryRaw: vi.fn(),
      $queryRawUnsafe: vi.fn(),
      $transaction: vi.fn(async (fn: (tx: typeof tables) => unknown) => fn(tables)),
    },
  };
});
vi.mock("@/lib/api-auth", () => ({ requireAuth: () => requireAuthMock() }));
vi.mock("@/lib/prisma", () => ({ default: prismaMock }));
vi.mock("@/lib/minio", () => ({ default: minioMock, MINIO_BUCKET: "bucket-test" }));

import { sampahHapus, sampahList, sampahPulihkan } from "@/app/api/[[...slugs]]/_lib/sampah/handlers";
import { resetFileForeignKeysCache } from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/fileReferences";

const HARI = 24 * 60 * 60 * 1000;
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Context Elysia tiruan minimal
const ctx = (over: Record<string, unknown> = {}): any => ({ params: {}, query: {}, headers: {}, set: { headers: {} }, ...over });
const asRole = (roleId: string) =>
  requireAuthMock.mockResolvedValue({ authenticated: true, user: { id: `u-${roleId}`, roleId, isActive: true } });
const ago = (hari: number) => new Date(Date.now() - hari * HARI);
const berkas = (id: string) => ({ id, mimeType: "application/pdf", category: "document", size: 10, link: `/api/fileStorage/findUnique/${id}.pdf` });
const entities = [prismaMock.dokumenDesaAntiKorupsi, prismaMock.dokumenAPBDes, prismaMock.fotoProfilBumDes, prismaMock.dokumenPerencanaan];

beforeEach(() => {
  vi.clearAllMocks();
  resetFileForeignKeysCache();
  asRole("2");
  prismaMock.$queryRaw.mockResolvedValue([{ tabel: 'public."DokumenAPBDes"', kolom: '"fileId"' }]);
  prismaMock.$queryRawUnsafe.mockResolvedValue([{ dirujuk: false }]);
  prismaMock.fileStorage.findUnique.mockResolvedValue({ path: "document", name: "fa.pdf" });
  for (const e of entities) {
    e.count.mockResolvedValue(0);
    e.findMany.mockResolvedValue([]);
    e.deleteMany.mockResolvedValue({ count: 1 });
  }
});

describe("guard & validasi", () => {
  it("tanpa sesi → 401; role non-admin → 403; admin biasa (bukan hanya role 0/1) lolos", async () => {
    requireAuthMock.mockResolvedValueOnce({
      authenticated: false,
      response: new Response(JSON.stringify({ success: false, message: "Unauthorized" }), { status: 401 }),
    });
    const c401 = ctx({ params: { sumber: "foto-bumdes" } });
    expect(await sampahList(c401)).toEqual({ success: false, message: "Unauthorized" });
    expect(c401.set.status).toBe(401);

    asRole("5");
    for (const [handler, c] of [
      [sampahList, ctx({ params: { sumber: "foto-bumdes" } })],
      [sampahPulihkan, ctx({ params: { sumber: "foto-bumdes", id: "x" } })],
      [sampahHapus, ctx({ params: { sumber: "foto-bumdes", id: "x" } })],
    ] as const) {
      expect(await handler(c)).toEqual({ success: false, message: "Hanya admin yang boleh mengelola Sampah" });
      expect(c.set.status).toBe(403);
    }
    for (const e of entities) expect(e.findMany).not.toHaveBeenCalled();

    asRole("3");
    expect(await sampahList(ctx({ params: { sumber: "foto-bumdes" } }))).toMatchObject({ success: true });
  });

  it("sumber tidak dikenal (termasuk DAK) → 400", async () => {
    for (const sumber of ["berita", "dokumen-dak", "file"]) {
      const c = ctx({ params: { sumber, id: "x" } });
      expect(await sampahList(c)).toEqual({ success: false, message: `Sumber Sampah tidak dikenal: ${sumber}` });
      expect(c.set.status).toBe(400);
      expect(await sampahHapus(ctx({ params: { sumber, id: "x" } }))).toMatchObject({ success: false });
    }
  });

  it("dokumen-apbdes tanpa scopeId → 400; limit tidak valid → 400", async () => {
    const c = ctx({ params: { sumber: "dokumen-apbdes" }, query: { scopeId: "  " } });
    expect(await sampahList(c)).toEqual({ success: false, message: "Parameter scopeId wajib diisi" });
    expect(c.set.status).toBe(400);
    const c2 = ctx({ params: { sumber: "foto-bumdes" }, query: { limit: "500" } });
    expect(await sampahList(c2)).toMatchObject({ success: false });
    expect(c2.set.status).toBe(400);
    expect(prismaMock.dokumenAPBDes.findMany).not.toHaveBeenCalled();
  });
});

describe("GET /api/sampah/:sumber", () => {
  it("dokumen-apbdes: scoped apbdesId, belum lewat retensi, paging di DB, bentuk item kontrak", async () => {
    const dihapus = ago(2);
    prismaMock.dokumenAPBDes.count.mockResolvedValueOnce(21);
    prismaMock.dokumenAPBDes.findMany.mockResolvedValueOnce([
      { id: "a1", judul: "APBDes 2026", deletedAt: dihapus, file: berkas("fa"), folder: { nama: "Laporan" } },
      { id: "a2", judul: "Lampiran", deletedAt: dihapus, file: berkas("fb"), folder: null },
    ]);

    const res = await sampahList(ctx({ params: { sumber: "dokumen-apbdes" }, query: { scopeId: "apb1", page: "2", limit: "10" } }));

    const args = prismaMock.dokumenAPBDes.findMany.mock.calls[0][0];
    expect(args.where).toEqual({ isActive: false, deletedAt: { gt: expect.any(Date) }, apbdesId: "apb1" });
    expect(Date.now() - args.where.deletedAt.gt.getTime()).toBeGreaterThanOrEqual(30 * HARI - 1000);
    expect(args).toMatchObject({ skip: 10, take: 10, orderBy: [{ deletedAt: "desc" }, { id: "asc" }] });
    expect(prismaMock.dokumenAPBDes.count.mock.calls[0][0].where).toEqual(args.where);
    expect(res).toEqual({
      success: true,
      data: {
        items: [
          {
            id: "a1",
            judul: "APBDes 2026",
            mimeType: "application/pdf",
            kategori: "document",
            ukuran: 10,
            pratinjauUrl: "/api/fileStorage/findUnique/fa.pdf",
            dihapusPada: dihapus.toISOString(),
            sisaHari: 28,
            folderNama: "Laporan",
          },
          expect.objectContaining({ id: "a2", folderNama: null }),
        ],
        total: 21,
        page: 2,
        limit: 10,
        retensiHari: 30,
      },
    });
  });

  it("foto-bumdes & dokumen-perencanaan mengabaikan scopeId; judul foto = keterangan atau nama berkas", async () => {
    prismaMock.fotoProfilBumDes.count.mockResolvedValueOnce(2);
    prismaMock.fotoProfilBumDes.findMany.mockResolvedValueOnce([
      { id: "f1", keterangan: "  ", deletedAt: ago(1), image: { ...berkas("g1"), category: "image", mimeType: "image/webp", link: "/api/img/g1.webp", realName: "pasar.webp" } },
      { id: "f2", keterangan: "Pasar desa", deletedAt: ago(1), image: { ...berkas("g2"), realName: "x.webp" } },
    ]);
    const foto = await sampahList(ctx({ params: { sumber: "foto-bumdes" }, query: { scopeId: "abaikan" } }));
    expect(prismaMock.fotoProfilBumDes.findMany.mock.calls[0][0].where).toEqual({ isActive: false, deletedAt: { gt: expect.any(Date) } });
    expect(foto).toMatchObject({
      success: true,
      data: {
        items: [
          { id: "f1", judul: "pasar.webp", kategori: "image", pratinjauUrl: "/api/img/g1.webp", folderNama: null },
          { id: "f2", judul: "Pasar desa" },
        ],
        total: 2,
        page: 1,
        limit: 20,
      },
    });

    await sampahList(ctx({ params: { sumber: "dokumen-perencanaan" }, query: { scopeId: "abaikan" } }));
    const where = prismaMock.dokumenPerencanaan.findMany.mock.calls[0][0].where;
    expect(where).toEqual({ isActive: false, deletedAt: { gt: expect.any(Date) } });
    expect(prismaMock.dokumenPerencanaan.findMany.mock.calls[0][0].select.folder).toBeUndefined();
  });
});

describe("POST /api/sampah/:sumber/:id/pulihkan", () => {
  it("dokumen-perencanaan aktif lagi; tidak di Sampah → 404", async () => {
    prismaMock.dokumenPerencanaan.updateMany.mockResolvedValueOnce({ count: 1 });
    expect(await sampahPulihkan(ctx({ params: { sumber: "dokumen-perencanaan", id: "p1" } }))).toEqual({ success: true, message: "Dokumen dipulihkan" });
    expect(prismaMock.dokumenPerencanaan.updateMany).toHaveBeenCalledWith({
      where: { id: "p1", isActive: false, deletedAt: { not: null } },
      data: { isActive: true, deletedAt: null },
    });

    prismaMock.dokumenPerencanaan.updateMany.mockResolvedValueOnce({ count: 0 });
    const c = ctx({ params: { sumber: "dokumen-perencanaan", id: "p9" } });
    expect(await sampahPulihkan(c)).toEqual({ success: false, message: "Dokumen tidak ada di Sampah" });
    expect(c.set.status).toBe(404);
  });

  it("dokumen-apbdes: folder asal sudah terhapus → kembali ke Umum (folderId null) di akhir folder", async () => {
    prismaMock.dokumenAPBDes.findFirst.mockResolvedValueOnce({
      id: "a1", apbdesId: "apb1", fileId: "fa", folderId: "fold1", folder: { isActive: false }, file: { isActive: true },
    });
    prismaMock.dokumenAPBDes.findMany.mockResolvedValueOnce([{ folderId: null, fileId: "fz", urutan: 4 }]);
    expect(await sampahPulihkan(ctx({ params: { sumber: "dokumen-apbdes", id: "a1" } }))).toEqual({ success: true, message: "Dokumen dipulihkan" });
    expect(prismaMock.dokumenAPBDes.update).toHaveBeenCalledWith({
      where: { id: "a1" },
      data: { isActive: true, deletedAt: null, folderId: null, urutan: 5 },
    });
  });

  it("foto-bumdes: galeri penuh → 409", async () => {
    prismaMock.fotoProfilBumDes.findFirst.mockResolvedValueOnce({ image: { isActive: true } });
    prismaMock.fotoProfilBumDes.count.mockResolvedValueOnce(50);
    prismaMock.fotoProfilBumDes.aggregate.mockResolvedValueOnce({ _max: { urutan: 49 } });
    const c = ctx({ params: { sumber: "foto-bumdes", id: "f1" } });
    expect(await sampahPulihkan(c)).toMatchObject({ success: false });
    expect(c.set.status).toBe(409);
    expect(prismaMock.fotoProfilBumDes.update).not.toHaveBeenCalled();
  });
});

describe("DELETE /api/sampah/:sumber/:id", () => {
  it("hapus permanen urutan aman: baris entitas → FileStorage → objek MinIO", async () => {
    prismaMock.dokumenAPBDes.findFirst.mockResolvedValueOnce({ file: { id: "fa" } });
    expect(await sampahHapus(ctx({ params: { sumber: "dokumen-apbdes", id: "a1" } }))).toEqual({ success: true, message: "Item dihapus permanen" });
    expect(prismaMock.dokumenAPBDes.deleteMany).toHaveBeenCalledWith({ where: { id: "a1", isActive: false, deletedAt: { not: null } } });
    expect(prismaMock.fileStorage.delete).toHaveBeenCalledWith({ where: { id: "fa" } });
    expect(minioMock.removeObject).toHaveBeenCalledWith("bucket-test", "document/fa.pdf");
    expect(prismaMock.fileStorage.delete.mock.invocationCallOrder[0]).toBeGreaterThan(prismaMock.dokumenAPBDes.deleteMany.mock.invocationCallOrder[0]);
    expect(minioMock.removeObject.mock.invocationCallOrder[0]).toBeGreaterThan(prismaMock.fileStorage.delete.mock.invocationCallOrder[0]);
  });

  it("berkas masih dirujuk data lain → baris entitas terhapus, berkas dilewati", async () => {
    prismaMock.fotoProfilBumDes.findFirst.mockResolvedValueOnce({ image: { id: "g1" } });
    prismaMock.$queryRawUnsafe.mockResolvedValueOnce([{ dirujuk: true }]);
    expect(await sampahHapus(ctx({ params: { sumber: "foto-bumdes", id: "f1" } }))).toMatchObject({ success: true });
    expect(prismaMock.fotoProfilBumDes.deleteMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.fileStorage.delete).not.toHaveBeenCalled();
    expect(minioMock.removeObject).not.toHaveBeenCalled();
  });

  it("item tidak ada / tidak di Sampah → 404 tanpa menghapus apa pun", async () => {
    prismaMock.dokumenPerencanaan.findFirst.mockResolvedValueOnce(null);
    const c = ctx({ params: { sumber: "dokumen-perencanaan", id: "aktif" } });
    expect(await sampahHapus(c)).toEqual({ success: false, message: "Item tidak ada di Sampah" });
    expect(c.set.status).toBe(404);
    expect(prismaMock.dokumenPerencanaan.deleteMany).not.toHaveBeenCalled();
    expect(prismaMock.fileStorage.delete).not.toHaveBeenCalled();
  });
});
