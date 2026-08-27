// @vitest-environment node
import { describe, it, expect } from "vitest";
import { getSosmedHref } from "@/app/admin/(dashboard)/landing-page/profil/_lib/sosmed";

describe("getSosmedHref", () => {
  it("normalisasi nomor telepon awalan 0 ke wa.me", () => {
    expect(getSosmedHref("telephone", "081234567890")).toBe(
      "https://wa.me/6281234567890"
    );
  });

  it("normalisasi nomor whatsapp yang sudah pakai 62 ke wa.me", () => {
    expect(getSosmedHref("whatsapp", "6281234567890")).toBe(
      "https://wa.me/6281234567890"
    );
  });

  it("buang karakter non-digit (spasi, strip, tanda kurung, plus) sebelum normalisasi", () => {
    expect(getSosmedHref("telephone", "+62 812-3456-7890")).toBe(
      "https://wa.me/6281234567890"
    );
  });

  it("nomor tanpa awalan 0/62 tetap diprefix 62", () => {
    expect(getSosmedHref("whatsapp", "81234567890")).toBe(
      "https://wa.me/6281234567890"
    );
  });

  it("tipe non-telepon (facebook/instagram/dst) pakai iconUrl apa adanya", () => {
    expect(
      getSosmedHref("facebook", "https://www.facebook.com/DarmasabaDesaku")
    ).toBe("https://www.facebook.com/DarmasabaDesaku");
  });

  it("icon null/custom tetap pakai iconUrl sebagai URL langsung", () => {
    expect(getSosmedHref(null, "https://www.instagram.com/ddarmasaba/")).toBe(
      "https://www.instagram.com/ddarmasaba/"
    );
  });

  it("return null kalau iconUrl kosong", () => {
    expect(getSosmedHref("telephone", "")).toBeNull();
    expect(getSosmedHref("facebook", undefined)).toBeNull();
    expect(getSosmedHref("whatsapp", "   ")).toBeNull();
  });

  it("return null kalau nomor telepon tidak mengandung digit sama sekali", () => {
    expect(getSosmedHref("telephone", "abc-tidak-valid")).toBeNull();
  });
});
