// @vitest-environment node
// Pengetahuan Jenna: allowlist tautan, peta route publik, HTML → teks, dan render/pemotongan snapshot.
import { beforeEach, describe, expect, it, vi } from "vitest";

const db = vi.hoisted(() => {
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
  return { rows, calls, prisma };
});

vi.mock("next/cache", () => ({ revalidateTag: vi.fn(), unstable_cache: <T,>(fn: T) => fn }));
vi.mock("@/lib/prisma", () => ({ default: db.prisma }));

import { CLIP_MARK, clipText, htmlToKnowledgeText } from "@/lib/jenna/knowledge/html";
import { buildPublicRoutes, isAllowedJennaHref, resolveSourceHref, visibleSiteMap } from "@/lib/jenna/knowledge/sitemap";
import {
  SNAPSHOT_TRUNCATED_MARK,
  buildKnowledgeSnapshot,
  renderKnowledgeSnapshot,
  type SnapshotSourceRows,
} from "@/lib/jenna/knowledge/snapshot";
import { KNOWLEDGE_SOURCE_BY_KEY, type KnowledgeSource } from "@/lib/jenna/knowledge/sources";

const source = (key: string): KnowledgeSource => KNOWLEDGE_SOURCE_BY_KEY.get(key)!;
const ROUTES = new Set(buildPublicRoutes({}, ["https://www.instagram.com/desadarmasaba"]));

beforeEach(() => {
  db.rows.clear();
  db.calls.length = 0;
});

describe("isAllowedJennaHref", () => {
  const routes = new Set(["/", "/pemerintahan/layanan", "/ppid/profil-ppid", "https://www.instagram.com/desadarmasaba"]);

  it.each([
    "/",
    "/pemerintahan/layanan",
    "/pemerintahan/layanan/abc123",
    "/pemerintahan/layanan/abc123?tab=syarat#biaya",
    "https://www.instagram.com/desadarmasaba",
  ])("mengizinkan %s", (href) => {
    expect(isAllowedJennaHref(href, routes)).toBe(true);
  });

  it.each([
    "/program-inovasi", // "/" hanya cocok persis, bukan prefix semua path
    "/pemerintahan/layanan-palsu", // prefix harus per segmen
    "/pemerintahan/layanan/../../admin",
    "/pemerintahan/layanan/./x",
    "//evil.example/pemerintahan/layanan",
    "/pemerintahan\\layanan",
    "/api/fileStorage/findUnique/abc",
    "https://www.instagram.com/desadarmasaba/../lain",
    "https://evil.example/",
    "javascript:alert(1)",
    "pemerintahan/layanan",
    "",
  ])("menolak %s", (href) => {
    expect(isAllowedJennaHref(href, routes)).toBe(false);
  });
});

