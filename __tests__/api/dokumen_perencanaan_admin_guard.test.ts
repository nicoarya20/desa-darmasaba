// @vitest-environment node
// Sisa T19 untuk Dokumen Perencanaan: POST/PUT/DELETE wajib role admin 0-4 (bukan hanya login), GET tetap publik.
// Modul Elysia diuji lewat Request; prisma dan auth di-mock.
import Elysia from "elysia";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAuthMock, dokumen, fileStorage } = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
  dokumen: { create: vi.fn(), update: vi.fn(), updateMany: vi.fn(), findMany: vi.fn(), findFirst: vi.fn(), count: vi.fn() },
  fileStorage: { findUnique: vi.fn() },
}));
vi.mock("@/lib/api-auth", () => ({ requireAuth: () => requireAuthMock() }));
vi.mock("@/lib/prisma", () => ({ default: { dokumenPerencanaan: dokumen, fileStorage } }));

import DokumenPerencanaan from "@/app/api/[[...slugs]]/_lib/desa/dokumen-perencanaan";
import { PESAN_DOKUMEN_PERENCANAAN_BUKAN_ADMIN } from "@/app/api/[[...slugs]]/_lib/desa/dokumen-perencanaan/dokumen-perencanaan.guard";

const app = new Elysia({ prefix: "/api/desa" }).use(DokumenPerencanaan);
const BASE = "http://localhost/api/desa/dokumenperencanaan";
const JSON_HEADERS = { "Content-Type": "application/json" };
const body = { jenis: "APBDES", judul: "APBDes Desa Contoh 2026", tahun: 2026 }; // test-only

const create = () => app.handle(new Request(`${BASE}/create`, { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(body) }));
const update = () => app.handle(new Request(`${BASE}/d1`, { method: "PUT", headers: JSON_HEADERS, body: JSON.stringify(body) }));
const remove = () => app.handle(new Request(`${BASE}/del/d1`, { method: "DELETE" }));
const MUTASI = [
  ["POST /create", create, dokumen.create],
  ["PUT /:id", update, dokumen.update],
  ["DELETE /del/:id", remove, dokumen.updateMany],
] as const;

const asRole = (roleId: string) => ({ authenticated: true, user: { id: "u-rekaan", roleId, isActive: true } }); // test-only
const tolak = (status: number, message: string) => ({
  authenticated: false,
  response: new Response(JSON.stringify({ success: false, message }), { status, headers: JSON_HEADERS }),
});

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  requireAuthMock.mockResolvedValue(asRole("2"));
  fileStorage.findUnique.mockResolvedValue({ mimeType: "application/pdf", isActive: true });
  dokumen.create.mockResolvedValue({ id: "d1" });
  dokumen.update.mockResolvedValue({ id: "d1" });
  dokumen.updateMany.mockResolvedValue({ count: 1 });
  dokumen.findFirst.mockResolvedValue({ id: "d1" });
  dokumen.findMany.mockResolvedValue([]);
  dokumen.count.mockResolvedValue(0);
});

describe.each(MUTASI)("%s", (_nama, panggil, tulis) => {
  it("role 5 (warga login) ditolak 403 dan tidak menyentuh database", async () => {
    requireAuthMock.mockResolvedValue(asRole("5"));
    const res = await panggil();
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ success: false, message: PESAN_DOKUMEN_PERENCANAAN_BUKAN_ADMIN });
    expect(tulis).not.toHaveBeenCalled();
  });

  it("tanpa sesi ditolak 401 dengan bentuk galat seragam", async () => {
    requireAuthMock.mockResolvedValue(tolak(401, "Unauthorized - Silakan login terlebih dahulu"));
    const res = await panggil();
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ success: false, message: "Unauthorized - Silakan login terlebih dahulu" });
    expect(tulis).not.toHaveBeenCalled();
  });

  it("akun nonaktif ditolak 403 dari guard sesi", async () => {
    requireAuthMock.mockResolvedValue(tolak(403, "Akun Anda tidak aktif. Hubungi administrator."));
    expect((await panggil()).status).toBe(403);
    expect(tulis).not.toHaveBeenCalled();
  });

  it.each(["0", "1", "2", "3", "4"])("role admin %s lolos dan menulis", async (roleId) => {
    requireAuthMock.mockResolvedValue(asRole(roleId));
    const res = await panggil();
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ success: true });
    expect(tulis).toHaveBeenCalledTimes(1);
  });
});

describe("GET tetap publik", () => {
  it("find-many dan detail dapat dibuka tanpa memeriksa sesi", async () => {
    const daftar = await app.handle(new Request(`${BASE}/find-many?jenis=PELAPORAN_APBDES`));
    expect(daftar.status).toBe(200);
    expect(dokumen.findMany.mock.calls[0][0].where).toMatchObject({ jenis: "PELAPORAN_APBDES", isActive: true });

    const detail = await app.handle(new Request(`${BASE}/d1`));
    expect(detail.status).toBe(200);
    expect(requireAuthMock).not.toHaveBeenCalled();
  });
});
