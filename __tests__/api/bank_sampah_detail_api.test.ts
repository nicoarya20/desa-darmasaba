// @vitest-environment node
// API Bank Sampah (KeteranganBankSampahTerdekat) setelah detail ditambah: field baru additive & tervalidasi,
// link Google Maps default ke rute koordinat, inovasi many-to-many, bagan lama dibersihkan, find-many ringan,
// rute daftar anak (pengurus/foto kegiatan) terpasang. Prisma & penghapus berkas di-mock.
import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, removeReleasedFiles } = vi.hoisted(() => ({
  prismaMock: {
    keteranganBankSampahTerdekat: {
      create: vi.fn((args: { data: object }) => Promise.resolve({ id: "bs1", ...args.data })),
      update: vi.fn((args: { data: object }) => Promise.resolve({ id: "bs1", ...args.data })),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      delete: vi.fn(),
    },
    programInovasi: { count: vi.fn() },
    pengurusBankSampah: { findMany: vi.fn() },
  },
  removeReleasedFiles: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({ default: prismaMock }));
vi.mock("@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeReleasedFiles", () => ({ default: removeReleasedFiles }));

import create from "@/app/api/[[...slugs]]/_lib/lingkungan/pengelolaan-sampah/keterangan-bank-sampah/create";
import del from "@/app/api/[[...slugs]]/_lib/lingkungan/pengelolaan-sampah/keterangan-bank-sampah/del";
import findMany from "@/app/api/[[...slugs]]/_lib/lingkungan/pengelolaan-sampah/keterangan-bank-sampah/findMany";
import findUnique from "@/app/api/[[...slugs]]/_lib/lingkungan/pengelolaan-sampah/keterangan-bank-sampah/findUnique";
import modul from "@/app/api/[[...slugs]]/_lib/lingkungan/pengelolaan-sampah/keterangan-bank-sampah/index";
import update from "@/app/api/[[...slugs]]/_lib/lingkungan/pengelolaan-sampah/keterangan-bank-sampah/updt";

const bs = prismaMock.keteranganBankSampahTerdekat;
// test-only: data rekaan.
const dasar = { name: "TPS Contoh", alamat: "Jl. Contoh No. 1", namaTempatMaps: "TPS Contoh", lat: -8.6, lng: 115.2 };

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- stub context Elysia minimal
const ctx = (body?: unknown, params: Record<string, string> = {}, query: Record<string, string> = {}): any => ({
  body,
  params,
  query,
  set: { status: 200 },
});

beforeEach(() => {
  vi.clearAllMocks();
  prismaMock.programInovasi.count.mockResolvedValue(0);
});

describe("create", () => {
  it("body lama tetap diterima; link petunjuk arah = rute koordinat", async () => {
    const res = await create(ctx(dasar));
    expect(res).toMatchObject({ success: true });
    expect(bs.create.mock.calls[0][0].data).toEqual({
      ...dasar,
      deskripsi: undefined,
      kontak: undefined,
      linkPetunjukArah: "https://www.google.com/maps/dir/?api=1&destination=-8.6,115.2",
    });
  });

  it("field detail disimpan: link Google Maps, medsos, kontak, inovasi terhubung", async () => {
    prismaMock.programInovasi.count.mockResolvedValueOnce(2);
    const body = {
      ...dasar,
      deskripsi: "Pengelolaan sampah 3R",
      kontak: "081200001111", // test-only
      mediaSosial: [{ platform: "instagram", url: "https://www.instagram.com/akun_contoh" }],
      linkPetunjukArah: "https://maps.app.goo.gl/Contoh123",
      programInovasiIds: ["inov-1", "inov-2"],
    };
    await create(ctx(body));
    expect(bs.create.mock.calls[0][0].data).toMatchObject({
      deskripsi: "Pengelolaan sampah 3R",
      mediaSosial: body.mediaSosial,
      linkPetunjukArah: "https://maps.app.goo.gl/Contoh123",
      programInovasi: { connect: [{ id: "inov-1" }, { id: "inov-2" }] },
    });
  });

  it("medsos URL invalid / link bukan Google Maps / inovasi tak dikenal → 400 tanpa tulis", async () => {
    for (const body of [
      { ...dasar, mediaSosial: [{ platform: "instagram", url: "akun_contoh" }] },
      { ...dasar, linkPetunjukArah: "https://evil.example/peta" },
      { ...dasar, programInovasiIds: ["tidak-ada"] },
    ]) {
      const c = ctx(body);
      expect(await create(c)).toMatchObject({ success: false });
      expect(c.set.status).toBe(400);
    }
    expect(bs.create).not.toHaveBeenCalled();
  });
});

describe("update", () => {
  it("inovasi diganti (set), bagan lama dilepas, field detail tak dikirim tidak disentuh", async () => {
    bs.findUnique.mockResolvedValueOnce({ fotoBaganStrukturId: "bagan-lama" });
    prismaMock.programInovasi.count.mockResolvedValueOnce(1);
    const res = await update(ctx({ ...dasar, fotoBaganStrukturId: "bagan-baru", programInovasiIds: ["inov-1"] }, { id: "bs1" }));
    expect(res).toMatchObject({ success: true });
    const data = bs.update.mock.calls[0][0].data;
    expect(data).toMatchObject({ fotoBaganStrukturId: "bagan-baru", programInovasi: { set: [{ id: "inov-1" }] } });
    expect(data).not.toHaveProperty("mediaSosial");
    expect(removeReleasedFiles).toHaveBeenCalledWith("KeteranganBankSampahTerdekat", ["bagan-lama"], ["bagan-baru"]);
  });

  it("bank sampah tidak ada → 404", async () => {
    bs.findUnique.mockResolvedValueOnce(null);
    const c = ctx(dasar, { id: "x" });
    expect(await update(c)).toMatchObject({ success: false });
    expect(c.set.status).toBe(404);
  });
});

describe("baca & hapus", () => {
  it("find-unique memuat relasi detail dan membuang medsos rusak", async () => {
    bs.findUnique.mockResolvedValueOnce({ id: "bs1", mediaSosial: [{ platform: "website", url: "javascript:x" }, { platform: "youtube", url: "https://youtube.com/@a" }] });
    const res = await findUnique(ctx(undefined, { id: "bs1" }));
    expect(res).toMatchObject({ success: true, data: { mediaSosial: [{ platform: "youtube", url: "https://youtube.com/@a" }] } });
    expect(Object.keys(bs.findUnique.mock.calls[0][0].include)).toEqual(["fotoBaganStruktur", "pengurus", "fotoKegiatan", "programInovasi"]);
  });

  it("find-many tetap ringan (omit deskripsi & medsos) dan limit dibatasi 100", async () => {
    bs.findMany.mockResolvedValueOnce([]);
    bs.count.mockResolvedValueOnce(0);
    await findMany(ctx(undefined, {}, { page: "1", limit: "5000" }));
    expect(bs.findMany.mock.calls[0][0]).toMatchObject({ take: 100, omit: { deskripsi: true, mediaSosial: true } });
  });

  it("hapus bank sampah membersihkan berkas bagan, pengurus, dan foto kegiatan", async () => {
    bs.findUnique.mockResolvedValueOnce({ fotoBaganStrukturId: "bagan", pengurus: [{ imageId: "p1" }, { imageId: null }], fotoKegiatan: [{ imageId: "f1" }] });
    expect(await del(ctx(undefined, { id: "bs1" }))).toMatchObject({ success: true });
    expect(removeReleasedFiles).toHaveBeenCalledWith("KeteranganBankSampahTerdekat", ["bagan", "p1", null, "f1"]);
  });
});

describe("rute daftar anak", () => {
  it("GET /:id/pengurus terpasang di modul keterangan bank sampah", async () => {
    prismaMock.pengurusBankSampah.findMany.mockResolvedValueOnce([{ id: "p1", nama: "Ketua Contoh" }]);
    const res = await modul.handle(new Request("http://localhost/keteranganbankterdekat/bs1/pengurus"));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ success: true, data: [{ id: "p1" }] });
    expect(prismaMock.pengurusBankSampah.findMany.mock.calls[0][0].where).toEqual({ bankSampahId: "bs1" });
  });
});
