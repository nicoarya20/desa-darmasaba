// @vitest-environment node
// Dokumen + folder APBDes di API (prisma di-mock): sinkron ter-scope apbdesId, hapus folder memindah
// dokumen ke "Umum", fileId lama dikosongkan saat daftar dokumen dikirim, validasi 400, bentuk respons.
import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => {
  const m = {
    aPBDes: { findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
    aPBDesItem: { create: vi.fn(), update: vi.fn(), createMany: vi.fn(), updateMany: vi.fn(), findMany: vi.fn() },
    folderDokumenAPBDes: { findMany: vi.fn(), create: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
    dokumenAPBDes: { findMany: vi.fn(), update: vi.fn(), updateMany: vi.fn(), createMany: vi.fn() },
    fileStorage: { count: vi.fn(), delete: vi.fn(), deleteMany: vi.fn() },
    $transaction: vi.fn(),
  };
  m.$transaction.mockImplementation(async (cb: (tx: typeof m) => unknown) => cb(m));
  return m;
});

vi.mock("@/lib/prisma", () => ({ default: prismaMock }));

import { applyApbdesIsiSync } from "@/app/api/[[...slugs]]/_lib/landing_page/apbdes/dokumen-sync";
import apbdesUpdate from "@/app/api/[[...slugs]]/_lib/landing_page/apbdes/updt";
import apbdesCreate from "@/app/api/[[...slugs]]/_lib/landing_page/apbdes/create";
import apbdesFindUnique from "@/app/api/[[...slugs]]/_lib/landing_page/apbdes/findUnique";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- konteks Elysia tiruan minimal
const ctx = (body: any, id = "a1") => ({ params: { id }, body, set: {} as { status?: number } }) as any;
const item = { kode: "4", uraian: "Pendapatan", anggaran: 1000, level: 1, tipe: null };
const file = { id: "f1", link: "/api/fileStorage/findUnique/f1", realName: "perdes.pdf", mimeType: "application/pdf", size: 10 };
const tanggal = new Date("2026-01-02T03:04:05.000Z");

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.aPBDes.findFirst.mockResolvedValue(null);
  prismaMock.aPBDesItem.findMany.mockResolvedValue([]);
  prismaMock.fileStorage.count.mockResolvedValue(1);
  prismaMock.folderDokumenAPBDes.create.mockResolvedValue({ id: "fo-baru" });
});

describe("applyApbdesIsiSync", () => {
  it("hapus folder: dokumennya dipindah ke Umum (ter-scope apbdesId) lalu folder di-soft-delete", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- tx tiruan minimal
    await applyApbdesIsiSync(prismaMock as any, "a1", { folders: { create: [], update: [], remove: ["fo1"] }, dokumen: null });

    expect(prismaMock.dokumenAPBDes.updateMany).toHaveBeenCalledWith({
      where: { apbdesId: "a1", folderId: { in: ["fo1"] } },
      data: { folderId: null },
    });
    const folderArg = prismaMock.folderDokumenAPBDes.updateMany.mock.calls[0][0];
    expect(folderArg.where).toEqual({ apbdesId: "a1", id: { in: ["fo1"] } });
    expect(folderArg.data).toMatchObject({ isActive: false });
    expect(folderArg.data.deletedAt).toBeInstanceOf(Date);
    // Dokumen tidak dikirim → fileId lama tidak disentuh; FileStorage tidak pernah dihapus.
    expect(prismaMock.aPBDes.update).not.toHaveBeenCalled();
    expect(prismaMock.fileStorage.delete).not.toHaveBeenCalled();
  });

  it("dokumen baru dibuat dengan apbdesId pemilik, folder tempKey diganti id baru, fileId lama dikosongkan", async () => {
    await applyApbdesIsiSync(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- tx tiruan minimal
      prismaMock as any,
      "a1",
      {
        folders: { create: [{ tempKey: "t1", nama: "Semester I", urutan: 0 }], update: [], remove: [] },
        dokumen: {
          create: [
            { fileId: "f1", judul: "Perdes", urutan: 0, folder: { tempKey: "t1" } },
            { fileId: "f2", judul: "Lampiran", urutan: 0, folder: null },
          ],
          update: [],
          remove: ["d-lama"],
        },
      },
    );

    expect(prismaMock.folderDokumenAPBDes.create).toHaveBeenCalledWith({
      data: { apbdesId: "a1", nama: "Semester I", urutan: 0 },
      select: { id: true },
    });
    expect(prismaMock.dokumenAPBDes.createMany).toHaveBeenCalledWith({
      data: [
        { apbdesId: "a1", fileId: "f1", judul: "Perdes", urutan: 0, folderId: "fo-baru" },
        { apbdesId: "a1", fileId: "f2", judul: "Lampiran", urutan: 0, folderId: null },
      ],
    });
    expect(prismaMock.dokumenAPBDes.updateMany.mock.calls[0][0].where).toEqual({ apbdesId: "a1", id: { in: ["d-lama"] } });
    expect(prismaMock.aPBDes.update).toHaveBeenCalledWith({ where: { id: "a1" }, data: { fileId: null } });
  });
});

