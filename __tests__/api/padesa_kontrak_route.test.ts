// @vitest-environment node
// Kontrak state ↔ rute modul PADesa (Pendapatan Asli Desa). Bug: state hapus Pembiayaan memanggil
// `/pembiayaan/del/:id` padahal server mendaftarkan `/pembiayaan/delete/:id` → hapus selalu 404.
// Test ini mengirim request yang BENAR-BENAR dibentuk state ke modul Elysia (prisma di-mock).
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Elysia from "elysia";

const mocks = vi.hoisted(() => {
  const model = () => ({ delete: vi.fn(async ({ where }: { where: { id: string } }) => ({ id: where.id })) });
  return {
    prisma: { pembiayaan: model(), belanja: model(), pendapatan: model(), apbDesa: model() },
    toast: { success: vi.fn(), error: vi.fn(), warn: vi.fn() },
  };
});

vi.mock("@/lib/prisma", () => ({ default: mocks.prisma }));
vi.mock("react-toastify", () => ({ toast: mocks.toast }));

import PendapatanAsliDesa from "@/app/api/[[...slugs]]/_lib/ekonomi/pendapatan-asli-desa";
import PADesaState from "@/app/admin/(dashboard)/_state/ekonomi/PADesa";

const BASE = "http://localhost";
// Prefix `/api/ekonomi` dipasang di route.ts; di sini dipasang ulang agar URL state bisa dipakai apa adanya.
const app = new Elysia({ prefix: "/api" }).use(new Elysia({ prefix: "/ekonomi" }).use(PendapatanAsliDesa));

const fetchSpy = vi.fn(async (input: string, init?: RequestInit) =>
  app.handle(new Request(new URL(input, BASE), init))
);

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal("fetch", fetchSpy);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("kontrak rute modul PADesa", () => {
  // AI-CONTRACT §10: path yang sudah dipakai state dikunci. Pembiayaan sengaja tetap `/delete/:id`
  // (beda dari saudaranya `/del/:id`) — perbaikan bug ada di sisi state, bukan rename rute.
  it("daftar method+path", () => {
    const routes = new Elysia().use(PendapatanAsliDesa).routes.map((r) => `${r.method} ${r.path}`).sort();
    expect(routes).toEqual([
      "DELETE /pendapatanaslidesa/apbdesa/del/:id",
      "DELETE /pendapatanaslidesa/belanja/del/:id",
      "DELETE /pendapatanaslidesa/pembiayaan/delete/:id",
      "DELETE /pendapatanaslidesa/pendapatanasli/del/:id",
      "GET /pendapatanaslidesa/apbdesa/:id",
      "GET /pendapatanaslidesa/apbdesa/find-first",
      "GET /pendapatanaslidesa/apbdesa/find-many",
      "GET /pendapatanaslidesa/belanja/:id",
      "GET /pendapatanaslidesa/belanja/find-many",
      "GET /pendapatanaslidesa/pembiayaan/:id",
      "GET /pendapatanaslidesa/pembiayaan/find-many",
      "GET /pendapatanaslidesa/pendapatanasli/:id",
      "GET /pendapatanaslidesa/pendapatanasli/find-many",
      "POST /pendapatanaslidesa/apbdesa/create",
      "POST /pendapatanaslidesa/belanja/create",
      "POST /pendapatanaslidesa/pembiayaan/create",
      "POST /pendapatanaslidesa/pendapatanasli/create",
      "PUT /pendapatanaslidesa/apbdesa/:id",
      "PUT /pendapatanaslidesa/belanja/:id",
      "PUT /pendapatanaslidesa/pembiayaan/:id",
      "PUT /pendapatanaslidesa/pendapatanasli/:id",
    ]);
  });
});

describe("rute DELETE Pembiayaan (server)", () => {
  it("DELETE /pembiayaan/delete/:id ditangani (bukan 404) dan menghapus id itu", async () => {
    const res = await app.handle(
      new Request(`${BASE}/api/ekonomi/pendapatanaslidesa/pembiayaan/delete/abc`, { method: "DELETE" })
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ success: true });
    expect(mocks.prisma.pembiayaan.delete).toHaveBeenCalledWith({ where: { id: "abc" } });
  });

  it("path lama /pembiayaan/del/:id tidak terdaftar → 404", async () => {
    const res = await app.handle(
      new Request(`${BASE}/api/ekonomi/pendapatanaslidesa/pembiayaan/del/abc`, { method: "DELETE" })
    );
    expect(res.status).toBe(404);
    expect(mocks.prisma.pembiayaan.delete).not.toHaveBeenCalled();
  });
});

describe("state delete.byId modul PADesa → rute server", () => {
  const cases = [
    { name: "pembiayaan", del: () => PADesaState.pembiayaan.delete, find: () => PADesaState.pembiayaan.findMany, url: "/api/ekonomi/pendapatanaslidesa/pembiayaan/delete/abc", model: mocks.prisma.pembiayaan },
    { name: "belanja", del: () => PADesaState.belanja.delete, find: () => PADesaState.belanja.findMany, url: "/api/ekonomi/pendapatanaslidesa/belanja/del/abc", model: mocks.prisma.belanja },
    { name: "pendapatan", del: () => PADesaState.pendapatan.delete, find: () => PADesaState.pendapatan.findMany, url: "/api/ekonomi/pendapatanaslidesa/pendapatanasli/del/abc", model: mocks.prisma.pendapatan },
    { name: "apbDesa", del: () => PADesaState.ApbDesa.delete, find: () => PADesaState.ApbDesa.findMany, url: "/api/ekonomi/pendapatanaslidesa/apbdesa/del/abc", model: mocks.prisma.apbDesa },
  ];

  it.each(cases)("$name: fetch DELETE ke URL terdaftar, server menghapus, toast sukses", async (c) => {
    // Refresh list pasca-hapus bukan fokus test ini.
    vi.spyOn(c.find(), "load").mockResolvedValue(undefined as never);

    await c.del().byId("abc");

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe(c.url);
    expect(init?.method).toBe("DELETE");
    expect(c.model.delete).toHaveBeenCalledWith({ where: { id: "abc" } });
    expect(mocks.toast.success).toHaveBeenCalled();
    expect(mocks.toast.error).not.toHaveBeenCalled();
  });
});
