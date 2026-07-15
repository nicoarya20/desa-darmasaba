// @vitest-environment node
// Fase 1 pilot: handler create/update ekonomi memakai handlePrismaError.
// Saat unique violation (P2002) → status 409 + { success:false, message:
// "<Field> sudah dipakai" } (gaya B). Error non-P2002 tetap dilempar (500 lama).
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Prisma } from "@prisma/client";

const prismaMock = vi.hoisted(() => ({
  sektorUnggulanDesa: { create: vi.fn(), update: vi.fn(), findUnique: vi.fn() },
  grafikJumlahPendudukMiskin: {
    create: vi.fn(),
    update: vi.fn(),
    findUnique: vi.fn(),
  },
}));
vi.mock("@/lib/prisma", () => ({ default: prismaMock }));

import sektorCreate from "@/app/api/[[...slugs]]/_lib/ekonomi/sektor-unggulan-desa/create";
import sektorUpdate from "@/app/api/[[...slugs]]/_lib/ekonomi/sektor-unggulan-desa/updt";
import miskinCreate from "@/app/api/[[...slugs]]/_lib/ekonomi/jumlah-penduduk-miskin/create";
import miskinUpdate from "@/app/api/[[...slugs]]/_lib/ekonomi/jumlah-penduduk-miskin/updt";

function p2002(target: string[]) {
  return new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
    code: "P2002",
    clientVersion: "6.3.1",
    meta: { target },
  });
}

// Context Elysia minimal: body, params, set.status.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ctx = (body: any, id?: string): any => ({
  body,
  params: id ? { id } : {},
  set: { status: 200 },
});

beforeEach(() => vi.clearAllMocks());

describe("sektorUnggulanDesa create/update — duplikat nama", () => {
  it("create P2002(name) → 409 + 'Nama sudah dipakai'", async () => {
    prismaMock.sektorUnggulanDesa.create.mockRejectedValueOnce(p2002(["name"]));
    const c = ctx({ name: "Pertanian", description: "x", value: 1 });
    const res = await sektorCreate(c);
    expect(c.set.status).toBe(409);
    expect(res).toEqual({ success: false, message: "Nama sudah dipakai" });
  });

  it("create sukses → success:true + data", async () => {
    prismaMock.sektorUnggulanDesa.create.mockResolvedValueOnce({
      id: "s1",
      name: "Pertanian",
      description: "x",
      value: 1,
    });
    const res: any = await sektorCreate(ctx({ name: "Pertanian", description: "x", value: 1 }));
    expect(res.success).toBe(true);
    expect(res.data?.id).toBe("s1");
  });

  it("update P2002(name) → 409 + 'Nama sudah dipakai'", async () => {
    prismaMock.sektorUnggulanDesa.findUnique.mockResolvedValueOnce({ id: "s1" });
    prismaMock.sektorUnggulanDesa.update.mockRejectedValueOnce(p2002(["name"]));
    const c = ctx({ name: "Peternakan", description: "x", value: 2 }, "s1");
    const res = await sektorUpdate(c);
    expect(c.set.status).toBe(409);
    expect(res).toEqual({ success: false, message: "Nama sudah dipakai" });
  });

  it("create error non-P2002 → dilempar (bukan ditelan)", async () => {
    prismaMock.sektorUnggulanDesa.create.mockRejectedValueOnce(new Error("boom"));
    await expect(
      sektorCreate(ctx({ name: "X", description: "y", value: 1 }))
    ).rejects.toThrow("boom");
  });
});

describe("grafikJumlahPendudukMiskin create/update — duplikat tahun", () => {
  it("create P2002(year) → 409 + 'Tahun sudah dipakai'", async () => {
    prismaMock.grafikJumlahPendudukMiskin.create.mockRejectedValueOnce(p2002(["year"]));
    const c = ctx({ year: 2024, totalPoorPopulation: 10 });
    const res = await miskinCreate(c);
    expect(c.set.status).toBe(409);
    expect(res).toEqual({ success: false, message: "Tahun sudah dipakai" });
  });

  it("update P2002(year) → 409 + 'Tahun sudah dipakai'", async () => {
    prismaMock.grafikJumlahPendudukMiskin.findUnique.mockResolvedValueOnce({ id: "m1" });
    prismaMock.grafikJumlahPendudukMiskin.update.mockRejectedValueOnce(p2002(["year"]));
    const c = ctx({ year: 2025, totalPoorPopulation: 20 }, "m1");
    const res = await miskinUpdate(c);
    expect(c.set.status).toBe(409);
    expect(res).toEqual({ success: false, message: "Tahun sudah dipakai" });
  });
});
