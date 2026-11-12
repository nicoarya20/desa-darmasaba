// @vitest-environment node
// API Pengaturan → Sampah (prisma & MinIO di-mock): guard role 0/1, daftar (counts per kelompok lengkap, paging,
// urutan lintas sumber), pulihkan berkas & dokumen entitas, hapus permanen berurutan, kosongkan, pratinjau.
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
    fileStorage: { groupBy: vi.fn(), findMany: vi.fn(), findFirst: vi.fn(), findUnique: vi.fn(), updateMany: vi.fn(), delete: vi.fn() },
    dokumenDesaAntiKorupsi: entity(),
    dokumenAPBDes: entity(),
    fotoProfilBumDes: entity(),
    dokumenPerencanaan: entity(),
  };
  return {
    requireAuthMock: vi.fn(),
    minioMock: { removeObject: vi.fn(), getObject: vi.fn() },
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

import {
  sampahHapus,
  sampahKosongkan,
  sampahList,
  sampahPratinjau,
  sampahPulihkan,
} from "@/app/api/[[...slugs]]/_lib/pengaturan/sampah/handlers";
import { resetFileForeignKeysCache } from "@/app/api/[[...slugs]]/_lib/fileStorage/_lib/fileReferences";
import { sampahKelompokList } from "@/lib/sampah/sampah-kelompok";

const HARI = 24 * 60 * 60 * 1000;
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Context Elysia tiruan minimal
const ctx = (over: Record<string, unknown> = {}): any => ({ params: {}, query: {}, headers: {}, set: { headers: {} }, ...over });
const asRole = (roleId: string) =>
  requireAuthMock.mockResolvedValue({ authenticated: true, user: { id: `u-${roleId}`, roleId, isActive: true } });
const ago = (hari: number) => new Date(Date.now() - hari * HARI);
const berkas = (id: string) => ({ id, path: "document", name: `${id}.pdf`, mimeType: "application/pdf", category: "document", size: 10 });
const entities = [prismaMock.dokumenDesaAntiKorupsi, prismaMock.dokumenAPBDes, prismaMock.fotoProfilBumDes, prismaMock.dokumenPerencanaan];

beforeEach(() => {
  vi.clearAllMocks();
  resetFileForeignKeysCache();
  asRole("1");
  prismaMock.$queryRaw.mockResolvedValue([{ tabel: 'public."Berita"', kolom: '"imageId"' }]);
  prismaMock.$queryRawUnsafe.mockResolvedValue([{ dirujuk: false }]);
  prismaMock.fileStorage.groupBy.mockResolvedValue([]);
  prismaMock.fileStorage.findMany.mockResolvedValue([]);
  for (const e of entities) {
    e.count.mockResolvedValue(0);
    e.findMany.mockResolvedValue([]);
    e.deleteMany.mockResolvedValue({ count: 1 });
  }
});

describe("guard", () => {
  it("tanpa sesi → 401, role admin biasa → 403, tanpa menyentuh DB", async () => {
    requireAuthMock.mockResolvedValueOnce({
      authenticated: false,
      response: new Response(JSON.stringify({ success: false, message: "Unauthorized" }), { status: 401 }),
    });
    const c401 = ctx();
    expect(await sampahList(c401)).toEqual({ success: false, message: "Unauthorized" });
    expect(c401.set.status).toBe(401);

    asRole("2");
    for (const [handler, c] of [
      [sampahList, ctx()],
      [sampahPulihkan, ctx({ params: { id: "file:f1" } })],
      [sampahHapus, ctx({ params: { id: "file:f1" } })],
      [sampahKosongkan, ctx({ query: { kelompok: "semua" } })],
      [sampahPratinjau, ctx({ params: { id: "file:f1" } })],
    ] as const) {
      expect(await handler(c)).toMatchObject({ success: false });
      expect(c.set.status).toBe(403);
    }
    expect(prismaMock.fileStorage.groupBy).not.toHaveBeenCalled();
    expect(prismaMock.fileStorage.updateMany).not.toHaveBeenCalled();
  });
});

describe("GET daftar", () => {
  it("counts lengkap untuk semua kelompok (0 bila kosong) + jumlah per kelompok dari DB", async () => {
    prismaMock.fileStorage.groupBy.mockResolvedValueOnce([
      { deletedFrom: "desa.berita", _count: { _all: 3 } },
      { deletedFrom: "desa.potensi", _count: { _all: 2 } },
      { deletedFrom: null, _count: { _all: 1 } },
      { deletedFrom: "menu.lama", _count: { _all: 1 } },
    ]);
    prismaMock.dokumenDesaAntiKorupsi.count.mockResolvedValueOnce(4);
    prismaMock.fotoProfilBumDes.count.mockResolvedValueOnce(1);

    const res = (await sampahList(ctx())) as { success: true; data: { counts: Record<string, number>; kelompok: unknown[]; total: number } };
    const kosong = Object.fromEntries(sampahKelompokList().map((k) => [k.id, 0]));
    expect(res.data.counts).toEqual({ ...kosong, semua: 12, Desa: 5, lainnya: 2, "Landing Page": 4, Ekonomi: 1 });
    expect(res.data.kelompok).toEqual(sampahKelompokList());
    expect(res.data.total).toBe(12);
  });

  it("menggabung sumber terbaru dihapus dulu, mengiris page & limit, dan total sesuai kelompok", async () => {
    prismaMock.fileStorage.groupBy.mockResolvedValue([{ deletedFrom: "desa.berita", _count: { _all: 2 } }]);
    prismaMock.dokumenPerencanaan.count.mockResolvedValue(1);
    prismaMock.fileStorage.findMany.mockResolvedValue([
      { id: "f1", realName: "a.webp", mimeType: "image/webp", category: "image", size: 5, deletedAt: ago(1), deletedFrom: "desa.berita" },
      { id: "f2", realName: "b.webp", mimeType: "image/webp", category: "image", size: 5, deletedAt: ago(3), deletedFrom: "desa.berita" },
    ]);
    prismaMock.dokumenPerencanaan.findMany.mockResolvedValue([{ id: "d1", judul: "RKP 2026", deletedAt: ago(2), file: berkas("fd") }]);

    const page1 = (await sampahList(ctx({ query: { kelompok: "Desa", page: "1", limit: "2" } }))) as {
      data: { items: { id: string; jenis: string; sisaHari: number }[]; total: number; page: number; limit: number };
    };
    expect(page1.data.items.map((i) => i.id)).toEqual(["file:f1", "perencanaan:d1"]);
    expect(page1.data.items[1]).toMatchObject({ jenis: "dokumen", sisaHari: 28 });
    expect(page1.data).toMatchObject({ total: 3, page: 1, limit: 2 });
    // Tiap sumber cukup mengambil page × limit baris teratas dari DB.
    expect(prismaMock.fileStorage.findMany.mock.calls[0][0]).toMatchObject({ take: 2, orderBy: [{ deletedAt: "desc" }, { id: "asc" }] });
    expect(prismaMock.fileStorage.findMany.mock.calls[0][0].where.AND).toEqual([{ deletedFrom: { in: expect.arrayContaining(["desa.berita", "desa.kegiatan-desa"]) } }]);
    // Sumber di luar kelompok tidak di-query.
    expect(prismaMock.dokumenDesaAntiKorupsi.findMany).not.toHaveBeenCalled();

    const page2 = (await sampahList(ctx({ query: { kelompok: "Desa", page: "2", limit: "2" } }))) as { data: { items: { id: string }[] } };
    expect(page2.data.items.map((i) => i.id)).toEqual(["file:f2"]);
  });

  it("kelompok Lainnya = deletedFrom kosong atau menu tak dikenal; berkas milik entitas terhapus tidak dobel", async () => {
    await sampahList(ctx({ query: { kelompok: "lainnya" } }));
    const where = prismaMock.fileStorage.findMany.mock.calls[0][0].where;
    expect(where.AND).toEqual([{ OR: [{ deletedFrom: null }, { deletedFrom: { notIn: expect.arrayContaining(["desa.berita"]) } }] }]);
    expect(where.DokumenDesaAntiKorupsi).toEqual({ none: { deletedAt: { not: null } } });
    expect(where.FotoProfilBumDes).toEqual({ none: { deletedAt: { not: null } } });
  });

  it("query tidak valid → 400 { success:false, message }", async () => {
    const c = ctx({ query: { kelompok: "Tidak Ada" } });
    expect(await sampahList(c)).toEqual({ success: false, message: "Kelompok tidak dikenal: Tidak Ada" });
    expect(c.set.status).toBe(400);
  });
});

describe("pulihkan", () => {
  it("berkas: aktif lagi di pustaka, deletedFrom dikosongkan", async () => {
    prismaMock.fileStorage.updateMany.mockResolvedValueOnce({ count: 1 });
    expect(await sampahPulihkan(ctx({ params: { id: "file:f1" } }))).toEqual({ success: true, message: "Berkas dipulihkan ke pustaka file" });
    expect(prismaMock.fileStorage.updateMany).toHaveBeenCalledWith({
      where: { id: "f1", deletedAt: { not: null } },
      data: { deletedAt: null, isActive: true, deletedFrom: null },
    });
  });

  it("dokumen DAK: aturan panel DAK (folder asal masih aktif, di akhir folder)", async () => {
    prismaMock.dokumenDesaAntiKorupsi.findFirst.mockResolvedValueOnce({
      id: "d1", desaAntiKorupsiId: "p1", fileId: "f1", folderId: "fo1", folder: { isActive: true }, file: { isActive: true },
    });
    prismaMock.dokumenDesaAntiKorupsi.findMany.mockResolvedValueOnce([{ folderId: "fo1", fileId: "f9", urutan: 4 }]);
    expect(await sampahPulihkan(ctx({ params: { id: "dak:d1" } }))).toEqual({ success: true, message: "Dokumen dipulihkan" });
    expect(prismaMock.dokumenDesaAntiKorupsi.update).toHaveBeenCalledWith({
      where: { id: "d1" },
      data: { isActive: true, deletedAt: null, folderId: "fo1", urutan: 5 },
    });
  });

  it("foto BUMDes: kembali di posisi terakhir; dokumen perencanaan: aktif lagi", async () => {
    prismaMock.fotoProfilBumDes.findFirst.mockResolvedValueOnce({ image: { isActive: true } });
    prismaMock.fotoProfilBumDes.count.mockResolvedValueOnce(2);
    prismaMock.fotoProfilBumDes.aggregate.mockResolvedValueOnce({ _max: { urutan: 7 } });
    expect(await sampahPulihkan(ctx({ params: { id: "bumdes-foto:g1" } }))).toMatchObject({ success: true });
    expect(prismaMock.fotoProfilBumDes.update).toHaveBeenCalledWith({ where: { id: "g1" }, data: { isActive: true, deletedAt: null, urutan: 8 } });

    prismaMock.dokumenPerencanaan.updateMany.mockResolvedValueOnce({ count: 1 });
    expect(await sampahPulihkan(ctx({ params: { id: "perencanaan:r1" } }))).toMatchObject({ success: true });
  });

  it("ID rusak / sumber tak dikenal / tidak di Sampah → 404", async () => {
    for (const id of ["tanpa-prefix", "x:1"]) {
      const c = ctx({ params: { id } });
      expect(await sampahPulihkan(c)).toMatchObject({ success: false });
      expect(c.set.status).toBe(404);
    }
    prismaMock.fileStorage.updateMany.mockResolvedValueOnce({ count: 0 });
    const c = ctx({ params: { id: "file:f1" } });
    expect(await sampahPulihkan(c)).toEqual({ success: false, message: "Berkas tidak ada di Sampah" });
    expect(c.set.status).toBe(404);
  });
});

describe("hapus permanen", () => {
  it("berkas: baris FileStorage dulu lalu objek MinIO", async () => {
    prismaMock.fileStorage.findFirst.mockResolvedValueOnce({ id: "f1" });
    prismaMock.fileStorage.findUnique.mockResolvedValueOnce({ path: "image", name: "a.webp" });
    expect(await sampahHapus(ctx({ params: { id: "file:f1" } }))).toEqual({ success: true, message: "Berkas dihapus permanen" });
    expect(prismaMock.fileStorage.delete.mock.invocationCallOrder[0]).toBeLessThan(minioMock.removeObject.mock.invocationCallOrder[0]);
  });

  it("dokumen entitas: baris entitas → baris FileStorage → MinIO (pola aman bug Maskot)", async () => {
    prismaMock.dokumenAPBDes.findFirst.mockResolvedValueOnce({ file: berkas("fa") });
    prismaMock.fileStorage.findUnique.mockResolvedValueOnce({ path: "document", name: "fa.pdf" });
    expect(await sampahHapus(ctx({ params: { id: "apbdes:a1" } }))).toEqual({ success: true, message: "Dokumen dihapus permanen" });
    expect(prismaMock.dokumenAPBDes.deleteMany).toHaveBeenCalledWith({ where: { id: "a1", isActive: false, deletedAt: { not: null } } });
    const urutan = [
      prismaMock.dokumenAPBDes.deleteMany.mock.invocationCallOrder[0],
      prismaMock.fileStorage.delete.mock.invocationCallOrder[0],
      minioMock.removeObject.mock.invocationCallOrder[0],
    ];
    expect([...urutan].sort((a, b) => a - b)).toEqual(urutan);
  });

  it("berkas entitas yang masih dipakai dokumen lain (mis. salinan DAK) tidak ikut dihapus", async () => {
    prismaMock.dokumenDesaAntiKorupsi.findFirst.mockResolvedValueOnce({ file: berkas("fs") });
    prismaMock.$queryRawUnsafe.mockResolvedValueOnce([{ dirujuk: true }]);
    expect(await sampahHapus(ctx({ params: { id: "dak:d1" } }))).toMatchObject({ success: true });
    expect(prismaMock.dokumenDesaAntiKorupsi.deleteMany).toHaveBeenCalled();
    expect(prismaMock.fileStorage.delete).not.toHaveBeenCalled();
    expect(minioMock.removeObject).not.toHaveBeenCalled();
  });

  it("item yang tidak di Sampah → 404 tanpa menghapus", async () => {
    prismaMock.fileStorage.findFirst.mockResolvedValueOnce(null);
    const c = ctx({ params: { id: "file:aktif" } });
    expect(await sampahHapus(c)).toMatchObject({ success: false });
    expect(c.set.status).toBe(404);
    expect(prismaMock.fileStorage.delete).not.toHaveBeenCalled();
  });
});

describe("kosongkan", () => {
  it("kelompok wajib (400 tanpa kelompok)", async () => {
    const c = ctx();
    expect(await sampahKosongkan(c)).toEqual({ success: false, message: "Parameter kelompok wajib diisi" });
    expect(c.set.status).toBe(400);
  });

  it("menghapus permanen semua item kelompok dan melaporkan jumlahnya", async () => {
    prismaMock.fileStorage.findMany.mockResolvedValueOnce([{ id: "f1" }, { id: "f2" }]);
    prismaMock.fileStorage.findFirst.mockImplementation(async ({ where }: { where: { id: string } }) => ({ id: where.id }));
    prismaMock.fileStorage.findUnique.mockResolvedValue({ path: "image", name: "x.webp" });

    const res = await sampahKosongkan(ctx({ query: { kelompok: "Kesehatan" } }));
    expect(res).toEqual({ success: true, message: "2 item dihapus permanen", data: { dihapus: 2 } });
    expect(prismaMock.fileStorage.findMany.mock.calls[0][0].where.AND).toEqual([{ deletedFrom: { in: expect.arrayContaining(["kesehatan.posyandu"]) } }]);
    expect(prismaMock.fileStorage.delete).toHaveBeenCalledTimes(2);
    // Entitas di luar kelompok Kesehatan tidak disentuh.
    for (const e of entities) expect(e.deleteMany).not.toHaveBeenCalled();
  });
});

describe("pratinjau admin", () => {
  it("mengalirkan berkas yang ada di Sampah tanpa cache publik; item aktif/tidak ada → 404", async () => {
    prismaMock.fileStorage.findFirst.mockResolvedValueOnce({ path: "image", name: "a.webp", mimeType: "image/webp" });
    minioMock.getObject.mockResolvedValueOnce((async function* () { yield Buffer.from("img"); })());
    const c = ctx({ params: { id: "file:f1" } });
    expect(String(await sampahPratinjau(c))).toBe("img");
    expect(c.set.headers["Cache-Control"]).toBe("private, no-store");
    expect(prismaMock.fileStorage.findFirst.mock.calls[0][0].where).toEqual({ id: "f1", deletedAt: { not: null } });

    prismaMock.fileStorage.findFirst.mockResolvedValueOnce(null);
    const c404 = ctx({ params: { id: "file:aktif" } });
    expect(await sampahPratinjau(c404)).toMatchObject({ success: false });
    expect(c404.set.status).toBe(404);
  });
});
