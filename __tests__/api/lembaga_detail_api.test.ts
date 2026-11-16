// @vitest-environment node
// API Lembaga Pendidikan (Info Sekolah) setelah detail sekolah ditambah: body lama tetap diterima, field baru
// tervalidasi skema bersama, find-unique memuat anak + hitungan (tanpa nama siswa), find-many ringan, foto lama
// dibersihkan, rute daftar anak terpasang. Prisma & penghapus berkas di-mock.
import { Prisma } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock, removeReleasedFiles } = vi.hoisted(() => ({
  prismaMock: {
    lembaga: {
      create: vi.fn((args: { data: object }) => Promise.resolve({ id: "lb1", ...args.data })),
      update: vi.fn((args: { data: object }) => Promise.resolve({ id: "lb1", ...args.data })),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    jenjangPendidikan: { findFirst: vi.fn() },
    pengurusLembaga: { findMany: vi.fn() },
    fotoKegiatanLembaga: { count: vi.fn(), aggregate: vi.fn(), create: vi.fn() },
    $transaction: vi.fn((ops: Promise<unknown>[]) => Promise.all(ops)),
  },
  removeReleasedFiles: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({ default: prismaMock }));
vi.mock("@/app/api/[[...slugs]]/_lib/fileStorage/_lib/removeReleasedFiles", () => ({ default: removeReleasedFiles }));

import create from "@/app/api/[[...slugs]]/_lib/pendidikan/info-sekolah-paud/lembaga/create";
import findMany from "@/app/api/[[...slugs]]/_lib/pendidikan/info-sekolah-paud/lembaga/findMany";
import findUnique from "@/app/api/[[...slugs]]/_lib/pendidikan/info-sekolah-paud/lembaga/findUnique";
import modul from "@/app/api/[[...slugs]]/_lib/pendidikan/info-sekolah-paud/lembaga/index";
import update from "@/app/api/[[...slugs]]/_lib/pendidikan/info-sekolah-paud/lembaga/updt";

const lb = prismaMock.lembaga;
// test-only: data rekaan.
const dasar = { nama: "TK Contoh Ceria", jenjangId: "j-tk" };

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- stub context Elysia minimal
const ctx = (body?: unknown, params: Record<string, string> = {}, query: Record<string, string> = {}): any => ({
  body,
  params,
  query,
  set: { status: 200 },
});

beforeEach(() => vi.clearAllMocks());

describe("create", () => {
  it("body lama { nama, jenjangId } tetap diterima tanpa kolom detail", async () => {
    expect(await create(ctx(dasar))).toMatchObject({ success: true });
    expect(lb.create.mock.calls[0][0].data).toEqual(dasar);
  });

  it("field detail disimpan: medsos, lokasi, link Google Maps, foto; teks kosong → null", async () => {
    const body = {
      ...dasar,
      deskripsi: "Sekolah contoh untuk anak usia dini.",
      alamat: "Jl. Contoh No. 1",
      kontak: " ",
      mediaSosial: [{ platform: "instagram", url: "https://www.instagram.com/tk_contoh" }],
      lat: -8.6,
      lng: 115.2,
      linkGoogleMaps: "https://maps.app.goo.gl/Contoh123",
      fotoSekolahId: "foto-1",
      fotoBaganStrukturId: "",
    };
    await create(ctx(body));
    expect(lb.create.mock.calls[0][0].data).toEqual({
      ...dasar,
      deskripsi: "Sekolah contoh untuk anak usia dini.",
      alamat: "Jl. Contoh No. 1",
      kontak: null,
      mediaSosial: body.mediaSosial,
      lat: -8.6,
      lng: 115.2,
      linkGoogleMaps: "https://maps.app.goo.gl/Contoh123",
      fotoSekolahId: "foto-1",
      fotoBaganStrukturId: null,
    });
  });

  it("medsos invalid / link bukan Google Maps / koordinat setengah / nama kosong → 400 tanpa tulis", async () => {
    const kasus: [object, string][] = [
      [{ ...dasar, mediaSosial: [{ platform: "instagram", url: "tk_contoh" }] }, "URL harus diawali http:// atau https://"],
      [{ ...dasar, mediaSosial: [{ platform: "website", url: "javascript:alert(1)" }] }, "URL harus diawali"],
      [{ ...dasar, mediaSosial: [{ platform: "myspace", url: "https://contoh.id" }] }, "Platform media sosial tidak dikenal"],
      [{ ...dasar, linkGoogleMaps: "https://evil.example/peta" }, "Google Maps"],
      [{ ...dasar, lat: -8.6 }, "lintang dan bujur"],
      [{ ...dasar, nama: "  " }, "Nama lembaga wajib diisi"],
      [{ nama: "TK Contoh" }, "Jenjang pendidikan wajib dipilih"],
    ];
    for (const [body, pesan] of kasus) {
      const c = ctx(body);
      const res = await create(c);
      expect(res).toMatchObject({ success: false });
      expect((res as { message: string }).message).toContain(pesan);
      expect(c.set.status).toBe(400);
    }
    expect(lb.create).not.toHaveBeenCalled();
  });
});

describe("update", () => {
  it("field tak dikirim tidak disentuh; foto sekolah lama yang diganti dilepas", async () => {
    lb.findUnique.mockResolvedValueOnce({ fotoSekolahId: "foto-lama", fotoBaganStrukturId: "bagan" });
    lb.update.mockResolvedValueOnce({ id: "lb1", fotoSekolahId: "foto-baru", fotoBaganStrukturId: "bagan" });
    const res = await update(ctx({ fotoSekolahId: "foto-baru", mediaSosial: [] }, { id: "lb1" }));
    expect(res).toMatchObject({ success: true });
    const data = lb.update.mock.calls[0][0].data;
    expect(data).toMatchObject({ fotoSekolahId: "foto-baru" });
    expect(data).not.toHaveProperty("nama");
    expect(data).not.toHaveProperty("fotoBaganStrukturId");
    expect(data.mediaSosial).toBe(Prisma.DbNull);
    expect(removeReleasedFiles).toHaveBeenCalledWith("Lembaga", ["foto-lama", "bagan"], ["foto-baru", "bagan"]);
  });

  it("medsos invalid → 400; lembaga tidak ada → 404", async () => {
    const invalid = ctx({ mediaSosial: [{ platform: "facebook", url: "bukan-url" }] }, { id: "lb1" });
    expect(await update(invalid)).toMatchObject({ success: false });
    expect(invalid.set.status).toBe(400);

    lb.findUnique.mockResolvedValueOnce(null);
    const hilang = ctx({ nama: "TK Baru" }, { id: "x" });
    expect(await update(hilang)).toMatchObject({ success: false });
    expect(hilang.set.status).toBe(404);
    expect(lb.update).not.toHaveBeenCalled();
  });
});

describe("baca", () => {
  it("find-unique meng-include foto, pengurus, galeri, hitungan aktif — tanpa daftar siswa", async () => {
    lb.findUnique.mockResolvedValueOnce({
      id: "lb1",
      mediaSosial: [{ platform: "website", url: "javascript:x" }, { platform: "facebook", url: "https://facebook.com/tk" }],
    });
    const res = await findUnique(ctx(undefined, { id: "lb1" }));
    expect(res).toMatchObject({ success: true, data: { mediaSosial: [{ platform: "facebook", url: "https://facebook.com/tk" }] } });
    const include = lb.findUnique.mock.calls[0][0].include;
    expect(Object.keys(include)).toEqual(["jenjangPendidikan", "fotoSekolah", "fotoBaganStruktur", "pengurus", "fotoKegiatan", "_count"]);
    expect(include.pengurus.orderBy).toEqual([{ urutan: "asc" }, { createdAt: "asc" }]);
    expect(include._count.select.siswa).toEqual({ where: { isActive: true } });
    expect(include).not.toHaveProperty("siswa");
  });

  it("find-unique id tak dikenal → 404 JSON", async () => {
    lb.findUnique.mockResolvedValueOnce(null);
    const c = ctx(undefined, { id: "x" });
    expect(await findUnique(c)).toMatchObject({ success: false });
    expect(c.set.status).toBe(404);
  });

  it("find-many tetap ringan (omit deskripsi & medsos) dan berpaginasi", async () => {
    lb.findMany.mockResolvedValueOnce([]);
    lb.count.mockResolvedValueOnce(0);
    const res = await findMany(ctx(undefined, {}, { page: "2", limit: "5" }));
    expect(res).toMatchObject({ success: true, page: 2, limit: 5 });
    expect(lb.findMany.mock.calls[0][0]).toMatchObject({ skip: 5, take: 5, omit: { deskripsi: true, mediaSosial: true } });
  });
});

describe("rute daftar anak", () => {
  it("GET /:id/pengurus terpasang dan difilter per lembaga", async () => {
    prismaMock.pengurusLembaga.findMany.mockResolvedValueOnce([{ id: "p1", nama: "Kepala Contoh" }]);
    const res = await modul.handle(new Request("http://localhost/lembagapendidikan/lb1/pengurus"));
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ success: true, data: [{ id: "p1" }] });
    expect(prismaMock.pengurusLembaga.findMany.mock.calls[0][0].where).toEqual({ lembagaId: "lb1" });
  });

  it("POST /:id/foto-kegiatan ke lembaga nonaktif/tidak ada → 404", async () => {
    lb.findFirst.mockResolvedValueOnce(null);
    const res = await modul.handle(
      new Request("http://localhost/lembagapendidikan/lb1/foto-kegiatan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: [{ imageId: "img-1" }] }),
      }),
    );
    expect(res.status).toBe(404);
    expect(lb.findFirst.mock.calls[0][0].where).toEqual({ id: "lb1", isActive: true });
    expect(prismaMock.fotoKegiatanLembaga.create).not.toHaveBeenCalled();
  });
});
