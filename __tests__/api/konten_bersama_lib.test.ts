// @vitest-environment node
// Fondasi konten bersama (Bank Sampah, Lembaga Sekolah, PUSTU, Posyandu): validasi media sosial, tautan kontak,
// link Google Maps, urutan daftar anak, dan skema pengurus/galeri.
import { describe, expect, it } from "vitest";
import { tautanKontak } from "@/lib/konten-bersama/kontak.link";
import { isLinkGoogleMaps, linkGoogleMaps, linkGoogleMapsSchema } from "@/lib/konten-bersama/lokasi.logic";
import { lengkapiUrlMedsos } from "@/lib/konten-bersama/media-sosial.model";
import { bacaMediaSosial, mediaSosialListSchema } from "@/lib/konten-bersama/media-sosial.validation";
import { buatSkemaPengurus } from "@/lib/konten-bersama/pengurus.validation";
import { buatSkemaGaleri } from "@/lib/konten-bersama/galeri.validation";
import { cekUrutanIds, urutanBaru } from "@/lib/konten-bersama/urutan.logic";
import { imageIdOpsional } from "@/lib/konten-bersama/daftar-anak.validation";
import { koordinatBerpasangan } from "@/lib/konten-bersama/lokasi.logic";
import { kolomMediaSosial } from "@/app/api/[[...slugs]]/_lib/_konten-bersama/media-sosial.data";
import { Prisma } from "@prisma/client";

describe("media sosial", () => {
  it("URL http/https diterima, URL invalid / skema lain / platform asing ditolak", () => {
    expect(mediaSosialListSchema.safeParse([{ platform: "instagram", url: "https://www.instagram.com/akun_contoh" }]).success).toBe(true);

    const bukanUrl = mediaSosialListSchema.safeParse([{ platform: "instagram", url: "akun_contoh" }]);
    expect(bukanUrl.success).toBe(false);
    expect(bukanUrl.error?.issues[0].message).toBe("URL harus diawali http:// atau https://");

    expect(mediaSosialListSchema.safeParse([{ platform: "website", url: "javascript:alert(1)" }]).success).toBe(false);
    expect(mediaSosialListSchema.safeParse([{ platform: "website", url: "ftp://contoh.id" }]).success).toBe(false);
    const asing = mediaSosialListSchema.safeParse([{ platform: "myspace", url: "https://contoh.id" }]);
    expect(asing.error?.issues[0].message).toBe("Platform media sosial tidak dikenal");
  });

  it("bacaMediaSosial membuang entri rusak dari kolom Json", () => {
    const raw = [
      { platform: "instagram", url: " https://instagram.com/a " },
      { platform: "facebook", url: "javascript:alert(1)" },
      { platform: "x", url: "https://x.com/a" },
      "rusak",
      null,
    ];
    expect(bacaMediaSosial(raw)).toEqual([{ platform: "instagram", url: "https://instagram.com/a" }]);
    expect(bacaMediaSosial(null)).toEqual([]);
    expect(bacaMediaSosial({ platform: "instagram" })).toEqual([]);
  });

  it("lengkapiUrlMedsos: nama akun → URL profil, nomor HP → wa.me, domain → https", () => {
    expect(lengkapiUrlMedsos("instagram", "akun_contoh")).toBe("https://www.instagram.com/akun_contoh");
    expect(lengkapiUrlMedsos("tiktok", "@akun.contoh")).toBe("https://www.tiktok.com/@akun.contoh");
    expect(lengkapiUrlMedsos("whatsapp", "0812 0000 1111")).toBe("https://wa.me/6281200001111"); // test-only
    expect(lengkapiUrlMedsos("instagram", "instagram.com/akun")).toBe("https://instagram.com/akun");
    expect(lengkapiUrlMedsos("website", "contoh.desa.id")).toBe("https://contoh.desa.id");
    expect(lengkapiUrlMedsos("website", "javascript:alert(1)")).toBe("javascript:alert(1)");
  });
});

describe("tautanKontak", () => {
  it("nomor seluler dalam teks bebas → tel: + wa.me, teks asli dipertahankan", () => {
    expect(tautanKontak("081200001111 (Admin TPS)")).toEqual({ // test-only
      teks: "081200001111 (Admin TPS)",
      telHref: "tel:+6281200001111",
      waHref: "https://wa.me/6281200001111",
    });
  });
  it("telepon tetap → tel: saja; tanpa nomor → teks saja; kosong → null", () => {
    expect(tautanKontak("(0361) 846 0000")).toMatchObject({ telHref: "tel:+623618460000", waHref: null }); // test-only
    expect(tautanKontak("Datang langsung ke kantor desa")).toEqual({ teks: "Datang langsung ke kantor desa", telHref: null, waHref: null });
    expect(tautanKontak("RT 03")).toMatchObject({ telHref: null, waHref: null });
    expect(tautanKontak("  ")).toBeNull();
    expect(tautanKontak(null)).toBeNull();
  });
});