describe("buildPublicRoutes / visibleSiteMap", () => {
  it("memuat beranda, basis detail, URL sosial; tanpa halaman kesehatan yang tersembunyi default", () => {
    expect(ROUTES.has("/")).toBe(true);
    expect(ROUTES.has("/program-inovasi")).toBe(true);
    expect(ROUTES.has("/pemerintahan/berita")).toBe(true);
    expect(ROUTES.has("https://www.instagram.com/desadarmasaba")).toBe(true);
    for (const hidden of ["/kesehatan/puskesmas", "/kesehatan/penanganan-darurat", "/kesehatan/info-wabah-penyakit"]) {
      expect(ROUTES.has(hidden)).toBe(false);
      expect(isAllowedJennaHref(`${hidden}/x1`, ROUTES)).toBe(false);
    }
  });

  it("basis detail berita ikut hilang bila submenu daftar berita disembunyikan", () => {
    const routes = new Set(buildPublicRoutes({ "/pemerintahan/berita/semua": false }, []));
    expect(routes.has("/pemerintahan/berita/semua")).toBe(false);
    expect(routes.has("/pemerintahan/berita")).toBe(false);
    expect(isAllowedJennaHref("/pemerintahan/berita/umum/abc", routes)).toBe(false);
  });

  it("peta situs tanpa duplikat href", () => {
    const hrefs = visibleSiteMap({}).map((entry) => entry.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    expect(hrefs).not.toContain("/kesehatan/puskesmas");
  });

  it("resolveSourceHref jatuh ke halaman menu bila detail tidak diizinkan", () => {
    const berita = source("berita");
    const row = { id: "b1", judul: "X", kategoriBerita: { name: "Umum" } };
    expect(resolveSourceHref(berita, row, ROUTES)).toBe(berita.href(row));
    const hidden = new Set(buildPublicRoutes({ "/pemerintahan/berita/semua": false }, []));
    expect(resolveSourceHref(berita, row, hidden)).toBe(berita.menuHref);
  });
});

describe("htmlToKnowledgeText / clipText", () => {
  it("membuang tag, komentar, script, style", () => {
    const html = `<p>Halo <b>warga</b></p><!-- rahasia --><script>alert("x")</script><style>p{color:red}</style><ul><li>Satu</li></ul>`;
    const text = htmlToKnowledgeText(html);
    expect(text).toContain("Halo warga");
    expect(text).toContain("Satu");
    expect(text).not.toMatch(/rahasia|alert|color|</);
  });

  it("nilai kosong → string kosong", () => {
    expect(htmlToKnowledgeText(null)).toBe("");
    expect(htmlToKnowledgeText(undefined)).toBe("");
    expect(htmlToKnowledgeText("")).toBe("");
  });

  it("clipText menyertakan penanda dalam batas", () => {
    expect(clipText("pendek", 10)).toBe("pendek");
    const clipped = clipText("a".repeat(50), 10);
    expect(clipped.length).toBe(10);
    expect(clipped.endsWith(CLIP_MARK)).toBe(true);
  });
});

describe("renderKnowledgeSnapshot", () => {
  const generatedAt = new Date("2026-11-13T02:00:00Z");
  const stub = (): SnapshotSourceRows[] => [
    {
      source: source("berita"),
      rows: [{ id: "b1", judul: "Upacara | Melasti", tanggalTerbit: new Date("2026-11-10T03:00:00Z"), kategoriBerita: { name: "Umum" } }],
    },
    {
      source: source("layanan_surat_keterangan"),
      rows: [
        { id: "l1", name: "Surat Domisili", deskripsi: "<p>Bawa KTP</p>", estimasiWaktu: "1 hari", biaya: 0 },
        { id: "l2", name: "Surat Usaha", deskripsi: null, estimasiWaktu: null, biaya: 5000 },
      ],
    },
    { source: source("sejarah_desa"), rows: [{ id: "s1", judul: "Sejarah", deskripsi: "<p>Desa tua di Badung.</p>" }] },
    { source: source("prestasi_desa"), rows: [] },
  ];
  const render = (maxChars?: number, sources = stub(), routes: ReadonlySet<string> = ROUTES) =>
    renderKnowledgeSnapshot({ sources, siteMap: visibleSiteMap({}), guide: "## Panduan\n- isi panduan", routes, generatedAt, maxChars });

  it("urutan tier A → B → C, sumber kosong dilewati, pipa di sel di-escape", () => {
    const out = render();
    const a = out.indexOf("### Sejarah Desa");
    const b = out.indexOf("### Layanan Surat Keterangan");
    const c = out.indexOf("### Berita");
    expect(a).toBeGreaterThan(0);
    expect(a).toBeLessThan(b);
    expect(b).toBeLessThan(c);
    expect(out).not.toContain("### Prestasi Desa");
    expect(out).toContain("Upacara / Melasti");
    expect(out).toContain("- 2026-11-10 — Upacara / Melasti — /pemerintahan/berita/");
    expect(out).toContain("Bawa KTP");
    expect(out).not.toContain("<p>");
  });

  it("kolom Tautan hanya ada bila tautan baris beda dari halaman sumber", () => {
    const out = render();
    const layanan = out.slice(out.indexOf("### Layanan Surat Keterangan"));
    expect(layanan.split("\n")[1]).toContain("| Tautan |");
    expect(layanan).toContain("/pemerintahan/layanan/l1");
    const sejarah = out.slice(out.indexOf("### Sejarah Desa"), out.indexOf("## Layanan"));
    expect(sejarah).not.toContain("Tautan");
  });

  it("tautan detail yang tak diizinkan diganti halaman menu sumber", () => {
    const noDetail = new Set([...ROUTES].filter((route) => route !== "/pemerintahan/berita"));
    const out = render(undefined, stub(), noDetail);
    expect(out).toContain("- 2026-11-10 — Upacara / Melasti — /pemerintahan/berita/semua");
    expect(out).not.toMatch(/\/pemerintahan\/berita\/(?!semua)/);
  });

  it("dipotong di batas baris, tier C hilang lebih dulu, penanda di akhir, tak melebihi batas", () => {
    const full = render();
    const max = full.indexOf("### Berita") + 5;
    const cut = render(max);
    expect(cut.length).toBeLessThanOrEqual(max);
    expect(cut.endsWith(SNAPSHOT_TRUNCATED_MARK)).toBe(true);
    expect(cut).toContain("### Layanan Surat Keterangan");
    expect(cut).not.toContain("Melasti");
    for (const line of cut.split("\n").slice(0, -1)) expect(full.split("\n")).toContain(line);
  });

  it("tidak dipotong bila muat", () => {
    expect(render()).not.toContain(SNAPSHOT_TRUNCATED_MARK);
  });
});

describe("buildKnowledgeSnapshot", () => {
  it("sumber yang menunya tersembunyi tidak di-query sama sekali", async () => {
    db.rows.set("pelayananSuratKeterangan", [{ id: "l1", name: "Surat Domisili", deskripsi: null, estimasiWaktu: null, biaya: 0 }]);
    db.rows.set("puskesmas", [{ id: "p1", name: "Puskesmas Rahasia" }]);
    const out = await buildKnowledgeSnapshot({ overrides: {}, now: new Date("2026-11-13T02:00:00Z") });
    expect(out).toContain("Surat Domisili");
    expect(out).not.toContain("Puskesmas Rahasia");
    expect(db.calls).toContain("pelayananSuratKeterangan");
    for (const hidden of ["puskesmas", "penangananDarurat"]) expect(db.calls).not.toContain(hidden);
    expect(db.calls).not.toContain("menuVisibility");
  });
});
