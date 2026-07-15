// @vitest-environment node
// Fase 1 batch 4: kategori prestasi/DAK + 3 responden indeks kepuasan
// (name @unique) memakai helper duplikat. P2002 → 409 "Nama sudah dipakai".
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Prisma } from "@prisma/client";

const prismaMock = vi.hoisted(() => ({
  kategoriPrestasiDesa: { create: vi.fn(), update: vi.fn() },
  kategoriDesaAntiKorupsi: { create: vi.fn(), update: vi.fn() },
  jenisKelaminResponden: { create: vi.fn(), update: vi.fn() },
  umurResponden: { create: vi.fn(), update: vi.fn() },
  pilihanRatingResponden: { create: vi.fn(), update: vi.fn() },
}));
vi.mock("@/lib/prisma", () => ({ default: prismaMock }));

import kategoriPrestasiCreate from "@/app/api/[[...slugs]]/_lib/landing_page/prestasi-desa/kategori-prestasi/create";
import kategoriPrestasiUpdate from "@/app/api/[[...slugs]]/_lib/landing_page/prestasi-desa/kategori-prestasi/updt";
import kategoriDakCreate from "@/app/api/[[...slugs]]/_lib/landing_page/desa-anti-korupsi/kategori-dak/create";
import jenisKelaminCreate from "@/app/api/[[...slugs]]/_lib/landing_page/indeks_kepuasan/jenis-kelamin-responden/create";
import umurCreate from "@/app/api/[[...slugs]]/_lib/landing_page/indeks_kepuasan/umur-responden/create";
import pilihanRatingCreate from "@/app/api/[[...slugs]]/_lib/landing_page/indeks_kepuasan/pilihan-rating-responden/create";

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

describe("kategori prestasi & DAK — duplikat nama → 409", () => {
  it("kategori prestasi create P2002(name) → 409", async () => {
    prismaMock.kategoriPrestasiDesa.create.mockRejectedValueOnce(p2002(["name"]));
    const c = ctx({ name: "Juara" });
    const res = await kategoriPrestasiCreate(c);
    expect(c.set.status).toBe(409);
    expect(res).toEqual({ success: false, message: "Nama sudah dipakai" });
  });

  it("kategori prestasi update P2002(name) → 409", async () => {
    prismaMock.kategoriPrestasiDesa.update.mockRejectedValueOnce(p2002(["name"]));
    const c = ctx({ name: "Juara" }, "kp1");
    const res = await kategoriPrestasiUpdate(c);
    expect(c.set.status).toBe(409);
    expect(res).toEqual({ success: false, message: "Nama sudah dipakai" });
  });

  it("kategori DAK create P2002(name) → 409", async () => {
    prismaMock.kategoriDesaAntiKorupsi.create.mockRejectedValueOnce(p2002(["name"]));
    const c = ctx({ name: "Transparansi" });
    const res = await kategoriDakCreate(c);
    expect(c.set.status).toBe(409);
    expect(res).toEqual({ success: false, message: "Nama sudah dipakai" });
  });

  it("kategori prestasi create error non-P2002 → dilempar (error asli, via handlePrismaError)", async () => {
    prismaMock.kategoriPrestasiDesa.create.mockRejectedValueOnce(new Error("boom"));
    await expect(kategoriPrestasiCreate(ctx({ name: "X" }))).rejects.toThrow("boom");
  });
});

describe("responden indeks kepuasan — duplikat nama → 409", () => {
  it("jenis kelamin create P2002(name) → 409", async () => {
    prismaMock.jenisKelaminResponden.create.mockRejectedValueOnce(p2002(["name"]));
    const c = ctx({ name: "Laki-laki" });
    const res = await jenisKelaminCreate(c);
    expect(c.set.status).toBe(409);
    expect(res).toEqual({ success: false, message: "Nama sudah dipakai" });
  });

  it("umur create P2002(name) → 409", async () => {
    prismaMock.umurResponden.create.mockRejectedValueOnce(p2002(["name"]));
    const c = ctx({ name: "17-25" });
    const res = await umurCreate(c);
    expect(c.set.status).toBe(409);
    expect(res).toEqual({ success: false, message: "Nama sudah dipakai" });
  });

  it("pilihan rating create P2002(name) → 409", async () => {
    prismaMock.pilihanRatingResponden.create.mockRejectedValueOnce(p2002(["name"]));
    const c = ctx({ name: "Puas" });
    const res = await pilihanRatingCreate(c);
    expect(c.set.status).toBe(409);
    expect(res).toEqual({ success: false, message: "Nama sudah dipakai" });
  });
});
