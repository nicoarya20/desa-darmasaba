// @vitest-environment node
// Kontrak rute (AI-CONTRACT §10) /api/ppid/strukturppid setelah pindah ke kode struktur bersama: path lama
// `posisiorganisasi`/`pegawai` dipertahankan, endpoint yang tak dipakai dihapus, error `{ success: false, message }`.
import { describe, it, expect, vi, beforeEach } from "vitest";
import Elysia from "elysia";

const prismaMock = vi.hoisted(() => ({
  posisiOrganisasiPPID: { findMany: vi.fn(), findUnique: vi.fn() },
  pegawaiPPID: { findUnique: vi.fn(), findMany: vi.fn(), count: vi.fn() },
}));
vi.mock("@/lib/prisma", () => ({ default: prismaMock }));
vi.mock("@/lib/minio", () => ({ default: { removeObject: vi.fn() }, MINIO_BUCKET: "bucket-test" }));

import PPID from "@/app/api/[[...slugs]]/_lib/ppid";
import StrukturPPID from "@/app/api/[[...slugs]]/_lib/ppid/struktur_ppid";

const app = new Elysia().group("/api", (api) => api.use(StrukturPPID));
const P = "/api/strukturppid";

beforeEach(() => vi.clearAllMocks());

describe("kontrak rute struktur PPID", () => {
  it("terdaftar di modul ppid dengan method + path persis (path lama dipertahankan)", () => {
    const routes = new Elysia()
      .use(PPID)
      .routes.map((r) => `${r.method} ${r.path}`)
      .filter((r) => r.includes("/strukturppid"))
      .sort();
    expect(routes).toEqual([
      "DELETE /ppid/strukturppid/pegawai/del/:id",
      "DELETE /ppid/strukturppid/posisiorganisasi/del/:id",
      "GET /ppid/strukturppid/pegawai/:id",
      "GET /ppid/strukturppid/pegawai/find-many",
      "GET /ppid/strukturppid/posisiorganisasi/:id",
      "GET /ppid/strukturppid/posisiorganisasi/find-many-all",
      "POST /ppid/strukturppid/pegawai/create",
      "POST /ppid/strukturppid/posisiorganisasi/create",
      "PUT /ppid/strukturppid/pegawai/:id",
      "PUT /ppid/strukturppid/posisiorganisasi/:id",
    ]);
  });
});

describe("bentuk respons lewat Elysia", () => {
  const send = (method: string, path: string, body?: unknown) =>
    app.handle(
      new Request(`http://localhost${P}${path}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      })
    );

  it("body tanpa jabatan → 400 { success: false, message }", async () => {
    const res = await send("POST", "/pegawai/create", { namaLengkap: "A" });
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ success: false, message: expect.any(String) });
  });

  it("404 detail pegawai berbentuk kontrak; baris terhapus (soft-delete) tidak dicari", async () => {
    prismaMock.pegawaiPPID.findUnique.mockResolvedValueOnce(null);
    const res = await send("GET", "/pegawai/tidak-ada");
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ success: false, message: "Pegawai PPID tidak ditemukan" });
    expect(prismaMock.pegawaiPPID.findUnique.mock.calls[0][0].where).toEqual({ id: "tidak-ada", deletedAt: null });
  });

  it("error tak terduga → 500 { success: false, message } dan dicatat", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    prismaMock.posisiOrganisasiPPID.findMany.mockRejectedValueOnce(new Error("db down"));
    const res = await send("GET", "/posisiorganisasi/find-many-all");
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ success: false, message: "Terjadi kesalahan pada server" });
    expect(String(spy.mock.calls[0][0])).toContain("[strukturppid]");
    spy.mockRestore();
  });

  it("sukses berbentuk { success: true, message, data }; filter isActive + tanpa baris terhapus", async () => {
    prismaMock.posisiOrganisasiPPID.findMany.mockResolvedValueOnce([{ id: "kepala_desa" }]);
    const res = await send("GET", "/posisiorganisasi/find-many-all?isActive=true");
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ success: true, data: [{ id: "kepala_desa" }] });
    expect(prismaMock.posisiOrganisasiPPID.findMany.mock.calls[0][0].where).toEqual({ deletedAt: null, isActive: true });
  });

  it("list pegawai berpaginasi berbentuk { success, data, page, limit, total, totalPages }", async () => {
    prismaMock.pegawaiPPID.findMany.mockResolvedValueOnce([]);
    prismaMock.pegawaiPPID.count.mockResolvedValueOnce(0);
    const res = await send("GET", "/pegawai/find-many?page=1&limit=100&isActive=true");
    expect(await res.json()).toEqual({
      success: true,
      message: "Berhasil mengambil daftar pegawai PPID",
      data: [],
      page: 1,
      limit: 100,
      total: 0,
      totalPages: 1,
    });
  });
});