describe("PUT /apbdes/:id dengan folders + dokumen", () => {
  const seedTersimpan = () => {
    prismaMock.aPBDes.findUnique
      .mockResolvedValueOnce({ id: "a1", tahun: 2025, items: [] })
      .mockResolvedValueOnce({ id: "a1", tahun: 2025, items: [], folders: [], dokumen: [] });
    prismaMock.folderDokumenAPBDes.findMany.mockResolvedValue([{ id: "fo1", nama: "Perdes", urutan: 0 }]);
    prismaMock.dokumenAPBDes.findMany.mockResolvedValue([
      { id: "d1", fileId: "f1", judul: "Perdes 2025", urutan: 0, folderId: "fo1" },
    ]);
  };

  it("folder tidak dikirim lagi → dokumennya pindah ke Umum, isi dibaca hanya milik APBDes ini", async () => {
    seedTersimpan();
    const res = await apbdesUpdate(
      ctx({ tahun: 2025, items: [item], folders: [], dokumen: [{ id: "d1", fileId: "f1", judul: "Perdes 2025", urutan: 0, folder: null }] }),
    );

    expect(res.success).toBe(true);
    expect(prismaMock.folderDokumenAPBDes.findMany.mock.calls[0][0].where).toEqual({ apbdesId: "a1", isActive: true });
    expect(prismaMock.dokumenAPBDes.findMany.mock.calls[0][0].where).toEqual({ apbdesId: "a1", isActive: true });
    expect(prismaMock.dokumenAPBDes.updateMany).toHaveBeenCalledWith({
      where: { apbdesId: "a1", folderId: { in: ["fo1"] } },
      data: { folderId: null },
    });
    expect(prismaMock.dokumenAPBDes.update).toHaveBeenCalledWith({
      where: { id: "d1" },
      data: { judul: "Perdes 2025", urutan: 0, folderId: null },
    });
  });

  it("folder milik APBDes lain ditolak 400 tanpa menulis apa pun", async () => {
    seedTersimpan();
    const c = ctx({ tahun: 2025, items: [item], dokumen: [{ fileId: "f9", judul: "Asing", urutan: 0, folder: { id: "fo-lain" } }] });
    const res = await apbdesUpdate(c);

    expect(res).toEqual({ success: false, message: "Dokumen #1: folder tidak ditemukan pada program ini" });
    expect(c.set.status).toBe(400);
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("tanpa folders/dokumen (klien lama) → isi dokumen tidak dimuat maupun diubah, fileId tetap ditulis", async () => {
    seedTersimpan();
    await apbdesUpdate(ctx({ tahun: 2025, items: [item], fileId: "f-lama" }));

    expect(prismaMock.dokumenAPBDes.findMany).not.toHaveBeenCalled();
    expect(prismaMock.dokumenAPBDes.createMany).not.toHaveBeenCalled();
    expect(prismaMock.aPBDes.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.aPBDes.update.mock.calls[0][0].data.fileId).toBe("f-lama");
  });
});

describe("POST /apbdes/create dengan dokumen", () => {
  it("dokumen dibuat untuk APBDes yang baru dibuat (bukan id lain) di dalam transaksi", async () => {
    prismaMock.aPBDes.create.mockResolvedValue({ id: "baru1", tahun: 2026 });
    prismaMock.aPBDesItem.create.mockResolvedValue({ id: "i1", kode: "4" });
    prismaMock.aPBDes.findUnique.mockResolvedValue({ id: "baru1", tahun: 2026, items: [], folders: [], dokumen: [] });

    const res = await apbdesCreate(
      ctx({ tahun: 2026, items: [item], folders: [], dokumen: [{ fileId: "f1", judul: "APBDes 2026", urutan: 0 }] }),
    );

    expect(res.success).toBe(true);
    expect(prismaMock.dokumenAPBDes.findMany).not.toHaveBeenCalled(); // APBDes baru belum punya isi
    expect(prismaMock.dokumenAPBDes.createMany).toHaveBeenCalledWith({
      data: [{ apbdesId: "baru1", fileId: "f1", judul: "APBDes 2026", urutan: 0, folderId: null }],
    });
  });

  it("berkas dokumen tidak aktif → 400 dan APBDes tidak dibuat", async () => {
    prismaMock.fileStorage.count.mockResolvedValue(0);
    const c = ctx({ tahun: 2026, items: [item], dokumen: [{ fileId: "hilang", judul: "X", urutan: 0 }] });
    const res = await apbdesCreate(c);

    expect(res).toEqual({ success: false, message: "File dokumen tidak ditemukan atau sudah dihapus" });
    expect(c.set.status).toBe(400);
    expect(prismaMock.aPBDes.create).not.toHaveBeenCalled();
  });
});

describe("GET /apbdes/:id", () => {
  it("mengelompokkan dokumen aktif per folder + dokumenUmum (createdAt ISO)", async () => {
    prismaMock.aPBDes.findUnique.mockResolvedValue({
      id: "a1",
      isActive: true,
      items: [],
      folders: [{ id: "fo1", nama: "Semester I", urutan: 0 }],
      dokumen: [
        { id: "d1", judul: "Laporan", urutan: 0, fileId: "f1", folderId: "fo1", createdAt: tanggal, file },
        { id: "d2", judul: "Perdes", urutan: 0, fileId: "f1", folderId: null, createdAt: tanggal, file },
      ],
    });
    const request = new Request("http://localhost/api/landingpage/apbdes/a1");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- konteks Elysia tiruan minimal
    const res = (await apbdesFindUnique({ request, set: {} } as any)) as any;

    expect(prismaMock.aPBDes.findUnique.mock.calls[0][0].include.dokumen.where).toEqual({ isActive: true });
    expect(res.data.folders).toEqual([
      { id: "fo1", nama: "Semester I", urutan: 0, dokumen: [{ id: "d1", judul: "Laporan", urutan: 0, fileId: "f1", createdAt: tanggal.toISOString(), file }] },
    ]);
    expect(res.data.dokumenUmum.map((d: { id: string }) => d.id)).toEqual(["d2"]);
    expect(res.data).not.toHaveProperty("dokumen");
  });
});
