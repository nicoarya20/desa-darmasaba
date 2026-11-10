// @vitest-environment node
// Fase 1 batch 5: parent DesaAntiKorupsi & Responden (name @unique) memakai
// helper duplikat. P2002 → 409 "Nama sudah dipakai".
// Catatan: PrestasiDesa TIDAK diuji di sini — sudah punya guard case-insensitive
// manual sendiri dan tidak diubah.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Prisma } from "@prisma/client";

const prismaMock = vi.hoisted(() => {
  const mock = {
    desaAntiKorupsi: { create: vi.fn(), update: vi.fn() },
    responden: { create: vi.fn(), update: vi.fn() },
    // create DAK kini membuat program + folder/dokumen dalam satu interactive transaction
    $transaction: vi.fn(),
  };
  mock.$transaction.mockImplementation(async (fn: (tx: typeof mock) => unknown) => fn(mock));
  return mock;
});
vi.mock("@/lib/prisma", () => ({ default: prismaMock }));

import dakCreate from "@/app/api/[[...slugs]]/_lib/landing_page/desa-anti-korupsi/create";
import dakUpdate from "@/app/api/[[...slugs]]/_lib/landing_page/desa-anti-korupsi/updt";
import respondenCreate from "@/app/api/[[...slugs]]/_lib/landing_page/indeks_kepuasan/responden/create";
import respondenUpdate from "@/app/api/[[...slugs]]/_lib/landing_page/indeks_kepuasan/responden/updt";

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

const dakBody = { name: "Program A", deskripsi: "x", kategoriId: "k" };
const respondenBody = {
  name: "Budi",
  tanggal: "2026-01-01",
  jenisKelaminId: "j",
  ratingId: "r",
  kelompokUmurId: "u",
};

beforeEach(() => vi.clearAllMocks());

describe("DesaAntiKorupsi — duplikat nama → 409", () => {
  it("create P2002(name) → 409 'Nama sudah dipakai'", async () => {
    prismaMock.desaAntiKorupsi.create.mockRejectedValueOnce(p2002(["name"]));
    const c = ctx(dakBody);
    const res = await dakCreate(c);
    expect(c.set.status).toBe(409);
    expect(res).toEqual({ success: false, message: "Nama sudah dipakai" });
  });

  it("update P2002(name) → 409 'Nama sudah dipakai'", async () => {
    prismaMock.desaAntiKorupsi.update.mockRejectedValueOnce(p2002(["name"]));
    const c = ctx(dakBody, "d1");
    const res = await dakUpdate(c);
    expect(c.set.status).toBe(409);
    expect(res).toEqual({ success: false, message: "Nama sudah dipakai" });
  });

  it("create error non-P2002 → dilempar (perilaku lama)", async () => {
    prismaMock.desaAntiKorupsi.create.mockRejectedValueOnce(new Error("boom"));
    await expect(dakCreate(ctx(dakBody))).rejects.toThrow(/desa anti korupsi/i);
  });
});

describe("Responden — duplikat nama → 409", () => {
  it("create P2002(name) → 409 'Nama sudah dipakai'", async () => {
    prismaMock.responden.create.mockRejectedValueOnce(p2002(["name"]));
    const c = ctx(respondenBody);
    const res = await respondenCreate(c);
    expect(c.set.status).toBe(409);
    expect(res).toEqual({ success: false, message: "Nama sudah dipakai" });
  });

  it("update P2002(name) → 409 'Nama sudah dipakai'", async () => {
    prismaMock.responden.update.mockRejectedValueOnce(p2002(["name"]));
    const c = ctx(respondenBody, "r1");
    const res = await respondenUpdate(c);
    expect(c.set.status).toBe(409);
    expect(res).toEqual({ success: false, message: "Nama sudah dipakai" });
  });
});
