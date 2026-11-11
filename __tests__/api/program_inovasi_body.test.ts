// @vitest-environment node
// Body API Program Inovasi: logo opsional (kosong → null), batas galeri dokumentasi,
// dan `imageIds` absen → galeri tidak disentuh saat update.
import { describe, expect, it } from "vitest";
import {
  MAX_GAMBAR_DOKUMENTASI,
  normalisasiImageId,
  periksaImageIds,
  susunDataCreate,
  susunDataUpdate,
} from "@/lib/program-inovasi";

// test-only: id FileStorage palsu
const ids = (n: number) => Array.from({ length: n }, (_, i) => `file-${i}`);

describe("normalisasiImageId", () => {
  it("string kosong / spasi / null → null, undefined tetap undefined", () => {
    expect(normalisasiImageId("")).toBeNull();
    expect(normalisasiImageId("   ")).toBeNull();
    expect(normalisasiImageId(null)).toBeNull();
    expect(normalisasiImageId(undefined)).toBeUndefined();
    expect(normalisasiImageId(" abc ")).toBe("abc");
  });
});

describe("periksaImageIds", () => {
  it("membuang id kosong & duplikat", () => {
    expect(periksaImageIds(["a", "", "a", "b"])).toEqual({ ok: true, data: ["a", "b"] });
  });

  it("menolak bila melebihi batas dengan pesan yang menyebut batasnya", () => {
    const hasil = periksaImageIds(ids(MAX_GAMBAR_DOKUMENTASI + 1));
    expect(hasil.ok).toBe(false);
    if (!hasil.ok) expect(hasil.message).toContain(String(MAX_GAMBAR_DOKUMENTASI));
  });

  it("tepat di batas masih diterima", () => {
    expect(periksaImageIds(ids(MAX_GAMBAR_DOKUMENTASI)).ok).toBe(true);
  });
});

describe("susunDataCreate", () => {
  it("tanpa logo & tanpa galeri → imageId null, images tidak di-connect", () => {
    const hasil = susunDataCreate({ name: "Sipandu", description: "<p>x</p>", imageId: "" });
    expect(hasil).toEqual({
      ok: true,
      data: { name: "Sipandu", description: "<p>x</p>", imageId: null },
    });
  });

  it("galeri di-connect sesuai urutan id", () => {
    const hasil = susunDataCreate({ name: "A", description: "B", imageId: "logo", imageIds: ["g1", "g2"] });
    expect(hasil.ok && hasil.data.images).toEqual({ connect: [{ id: "g1" }, { id: "g2" }] });
    expect(hasil.ok && hasil.data.imageId).toBe("logo");
  });

  it("galeri melebihi batas → ditolak", () => {
    expect(susunDataCreate({ name: "A", description: "B", imageIds: ids(MAX_GAMBAR_DOKUMENTASI + 5) }).ok).toBe(false);
  });

  it("tidak pernah menyertakan field link", () => {
    const hasil = susunDataCreate({ name: "A", description: "B" });
    expect(hasil.ok && "link" in hasil.data).toBe(false);
  });
});

describe("susunDataUpdate", () => {
  it("imageIds tidak dikirim → images tidak diubah", () => {
    const hasil = susunDataUpdate({ name: "Baru" });
    expect(hasil).toEqual({ ok: true, data: { name: "Baru" } });
  });

  it("imageIds kosong dikirim → galeri dikosongkan (set [])", () => {
    const hasil = susunDataUpdate({ imageIds: [] });
    expect(hasil.ok && hasil.data.images).toEqual({ set: [] });
  });

  it("imageId null / string kosong → logo dihapus (null)", () => {
    expect(susunDataUpdate({ imageId: null })).toEqual({ ok: true, data: { imageId: null } });
    expect(susunDataUpdate({ imageId: "" })).toEqual({ ok: true, data: { imageId: null } });
  });

  it("imageIds melebihi batas → ditolak", () => {
    expect(susunDataUpdate({ imageIds: ids(MAX_GAMBAR_DOKUMENTASI + 1) }).ok).toBe(false);
  });
});
