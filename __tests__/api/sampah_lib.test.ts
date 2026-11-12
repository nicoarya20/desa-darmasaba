// @vitest-environment node
// Modul murni Sampah: registry pemilik berkas → menu, kelompok sidebar, bentuk item, validasi query, retensi.
import { describe, it, expect } from "vitest";
import { allDomains } from "@/app/admin/_com/nav";
import { FILE_OWNER_MENU, menuIdForOwner } from "@/lib/sampah/sampah-file-owner";
import {
  isKnownSampahMenuId,
  kelompokIdOfMenu,
  menuIdsOfKelompok,
  resolveSampahAsal,
  sampahKelompokList,
} from "@/lib/sampah/sampah-kelompok";
import { compareSampahRows, parseSampahId, toSampahItem, toSampahKategori, type SampahRow } from "@/lib/sampah/sampah-item";
import { parseSampahKelompok, parseSampahListQuery } from "@/lib/sampah/sampah-query";
import { SAMPAH_RETENSI_HARI, sampahCutoff, sisaHariSampah } from "@/lib/sampah/sampah-retensi";
import { DAK_SAMPAH_RETENSI_HARI } from "@/lib/desa-anti-korupsi-sampah";
import { canManageSampah } from "@/lib/sampah/sampah-access";

const HARI = 24 * 60 * 60 * 1000;

describe("registry pemilik berkas → menu", () => {
  it("semua ID menu di registry adalah menu sidebar yang ada (tidak bisa jatuh diam-diam ke Lainnya)", () => {
    const tidakDikenal = Object.entries(FILE_OWNER_MENU).filter(([, menuId]) => !isKnownSampahMenuId(menuId));
    expect(tidakDikenal).toEqual([]);
  });

  it("memetakan pemilik yang dikenal dan mengembalikan null untuk pemilik tak dikenal", () => {
    expect(menuIdForOwner("Berita")).toBe("desa.berita");
    expect(menuIdForOwner("PegawaiPPID")).toBe("ppid.struktur-ppid");
    expect(menuIdForOwner("MusikDesa")).toBe("Musik");
    expect(menuIdForOwner("ModelTidakAda")).toBeNull();
    expect(menuIdForOwner("toString")).toBeNull();
  });
});

describe("kelompok Sampah", () => {
  it("daftar = section sidebar sesuai urutan + Lainnya di akhir", () => {
    const list = sampahKelompokList();
    expect(list.map((k) => k.id)).toEqual([...allDomains.map((d) => d.id), "lainnya"]);
    expect(list[0]).toEqual({ id: "Landing Page", nama: "Landing Page" });
    expect(list.find((k) => k.id === "Desa")?.nama).toBe("Pemerintahan");
    expect(list.at(-1)).toEqual({ id: "lainnya", nama: "Lainnya" });
  });

  it("menu → kelompok; null/tidak dikenal → lainnya; section tanpa submenu (Musik) jadi menunya sendiri", () => {
    expect(kelompokIdOfMenu("kesehatan.posyandu")).toBe("Kesehatan");
    expect(kelompokIdOfMenu("Musik")).toBe("Musik");
    expect(kelompokIdOfMenu(null)).toBe("lainnya");
    expect(kelompokIdOfMenu("menu.lama")).toBe("lainnya");
    expect(menuIdsOfKelompok("Desa")).toContain("desa.berita");
    expect(menuIdsOfKelompok("lainnya")).toEqual([]);
  });

  it("asal item membawa nama kelompok & menu; menu tak dikenal tetap dilaporkan di Lainnya", () => {
    expect(resolveSampahAsal("desa.berita")).toEqual({
      kelompokId: "Desa",
      kelompokNama: "Pemerintahan",
      menuId: "desa.berita",
      menuNama: "Berita",
    });
    expect(resolveSampahAsal("menu.lama")).toEqual({ kelompokId: "lainnya", kelompokNama: "Lainnya", menuId: "menu.lama", menuNama: null });
  });
});

