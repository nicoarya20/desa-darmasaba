// @vitest-environment node
// Fase 1 batch 2: handler create/update APBDes (tahun) & Beasiswa Pendaftar (NIK)
// memakai helper duplikat. P2002 → 409 + "<Field> sudah dipakai" (gaya B).
// Error non-P2002 tetap seperti perilaku lama (500 / pesan gagal).
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Prisma } from "@prisma/client";

const prismaMock = vi.hoisted(() => ({
  apbDesa: { create: vi.fn(), update: vi.fn(), findUnique: vi.fn() },
  beasiswaPendaftar: { create: vi.fn(), update: vi.fn() },
}));
vi.mock("@/lib/prisma", () => ({ default: prismaMock }));

import apbDesaCreate from "@/app/api/[[...slugs]]/_lib/ekonomi/pendapatan-asli-desa/apbDesa/create";
import apbDesaUpdate from "@/app/api/[[...slugs]]/_lib/ekonomi/pendapatan-asli-desa/apbDesa/updt";
import beasiswaCreate from "@/app/api/[[...slugs]]/_lib/pendidikan/beasiswa-desa/beasiswa-pendaftar/create";
import beasiswaUpdate from "@/app/api/[[...slugs]]/_lib/pendidikan/beasiswa-desa/beasiswa-pendaftar/updt";

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

const apbBody = { tahun: 2024, pendapatanIds: [], belanjaIds: [], pembiayaanIds: [] };
const beasiswaBody = {
  namaLengkap: "A",
  nis: "1",
  kelas: "X",
  jenisKelamin: "LAKI_LAKI",
  tempatLahir: "Bali",
  tanggalLahir: "2005-01-01",
  nik: "5103000000000001",
  noHp: "0812",
};

beforeEach(() => vi.clearAllMocks());

describe("apbDesa create/update — duplikat tahun", () => {
  it("create P2002(tahun) → 409 + 'Tahun sudah dipakai'", async () => {
    prismaMock.apbDesa.create.mockRejectedValueOnce(p2002(["tahun"]));
    const c = ctx(apbBody);
    const res = await apbDesaCreate(c);
    expect(c.set.status).toBe(409);
    expect(res).toEqual({ success: false, message: "Tahun sudah dipakai" });
  });

  it("update P2002(tahun) → 409 + 'Tahun sudah dipakai'", async () => {
    prismaMock.apbDesa.findUnique.mockResolvedValueOnce({ id: "a1" });
    prismaMock.apbDesa.update.mockRejectedValueOnce(p2002(["tahun"]));
    const c = ctx(apbBody, "a1");
    const res = await apbDesaUpdate(c);
    expect(c.set.status).toBe(409);
    expect(res).toEqual({ success: false, message: "Tahun sudah dipakai" });
  });

  it("update error non-P2002 → tetap 500 (bukan 409)", async () => {
    prismaMock.apbDesa.findUnique.mockResolvedValueOnce({ id: "a1" });
    prismaMock.apbDesa.update.mockRejectedValueOnce(new Error("boom"));
    const c = ctx(apbBody, "a1");
    const res: any = await apbDesaUpdate(c);
    expect(c.set.status).toBe(500);
    expect(res.error).toBeDefined();
  });
});

describe("beasiswaPendaftar create/update — duplikat NIK", () => {
  it("create P2002(nik) → 409 + 'NIK sudah dipakai', tanpa bocor nilai NIK", async () => {
    prismaMock.beasiswaPendaftar.create.mockRejectedValueOnce(p2002(["nik"]));
    const c = ctx(beasiswaBody);
    const res = await beasiswaCreate(c);
    expect(c.set.status).toBe(409);
    expect(res).toEqual({ success: false, message: "NIK sudah dipakai" });
    expect(res.message).not.toContain(beasiswaBody.nik);
  });

  it("create error non-P2002 → dilempar (perilaku lama)", async () => {
    prismaMock.beasiswaPendaftar.create.mockRejectedValueOnce(new Error("boom"));
    await expect(beasiswaCreate(ctx(beasiswaBody))).rejects.toThrow(/beasiswa/i);
  });

  it("update P2002(nik) → 409 + 'NIK sudah dipakai'", async () => {
    prismaMock.beasiswaPendaftar.update.mockRejectedValueOnce(p2002(["nik"]));
    const c = ctx(beasiswaBody, "b1");
    const res = await beasiswaUpdate(c);
    expect(c.set.status).toBe(409);
    expect(res).toEqual({ success: false, message: "NIK sudah dipakai" });
  });
});
