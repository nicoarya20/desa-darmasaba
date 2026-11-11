// @vitest-environment node
// Seed data Point 1 (wilayah, BUMDes, produk unggulan, kegiatan pembangunan): bentuk data valid dan seeder idempoten.
import { beforeEach, describe, expect, it, vi } from "vitest";
import { loadJsonData } from "../../prisma/load-json";
import { WILAYAH_DESA_ID, isHttpsUrl } from "@/app/api/[[...slugs]]/_lib/desa/profile/profile_desa/wilayah/validation";
import { PROFIL_BUMDES_ID } from "@/app/api/[[...slugs]]/_lib/ekonomi/bumdes/profil/validation";
import {
  KATEGORI_PEMBANGUNAN_ID,
  PROGRES_MAX,
  PROGRES_MIN,
  STATUS_PEMBANGUNAN,
} from "@/lib/kegiatan-pembangunan";

const prismaMock = vi.hoisted(() => ({
  wilayahDesa: { upsert: vi.fn() },
  profilBumDes: { upsert: vi.fn() },
  unitUsahaBumDes: { upsert: vi.fn() },
}));
vi.mock("@/lib/prisma", () => ({ default: prismaMock }));

import { seedWilayahDesa } from "../../prisma/_seeder_list/desa/seed_wilayah_desa";
import { seedBumdesProfil } from "../../prisma/_seeder_list/ekonomi/seed_bumdes_profil";

const wilayah = loadJsonData("desa/wilayah-desa/wilayah-desa.json");
const profil = loadJsonData("ekonomi/bumdes/profil-bumdes.json");
const unitUsaha = loadJsonData<{ id: string; nama: string; urutan: number }[]>("ekonomi/bumdes/unit-usaha-bumdes.json");
const pasarDesa = loadJsonData<{ id: string; nama: string; isUnggulan?: boolean }[]>("ekonomi/pasar-desa/pasar-desa.json");
const kegiatan = loadJsonData<Record<string, any>[]>("desa/kegiatan-desa/kegiatan-desa.json"); // eslint-disable-line @typescript-eslint/no-explicit-any -- bentuk JSON seed bebas, divalidasi per-field di test
const kategori = loadJsonData<{ id: string; nama: string }[]>("desa/kegiatan-desa/kategori-kegiatan.json");

describe("seed data Point 1 — bentuk data", () => {
  it("wilayah desa: empat batas terisi teks dan peta hanya https bila ada", () => {
    for (const k of ["batasUtara", "batasSelatan", "batasTimur", "batasBarat"]) {
      expect(typeof wilayah[k]).toBe("string");
      expect(wilayah[k].length).toBeGreaterThan(0);
      expect(wilayah[k].length).toBeLessThanOrEqual(255);
    }
    expect(wilayah.luasWilayah === null || wilayah.luasWilayah > 0).toBe(true);
    expect(wilayah.petaEmbedUrl === null || isHttpsUrl(wilayah.petaEmbedUrl)).toBe(true);
    expect(wilayah.keterangan).toContain("contoh");
  });

  it("bumdes: profil punya nama + deskripsi dan unit usaha unik berurutan", () => {
    expect(profil.nama.length).toBeGreaterThan(0);
    expect(profil.deskripsi.length).toBeGreaterThan(0);
    expect(new Set(unitUsaha.map((u) => u.id)).size).toBe(unitUsaha.length);
    expect(new Set(unitUsaha.map((u) => u.urutan)).size).toBe(unitUsaha.length);
  });

  it("produk unggulan: semua produk punya flag boolean dan tepat dua yang unggulan", () => {
    expect(pasarDesa.every((p) => typeof p.isUnggulan === "boolean")).toBe(true);
    expect(pasarDesa.filter((p) => p.isUnggulan).map((p) => p.nama).sort()).toEqual([
      "Ayam & Daging Segar Darmasaba",
      "Sayur Segar Pak Wayan",
    ]);
  });

  it("kategori Pembangunan di seed cocok dengan konstanta kode", () => {
    expect(kategori.find((k) => k.id === KATEGORI_PEMBANGUNAN_ID)?.nama).toBe("Pembangunan");
  });

  it("kegiatan pembangunan: id unik, progres 0-100, status valid, konsisten dengan progres", () => {
    expect(new Set(kegiatan.map((k) => k.id)).size).toBe(kegiatan.length);
    const pembangunan = kegiatan.filter((k) => k.kategoriKegiatanId === KATEGORI_PEMBANGUNAN_ID);
    expect(pembangunan.length).toBeGreaterThanOrEqual(3);
    for (const k of pembangunan) {
      expect(Number.isInteger(k.progres)).toBe(true);
      expect(k.progres).toBeGreaterThanOrEqual(PROGRES_MIN);
      expect(k.progres).toBeLessThanOrEqual(PROGRES_MAX);
      expect(STATUS_PEMBANGUNAN).toContain(k.statusPembangunan);
      expect(k.anggaran).toBeGreaterThan(0);
      if (k.statusPembangunan === "selesai") expect(k.progres).toBe(PROGRES_MAX);
      if (k.statusPembangunan === "rencana") expect(k.progres).toBe(PROGRES_MIN);
    }
  });

  it("kegiatan non-pembangunan tidak membawa field pembangunan", () => {
    for (const k of kegiatan.filter((x) => x.kategoriKegiatanId !== KATEGORI_PEMBANGUNAN_ID)) {
      expect(k.anggaran).toBeUndefined();
      expect(k.progres).toBeUndefined();
    }
  });
});

describe("seed data Point 1 — seeder idempoten", () => {
  beforeEach(() => vi.clearAllMocks());

  it("seedWilayahDesa upsert baris tunggal by id tetap, dua kali panggil = argumen sama", async () => {
    await seedWilayahDesa();
    await seedWilayahDesa();
    expect(prismaMock.wilayahDesa.upsert).toHaveBeenCalledTimes(2);
    const [first, second] = prismaMock.wilayahDesa.upsert.mock.calls.map((c) => c[0]);
    expect(first.where).toEqual({ id: WILAYAH_DESA_ID });
    expect(first.create.id).toBe(WILAYAH_DESA_ID);
    expect(second).toEqual(first);
  });

  it("seedBumdesProfil upsert profil singleton + satu upsert per unit usaha", async () => {
    await seedBumdesProfil();
    expect(prismaMock.profilBumDes.upsert).toHaveBeenCalledTimes(1);
    expect(prismaMock.profilBumDes.upsert.mock.calls[0][0].where).toEqual({ id: PROFIL_BUMDES_ID });
    const ids = prismaMock.unitUsahaBumDes.upsert.mock.calls.map((c) => c[0].where.id);
    expect(ids).toEqual(unitUsaha.map((u) => u.id));
  });
});
