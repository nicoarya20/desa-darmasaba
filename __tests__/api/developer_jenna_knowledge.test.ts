// @vitest-environment node
// Pengetahuan Jenna untuk Developer Console (GET /api/developer/jenna/knowledge): read-only, khusus
// role "0", sumber tersembunyi tidak di-query, dan angka yang dilaporkan sama dengan snapshot.
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Context } from "elysia";

const { db, requireAuthMock } = vi.hoisted(() => {
  const rows = new Map<string, unknown[]>();
  const calls: string[] = [];
  const delegate = (name: string) => ({
    findMany: vi.fn(async () => {
      calls.push(name);
      return rows.get(name) ?? [];
    }),
    findFirst: vi.fn(async () => (rows.get(name) ?? [])[0] ?? null),
  });
  const cache = new Map<string, ReturnType<typeof delegate>>();
  const prisma = new Proxy({}, {
    get: (_t, prop: string) => {
      if (!cache.has(prop)) cache.set(prop, delegate(prop));
      return cache.get(prop);
    },
  });
  return { db: { rows, calls, prisma }, requireAuthMock: vi.fn() };
});

vi.mock("next/cache", () => ({ revalidateTag: vi.fn(), unstable_cache: <T,>(fn: T) => fn }));
vi.mock("@/lib/api-auth", () => ({ requireAuth: () => requireAuthMock() }));
vi.mock("@/lib/env", () => ({ env: { NODE_ENV: "production", BETTER_AUTH_SECRET: "x" } }));
vi.mock("@/lib/prisma", () => ({ default: db.prisma }));

import { jennaKnowledgeGet } from "@/app/api/[[...slugs]]/_lib/developer/jenna-knowledge";
import { buildJennaKnowledge } from "@/lib/jenna/knowledge/admin";
import { JENNA_KNOWLEDGE_REVALIDATE_SECONDS } from "@/lib/jenna/knowledge/sitemap";
import { SNAPSHOT_MAX_CHARS, SNAPSHOT_TRUNCATED_MARK, buildKnowledgeSnapshot } from "@/lib/jenna/knowledge/snapshot";
import { KNOWLEDGE_SOURCES, KNOWLEDGE_SOURCE_BY_KEY } from "@/lib/jenna/knowledge/sources";
import { JENNA_TOOLS } from "@/lib/jenna/tools";

const NOW = new Date("2026-11-13T02:00:00Z");
const HIDDEN_KEYS = ["puskesmas", "penanganan_darurat"];

function ctx() {
  const set: { status?: number; headers: Record<string, string> } = { headers: {} };
  return { context: { query: {}, params: {}, set, body: undefined } as unknown as Context, set };
}
const asUser = (roleId: string) =>
  requireAuthMock.mockResolvedValue({ authenticated: true, user: { id: `u-${roleId}`, roleId, isActive: true } });

beforeEach(() => {
  vi.clearAllMocks();
  db.rows.clear();
  db.calls.length = 0;
});

