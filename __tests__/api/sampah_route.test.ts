// @vitest-environment node
// Kontrak rute Sampah per fitur: modul `/sampah` (3 rute, dipasang di route.ts), request HTTP sungguhan lewat Elysia
// (prisma & auth di-mock), bukan jalur publik, dan modul Sampah global lama di bawah Pengaturan sudah tidak ada.
import { describe, it, expect, vi, beforeEach } from "vitest";
import { existsSync, readFileSync } from "fs";
import path from "path";
import Elysia from "elysia";

const { requireAuthMock, prismaMock } = vi.hoisted(() => ({
  requireAuthMock: vi.fn(),
  prismaMock: { fotoProfilBumDes: { count: vi.fn(), findMany: vi.fn() } },
}));
vi.mock("@/lib/api-auth", () => ({ requireAuth: () => requireAuthMock() }));
vi.mock("@/lib/prisma", () => ({ default: prismaMock }));
vi.mock("@/lib/minio", () => ({ default: {}, MINIO_BUCKET: "bucket-test" }));

import Sampah from "@/app/api/[[...slugs]]/_lib/sampah";
import { isPublicGetPath } from "@/lib/auth-policy";

const API_DIR = path.join(process.cwd(), "src/app/api/[[...slugs]]");
// Disusun dari potongan agar path modul lama tidak muncul literal di repo (grep bersih).
const MODUL_LAMA = ["pengaturan", "sampah"].join("/");
const app = new Elysia({ prefix: "/api" }).use(Sampah);
const get = (url: string) => app.handle(new Request(`http://localhost${url}`));

beforeEach(() => {
  vi.clearAllMocks();
  requireAuthMock.mockResolvedValue({ authenticated: true, user: { id: "u1", roleId: "2", isActive: true } });
  prismaMock.fotoProfilBumDes.count.mockResolvedValue(0);
  prismaMock.fotoProfilBumDes.findMany.mockResolvedValue([]);
});

describe("rute /api/sampah", () => {
  it("daftar method+path modul dikunci (AI-CONTRACT §10)", () => {
    const routes = new Elysia().use(Sampah).routes.map((r) => `${r.method} ${r.path}`).sort();
    expect(routes).toEqual(["DELETE /sampah/:sumber/:id", "GET /sampah/:sumber", "POST /sampah/:sumber/:id/pulihkan"]);
  });

  it("GET /api/sampah/foto-bumdes lewat HTTP → 200 kontrak daftar; sumber asing → 400", async () => {
    const ok = await get("/api/sampah/foto-bumdes?page=1&limit=20");
    expect(ok.status).toBe(200);
    expect(await ok.json()).toEqual({ success: true, data: { items: [], total: 0, page: 1, limit: 20, retensiHari: 30 } });

    const bad = await get("/api/sampah/berita");
    expect(bad.status).toBe(400);
    expect(await bad.json()).toEqual({ success: false, message: "Sumber Sampah tidak dikenal: berita" });
  });

  it("bukan jalur GET publik", () => {
    expect(isPublicGetPath("/api/sampah/foto-bumdes")).toBe(false);
    expect(isPublicGetPath("/api/sampah/dokumen-apbdes")).toBe(false);
  });
});

describe("modul Sampah global lama dihapus", () => {
  it("route.ts memasang modul /sampah, bukan modul lama; folder modul lama tidak ada", () => {
    const route = readFileSync(path.join(API_DIR, "route.ts"), "utf8");
    expect(route).toContain('import Sampah from "./_lib/sampah";');
    expect(route).not.toContain(MODUL_LAMA);
    expect(existsSync(path.join(API_DIR, "_lib", MODUL_LAMA))).toBe(false);
  });

  it("GET ke path modul lama tidak dilayani modul Sampah → 404", async () => {
    expect((await get(`/api/${MODUL_LAMA}`)).status).toBe(404);
  });
});
