// @vitest-environment node
// Logika murni urutan galeri foto Profil BUMDes + skema body.
import { describe, it, expect } from "vitest";
import { cekUrutanIds, urutanDariIndex, urutanFotoBaru } from "@/lib/bumdes-foto-urutan";
import { MAX_KETERANGAN_FOTO, fotoProfilCreateSchema, fotoProfilReorderSchema } from "@/lib/bumdes-foto-profil";

describe("urutanFotoBaru", () => {
  it("galeri kosong mulai dari 0", () => {
    expect(urutanFotoBaru(null, 3)).toEqual([0, 1, 2]);
  });
  it("melanjutkan setelah urutan terbesar", () => {
    expect(urutanFotoBaru(7, 2)).toEqual([8, 9]);
  });
});

describe("cekUrutanIds", () => {
  it("permutasi lengkap foto aktif → valid", () => {
    expect(cekUrutanIds(["b", "a"], ["a", "b"])).toBeNull();
  });
  it("id yang tidak aktif → pesan tidak ditemukan", () => {
    expect(cekUrutanIds(["a", "x"], ["a", "b"])).toContain("tidak ditemukan");
  });
  it("daftar parsial → pesan daftar berubah", () => {
    expect(cekUrutanIds(["a"], ["a", "b"])).toContain("berubah");
  });
});

describe("urutanDariIndex", () => {
  it("urutan = posisi di daftar", () => {
    expect(urutanDariIndex(["z", "y"])).toEqual([
      { id: "z", urutan: 0 },
      { id: "y", urutan: 1 },
    ]);
  });
});

describe("skema galeri", () => {
  it("keterangan melebihi batas ditolak", () => {
    const res = fotoProfilCreateSchema.safeParse({
      items: [{ imageId: "a", keterangan: "x".repeat(MAX_KETERANGAN_FOTO + 1) }],
    });
    expect(res.success).toBe(false);
  });
  it("reorder dengan id ganda ditolak", () => {
    const res = fotoProfilReorderSchema.safeParse({ ids: ["a", "a"] });
    expect(res.success).toBe(false);
    expect(res.error?.issues[0].message).toBe("ID foto dikirim lebih dari sekali");
  });
});