describe("item Sampah", () => {
  const now = new Date("2026-11-12T00:00:00Z");
  const row = (over: Partial<SampahRow> = {}): SampahRow => ({
    sumber: "file",
    id: "f1",
    jenis: "file",
    judul: "foto.webp",
    deletedAt: new Date(now.getTime() - 2 * HARI),
    menuId: "desa.berita",
    file: { mimeType: "image/webp", category: "image", size: 1200 },
    ...over,
  });

  it("toSampahItem membentuk kontrak: id gabungan, ISO, sisa hari, pratinjau admin, asal", () => {
    expect(toSampahItem(row(), now, 30)).toEqual({
      id: "file:f1",
      jenis: "file",
      judul: "foto.webp",
      mimeType: "image/webp",
      kategori: "image",
      ukuran: 1200,
      pratinjauUrl: "/api/pengaturan/sampah/file%3Af1/pratinjau",
      dihapusPada: "2026-11-10T00:00:00.000Z",
      sisaHari: 28,
      asal: { kelompokId: "Desa", kelompokNama: "Pemerintahan", menuId: "desa.berita", menuNama: "Berita" },
    });
  });

  it("item tanpa berkas: pratinjau null, ukuran null; kategori tak dikenal → other", () => {
    const item = toSampahItem(row({ sumber: "perencanaan", jenis: "dokumen", file: null }), now, 30);
    expect(item).toMatchObject({ id: "perencanaan:f1", pratinjauUrl: null, ukuran: null, mimeType: "" });
    expect(toSampahKategori("video")).toBe("other");
    expect(toSampahKategori(undefined)).toBe("other");
  });

  it("parseSampahId memisah di titik dua pertama; format rusak → null", () => {
    expect(parseSampahId("dak:abc")).toEqual({ sumber: "dak", id: "abc" });
    expect(parseSampahId("file:a:b")).toEqual({ sumber: "file", id: "a:b" });
    expect(parseSampahId("abc")).toBeNull();
    expect(parseSampahId(":abc")).toBeNull();
    expect(parseSampahId("file:")).toBeNull();
  });

  it("urutan gabungan: terbaru dihapus dulu, seri diurutkan ID", () => {
    const a = row({ id: "b", deletedAt: new Date(1000) });
    const b = row({ id: "a", deletedAt: new Date(1000) });
    const c = row({ id: "z", deletedAt: new Date(5000) });
    expect([a, b, c].sort(compareSampahRows).map((r) => r.id)).toEqual(["z", "a", "b"]);
  });
});

describe("validasi query", () => {
  it("default kelompok semua, page 1, limit 20, cari kosong", () => {
    expect(parseSampahListQuery({})).toEqual({ ok: true, value: { kelompok: "semua", page: 1, limit: 20, cari: "" } });
  });

  it("menolak kelompok tak dikenal, page/limit tidak valid, dan jendela paging terlalu jauh", () => {
    expect(parseSampahListQuery({ kelompok: "Kosong" })).toMatchObject({ ok: false });
    expect(parseSampahListQuery({ limit: "0" })).toMatchObject({ ok: false });
    expect(parseSampahListQuery({ limit: "101" })).toMatchObject({ ok: false });
    expect(parseSampahListQuery({ page: "1.5" })).toMatchObject({ ok: false });
    expect(parseSampahListQuery({ page: "51", limit: "100" })).toMatchObject({ ok: false });
    expect(parseSampahListQuery({ kelompok: "Kesehatan", page: "2", limit: "5", cari: " foto " })).toEqual({
      ok: true,
      value: { kelompok: "Kesehatan", page: 2, limit: 5, cari: "foto" },
    });
  });

  it("kosongkan mewajibkan kelompok (tanpa default ke semua)", () => {
    expect(parseSampahKelompok(undefined, null)).toEqual({ ok: false, message: "Parameter kelompok wajib diisi" });
    expect(parseSampahKelompok("semua", null)).toEqual({ ok: true, value: "semua" });
    expect(parseSampahKelompok("lainnya", null)).toEqual({ ok: true, value: "lainnya" });
  });
});

describe("retensi & akses", () => {
  it("retensi 30 hari satu sumber; DAK default mengikutinya", () => {
    expect(SAMPAH_RETENSI_HARI).toBe(30);
    expect(DAK_SAMPAH_RETENSI_HARI).toBe(SAMPAH_RETENSI_HARI);
    const now = new Date("2026-11-12T00:00:00Z");
    expect(sampahCutoff(now, 30).toISOString()).toBe("2026-10-13T00:00:00.000Z");
    expect(sisaHariSampah(now, now, 30)).toBe(30);
  });

  it("hanya role 0/1 yang boleh mengelola Sampah", () => {
    expect(canManageSampah("0")).toBe(true);
    expect(canManageSampah(1)).toBe(true);
    expect(canManageSampah("2")).toBe(false);
    expect(canManageSampah(null)).toBe(false);
  });
});
