// @vitest-environment node
// Handler Struktur BUMDes lewat factory struktur bersama (prisma di-mock): hanya nama + jabatan wajib, email tidak
// unik, deskripsi jabatan opsional, atasan siklus ditolak, hapus = `delete` biasa (tanpa transaksi tabel lama).
import { describe, it, expect, vi, beforeEach } from "vitest";

const { prismaMock, minioMock } = vi.hoisted(() => {
  const delegate = () => ({
    findMany: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  });
  return {
    prismaMock: {
      posisiOrganisasiBumDes: delegate(),
      pegawaiBumDes: delegate(),
      // findUnique: path/nama berkas dibaca purgeStoredFile sebelum baris & objek MinIO dihapus.
      fileStorage: { delete: vi.fn(), findUnique: vi.fn(async () => ({ path: "image", name: "a.webp" })) },
      $transaction: vi.fn(),
    },
    minioMock: { removeObject: vi.fn() },
  };
});
vi.mock("@/lib/prisma", () => ({ default: prismaMock }));
vi.mock("@/lib/minio", () => ({ default: minioMock, MINIO_BUCKET: "bucket-test" }));
vi.mock("@/app/api/[[...slugs]]/_lib/fileStorage/_lib/fileReferences", () => ({ isFileReferenced: vi.fn(async () => false) }));

import { strukturBumdesHandlers as H } from "@/app/api/[[...slugs]]/_lib/ekonomi/struktur-bumdes/handlers";

const posisi = prismaMock.posisiOrganisasiBumDes;
const pegawai = prismaMock.pegawaiBumDes;

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- stub context Elysia minimal
const ctx = (opts: { body?: unknown; id?: string } = {}): any => ({
  body: opts.body,
  params: opts.id ? { id: opts.id } : {},
  query: {},
  set: { status: 200 },
});

beforeEach(() => {
  vi.clearAllMocks();
  posisi.findUnique.mockResolvedValue({ id: "direktur" });
});

describe("pegawai BUMDes", () => {
  it("hanya nama + jabatan wajib; field opsional kosong → null; tanpa nama/jabatan → 400", async () => {
    pegawai.create.mockResolvedValueOnce({ id: "p1" });
    const ok = await H.pegawai.create(ctx({ body: { namaLengkap: "Ni Kadek, S.E.", posisiId: "direktur", email: "" } }));
    expect(ok).toMatchObject({ success: true, message: "Pegawai BUMDes berhasil ditambahkan" });
    expect(pegawai.create.mock.calls[0][0].data).toMatchObject({
      namaLengkap: "Ni Kadek, S.E.",
      email: null,
      telepon: null,
      imageId: null,
      gelarAkademik: null,
      alamat: null,
      tanggalMasuk: null,
    });
    // Tabel BUMDes tanpa deletedAt: cek jabatan tidak memakai filter soft-delete.
    expect(posisi.findUnique.mock.calls[0][0].where).toEqual({ id: "direktur" });

    for (const body of [{ posisiId: "direktur" }, { namaLengkap: "A" }]) {
      const c = ctx({ body });
      expect(await H.pegawai.create(c)).toMatchObject({ success: false });
      expect(c.set.status).toBe(400);
    }
    expect(pegawai.create).toHaveBeenCalledTimes(1);
  });

  it("dua pegawai tanpa email sama-sama tersimpan (email tidak unik)", async () => {
    pegawai.create.mockResolvedValueOnce({ id: "p1" }).mockResolvedValueOnce({ id: "p2" });
    const a = await H.pegawai.create(ctx({ body: { namaLengkap: "A", posisiId: "direktur" } }));
    const b = await H.pegawai.create(ctx({ body: { namaLengkap: "B", posisiId: "direktur", email: "" } }));
    expect([a, b]).toMatchObject([{ success: true, data: { id: "p1" } }, { success: true, data: { id: "p2" } }]);
  });

  it("hapus: `delete` biasa tanpa transaksi, lalu foto", async () => {
    const foto = { id: "img-1", path: "image", name: "a.webp" };
    pegawai.findUnique.mockResolvedValueOnce({ id: "p1", imageId: foto.id, image: foto });
    expect(await H.pegawai.delete(ctx({ id: "p1" }))).toMatchObject({ success: true, data: { id: "p1" } });
    expect(pegawai.delete).toHaveBeenCalledTimes(1);
    expect(pegawai.delete).toHaveBeenCalledWith({ where: { id: "p1" } });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(pegawai.update).not.toHaveBeenCalled();
    expect(prismaMock.fileStorage.delete).toHaveBeenCalledWith({ where: { id: foto.id } });
    expect(minioMock.removeObject).toHaveBeenCalledWith("bucket-test", "image/a.webp");
  });

  it("hapus pegawai yang tidak ada → 404 tanpa menghapus", async () => {
    pegawai.findUnique.mockResolvedValueOnce(null);
    const c = ctx({ id: "x" });
    expect(await H.pegawai.delete(c)).toEqual({ success: false, message: "Pegawai BUMDes tidak ditemukan" });
    expect(c.set.status).toBe(404);
    expect(pegawai.delete).not.toHaveBeenCalled();
  });
});

describe("jabatan BUMDes", () => {
  it("deskripsi opsional (tidak dikirim → null), urutan + atasan tersimpan", async () => {
    posisi.findMany.mockResolvedValueOnce([{ id: "direktur", parentId: null }]);
    posisi.create.mockResolvedValueOnce({ id: "sekretaris" });
    const res = await H.posisi.create(ctx({ body: { nama: "Sekretaris", hierarki: 2, urutan: 1, parentId: "direktur" } }));
    expect(res).toMatchObject({ success: true });
    expect(posisi.create.mock.calls[0][0].data).toEqual({
      nama: "Sekretaris",
      hierarki: 2,
      deskripsi: null,
      urutan: 1,
      parentId: "direktur",
    });
  });

  it("atasan yang membentuk siklus ditolak 400 tanpa menulis", async () => {
    posisi.findMany.mockResolvedValue([
      { id: "direktur", parentId: null },
      { id: "sekretaris", parentId: "direktur" },
    ]);
    const c = ctx({ id: "direktur", body: { nama: "Direktur", hierarki: 1, parentId: "sekretaris" } });
    expect(await H.posisi.update(c)).toMatchObject({ success: false });
    expect(c.set.status).toBe(400);
    expect(posisi.findMany.mock.calls[0][0].where).toEqual({});
    expect(posisi.update).not.toHaveBeenCalled();
  });

  it("hapus: 409 bila masih dipakai pegawai; bila kosong `delete` biasa tanpa transaksi", async () => {
    posisi.findUnique.mockResolvedValueOnce({ id: "direktur", _count: { pegawai: 2, children: 0 } });
    const dipakai = ctx({ id: "direktur" });
    expect(await H.posisi.delete(dipakai)).toMatchObject({ success: false, message: expect.stringContaining("2 pegawai") });
    expect(dipakai.set.status).toBe(409);
    expect(posisi.delete).not.toHaveBeenCalled();

    posisi.findUnique.mockResolvedValueOnce({ id: "bendahara", _count: { pegawai: 0, children: 0 } });
    expect(await H.posisi.delete(ctx({ id: "bendahara" }))).toMatchObject({ success: true, data: { id: "bendahara" } });
    expect(posisi.delete).toHaveBeenCalledTimes(1);
    expect(posisi.delete).toHaveBeenCalledWith({ where: { id: "bendahara" } });
    expect(prismaMock.$transaction).not.toHaveBeenCalled();
    expect(posisi.update).not.toHaveBeenCalled();
  });
});
