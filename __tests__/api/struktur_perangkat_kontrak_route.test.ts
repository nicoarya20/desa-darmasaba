// @vitest-environment node
// Kontrak rute (AI-CONTRACT §10) /api/desa/strukturperangkat sesuai MIND/PLAN/struktur-perangkat-desa.md,
// plus bentuk error seragam `{ success: false, message }` lewat Elysia sungguhan.
import { describe, it, expect, vi, beforeEach } from "vitest";
import Elysia from "elysia";

const prismaMock = vi.hoisted(() => ({
  posisiPerangkatDesa: { findMany: vi.fn(), findUnique: vi.fn() },
  perangkatDesa: { findUnique: vi.fn() },
}));
vi.mock("@/lib/prisma", () => ({ default: prismaMock }));
vi.mock("@/lib/minio", () => ({ default: { removeObject: vi.fn() }, MINIO_BUCKET: "bucket-test" }));

import Desa from "@/app/api/[[...slugs]]/_lib/desa";
import StrukturPerangkatDesa from "@/app/api/[[...slugs]]/_lib/desa/struktur-perangkat";

const app = new Elysia().group("/api", (api) => api.use(StrukturPerangkatDesa));
const P = "/api/strukturperangkat";

beforeEach(() => vi.clearAllMocks());

describe("kontrak rute struktur perangkat desa", () => {
  it("terdaftar di modul desa dengan method + path persis sesuai plan", () => {
    const routes = new Elysia()
      .use(Desa)
      .routes.map((r) => `${r.method} ${r.path}`)
      .filter((r) => r.includes("/strukturperangkat/"))
      .sort();
    expect(routes).toEqual([
      "DELETE /desa/strukturperangkat/pegawai/del/:id",
      "DELETE /desa/strukturperangkat/posisi/del/:id",
      "GET /desa/strukturperangkat/pegawai/:id",
      "GET /desa/strukturperangkat/pegawai/find-many",
      "GET /desa/strukturperangkat/posisi/:id",
      "GET /desa/strukturperangkat/posisi/find-many-all",
      "POST /desa/strukturperangkat/pegawai/create",
      "POST /desa/strukturperangkat/posisi/create",
      "PUT /desa/strukturperangkat/pegawai/:id",
      "PUT /desa/strukturperangkat/posisi/:id",
    ]);
  });
});

describe("bentuk error lewat Elysia", () => {
  const send = (method: string, path: string, body?: unknown) =>
    app.handle(
      new Request(`http://localhost${P}${path}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      })
    );

  it("body tanpa field wajib → 400 { success: false, message }", async () => {
    const res = await send("POST", "/pegawai/create", { namaLengkap: "A" });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ success: false, message: expect.any(String) });
  });

  it("404 detail pegawai berbentuk kontrak", async () => {
    prismaMock.perangkatDesa.findUnique.mockResolvedValueOnce(null);
    const res = await send("GET", "/pegawai/tidak-ada");
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ success: false, message: "Perangkat desa tidak ditemukan" });
  });

  it("error tak terduga → 500 { success: false, message } dan dicatat", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    prismaMock.posisiPerangkatDesa.findMany.mockRejectedValueOnce(new Error("db down"));
    const res = await send("GET", "/posisi/find-many-all");
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ success: false, message: "Terjadi kesalahan pada server" });
    expect(String(spy.mock.calls[0][0])).toContain("/posisi/find-many-all");
    spy.mockRestore();
  });

  it("sukses berbentuk { success: true, message, data }", async () => {
    prismaMock.posisiPerangkatDesa.findMany.mockResolvedValueOnce([{ id: "pd-perbekel" }]);
    const res = await send("GET", "/posisi/find-many-all?isActive=true");
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ success: true, data: [{ id: "pd-perbekel" }] });
    expect(prismaMock.posisiPerangkatDesa.findMany.mock.calls[0][0].where).toEqual({ isActive: true });
  });
});
