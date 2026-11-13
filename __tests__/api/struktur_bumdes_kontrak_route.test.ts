// @vitest-environment node
// Kontrak rute (AI-CONTRACT §10) /api/ekonomi/struktur-organisasi setelah pindah ke kode struktur bersama: path lama
// `posisi-organisasi`/`pegawai` dipertahankan, endpoint yang tak dipakai dihapus, error `{ success: false, message }`.
import { describe, it, expect, vi, beforeEach } from "vitest";
import Elysia from "elysia";

const prismaMock = vi.hoisted(() => ({
  posisiOrganisasiBumDes: { findMany: vi.fn(), findUnique: vi.fn() },
  pegawaiBumDes: { findUnique: vi.fn(), findMany: vi.fn(), count: vi.fn() },
}));
vi.mock("@/lib/prisma", () => ({ default: prismaMock }));
vi.mock("@/lib/minio", () => ({ default: { removeObject: vi.fn() }, MINIO_BUCKET: "bucket-test" }));

import Ekonomi from "@/app/api/[[...slugs]]/_lib/ekonomi";
import StrukturBumdes from "@/app/api/[[...slugs]]/_lib/ekonomi/struktur-bumdes";

const app = new Elysia().group("/api", (api) => api.use(StrukturBumdes));
const P = "/api/struktur-organisasi";

beforeEach(() => vi.clearAllMocks());

describe("kontrak rute struktur BUMDes", () => {
  it("terdaftar di modul ekonomi dengan method + path persis (path lama dipertahankan)", () => {
    const routes = new Elysia()
      .use(Ekonomi)
      .routes.map((r) => `${r.method} ${r.path}`)
      .filter((r) => r.includes("/ekonomi/struktur-organisasi"))
      .sort();
    expect(routes).toEqual([
      "DELETE /ekonomi/struktur-organisasi/pegawai/del/:id",
      "DELETE /ekonomi/struktur-organisasi/posisi-organisasi/del/:id",
      "GET /ekonomi/struktur-organisasi/pegawai/:id",
      "GET /ekonomi/struktur-organisasi/pegawai/find-many",
      "GET /ekonomi/struktur-organisasi/posisi-organisasi/:id",
      "GET /ekonomi/struktur-organisasi/posisi-organisasi/find-many-all",
      "POST /ekonomi/struktur-organisasi/pegawai/create",
      "POST /ekonomi/struktur-organisasi/posisi-organisasi/create",
      "PUT /ekonomi/struktur-organisasi/pegawai/:id",
      "PUT /ekonomi/struktur-organisasi/posisi-organisasi/:id",
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

  it("404 detail pegawai berbentuk kontrak; tabel tanpa soft-delete", async () => {
    prismaMock.pegawaiBumDes.findUnique.mockResolvedValueOnce(null);
    const res = await send("GET", "/pegawai/tidak-ada");
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ success: false, message: "Pegawai BUMDes tidak ditemukan" });
    expect(prismaMock.pegawaiBumDes.findUnique.mock.calls[0][0].where).toEqual({ id: "tidak-ada" });
  });

  it("error tak terduga → 500 { success: false, message } dan dicatat", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    prismaMock.posisiOrganisasiBumDes.findMany.mockRejectedValueOnce(new Error("db down"));
    const res = await send("GET", "/posisi-organisasi/find-many-all");
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({ success: false, message: "Terjadi kesalahan pada server" });
    expect(String(spy.mock.calls[0][0])).toContain("[strukturbumdes]");
    spy.mockRestore();
  });

  it("sukses berbentuk { success: true, message, data }; filter isActive", async () => {
    prismaMock.posisiOrganisasiBumDes.findMany.mockResolvedValueOnce([{ id: "direktur" }]);
    const res = await send("GET", "/posisi-organisasi/find-many-all?isActive=true");
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ success: true, data: [{ id: "direktur" }] });
    expect(prismaMock.posisiOrganisasiBumDes.findMany.mock.calls[0][0].where).toEqual({ isActive: true });
  });

  it("list pegawai berpaginasi berbentuk { success, data, page, limit, total, totalPages }", async () => {
    prismaMock.pegawaiBumDes.findMany.mockResolvedValueOnce([]);
    prismaMock.pegawaiBumDes.count.mockResolvedValueOnce(0);
    const res = await send("GET", "/pegawai/find-many?page=1&limit=100&isActive=true");
    expect(await res.json()).toEqual({
      success: true,
      message: "Berhasil mengambil daftar pegawai BUMDes",
      data: [],
      page: 1,
      limit: 100,
      total: 0,
      totalPages: 1,
    });
  });
});
