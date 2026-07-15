// @vitest-environment node
// Fase 1 batch 3: handler create/update model master/kategori (name/nama @unique)
// memakai helper duplikat. P2002 → 409 + "Nama sudah dipakai" (gaya B).
// Handler updt potensi memakai Response.json → cek via res.status + body JSON.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Prisma } from "@prisma/client";

const prismaMock = vi.hoisted(() => ({
  potensiDesa: { create: vi.fn(), update: vi.fn(), findUnique: vi.fn() },
  kategoriBerita: { create: vi.fn(), update: vi.fn() },
  kategoriPotensi: { create: vi.fn(), update: vi.fn() },
  categoryPengumuman: { create: vi.fn(), update: vi.fn() },
  fileStorage: { delete: vi.fn() },
}));
vi.mock("@/lib/prisma", () => ({ default: prismaMock }));
// minio dipakai potensi/updt; stub agar tak menyentuh network.
vi.mock("@/lib/minio", () => ({
  default: { removeObject: vi.fn() },
  MINIO_BUCKET: "bucket",
}));

import potensiCreate from "@/app/api/[[...slugs]]/_lib/desa/potensi/create";
import potensiUpdate from "@/app/api/[[...slugs]]/_lib/desa/potensi/updt";
import kategoriBeritaCreate from "@/app/api/[[...slugs]]/_lib/desa/berita/kategori-berita/create";
import kategoriBeritaUpdate from "@/app/api/[[...slugs]]/_lib/desa/berita/kategori-berita/updt";
import kategoriPotensiCreate from "@/app/api/[[...slugs]]/_lib/desa/potensi/kategori-potensi/create";
import kategoriPengumumanCreate from "@/app/api/[[...slugs]]/_lib/desa/pengumuman/kategori-pengumuman/create";

function p2002(target: string[]) {
  return new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
    code: "P2002",
    clientVersion: "6.3.1",
    meta: { target },
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ctx = (body: any, id?: string): any => ({
  body,
  params: id ? { id } : {},
  set: { status: 200 },
});

beforeEach(() => vi.clearAllMocks());

describe("kategori create — duplikat nama → 409", () => {
  it("kategori berita create P2002(name) → 409 'Nama sudah dipakai'", async () => {
    prismaMock.kategoriBerita.create.mockRejectedValueOnce(p2002(["name"]));
    const c = ctx({ name: "Umum" });
    const res = await kategoriBeritaCreate(c);
    expect(c.set.status).toBe(409);
    expect(res).toEqual({ success: false, message: "Nama sudah dipakai" });
  });

  it("kategori potensi create P2002(nama) → 409 'Nama sudah dipakai'", async () => {
    prismaMock.kategoriPotensi.create.mockRejectedValueOnce(p2002(["nama"]));
    const c = ctx({ nama: "Wisata" });
    const res = await kategoriPotensiCreate(c);
    expect(c.set.status).toBe(409);
    expect(res).toEqual({ success: false, message: "Nama sudah dipakai" });
  });

  it("kategori pengumuman create P2002(name) → 409 'Nama sudah dipakai'", async () => {
    prismaMock.categoryPengumuman.create.mockRejectedValueOnce(p2002(["name"]));
    const c = ctx({ name: "Penting" });
    const res = await kategoriPengumumanCreate(c);
    expect(c.set.status).toBe(409);
    expect(res).toEqual({ success: false, message: "Nama sudah dipakai" });
  });

  it("kategori berita create error non-P2002 → dilempar (perilaku lama)", async () => {
    prismaMock.kategoriBerita.create.mockRejectedValueOnce(new Error("boom"));
    await expect(kategoriBeritaCreate(ctx({ name: "X" }))).rejects.toThrow(/kategori berita/i);
  });
});

describe("kategori update — duplikat nama → 409", () => {
  it("kategori berita update P2002(name) → 409", async () => {
    prismaMock.kategoriBerita.update.mockRejectedValueOnce(p2002(["name"]));
    const c = ctx({ name: "Umum" }, "k1");
    const res = await kategoriBeritaUpdate(c);
    expect(c.set.status).toBe(409);
    expect(res).toEqual({ success: false, message: "Nama sudah dipakai" });
  });
});

describe("potensiDesa — duplikat nama", () => {
  it("create P2002(name) → 409 'Nama sudah dipakai'", async () => {
    prismaMock.potensiDesa.create.mockRejectedValueOnce(p2002(["name"]));
    const c = ctx({ name: "Sawah", deskripsi: "x", kategoriId: "k", imageId: "i", content: "c" });
    const res = await potensiCreate(c);
    expect(c.set.status).toBe(409);
    expect(res).toEqual({ success: false, message: "Nama sudah dipakai" });
  });

  it("update P2002(name) → Response 409 + body 'Nama sudah dipakai'", async () => {
    prismaMock.potensiDesa.findUnique.mockResolvedValueOnce({ id: "p1", imageId: "i", image: null });
    prismaMock.potensiDesa.update.mockRejectedValueOnce(p2002(["name"]));
    const c = ctx({ name: "Sawah", deskripsi: "x", kategoriId: "k", imageId: "i", content: "c" }, "p1");
    const res: Response = await potensiUpdate(c);
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body).toEqual({ success: false, message: "Nama sudah dipakai" });
  });
});