describe("buildJennaKnowledge", () => {
  it("memuat semua sumber registry sesuai urutan, dengan baris yang sama dengan snapshot", async () => {
    db.rows.set("pelayananSuratKeterangan", [
      { id: "l1", name: "Surat Domisili", deskripsi: null, estimasiWaktu: null, biaya: 0 },
      { id: "l2", name: "Surat Usaha", deskripsi: null, estimasiWaktu: null, biaya: 5000 },
    ]);
    const data = await buildJennaKnowledge({ overrides: {}, now: NOW });

    expect(data.sources.map((s) => s.key)).toEqual(KNOWLEDGE_SOURCES.map((s) => s.key));
    const layanan = KNOWLEDGE_SOURCE_BY_KEY.get("layanan_surat_keterangan")!;
    expect(data.sources.find((s) => s.key === layanan.key)).toEqual({
      key: layanan.key,
      label: layanan.label,
      domain: "layanan",
      tier: "B",
      visible: true,
      href: layanan.menuHref,
      rows: 2,
      take: layanan.take,
      searchable: layanan.searchFields.length > 0,
    });
    expect(data.snapshot.text).toContain("Surat Domisili");
    expect(data.snapshot.text).toBe(await buildKnowledgeSnapshot({ overrides: {}, now: NOW }));
  });

  it("sumber yang menunya tersembunyi → visible false, rows 0, tidak di-query, tidak bisa dicari", async () => {
    db.rows.set("puskesmas", [{ id: "p1", name: "Puskesmas Rahasia" }]);
    const data = await buildJennaKnowledge({ overrides: {}, now: NOW });

    for (const key of HIDDEN_KEYS) {
      expect(data.sources.find((s) => s.key === key)).toMatchObject({ visible: false, rows: 0, searchable: false });
    }
    for (const delegate of ["puskesmas", "penangananDarurat"]) expect(db.calls).not.toContain(delegate);
    expect(data.snapshot.text).not.toContain("Puskesmas Rahasia");
    expect(db.calls).not.toContain("menuVisibility");
  });

  it("menyembunyikan menu lewat override ikut menyembunyikan sumbernya", async () => {
    db.rows.set("berita", [{ id: "b1", judul: "Upacara Melasti", tanggalTerbit: NOW, kategoriBerita: { name: "Umum" } }]);
    const shown = await buildJennaKnowledge({ overrides: {}, now: NOW });
    expect(shown.sources.find((s) => s.key === "berita")).toMatchObject({ visible: true, rows: 1, searchable: true });

    const hidden = await buildJennaKnowledge({ overrides: { "/pemerintahan/berita/semua": false }, now: NOW });
    expect(hidden.sources.find((s) => s.key === "berita")).toMatchObject({ visible: false, rows: 0, searchable: false });
    expect(hidden.snapshot.text).not.toContain("Upacara Melasti");
  });

  it("searchable hanya untuk sumber terlihat yang punya kolom pencarian (syarat cari_konten)", async () => {
    const data = await buildJennaKnowledge({ overrides: {}, now: NOW });
    for (const dto of data.sources) {
      const source = KNOWLEDGE_SOURCE_BY_KEY.get(dto.key)!;
      expect(dto.searchable).toBe(dto.visible && source.searchFields.length > 0);
    }
    expect(data.sources.some((s) => s.searchable)).toBe(true);
    expect(data.sources.some((s) => s.visible && !s.searchable)).toBe(true);
  });

  it("snapshot muat → truncated false, ukuran & metadata sesuai", async () => {
    const data = await buildJennaKnowledge({ overrides: {}, now: NOW });
    expect(data.snapshot.truncated).toBe(false);
    expect(data.snapshot.text).not.toContain(SNAPSHOT_TRUNCATED_MARK);
    expect(data.snapshot.chars).toBe(data.snapshot.text.length);
    expect(data.snapshot.maxChars).toBe(SNAPSHOT_MAX_CHARS);
    expect(data.snapshot.revalidateSeconds).toBe(JENNA_KNOWLEDGE_REVALIDATE_SECONDS);
    expect(data.snapshot.generatedAt).toBe(NOW.toISOString());
  });

  it("snapshot melebihi batas → truncated true dan tetap dalam batas", async () => {
    // Mock mengabaikan `take`, jadi ribuan baris cukup untuk melewati batas karakter.
    db.rows.set(
      "berita",
      Array.from({ length: 4000 }, (_, i) => ({
        id: `b${i}`,
        judul: `Berita panjang nomor ${i} tentang kegiatan desa`,
        tanggalTerbit: NOW,
        kategoriBerita: { name: "Umum" },
      })),
    );
    const data = await buildJennaKnowledge({ overrides: {}, now: NOW });
    expect(data.snapshot.truncated).toBe(true);
    expect(data.snapshot.text.endsWith(SNAPSHOT_TRUNCATED_MARK)).toBe(true);
    expect(data.snapshot.chars).toBeLessThanOrEqual(SNAPSHOT_MAX_CHARS);
  });

  it("tool = nama & deskripsi JENNA_TOOLS, tanpa skema parameter", async () => {
    const data = await buildJennaKnowledge({ overrides: {}, now: NOW });
    expect(data.tools).toEqual(JENNA_TOOLS.map((t) => ({ name: t.spec.name, description: t.spec.description })));
    expect(data.tools.map((t) => t.name)).toEqual(["cari_konten", "detail_konten", "agenda", "cek_kantor_buka"]);
  });
});

describe("GET /jenna/knowledge", () => {
  it("tanpa sesi → 401, DB tidak disentuh, no-store", async () => {
    requireAuthMock.mockResolvedValue({
      authenticated: false,
      response: new Response(JSON.stringify({ success: false, message: "Unauthorized" }), { status: 401 }),
    });
    const { context, set } = ctx();
    const res = await jennaKnowledgeGet(context);
    expect(res).toEqual({ success: false, message: "Unauthorized" });
    expect(set.status).toBe(401);
    expect(set.headers["cache-control"]).toBe("no-store");
    expect(db.calls).toEqual([]);
  });

  it.each(["1", "2", "3", "4", "5"])("role %s → 403, DB tidak disentuh", async (roleId) => {
    asUser(roleId);
    const { context, set } = ctx();
    const res = await jennaKnowledgeGet(context);
    expect(res).toMatchObject({ success: false });
    expect(set.status).toBe(403);
    expect(db.calls).toEqual([]);
  });

  it("developer → snapshot, sumber, dan tool; no-store", async () => {
    asUser("0");
    const { context, set } = ctx();
    const res = await jennaKnowledgeGet(context);
    expect(set.status).toBeUndefined();
    expect(set.headers["cache-control"]).toBe("no-store");
    if (!res.success) throw new Error("unreachable");
    expect(res.data.sources).toHaveLength(KNOWLEDGE_SOURCES.length);
    expect(res.data.tools).toHaveLength(JENNA_TOOLS.length);
    expect(res.data.snapshot.chars).toBe(res.data.snapshot.text.length);
  });
});