describe("lokasi", () => {
  it("link Google Maps pendek diterima, situs lain ditolak, kosong → null", () => {
    expect(isLinkGoogleMaps("https://maps.app.goo.gl/AbCdEf123")).toBe(true);
    expect(isLinkGoogleMaps("https://www.google.com/maps/place/x")).toBe(true);
    expect(isLinkGoogleMaps("https://evil.example/maps")).toBe(false);
    expect(linkGoogleMapsSchema.parse("")).toBeNull();
    expect(linkGoogleMapsSchema.parse(undefined)).toBeUndefined();
    expect(linkGoogleMapsSchema.safeParse("https://evil.example/maps").success).toBe(false);
  });
  it("linkGoogleMaps: link tersimpan dulu, lalu rute koordinat, selain itu null", () => {
    expect(linkGoogleMaps("https://maps.app.goo.gl/x", { lat: 1, lng: 2 })).toBe("https://maps.app.goo.gl/x");
    expect(linkGoogleMaps(null, { lat: -8.6, lng: 115.2 })).toBe("https://www.google.com/maps/dir/?api=1&destination=-8.6,115.2");
    expect(linkGoogleMaps(null, { lat: 0, lng: 0 })).toBeNull();
    expect(linkGoogleMaps("javascript:alert(1)", null)).toBeNull();
  });
});

describe("urutan & skema daftar anak", () => {
  it("urutanBaru melanjutkan setelah urutan terbesar; pesan reorder memakai label", () => {
    expect(urutanBaru(null, 2)).toEqual([0, 1]);
    expect(urutanBaru(4, 1)).toEqual([5]);
    expect(cekUrutanIds(["a"], ["a", "b"], "pengurus")).toBe("Daftar pengurus sudah berubah. Muat ulang halaman lalu coba lagi.");
    expect(cekUrutanIds(["a", "z"], ["a", "b"], "pengurus")).toContain("Sebagian pengurus tidak ditemukan");
  });

  it("pengurus: nama & jabatan wajib, foto opsional (\"\" → null), update parsial", () => {
    const skema = buatSkemaPengurus({ max: 3 });
    expect(skema.create.parse({ items: [{ nama: " Ketua Contoh ", jabatan: "Ketua", imageId: "" }] })).toEqual({
      items: [{ nama: "Ketua Contoh", jabatan: "Ketua", imageId: null }],
    });
    const tanpaJabatan = skema.create.safeParse({ items: [{ nama: "A", jabatan: " " }] });
    expect(tanpaJabatan.error?.issues[0].message).toBe("Jabatan wajib diisi");
    expect(skema.create.safeParse({ items: Array(4).fill({ nama: "A", jabatan: "B" }) }).success).toBe(false);
    expect(skema.update.parse({ jabatan: "Sekretaris" })).toEqual({ jabatan: "Sekretaris" });
    expect(skema.reorder.safeParse({ ids: ["a", "a"] }).error?.issues[0].message).toBe("ID pengurus dikirim lebih dari sekali");
  });

  it("galeri: batas per domain dan keterangan kosong → null", () => {
    const skema = buatSkemaGaleri({ max: 2 });
    expect(skema.create.parse({ items: [{ imageId: "img-1", keterangan: " " }] })).toEqual({ items: [{ imageId: "img-1", keterangan: null }] });
    expect(skema.create.safeParse({ items: [{ imageId: "a" }, { imageId: "b" }, { imageId: "c" }] }).error?.issues[0].message).toBe(
      "Maksimal 2 foto sekaligus",
    );
  });
});

describe("perluasan untuk Lembaga Sekolah", () => {
  it("koordinat opsional harus berpasangan", () => {
    expect(koordinatBerpasangan({})).toBe(true);
    expect(koordinatBerpasangan({ lat: null, lng: null })).toBe(true);
    expect(koordinatBerpasangan({ lat: -8.6, lng: 115.2 })).toBe(true);
    expect(koordinatBerpasangan({ lat: -8.6 })).toBe(false);
    expect(koordinatBerpasangan({ lat: null, lng: 115.2 })).toBe(false);
  });

  it("imageIdOpsional: tidak dikirim tetap undefined, kosong → null", () => {
    expect(imageIdOpsional.parse(undefined)).toBeUndefined();
    expect(imageIdOpsional.parse(" ")).toBeNull();
    expect(imageIdOpsional.parse(null)).toBeNull();
    expect(imageIdOpsional.parse("img-1")).toBe("img-1");
  });

  it("kolomMediaSosial: tidak dikirim → tanpa kolom, kosong → DbNull", () => {
    expect(kolomMediaSosial(undefined)).toEqual({});
    expect(kolomMediaSosial([]).mediaSosial).toBe(Prisma.DbNull);
    expect(kolomMediaSosial(null).mediaSosial).toBe(Prisma.DbNull);
    const isi = [{ platform: "instagram" as const, url: "https://instagram.com/a" }];
    expect(kolomMediaSosial(isi)).toEqual({ mediaSosial: isi });
  });
});
