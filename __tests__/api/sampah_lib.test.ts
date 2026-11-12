// @vitest-environment node
// Modul murni Sampah per fitur: daftar sumber, bentuk item kontrak, validasi query, retensi.
import { describe, it, expect } from "vitest";
import { isSampahSumber, SAMPAH_SUMBER, toSampahItem, toSampahKategori, type SampahRow } from "@/lib/sampah/sampah-item";
import { parseSampahListQuery } from "@/lib/sampah/sampah-query";
import { SAMPAH_RETENSI_HARI, sampahCutoff, sisaHariSampah } from "@/lib/sampah/sampah-retensi";
import { DAK_SAMPAH_RETENSI_HARI } from "@/lib/desa-anti-korupsi-sampah";

const HARI = 24 * 60 * 60 * 1000;

describe("sumber Sampah", () => {
  it("hanya 3 fitur koleksi yang dilayani /api/sampah (DAK lewat panel sendiri)", () => {
    expect(SAMPAH_SUMBER).toEqual(["dokumen-apbdes", "foto-bumdes", "dokumen-perencanaan"]);
    expect(isSampahSumber("foto-bumdes")).toBe(true);
    expect(isSampahSumber("dokumen-dak")).toBe(false);
    expect(isSampahSumber("berita")).toBe(false);
  });
});

describe("item Sampah", () => {
  const now = new Date("2026-11-12T00:00:00Z");
  const row = (over: Partial<SampahRow> = {}): SampahRow => ({
    id: "a1",
    judul: "APBDes 2026.pdf",
    deletedAt: new Date(now.getTime() - 2 * HARI),
    folderNama: "Laporan",
    file: { mimeType: "application/pdf", category: "document", size: 1200, link: "/api/fileStorage/findUnique/a.pdf" },
    ...over,
  });

  it("toSampahItem membentuk kontrak: id entitas, ISO, sisa hari, link berkas sebagai pratinjau, folder", () => {
    expect(toSampahItem(row(), now, 30)).toEqual({
      id: "a1",
      judul: "APBDes 2026.pdf",
      mimeType: "application/pdf",
      kategori: "document",
      ukuran: 1200,
      pratinjauUrl: "/api/fileStorage/findUnique/a.pdf",
      dihapusPada: "2026-11-10T00:00:00.000Z",
      sisaHari: 28,
      folderNama: "Laporan",
    });
  });

  it("item tanpa berkas: pratinjau & ukuran null; link kosong → null; kategori tak dikenal → other", () => {
    expect(toSampahItem(row({ file: null, folderNama: null }), now, 30)).toMatchObject({
      pratinjauUrl: null,
      ukuran: null,
      mimeType: "",
      kategori: "document",
      folderNama: null,
    });
    expect(toSampahItem(row({ file: { mimeType: "x", category: "image", size: null, link: "" } }), now, 30).pratinjauUrl).toBeNull();
    expect(toSampahKategori("video")).toBe("other");
    expect(toSampahKategori(undefined)).toBe("other");
  });
});

describe("validasi query", () => {
  it("default page 1, limit 20, scopeId null (kosong/spasi = null)", () => {
    expect(parseSampahListQuery({})).toEqual({ ok: true, value: { page: 1, limit: 20, scopeId: null } });
    expect(parseSampahListQuery({ scopeId: "  " })).toEqual({ ok: true, value: { page: 1, limit: 20, scopeId: null } });
    expect(parseSampahListQuery({ page: "3", limit: "5", scopeId: " apb1 " })).toEqual({
      ok: true,
      value: { page: 3, limit: 5, scopeId: "apb1" },
    });
  });

  it("menolak page/limit tidak valid dan scopeId terlalu panjang", () => {
    expect(parseSampahListQuery({ limit: "0" })).toMatchObject({ ok: false });
    expect(parseSampahListQuery({ limit: "101" })).toMatchObject({ ok: false });
    expect(parseSampahListQuery({ page: "1.5" })).toMatchObject({ ok: false });
    expect(parseSampahListQuery({ page: "-1" })).toMatchObject({ ok: false });
    expect(parseSampahListQuery({ scopeId: "x".repeat(101) })).toMatchObject({ ok: false });
  });
});

describe("retensi", () => {
  it("retensi 30 hari satu sumber; DAK default mengikutinya", () => {
    expect(SAMPAH_RETENSI_HARI).toBe(30);
    expect(DAK_SAMPAH_RETENSI_HARI).toBe(SAMPAH_RETENSI_HARI);
    const now = new Date("2026-11-12T00:00:00Z");
    expect(sampahCutoff(now, 30).toISOString()).toBe("2026-10-13T00:00:00.000Z");
    expect(sisaHariSampah(now, now, 30)).toBe(30);
  });
});
