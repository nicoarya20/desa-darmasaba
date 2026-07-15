// @vitest-environment node
// Fase 1 batch 6: sisa marginal — program inovasi (name), pejabat desa (name),
// pegawai bumdes (email), pegawai PPID (email). P2002 → 409 "<Field> sudah dipakai".
// pejabat-desa & ppid-pegawai updt memakai Response.json → cek via res.status.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Prisma } from "@prisma/client";

const prismaMock = vi.hoisted(() => ({
  programInovasi: { create: vi.fn(), update: vi.fn() },
  pejabatDesa: { findUnique: vi.fn(), update: vi.fn() },
  pegawaiBumDes: { update: vi.fn() },
  pegawaiPPID: { findUnique: vi.fn(), update: vi.fn() },
  fileStorage: { delete: vi.fn() },
}));
vi.mock("@/lib/prisma", () => ({ default: prismaMock }));
vi.mock("@/lib/minio", () => ({
  default: { removeObject: vi.fn() },
  MINIO_BUCKET: "bucket",
}));

import programInovasiCreate from "@/app/api/[[...slugs]]/_lib/landing_page/profile/program-inovasi/create";
import programInovasiUpdate from "@/app/api/[[...slugs]]/_lib/landing_page/profile/program-inovasi/updt";
import pejabatDesaUpdate from "@/app/api/[[...slugs]]/_lib/landing_page/profile/pejabat-desa/updt";
import pegawaiBumdesUpdate from "@/app/api/[[...slugs]]/_lib/ekonomi/struktur-bumdes/pegawai/updt";
import pegawaiPPIDUpdate from "@/app/api/[[...slugs]]/_lib/ppid/struktur_ppid/pegawai/updt";

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

describe("program inovasi — duplikat nama → 409", () => {
  it("create P2002(name) → 409 'Nama sudah dipakai'", async () => {
    prismaMock.programInovasi.create.mockRejectedValueOnce(p2002(["name"]));
    const c = ctx({ name: "Inovasi A", description: "x", imageId: "i", link: "l" });
    const res = await programInovasiCreate(c);
    expect(c.set.status).toBe(409);
    expect(res).toEqual({ success: false, message: "Nama sudah dipakai" });
  });

  it("update P2002(name) → 409 'Nama sudah dipakai'", async () => {
    prismaMock.programInovasi.update.mockRejectedValueOnce(p2002(["name"]));
    const c = ctx({ name: "Inovasi A" }, "pi1");
    const res = await programInovasiUpdate(c);
    expect(c.set.status).toBe(409);
    expect(res).toEqual({ success: false, message: "Nama sudah dipakai" });
  });

  it("create error non-P2002 → dilempar (perilaku lama)", async () => {
    prismaMock.programInovasi.create.mockRejectedValueOnce(new Error("boom"));
    await expect(
      programInovasiCreate(ctx({ name: "X", description: "y", imageId: "i", link: "l" }))
    ).rejects.toThrow(/program inovasi/i);
  });
});

describe("pejabat desa — duplikat nama (Response.json 409)", () => {
  it("update P2002(name) → Response 409 + body 'Nama sudah dipakai'", async () => {
    prismaMock.pejabatDesa.findUnique.mockResolvedValueOnce({ id: "pd1", imageId: "i", image: null });
    prismaMock.pejabatDesa.update.mockRejectedValueOnce(p2002(["name"]));
    const c = ctx({ name: "Kadus", position: "Kepala", imageId: "i" }, "pd1");
    const res: Response = await pejabatDesaUpdate(c);
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body).toEqual({ success: false, message: "Nama sudah dipakai" });
  });
});

describe("pegawai bumdes & PPID — duplikat email → 409", () => {
  it("pegawai bumdes update P2002(email) → 409 'Email sudah dipakai'", async () => {
    prismaMock.pegawaiBumDes.update.mockRejectedValueOnce(p2002(["email"]));
    const c = ctx({ id: "pb1", namaLengkap: "A", email: "a@x.com" });
    const res = await pegawaiBumdesUpdate(c);
    expect(c.set.status).toBe(409);
    expect(res).toEqual({ success: false, message: "Email sudah dipakai" });
  });

  it("pegawai PPID update P2002(email) → Response 409 + body 'Email sudah dipakai'", async () => {
    prismaMock.pegawaiPPID.findUnique.mockResolvedValueOnce({ id: "pp1", imageId: "i", image: null });
    prismaMock.pegawaiPPID.update.mockRejectedValueOnce(p2002(["email"]));
    const c = ctx({ name: "A", email: "a@x.com", imageId: "i" }, "pp1");
    const res: Response = await pegawaiPPIDUpdate(c);
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body).toEqual({ success: false, message: "Email sudah dipakai" });
  });
});
