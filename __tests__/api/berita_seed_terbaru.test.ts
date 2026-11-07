// @vitest-environment node
// Seed berita terbaru: shape data (id, kategori, tanggal urut, sumber, gambar di disk) dan
// perilaku seeder (createdAt dari tanggal asli, FileStorage menunjuk file public/ tanpa MinIO).
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { existsSync, readFileSync, statSync } from "fs";
import { join } from "path";

const prismaMock = vi.hoisted(() => ({
  kategoriBerita: { upsert: vi.fn(), findMany: vi.fn() },
  fileStorage: { upsert: vi.fn(), findUnique: vi.fn() },
  berita: { upsert: vi.fn(), deleteMany: vi.fn().mockResolvedValue({ count: 0 }) },
}));
vi.mock("@/lib/prisma", () => ({ default: prismaMock }));

import { seedBerita } from "../../prisma/_seeder_list/desa/berita/seed_berita";

type SeedBerita = {
  id: string;
  judul: string;
  deskripsi: string;
  content: string;
  kategoriBeritaId: string;
  tanggal: string;
  imageName: string;
  imageLink: string;
};

const DATA_DIR = join(process.cwd(), "prisma/data/desa/berita");
const readJson = <T>(file: string): T => JSON.parse(readFileSync(join(DATA_DIR, file), "utf-8"));
const berita = readJson<SeedBerita[]>("berita.json");
const kategori = readJson<{ id: string; name: string }[]>("kategori-berita.json");

const IMAGE_DIR = "/assets/images/berita-terbaru/";
const MAX_IMAGE_BYTES = 210 * 1024;
const SOURCE_LINE = /<p>Sumber: .+ — https:\/\/[^\s<]+<\/p>$/;

describe("data seed berita terbaru", () => {
  it("berisi 8 berita dengan id dan judul unik", () => {
    expect(berita).toHaveLength(8);
    expect(new Set(berita.map((b) => b.id)).size).toBe(berita.length);
    expect(new Set(berita.map((b) => b.judul)).size).toBe(berita.length);
  });

  it("kategoriBeritaId selalu merujuk kategori yang ada", () => {
    const valid = new Set(kategori.map((k) => k.id));
    for (const b of berita) expect(valid.has(b.kategoriBeritaId), b.judul).toBe(true);
  });

  it("tanggal valid, urut dari terbaru ke terlama, dan jatuh di Okt–Nov 2026", () => {
    const times = berita.map((b) => new Date(b.tanggal).getTime());
    for (const t of times) expect(Number.isNaN(t)).toBe(false);
    for (let i = 1; i < times.length; i++) expect(times[i - 1]).toBeGreaterThan(times[i]);
    expect(times[0]).toBeLessThan(new Date("2026-12-01T00:00:00Z").getTime());
    expect(times[times.length - 1]).toBeGreaterThanOrEqual(new Date("2026-10-01T00:00:00Z").getTime());
  });

  it("deskripsi dan content berformat <p>, content 2–4 paragraf diakhiri baris Sumber dengan URL", () => {
    for (const b of berita) {
      expect(b.deskripsi, b.judul).toMatch(/^<p>.+<\/p>$/);
      expect(b.content, b.judul).toMatch(SOURCE_LINE);
      const isi = b.content.split("</p>").filter(Boolean).length - 1; // tidak termasuk baris Sumber
      expect(isi, b.judul).toBeGreaterThanOrEqual(2);
      expect(isi, b.judul).toBeLessThanOrEqual(4);
    }
  });

  it("tiap berita menyebut Darmasaba", () => {
    for (const b of berita) expect(`${b.judul} ${b.content}`, b.judul).toMatch(/Darmasaba/);
  });

  it("imageLink menunjuk file webp yang ada di public/ dan ukurannya wajar", () => {
    const names = new Set<string>();
    for (const b of berita) {
      expect(b.imageLink.startsWith(IMAGE_DIR), b.judul).toBe(true);
      expect(b.imageLink.endsWith(`/${b.imageName}`), b.judul).toBe(true);
      expect(b.imageName, b.judul).toMatch(/^[a-z0-9-]+\.webp$/);
      const file = join(process.cwd(), "public", b.imageLink);
      expect(existsSync(file), file).toBe(true);
      expect(statSync(file).size, file).toBeLessThanOrEqual(MAX_IMAGE_BYTES);
      names.add(b.imageName);
    }
    expect(names.size).toBe(berita.length);
  });
});

describe("seedBerita", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    vi.spyOn(console, "warn").mockImplementation(() => undefined);
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    prismaMock.kategoriBerita.upsert.mockResolvedValue({});
    prismaMock.kategoriBerita.findMany.mockResolvedValue(kategori);
    prismaMock.fileStorage.upsert.mockImplementation(async ({ where }: { where: { name: string } }) => ({
      id: `file-${where.name}`,
    }));
    prismaMock.berita.upsert.mockResolvedValue({});
  });

  afterEach(() => vi.restoreAllMocks());

  it("membuat FileStorage dengan link statis public/ dan tidak memakai lookup /api/img", async () => {
    await seedBerita();

    expect(prismaMock.fileStorage.upsert).toHaveBeenCalledTimes(berita.length);
    expect(prismaMock.fileStorage.findUnique).not.toHaveBeenCalled();
    const first = prismaMock.fileStorage.upsert.mock.calls[0][0];
    expect(first.where).toEqual({ name: berita[0].imageName });
    expect(first.create).toMatchObject({
      name: berita[0].imageName,
      link: berita[0].imageLink,
      mimeType: "image/webp",
      category: "image",
    });
    expect(first.create.link.startsWith("/api/img/")).toBe(false);
  });

  it("menyetel createdAt dari tanggal berita dan imageId dari baris FileStorage", async () => {
    await seedBerita();

    expect(prismaMock.berita.upsert).toHaveBeenCalledTimes(berita.length);
    berita.forEach((b, i) => {
      const call = prismaMock.berita.upsert.mock.calls[i][0];
      expect(call.where).toEqual({ id: b.id });
      expect(call.create.createdAt).toEqual(new Date(b.tanggal));
      expect(call.update.createdAt).toEqual(new Date(b.tanggal));
      expect(call.create.imageId).toBe(`file-${b.imageName}`);
      expect(call.create.kategoriBeritaId).toBe(b.kategoriBeritaId);
    });
  });
});
