// @vitest-environment node
// Seed data contoh Point 6 (kegiatan Kepemudaan/PKK, hasil pertanian/peternakan, link toko online):
// bentuk data valid terhadap aturan kode, bertanda "data contoh", dan seeder tidak menimpa isian admin.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadJsonData } from "../../prisma/load-json";
import { formatSektorValue, parseSatuanPeriodeInput } from "@/lib/sektor-unggulan";
import { validateLinkTokoOnlineList } from "@/app/darmasaba/(pages)/ekonomi/umkm/_lib/linkTokoOnline";

const prismaMock = vi.hoisted(() => ({
  linkTokoOnline: { findMany: vi.fn(), createMany: vi.fn() },
  sektorUnggulanDesa: { upsert: vi.fn() },
}));
vi.mock("@/lib/prisma", () => ({ default: prismaMock }));

import { seedLinkTokoOnline } from "../../prisma/_seeder_list/ekonomi/seed_link_toko_online";
import { seedSektorUnggulanDesa } from "../../prisma/_seeder_list/ekonomi/seed_sektor_unggulan_desa";

type KegiatanSeed = { id: string; judul: string; deskripsiLengkap: string; tanggal: string; partisipan: number; kategoriKegiatanId: string };
type SektorSeed = { id: string; name: string; value: number; satuan?: string; periode?: string };
type LinkSeed = { keterangan: string; data: { produkId: string; links: { platform: string; url: string }[] }[] };

const kegiatan = loadJsonData<KegiatanSeed[]>("desa/kegiatan-desa/kegiatan-desa.json");
const kategori = loadJsonData<{ id: string; nama: string }[]>("desa/kegiatan-desa/kategori-kegiatan.json");
const sektor = loadJsonData<SektorSeed[]>("ekonomi/sektor-unggulan/sektor-unggulan.json");
const linkSeed = loadJsonData<LinkSeed>("ekonomi/pasar-desa/link-toko-online.json");
const pasarDesa = loadJsonData<{ id: string }[]>("ekonomi/pasar-desa/pasar-desa.json");

const KATEGORI_POINT6 = ["Kepemudaan", "PKK & Pemberdayaan Perempuan"];

describe("seed kegiatan Kepemudaan & PKK", () => {
  it.each(KATEGORI_POINT6)("kategori %s punya minimal dua kegiatan", (nama) => {
    const kat = kategori.find((k) => k.nama === nama);
    expect(kat).toBeDefined();
    expect(kegiatan.filter((k) => k.kategoriKegiatanId === kat!.id).length).toBeGreaterThanOrEqual(2);
  });

  it("id kegiatan unik dan setiap kategori merujuk ke kategori yang ada", () => {
    expect(new Set(kegiatan.map((k) => k.id)).size).toBe(kegiatan.length);
    const kategoriIds = new Set(kategori.map((k) => k.id));
    expect(kegiatan.every((k) => kategoriIds.has(k.kategoriKegiatanId))).toBe(true);
  });

  it("kegiatan Point 6 bertanda data contoh, tanggal valid, dan partisipan positif", () => {
    const ids = new Set(kategori.filter((k) => KATEGORI_POINT6.includes(k.nama)).map((k) => k.id));
    for (const k of kegiatan.filter((x) => ids.has(x.kategoriKegiatanId))) {
      expect(k.deskripsiLengkap).toContain("Data contoh");
      expect(Number.isNaN(new Date(k.tanggal).getTime())).toBe(false);
      expect(k.partisipan).toBeGreaterThan(0);
    }
  });
});

describe("seed hasil pertanian & peternakan", () => {
  it.each(["Pertanian", "Peternakan"])("%s punya satuan + periode yang lolos validasi API dan tampil di publik", (nama) => {
    const s = sektor.find((x) => x.name === nama)!;
    const parsed = parseSatuanPeriodeInput({ satuan: s.satuan, periode: s.periode });
    expect(parsed).toEqual({ ok: true, data: { satuan: s.satuan, periode: s.periode } });
    expect(s.periode).toContain("data contoh");
    expect(formatSektorValue(s)).toBe(`${s.value} ton • ${s.periode}`);
  });

  beforeEach(() => vi.clearAllMocks());

  it("mode SEED_OVERWRITE: seeder hanya menimpa satuan/periode untuk sektor yang mengisinya di JSON", async () => {
    vi.stubEnv("SEED_OVERWRITE", "true");
    await seedSektorUnggulanDesa();
    vi.unstubAllEnvs();
    const calls = prismaMock.sektorUnggulanDesa.upsert.mock.calls.map(([arg]) => arg);
    const pertanian = calls.find((c) => c.update.name === "Pertanian");
    const umkm = calls.find((c) => c.update.name === "UMKM Kecil");
    expect(pertanian.update).toMatchObject({ satuan: "ton", periode: "Tahun 2025 (data contoh)" });
    expect(umkm.update).not.toHaveProperty("satuan");
    expect(umkm.update).not.toHaveProperty("periode");
    expect(umkm.create).toMatchObject({ satuan: null, periode: null });
  });
});

describe("seed link toko online", () => {
  beforeEach(() => vi.clearAllMocks());

  it("bertanda data contoh dan setiap produk merujuk ke produk pasar desa yang ada", () => {
    expect(linkSeed.keterangan).toContain("Data contoh");
    const produkIds = new Set(pasarDesa.map((p) => p.id));
    expect(linkSeed.data.length).toBeGreaterThan(0);
    expect(linkSeed.data.every((d) => produkIds.has(d.produkId))).toBe(true);
  });

  it("semua link lolos validasi yang sama dengan form admin", () => {
    for (const d of linkSeed.data) {
      expect(validateLinkTokoOnlineList(d.links).ok).toBe(true);
    }
  });

  it("melewati produk yang sudah punya link dan mengisi produk lainnya berurutan", async () => {
    const [sudahAda, ...lainnya] = linkSeed.data;
    prismaMock.linkTokoOnline.findMany.mockResolvedValue([{ produkId: sudahAda.produkId }]);

    await seedLinkTokoOnline();

    const created = prismaMock.linkTokoOnline.createMany.mock.calls.map(([arg]) => arg.data);
    expect(created).toHaveLength(lainnya.length);
    expect(created.flat().some((l: { produkId: string }) => l.produkId === sudahAda.produkId)).toBe(false);
    expect(created[0]).toEqual(
      lainnya[0].links.map((l, i) => ({ platform: l.platform, url: new URL(l.url).href, urutan: i, produkId: lainnya[0].produkId })),
    );
  });

  it("tidak membuat link sama sekali bila semua produk sudah punya link", async () => {
    prismaMock.linkTokoOnline.findMany.mockResolvedValue(linkSeed.data.map((d) => ({ produkId: d.produkId })));
    await seedLinkTokoOnline();
    expect(prismaMock.linkTokoOnline.createMany).not.toHaveBeenCalled();
  });
});
