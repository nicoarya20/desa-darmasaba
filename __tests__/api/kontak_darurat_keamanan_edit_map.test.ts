// @vitest-environment node
// Regresi: form Edit Kontak Darurat Keamanan tidak memuat kontak item yang
// sudah dipilih saat create.
//
// Bug lama (page.tsx): `kategoriId: Array.isArray(data.kategoriId) ? data.kategoriId : []`.
// `data.kategoriId` adalah scalar FK tunggal (relasi `kategori`), bukan array —
// sehingga cabang selalu jatuh ke `[]` dan MultiSelect "Kontak Item" kosong.
//
// Fix: ambil daftar dari relasi `kontakItems` (`kontakItemId`) sebagai fallback.
import { describe, it, expect } from "vitest";
import { mapKontakToForm } from "@/app/admin/(dashboard)/keamanan/kontak-darurat/kontak-darurat-keamanan/[id]/edit/_lib/mapKontakToForm";

describe("mapKontakToForm — Edit memuat kontak item dari relasi kontakItems", () => {
  it("mengisi kategoriId dari kontakItems saat kategoriId scalar (bentuk API nyata)", () => {
    const apiData = {
      id: "kd1",
      nama: "Damkar",
      icon: "IconFlame",
      kategoriId: "kat-tunggal", // FK scalar — bukan array
      kontakItems: [
        { kontakItemId: "item-a" },
        { kontakItemId: "item-b" },
      ],
    };

    const form = mapKontakToForm(apiData);

    expect(form.name).toBe("Damkar");
    expect(form.icon).toBe("IconFlame");
    expect(form.kategoriId).toEqual(["item-a", "item-b"]);
  });

  it("tetap memakai kategoriId jika sudah berupa array", () => {
    const form = mapKontakToForm({
      nama: "Polsek",
      icon: "",
      kategoriId: ["x", "y"],
      kontakItems: [{ kontakItemId: "z" }],
    });
    expect(form.kategoriId).toEqual(["x", "y"]);
  });

  it("mengembalikan default aman saat data null / field kosong", () => {
    expect(mapKontakToForm(null)).toEqual({ name: "", icon: "", kategoriId: [] });
    expect(mapKontakToForm({ nama: "A" }).kategoriId).toEqual([]);
  });
});
